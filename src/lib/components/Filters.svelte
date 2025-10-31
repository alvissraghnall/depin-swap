<script>
	let searchValue = $state('');
	let resourceType = $state('All');
	let sortBy = $state('Newest');
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
            <option class="bg-background text-text-primary">All</option>
            <option class="bg-background text-text-primary">Storage</option>
            <option class="bg-background text-text-primary">Compute</option>
        </select>
    </div>
    <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-text-secondary" for="sort-by">Sort By:</label>
        <select
            class="rounded-lg border border-border bg-surface py-2 pr-8 pl-3 text-text-primary focus:border-primary focus:ring-primary"
            id="sort-by"
            bind:value={sortBy}
        >
            <option class="bg-background text-text-primary">Newest</option>
            <option class="bg-background text-text-primary">Price: Low to High</option>
            <option class="bg-background text-text-primary">Price: High to Low</option>
            <option class="bg-background text-text-primary">Duration</option>
        </select>
    </div>
</div>
