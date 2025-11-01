<script lang="ts">
	import MyListingCard from '$lib/components/MyListingCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { PageProps } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { wallet, walletAddress, isConnected } from '$lib/stores/wallet';
	import { getUserListings, deleteListing } from '$lib/remote/listings.remote';
	import { SvelteSet } from 'svelte/reactivity';
	import type { Listing } from '$lib/server/models/Listing.model';

	let { data }: PageProps = $props();

	let loading = $state(true);
	let error = $state<string | null>(null);
	let deleteInProgress = new SvelteSet<string>();

	let userListings = $derived.by(async () => {
		if (!$isConnected || !$walletAddress) {
			return [];
		}
		try {
			return await getUserListings($walletAddress);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to fetch listings';
			return [];
		}
	}) as Promise<Listing[]>;

	$effect(() => {
		if ($isConnected && $walletAddress) {
			loading = false;
		} else {
			loading = false;
		}
	});

	async function handleEdit(id: string) {
		await goto(`/my-listings/edit/${id}`);
	}

	async function handleRemove(id: string) {
		if (!confirm('Are you sure you want to remove this listing? This action cannot be undone.')) {
			return;
		}

		try {
			deleteInProgress.add(id);

			await deleteListing(id);
		} catch (err) {
			console.error('Error removing listing:', err);
			alert(
				err instanceof Error
					? err.message
					: 'An error occurred while removing the listing. Please try again.'
			);
		} finally {
			deleteInProgress.delete(id);
		}
	}

	function handleConnectWallet() {
		wallet.connect();
	}
</script>

<main class="container mx-auto flex-grow px-4 py-8 md:py-12">
	<div class="flex flex-col gap-8">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h1 class="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
				My Listed Resources
			</h1>
			<a
				href="/list-resource"
				class="flex h-10 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90"
			>
				<span class="material-symbols-outlined">add</span>
				<span class="truncate">List a New Resource</span>
			</a>
		</div>

		{#if !$isConnected}
			<div class="flex flex-col items-center justify-center gap-4 py-16">
				<span class="material-symbols-outlined text-5xl text-gray-400">account_circle</span>
				<p class="text-xl font-medium text-gray-600 dark:text-gray-400">
					Connect your wallet to view your listings
				</p>
				<button
					onclick={handleConnectWallet}
					class="flex h-10 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-white transition-opacity hover:opacity-80"
				>
					Connect Wallet
				</button>
			</div>
		{:else if loading}
			<div class="flex items-center justify-center py-12">
				<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
			</div>
		{:else if error}
			<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
				{error}
			</div>
		{:else}
			{#await userListings}
				<div class="flex items-center justify-center py-12">
					<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
				</div>
			{:then listings}
				{#if listings.length === 0}
					<EmptyState
						title="You haven't listed any resources yet"
						description="Get started by listing your spare resources for others to use."
						buttonText="List Your First Resource"
						buttonLink="/list-resource"
						icon="inventory_2"
					/>
				{:else}
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{#each listings as listing (listing._id)}
							<MyListingCard
								{listing}
								onedit={handleEdit}
								onremove={handleRemove}
								disabled={deleteInProgress.has(listing._id.toString())}
							/>
						{/each}
					</div>
				{/if}
			{:catch err}
				<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
					{err instanceof Error ? err.message : 'Failed to load listings'}
				</div>
			{/await}
		{/if}
	</div>
</main>
