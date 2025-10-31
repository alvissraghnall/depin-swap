<script lang="ts">
	import type { Resource } from '$lib/types/resource';
  import type { Listing } from '$lib/server/models/Listing.model';
  import { escrowService } from '$lib/services/escrow';
  
  import { wallet, walletAddress, isConnected } from '$lib/stores/wallet';
  import { isInWishlist, toggleWishlist } from '$lib/remote/wishlist.remote';

	let { _id, title, type, duration, provider, price, priceUnit, icon }: Resource = $props();

	let badgeClass = $derived(
		type === 'Storage'
			? 'bg-purple-500/10 text-purple-400'
			: type === 'Compute'
				? 'bg-teal-500/10 text-teal-400'
				: 'bg-blue-500/10 text-blue-400'
	);
	
  let isProcessing = $state(false);
  let statusMessage = $state<string | null>(null);
  let inWishlist = $state(false);
  let wishlistLoading = $state(true);

  async function checkWishlistStatus() {
    if ($isConnected && $walletAddress) {
      try {
        wishlistLoading = true;
        inWishlist = await isInWishlist({
          listingId: _id.toString(),
          userAddress: $walletAddress
        });
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      } finally {
        wishlistLoading = false;
      }
    }
  }

  $effect(() => {
    if ($isConnected && $walletAddress) {
      checkWishlistStatus();
    } else {
      inWishlist = false;
      wishlistLoading = false;
    }
  });

  async function handleBuyNow() {
    if (!$wallet.isConnected) {
      await wallet.connect();
      return;
    }

    const isCorrectNetwork = await escrowService.checkNetwork();
    if (!isCorrectNetwork) {
      const switched = await escrowService.switchToSepolia();
      if (!switched) {
        alert('Please switch to Sepolia testnet to continue');
        return;
      }
    }

    isProcessing = true;
    statusMessage = 'Preparing transaction...';

    try {
      statusMessage = 'Waiting for confirmation...';

      const result = await escrowService.createTrade({
        sellerAddress: provider,
        priceInEth: price
      });

      if (result.success) {
        statusMessage = 'Trade created successfully!';
        alert(`Trade created successfully! Transaction hash: ${result.transactionHash}`);
      } else {
        statusMessage = null;
        alert(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      statusMessage = null;
      alert('An unexpected error occurred. Please try again.');
    } finally {
      isProcessing = false;
      setTimeout(() => {
        statusMessage = null;
      }, 3000);
    }
  }
  
  async function handleToggleWishlist() {
    if (!$isConnected) {
      await wallet.connect();
      return;
    }

    isProcessing = true;
    statusMessage = inWishlist ? 'Removing from wishlist...' : 'Adding to wishlist...';

    try {
      const result = await toggleWishlist({
        listingId: _id.toString(),
        userAddress: $walletAddress!
      });

      if (result.success) {
        inWishlist = result.action === 'added';
        statusMessage = result.action === 'added'
          ? 'Added to wishlist!'
          : 'Removed from wishlist!';
      } else {
        statusMessage = null;
        alert('Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      statusMessage = null;
      alert('Failed to update wishlist');
    } finally {
      isProcessing = false;
      setTimeout(() => {
        statusMessage = null;
      }, 3000);
    }
  }
</script>

<div
    class="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
>
    <div class="flex-1 p-5">
        <div class="mb-4 flex items-center justify-between">
            <span
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium {badgeClass}"
            >
                {type}
            </span>
            <span class="material-symbols-outlined text-text-secondary opacity-70">{icon}</span>
        </div>

        <h3 class="text-lg font-bold text-text-primary">{title}</h3>

        <div class="mt-4 space-y-2 text-sm text-text-secondary">
            <p>
                <span class="font-medium text-text-primary">Duration:</span>
                {duration}
            </p>
            <p>
                <span class="font-medium text-text-primary">Provider:</span>
                {provider}
            </p>
        </div>
    </div>

	{#if statusMessage}
	    <div class="rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-sm text-blue-400">
	      {statusMessage}
	    </div>
	  {/if}
	  
	  <div class="flex items-center justify-between border-t border-border p-4">
	    <div class="mb-3">
	      <p class="text-sm dark:text-white/60 text-slate-700">Price</p>
	      <p class="text-2xl font-bold text-primary">{parseInt(price as string)} ETH</p>
	      <p class="text-sm dark:text-white/40 text-slate-700">/ {priceUnit}</p>
	    </div>

        <div class="flex gap-2">
            <button
                onclick={handleToggleWishlist}
                disabled={isProcessing || wishlistLoading}
                class="flex h-10 min-w-[40px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface px-3 text-sm font-bold leading-normal tracking-[0.015em] text-text-primary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                {#if wishlistLoading}
                    <span class="material-symbols-outlined animate-spin">refresh</span>
                {:else}
                    <span class="material-symbols-outlined">
                        {inWishlist ? 'bookmark' : 'bookmark_border'}
                    </span>
                {/if}
            </button>

            <button
                onclick={handleBuyNow}
                disabled={isProcessing}
                class="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold leading-normal tracking-[0.015em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <span class="truncate">
                    {#if isProcessing}
                        Processing...
                    {:else if !$isConnected}
                        Connect & Buy
                    {:else}
                        Buy Now
                    {/if}
                </span>
            </button>
        </div>
    </div>
</div>
