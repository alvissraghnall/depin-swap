<script lang="ts">
	import type { Resource } from '$lib/types/resource';

	let { title, type, duration, provider, price, priceUnit, icon }: Resource = $props();

	let badgeClass = $derived(
		type === 'Storage' ? 'bg-purple-500/10 text-purple-400'  : type === 'Compute' ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'
	);
</script>

<div
	class="hover:border-primary/50 hover:shadow-primary/10 group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
>
	<div class="flex-1 p-5">
		<div class="mb-4 flex items-center justify-between">
			<span
				class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium {badgeClass}"
			>
				{type}
			</span>
			<span class="material-symbols-outlined text-white/40">{icon}</span>
		</div>

		<h3 class="text-lg font-bold text-white">{title}</h3>

		<div class="mt-4 space-y-2 text-sm text-white/70">
			<p>
				<span class="font-medium text-white/90">Duration:</span>
				{duration}
			</p>
			<p>
				<span class="font-medium text-white/90">Provider:</span>
				{provider}
			</p>
		</div>
	</div>

	<div class="border-t border-white/10 bg-white/5 p-4">
		<div class="mb-3 text-center">
			<span class="text-primary text-2xl font-bold">{parseInt(price)} ETH</span>
			<span class="text-sm text-white/60">/ {priceUnit}</span>
		</div>

		<button
			class="bg-primary text-background-dark flex h-10 w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg px-4 text-sm font-bold leading-normal tracking-[0.015em] transition-opacity hover:opacity-80"
		>
			<span class="truncate">Buy Now</span>
		</button>
	</div>
</div>
