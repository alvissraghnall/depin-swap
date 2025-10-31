import { writable, derived } from 'svelte/store';
import { appKit } from '$lib/appkit';
import { browser } from '$app/environment';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
}

function createWalletStore() {
  const { subscribe, update } = writable<WalletState>({
    isConnected: false,
    address: null,
    chainId: null
  });

  if (browser && appKit) {
    appKit.subscribeAccount((account) => {
      update((state) => ({
        ...state,
        isConnected: account.isConnected,
        address: account.address || null
      }));
    });

    appKit.subscribeState((state) => {
      update((prev) => ({
        ...prev,
        chainId: state.selectedNetworkId ? Number(state.selectedNetworkId) : null
      }));
    });
  }

  return {
    subscribe,
    connect: async () => {
      if (appKit) {
        await appKit.open();
      }
    },
    disconnect: async () => {
      if (appKit) {
        await appKit.disconnect();
      }
    }
  };
}

export const wallet = createWalletStore();

export const isConnected = derived(wallet, ($wallet) => $wallet.isConnected);
export const walletAddress = derived(wallet, ($wallet) => $wallet.address);
