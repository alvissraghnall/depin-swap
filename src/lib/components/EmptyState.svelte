<script lang="ts">
	type Props = {
		title?: string;
		description?: string;
		buttonText?: string;
		buttonLink?: string;
		icon?: string;
		showButton?: boolean;
	};

	let {
		title = 'No Resources Found',
		description = 'No resources match your current filter criteria. Try adjusting your filters or list your own resource.',
		buttonText = 'Clear Filters',
		buttonLink = '#',
		icon = 'search_off',
		showButton = true
	}: Props = $props();
</script>

<div class="mt-12">
	<div
		class="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-gray-300 px-6 py-14 text-center dark:border-white/20"
	>
		<span class="material-symbols-outlined text-5xl text-gray-400 dark:text-white/30">{icon}</span>
		<div class="flex max-w-md flex-col items-center gap-2">
			<p class="text-lg leading-tight font-bold tracking-[-0.015em] text-gray-900 dark:text-white">
				{title}
			</p>
			<p class="text-sm leading-normal font-normal text-gray-600 dark:text-white/60">
				{description}
			</p>
		</div>
		{#if showButton}
			<a
				href={buttonLink}
				class="flex h-10 max-w-[480px] min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-white transition-colors hover:bg-primary/90 dark:bg-white/10 dark:hover:bg-white/20"
			>
				<span class="truncate">{buttonText}</span>
			</a>
		{/if}
	</div>
</div>
