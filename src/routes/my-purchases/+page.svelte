<script lang="ts">
  import { wallet, walletAddress, isConnected } from '$lib/stores/wallet';
  import { getUserPurchases } from '$lib/remote/purchases.remote';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import { onMount } from 'svelte';
	import type { Purchase } from '$lib/server/models/Purchase.model';
	import type { Listing } from '$lib/server/models/Listing.model';

	interface PurchaseWithListing extends Omit<Purchase, 'listing'> {
	  listing: Listing;
	}

  let purchases = $state<PurchaseWithListing[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    if ($isConnected && $walletAddress) {
      fetchUserPurchases($walletAddress);
    } else {
      purchases = [];
      loading = false;
    }
  });

  function formatAddress(address: string | null) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  async function fetchUserPurchases(addr: string) {
    try {
      loading = true;
      error = null;
      
      const result = await getUserPurchases(addr);
      purchases = result as PurchaseWithListing[];
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch purchases';
    } finally {
      loading = false;
    }
  }
</script>

<main class="flex flex-1 justify-center py-10 px-4 sm:px-6 lg:px-8">
  <div class="flex flex-col w-full max-w-full flex-1 gap-y-6">
    <div class="flex flex-wrap justify-between gap-4">
      <h1 class="text-text-primary text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
        My Purchases
      </h1>
    </div>

    {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    {:else if error}
      <div class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
        {error}
      </div>
    {:else if purchases.length === 0}
      <div class="flex flex-col items-center justify-center py-16 gap-4">
        <span class="material-symbols-outlined text-5xl text-text-secondary opacity-30">shopping_cart</span>
        <h2 class="text-xl font-medium text-text-primary">You haven't made any purchases yet</h2>
        <p class="text-text-secondary">When you buy resources from the marketplace, your purchase history will appear here.</p>
        <a 
          href="/"
          class="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-primary-foreground text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
        >
          <span class="truncate">Browse Resources</span>
        </a>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-border">
          <thead>
            <tr class="bg-surface">
              <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Resource
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Provider
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Price
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {#each purchases as purchase (purchase._id)}
              <tr class="border-b border-border hover:bg-surface">
                <td class="px-6 py-4 text-sm text-text-primary">
                  {new Date(purchase.createdAt!).toLocaleDateString()}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center size-10 rounded-lg bg-primary/20 text-primary">
                      <span class="material-symbols-outlined">{purchase.listing?.icon || 'dns'}</span>
                    </div>
                    <div>
                      <p class="font-medium text-text-primary">{purchase.listing?.title || 'Unknown Resource'}</p>
                      <p class="text-sm text-text-secondary">{purchase.listing?.type || 'Unknown'}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-text-primary">
                  {formatAddress(purchase.listing?.provider) || 'Unknown'}
                </td>
                <td class="px-6 py-4 text-sm text-text-primary">
                  {purchase.listing?.price || '0'} {purchase.listing?.priceUnit || 'ETH'}
                </td>
                <td class="px-6 py-4 text-sm text-text-primary">
                  <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                    Completed
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</main>
