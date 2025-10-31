<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import ResourceCard from '$lib/components/ResourceCard.svelte';
  import { walletAddress, isConnected, wallet } from '$lib/stores/wallet';
  import { getUserWishlist } from '$lib/remote/wishlist.remote';
  import { onMount } from 'svelte';
	import type { Wishlist } from '$lib/server/models/Wishlist.model';
	import type { Listing } from '$lib/server/models/Listing.model';

  let wishlistItems = $state<Array<Listing>>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function fetchWishlist() {
    if (!$isConnected || !$walletAddress) {
      loading = false;
      return;
    }

    try {
      loading = true;
      error = null;
      const items = await getUserWishlist({ userAddress: $walletAddress });
      wishlistItems = items.map(item => item.listing);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Failed to fetch wishlist';
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    fetchWishlist();
  });
</script>

<main class="flex-grow container mx-auto px-4 py-8 md:py-12">
  <div class="flex flex-col gap-8">
    <div class="flex flex-wrap justify-between items-center gap-4">
      <h1 class="text-4xl font-black tracking-tighter text-white">My Wishlist</h1>
    </div>

    {#if loading}
      <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    {:else if error}
      <div class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
        {error}
      </div>
    {:else if !$isConnected}
      <div class="flex flex-col items-center justify-center py-16 gap-4">
        <span class="material-symbols-outlined text-5xl text-white/30">account_circle</span>
        <p class="text-xl font-medium text-white/80">Connect your wallet to view your wishlist</p>
        <button
          onclick={() => wallet.connect()}
          class="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] transition-opacity hover:opacity-80"
        >
          Connect Wallet
        </button>
      </div>
    {:else if wishlistItems.length === 0}
      <div class="flex flex-col items-center justify-center py-16 gap-4">
        <span class="material-symbols-outlined text-5xl text-white/30">bookmark_border</span>
        <p class="text-xl font-medium text-white/80">Your wishlist is empty</p>
        <a 
          href="/"
          class="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-background-dark text-sm font-bold leading-normal tracking-[0.015em] transition-opacity hover:opacity-80"
        >
          Browse Resources
        </a>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each wishlistItems as listing (listing._id)}
          <ResourceCard {...listing} />
        {/each}
      </div>
    {/if}
  </div>
</main>
