import { browser } from '$app/environment';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { sepolia, solanaDevnet, solanaTestnet, type AppKitNetwork } from '@reown/appkit/networks';
import { PUBLIC_REOWN_PROJECT_ID } from '$env/static/public';
import { page } from '$app/state';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';

let appKit: ReturnType<typeof createAppKit> | undefined = undefined;

if (browser) {
	const projectId = PUBLIC_REOWN_PROJECT_ID;
	if (!projectId) {
		throw new Error('Project ID is not set');
	}

	const networks: [AppKitNetwork, ...AppKitNetwork[]] = [solanaTestnet, sepolia, solanaDevnet];

	const ethersAdapter = new EthersAdapter();
	const solAdapter = new SolanaAdapter();

	appKit = createAppKit({
		adapters: [ethersAdapter, solAdapter],
		networks: networks,
		defaultNetwork: sepolia,
		projectId,
		metadata: {
			name: 'OmniDepin',
			description: 'Omnidepin Marketplace',
			url: page.url.hostname,
			icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
		},
		features: {
			socials: false,
			email: false,
		}
	});
}

export { appKit };
