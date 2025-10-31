import { BrowserProvider, Contract, parseEther, type Eip1193Provider, type TransactionReceipt } from 'ethers';
import { appKit } from '$lib/appkit';
import escrowAbi from '$lib/abi/contracts_escrow_sol_SimpleEscrow.json';
import { sepolia } from '@reown/appkit/networks';
import { PUBLIC_ESCROW_CONTRACT_ADDRESS } from '$env/static/public'

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
  Unknown = 'An unknown error occurred.',
}

class EscrowService {
  private cachedProvider?: BrowserProvider;
  private cachedContract?: Contract;

  private async getProvider(): Promise<any> {
    if (this.cachedProvider) return this.cachedProvider;

    return new Promise((resolve, reject) => {
      const unsubscribe = appKit?.subscribeProviders((state) => {

        const eip155Provider = state['eip155'] as Eip1193Provider;
        if (eip155Provider && typeof eip155Provider.request === 'function') {
          unsubscribe?.();
          const ethersProvider = new BrowserProvider(eip155Provider);
          this.cachedProvider = ethersProvider;
          resolve(eip155Provider);
        }
      });

      const timeout = setTimeout(() => {
        unsubscribe?.();
        reject(new Error(EscrowError.ProviderTimeout));
      }, 5000);

      const originalResolve = resolve;
      resolve = ((value) => {
        clearTimeout(timeout);
        originalResolve(value);
      }) as typeof resolve;
    });
  }

  private async getContract(): Promise<Contract> {
    if (this.cachedContract) return this.cachedContract;

    const provider = await this.getProvider();
    if (!provider) throw new Error('No provider found');

    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();

    const contract = new Contract(ESCROW_CONTRACT_ADDRESS, escrowAbi, signer);
    this.cachedContract = contract;
    return contract;
  }

  async createTrade({ sellerAddress, priceInEth }: CreateTradeParams): Promise<TradeResult> {
    try {
      if (!/^0x[a-fA-F0-9]{40}$/.test(sellerAddress)) {
        return { success: false, error: EscrowError.InvalidAddress };
      }

      const amount = Number(priceInEth);
      if (isNaN(amount) || amount <= 0) {
        return { success: false, error: EscrowError.InvalidAmount };
      }

      const isSepolia = await this.checkNetwork();
      if (!isSepolia) {
        return { success: false, error: EscrowError.WrongNetwork };
      }

      const contract = await this.getContract();
      const amountInWei = parseEther(priceInEth.toString());

      const tx = await contract.createTrade(sellerAddress, amountInWei, {
        value: amountInWei,
      });

      const receipt: TransactionReceipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
      };
    } catch (error: any) {
      console.error('Error creating trade:', error);
      return { success: false, error: this.mapError(error) };
    }
  }

  async checkNetwork(): Promise<boolean> {
    try {
      const provider = await this.getProvider();
      if (!provider) return false;

      const ethersProvider = new BrowserProvider(provider);
      const network = await ethersProvider.getNetwork();

      return Number(network.chainId) === SEPOLIA_CHAIN_ID;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }

  async switchToSepolia(): Promise<boolean> {
    try {
      if (appKit) {
        await appKit.switchNetwork(sepolia);
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
