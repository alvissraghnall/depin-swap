<script lang="ts">
	import type { Listing } from '$lib/server/models/Listing.model';
	import type { Base } from '@typegoose/typegoose/lib/defaultClasses';

	
	type Props = {
		listing: Listing & Base;
		onedit?: (id: string) => void;
		onremove?: (id: string) => void;
	};

	let { listing, onedit, onremove }: Props = $props();

	const amount = $derived(
		listing.title.includes('GB')
			? listing.title.split('GB')[0] + ' GB'
			: listing.title.includes('TB')
				? listing.title.split('TB')[0] + ' TB'
				: listing.title.includes('vCPU')
					? listing.title.split('vCPU')[0] + ' vCPU'
					: listing.title.includes('Mbps')
						? listing.title.split('Mbps')[0] + ' Mbps'
						: listing.title
	);

	const statusColor = $derived(
		listing.available
			? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
			: 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300'
	);

	const statusText = $derived(listing.available ? 'Active' : 'Pending');

	function handleEdit() {
		onedit?.(listing._id as unknown as string);
	}

	function handleRemove() {
		onremove?.(listing._id as unknown as string);
	}
</script>

<div
	class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/50"
>
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<div class="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary">
				<span class="material-symbols-outlined">{listing.icon}</span>
			</div>
			<p class="text-base font-bold text-gray-900 dark:text-white">{listing.type}</p>
		</div>
		<span
			class="inline-flex items-center rounded-full {statusColor} px-2.5 py-0.5 text-xs font-medium"
		>
			{statusText}
		</span>
	</div>
	<div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
		<p><span class="font-medium text-gray-700 dark:text-gray-300">Amount:</span> {amount}</p>
		<p>
			<span class="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
			{listing.duration}
		</p>
		<p>
			<span class="font-medium text-gray-700 dark:text-gray-300">Price:</span>
			{listing.price} ETH {listing.priceUnit}
		</p>
	</div>
	<div class="mt-2 flex gap-3">
		<button
			onclick={handleEdit}
			class="flex h-9 flex-1 items-center justify-center overflow-hidden rounded-lg bg-gray-200 px-3 text-sm font-bold text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
		>
			<span class="truncate">Edit</span>
		</button>
		<button
			onclick={handleRemove}
			class="flex h-9 flex-1 items-center justify-center overflow-hidden rounded-lg bg-transparent px-3 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/10 dark:text-red-400"
		>
			<span class="truncate">Remove</span>
		</button>
	</div>
</div>
