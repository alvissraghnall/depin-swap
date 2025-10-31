<script lang="ts">
	import PageHeading from '$lib/components/PageHeading.svelte';
	import Filters from '$lib/components/Filters.svelte';
	import ResourceGrid from '$lib/components/ResourceGrid.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	console.log(data);
</script>

<main class="flex-1">
	<div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<PageHeading />
		<Filters />

		{#if data.error}
			<div class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
				{data.error}
			</div>
		{:else if data.listings.length === 0}
			<EmptyState />
		{:else}
			<ResourceGrid resources={data.listings} />
		{/if}
		<!-- <ResourceGrid /> -->
	</div>
</main>
