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
			wishlistItems = items.map((item) => item.listing);
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

<main class="container mx-auto flex-grow px-4 py-8 md:py-12">
	<div class="flex flex-col gap-8">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h1 class="text-4xl font-black tracking-tighter text-text-primary">My Wishlist</h1>
		</div>

		{#if loading}
			<div class="flex items-center justify-center py-12">
				<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
			</div>
		{:else if error}
			<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
				{error}
			</div>
		{:else if !$isConnected}
			<div class="flex flex-col items-center justify-center gap-4 py-16">
				<span class="material-symbols-outlined text-5xl text-text-secondary opacity-30"
					>account_circle</span
				>
				<p class="text-xl font-medium text-text-secondary">
					Connect your wallet to view your wishlist
				</p>
				<button
					onclick={() => wallet.connect()}
					class="flex h-10 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-primary-foreground transition-opacity hover:opacity-80"
				>
					Connect Wallet
				</button>
			</div>
		{:else if wishlistItems.length === 0}
			<div class="flex flex-col items-center justify-center gap-4 py-16">
				<span class="material-symbols-outlined text-5xl text-text-secondary opacity-30"
					>bookmark_border</span
				>
				<p class="text-xl font-medium text-text-secondary">Your wishlist is empty</p>
				<a
					href="/"
					class="flex h-10 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-primary-foreground transition-opacity hover:opacity-80"
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
