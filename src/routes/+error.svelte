<script lang="ts">
	import { page } from '$app/state';
</script>

<div
	class="flex min-h-screen w-full flex-col items-center justify-center bg-background p-6 font-display"
>
	<div class="flex max-w-md flex-col items-center gap-4 text-center">
		<span class="material-symbols-outlined text-7xl text-primary">
			{#if page.status === 404}
				search_off
			{:else}
				error
			{/if}
		</span>

		<h1 class="text-7xl font-black tracking-tighter text-text-primary">
			{page.status}
		</h1>

		<p class="text-2xl font-bold tracking-tight text-text-primary">
			{#if page.status === 404}
				Page Not Found
			{:else}
				Oops! Something went wrong
			{/if}
		</p>

		<p class="text-base text-text-secondary">
			{#if page.status === 404}
				We're sorry, but the page you're looking for doesn't exist or may have been moved.
			{:else}
				{page.error?.message || 'An unexpected error occurred. Our team has been notified.'}
			{/if}
		</p>

		<a
			href="/"
			class="mt-6 flex h-10 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-5 text-sm font-bold leading-normal tracking-[0.015em] text-primary-foreground transition-opacity hover:opacity-80"
		>
			Go Back Home
		</a>
	</div>
</div>
