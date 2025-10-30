<script>
	let searchValue = $state('');
	let resourceType = $state('All');
	let sortBy = $state('Newest');
</script>

<div class="mb-8 flex flex-wrap items-center gap-4">
	<div class="relative flex-1">
		<span
			class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50"
			>search</span
		>
		<input
			class="focus:border-primary focus:ring-primary w-full rounded-lg border border-white/20 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-white/50 sm:min-w-64"
			placeholder="Search resources..."
			type="text"
			bind:value={searchValue}
		/>
	</div>
	<div class="flex items-center gap-2">
		<label class="text-sm font-medium text-white/80" for="resource-type">Type:</label>
		<select
			class="focus:border-primary focus:ring-primary rounded-lg border border-white/20 bg-white/5 py-2 pl-3 pr-8 text-white"
			id="resource-type"
			bind:value={resourceType}
		>
			<option>All</option>
			<option>Storage</option>
			<option>Compute</option>
		</select>
	</div>
	<div class="flex items-center gap-2">
		<label class="text-sm font-medium text-white/80" for="sort-by">Sort By:</label>
		<select
			class="focus:border-primary focus:ring-primary rounded-lg border border-white/20 bg-white/5 py-2 pl-3 pr-8 text-white"
			id="sort-by"
			bind:value={sortBy}
		>
			<option>Newest</option>
			<option>Price: Low to High</option>
			<option>Price: High to Low</option>
			<option>Duration</option>
		</select>
	</div>
</div>
