<script lang="ts">
	type Props = {
		title?: string;
		description?: string;
		buttonText?: string;
		buttonLink?: string;
		buttonAction?: () => unknown;
		icon?: string;
		showButton?: boolean;
	};

	let {
		title = 'No Resources Found',
		description = 'No resources match your current filter criteria. Try adjusting your filters or list your own resource.',
		buttonText = 'Clear Filters',
		buttonLink = '#',
		buttonAction,
		icon = 'search_off',
		showButton = true
	}: Props = $props();
</script>

<div class="mt-12">
	<div
		class="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-border px-6 py-14 text-center"
	>
		<span class="material-symbols-outlined text-5xl text-text-secondary opacity-60">{icon}</span>
		<div class="flex max-w-md flex-col items-center gap-2">
			<p class="text-lg leading-tight font-bold tracking-[-0.015em] text-text-primary">
				{title}
			</p>
			<p class="text-sm leading-normal font-normal text-text-secondary">
				{description}
			</p>
		</div>
		{#if showButton}
			{#if buttonAction}
				<button
					class="flex h-10 max-w-[480px] min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold text-text-primary transition-colors hover:bg-primary/90"
					onclick={buttonAction}
				>
					<span class="truncate">{buttonText}</span>
				</button>
			{:else}
				<a
					href={buttonLink}
					class="flex h-10 max-w-[480px] min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-primary-foreground transition-colors hover:bg-primary/90"
				>
					<span class="truncate">{buttonText}</span>
				</a>
			{/if}
		{/if}
	</div>
</div>
