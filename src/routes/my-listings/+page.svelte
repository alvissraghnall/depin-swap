<script lang="ts">
	import MyListingCard from '$lib/components/MyListingCard.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { PageProps } from './$types';
	import { goto, invalidateAll } from '$app/navigation';

	let { data }: PageProps = $props();

	async function handleEdit(id: string) {
		await goto(`/my-listings/edit/${id}`);
	}

	async function handleRemove(id: string) {
		if (!confirm('Are you sure you want to remove this listing? This action cannot be undone.')) {
			return;
		}

		try {
			const response = await fetch(`/api/listings/${id}`, {
				method: 'DELETE'
			});

			if (!response.ok) {
				const error = await response.json();
				alert(error.message || 'Failed to remove listing');
				return;
			}

			await invalidateAll();
		} catch (error) {
			console.error('Error removing listing:', error);
			alert('An error occurred while removing the listing. Please try again.');
		}
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

		{#if data.error}
			<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
				{data.error}
			</div>
		{:else if data.listings.length === 0}
			<EmptyState
				title="You haven't listed any resources yet"
				description="Get started by listing your spare resources for others to use."
				buttonText="List Your First Resource"
				buttonLink="/list-resource"
				icon="inventory_2"
			/>
		{:else}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				{#each data.listings as listing (listing._id)}
					<MyListingCard {listing} onedit={handleEdit} onremove={handleRemove} />
				{/each}
			</div>
		{/if}
	</div>
</main>
