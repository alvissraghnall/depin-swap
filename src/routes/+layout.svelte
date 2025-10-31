<script>
	import TopNavBar from '$lib/components/TopNavBar.svelte';
	import ThemeProvider from '$lib/components/ThemeProvider.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
		rel="stylesheet"
	/>

	<script>
		(() => {
			try {
				const saved = localStorage.getItem('theme-preference');
				const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
				const theme = saved ?? (systemDark ? 'dark' : 'light');

				document.documentElement.classList.add(theme);
				document.documentElement.style.colorScheme = theme;
			} catch {
				// If localStorage is unavailable (SSR, privacy mode), default to light
				document.documentElement.classList.add('light');
				document.documentElement.style.colorScheme = 'light';
			}
		})();
	</script>
</svelte:head>

<ThemeProvider>
    <div
        class="relative flex min-h-screen w-full flex-col bg-background font-display"
    >
        <TopNavBar />
        {@render children()}
    </div>
</ThemeProvider>

<style>
	:global(html),
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'Space Grotesk', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(body) {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	:global(*) {
		transition:
			background-color 0.3s ease,
			border-color 0.3s ease,
			color 0.3s ease;
	}
</style>
