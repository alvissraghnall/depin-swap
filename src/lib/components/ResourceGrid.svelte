<script lang="ts">
	import ResourceCard from './ResourceCard.svelte';
	import type { Resource } from '$lib/types/resource';

	/*
	const resources: Resource[] = [
		{
			title: '1 TB Storage',
			type: 'Storage',
			duration: '6 Months',
			provider: 'Filecoin Network',
			price: '0.15 SOL',
			priceUnit: '6 Months',
			icon: 'database'
		},
		{
			title: '8x vCPU / 32GB RAM',
			type: 'Compute',
			duration: '24 Hours',
			provider: 'Akash Network',
			price: '0.02 ETH',
			priceUnit: '24 Hours',
			icon: 'developer_board'
		},
		{
			title: '500 GB Storage',
			type: 'Storage',
			duration: '3 Months',
			provider: 'Arweave',
			price: '0.08 SOL',
			priceUnit: '3 Months',
			icon: 'database'
		},
		{
			title: 'GPU Compute Power',
			type: 'Compute',
			duration: '12 Hours',
			provider: 'Render Network',
			price: '0.05 ETH',
			priceUnit: '12 Hours',
			icon: 'developer_board'
		},
		{
			title: '4x vCPU / 16GB RAM',
			type: 'Compute',
			duration: '72 Hours',
			provider: 'Akash Network',
			price: '0.03 ETH',
			priceUnit: '72 Hours',
			icon: 'developer_board'
		},
		{
			title: '10 TB Storage',
			type: 'Storage',
			duration: '12 Months',
			provider: 'Sia Network',
			price: '1.25 SOL',
			priceUnit: '12 Months',
			icon: 'database'
		}
	];
	*/

	let { resources }: { resources: Resource[] } = $props();
</script>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
	{#each resources as resource (resource._id)}
		<ResourceCard {...resource} />
	{/each}
</div>
