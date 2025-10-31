<script lang="ts">
	let {
		searchValue = $bindable(''),
		resourceType = $bindable('All'),
		sortBy = $bindable('Newest'),
		onReset
	} = $props();

	const resourceTypes = ['All', 'Storage', 'Compute', 'Bandwidth'];
	const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Duration'];
</script>

<div class="mb-8 flex flex-wrap items-center gap-4">
	<div class="relative flex-1">
		<span
			class="material-symbols-outlined pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-secondary"
			>search</span
		>
		<input
			class="w-full rounded-lg border border-border bg-surface py-2 pr-4 pl-10 text-text-primary placeholder-text-secondary focus:border-primary focus:ring-primary sm:min-w-64"
			placeholder="Search resources..."
			type="text"
			bind:value={searchValue}
		/>
	</div>

	<div class="flex items-center gap-2">
		<label class="text-sm font-medium text-text-secondary" for="resource-type">Type:</label>
		<select
			class="rounded-lg border border-border bg-surface py-2 pr-8 pl-3 text-text-primary focus:border-primary focus:ring-primary"
			id="resource-type"
			bind:value={resourceType}
		>
			{#each resourceTypes as type}
				<option class="bg-background text-text-primary" value={type}>{type}</option>
			{/each}
		</select>
	</div>

	<div class="flex items-center gap-2">
		<label class="text-sm font-medium text-text-secondary" for="sort-by">Sort By:</label>
		<select
			class="rounded-lg border border-border bg-surface py-2 pr-8 pl-3 text-text-primary focus:border-primary focus:ring-primary"
			id="sort-by"
			bind:value={sortBy}
		>
			{#each sortOptions as option}
				<option class="bg-background text-text-primary" value={option}>{option}</option>
			{/each}
		</select>
	</div>

	<button
		class="hover:bg-surface-variant flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary transition-colors"
		onclick={() => onReset?.()}
	>
		<span class="material-symbols-outlined text-base">refresh</span>
		Reset
	</button>
</div>
