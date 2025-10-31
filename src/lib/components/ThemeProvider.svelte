<script lang="ts">
	import { browser } from '$app/environment';
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();

	$effect(() => {
		if (!browser) return;

		const html = document.documentElement;

		html.style.transition = 'none';
		void html.offsetHeight;
		html.style.transition = '';
	});
</script>

{@render children()}
