import {
	BrowserProvider,
	Contract,
	isAddress,
	parseEther,
	type Eip1193Provider,
	type TransactionReceipt
} from 'ethers';
import { appKit } from '$lib/appkit';
import escrowAbi from '$lib/abi/contracts_escrow_sol_SimpleEscrow.json';
import { sepolia } from '@reown/appkit/networks';
import { PUBLIC_ESCROW_CONTRACT_ADDRESS } from '$env/static/public';

const ESCROW_CONTRACT_ADDRESS = PUBLIC_ESCROW_CONTRACT_ADDRESS;
const SEPOLIA_CHAIN_ID = 11155111;

export interface CreateTradeParams {
	sellerAddress: string;
	priceInEth: string | number;
}

export interface TradeResult {
	success: boolean;
	transactionHash?: string;
	error?: string;
}

export enum EscrowError {
	Rejected = 'Transaction was rejected by the user.',
	InsufficientFunds = 'Insufficient funds. Please get testnet ETH from a Sepolia faucet.',
	WrongNetwork = 'Please switch to the Sepolia network before creating a trade.',
	InvalidAddress = 'Invalid seller address.',
	InvalidAmount = 'Invalid trade amount.',
	ProviderTimeout = 'Could not connect to wallet provider. Please try again.',
	Unknown = 'An unknown error occurred.'
}

class EscrowService {
	private cachedProvider?: BrowserProvider;
	private cachedContract?: Contract;

	private async getProvider(): Promise<BrowserProvider> {
		if (this.cachedProvider) {
			return this.cachedProvider;
		}

		try {
			const state = appKit?.getState();
			const provider = appKit?.getProvider<Eip1193Provider>('eip155');
			console.log(state, provider, appKit?.getWalletProvider());
			// const eip155Provider = state?.selectedNetworkId.providers['eip155'] as Eip1193Provider;
			if (provider) {
				console.log('Provider found.');
				const ethersProvider = new BrowserProvider(provider);
				this.cachedProvider = ethersProvider;
				return ethersProvider;
			}
		} catch (e) {
			console.warn('Error reading appKit state, falling back to subscription.', e);
		}

		console.log('No provider in state, subscribing for connection...');
		return new Promise((resolve, reject) => {
			const unsubscribe = appKit?.subscribeProviders((state) => {
				const eip155Provider = state['eip155'] as Eip1193Provider;
				console.log(eip155Provider, 2899);
				if (eip155Provider && typeof eip155Provider.request === 'function') {
					unsubscribe?.();
					const ethersProvider = new BrowserProvider(eip155Provider);
					this.cachedProvider = ethersProvider;
					resolve(ethersProvider);
				}
			});

			console.log(unsubscribe);

			const timeout = setTimeout(() => {
				unsubscribe?.();
				reject(new Error(EscrowError.ProviderTimeout));
			}, 7000);

			const originalResolve = resolve;
			resolve = ((value) => {
				clearTimeout(timeout);
				originalResolve(value);
			}) as typeof resolve;
		});
	}

	private async getContract(): Promise<Contract> {
		if (this.cachedContract) {
			return this.cachedContract;
		}

		const ethersProvider = await this.getProvider();
		if (!ethersProvider) throw new Error('No provider found');

		const signer = await ethersProvider.getSigner();

		const contract = new Contract(ESCROW_CONTRACT_ADDRESS, escrowAbi, signer);
		this.cachedContract = contract;
		return contract;
	}

	async createTrade({ sellerAddress, priceInEth }: CreateTradeParams): Promise<TradeResult> {
		try {
			if (!isAddress(sellerAddress)) {
				return { success: false, error: EscrowError.InvalidAddress };
			}

			const amount = Number(priceInEth);
			if (isNaN(amount) || amount <= 0) {
				return { success: false, error: EscrowError.InvalidAmount };
			}

			const isSepolia = await this.checkNetwork();
			if (!isSepolia) {
				const switched = await this.switchToSepolia();
				if (!switched) {
					return { success: false, error: EscrowError.WrongNetwork };
				}
				// Give the provider a moment to settle after network switch
				await new Promise((res) => setTimeout(res, 500));
			}

			const contract = await this.getContract();
			const amountInWei = parseEther(priceInEth.toString());

			const tx = await contract.createTrade(sellerAddress, amountInWei, {
				value: amountInWei
			});

			const receipt: TransactionReceipt = await tx.wait();

			return {
				success: true,
				transactionHash: receipt.hash
			};
		} catch (error: any) {
			console.error('Error creating trade:', error);
			return { success: false, error: this.mapError(error) };
		}
	}

	async checkNetwork(): Promise<boolean> {
		try {
			const ethersProvider = await this.getProvider();
			if (!ethersProvider) return false;

			const network = await ethersProvider.getNetwork();

			console.log(network.chainId);
			return Number(network.chainId) === SEPOLIA_CHAIN_ID;
		} catch (error) {
			console.error('Error checking network:', error);
			return false;
		}
	}

	async switchToSepolia(): Promise<boolean> {
		try {
			if (appKit) {
				// clear cached provider so it can be re-fetched on the new network
				this.cachedProvider = undefined;
				this.cachedContract = undefined;
				await appKit.switchNetwork(sepolia, { throwOnFailure: true });
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error switching network:', error);
			return false;
		}
	}

	private mapError(error: any): string {
		const msg = error?.message?.toLowerCase() || '';

		if (error.code === 'ACTION_REJECTED' || msg.includes('user rejected')) {
			return EscrowError.Rejected;
		}
		if (error.code === 'INSUFFICIENT_FUNDS' || msg.includes('insufficient funds')) {
			return EscrowError.InsufficientFunds;
		}
		if (msg.includes('network') || msg.includes('chain')) {
			return EscrowError.WrongNetwork;
		}
		if (msg.includes('timeout')) {
			return EscrowError.ProviderTimeout;
		}

		return error?.message || EscrowError.Unknown;
	}
}

export const escrowService = new EscrowService();
