<script lang="ts">
	import PageHeading from '$lib/components/PageHeading.svelte';
	import Filters from '$lib/components/Filters.svelte';
	import ResourceGrid from '$lib/components/ResourceGrid.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { PageProps } from './$types';
	import type { Listing } from '$lib/server/models/Listing.model';

	let { data }: PageProps = $props();

	let searchValue = $state('');
	let resourceType = $state('All');
	let sortBy = $state('Newest');

	let filteredListings: Listing[] = $derived.by(() => {
		let filtered = [...data.listings];

		if (searchValue.trim()) {
			const searchLower = searchValue.toLowerCase().trim();
			filtered = filtered.filter(
				(listing) =>
					listing.title.toLowerCase().includes(searchLower) ||
					listing.type.toLowerCase().includes(searchLower) ||
					listing.provider.toLowerCase().includes(searchLower) ||
					listing.duration.toLowerCase().includes(searchLower)
			);
		}

		if (resourceType !== 'All') {
			filtered = filtered.filter((listing) => listing.type === resourceType);
		}

		switch (sortBy) {
			case 'Price: Low to High':
				filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
				break;
			case 'Price: High to Low':
				filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
				break;
			case 'Duration':
				// Extract numeric value from duration for sorting
				filtered.sort((a, b) => {
					const extractNumber = (str: string) => {
						const match = str.match(/(\d+)/);
						return match ? parseInt(match[0]) : 0;
					};
					return extractNumber(b.duration) - extractNumber(a.duration);
				});
				break;
			case 'Newest':
			default:
				break;
		}

		console.log(filtered);

		return filtered;
	});

	$inspect(filteredListings, searchValue, resourceType, sortBy);

	function resetFilters() {
		searchValue = '';
		resourceType = 'All';
		sortBy = 'Newest';
	}
</script>

<main class="flex-1">
	<div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<PageHeading />
		<Filters bind:searchValue={searchValue} bind:resourceType={resourceType} bind:sortBy={sortBy} onReset={resetFilters} />

		{#if data.error}
			<div class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
				{data.error}
			</div>
		{:else if filteredListings.length === 0}
			<EmptyState
				title="No resources found"
				description="Try adjusting your filters or search terms"
				buttonText="Clear Filters"
				buttonAction={resetFilters}
			/>
		{:else}
			<ResourceGrid resources={filteredListings} />
		{/if}
	</div>
</main>
