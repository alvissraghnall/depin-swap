<script lang="ts">
	import {
		theme,
		themePreference,
		setTheme,
		toggleTheme,
		cycleTheme,
		isDark
	} from '$lib/stores/theme';
	import { browser } from '$app/environment';

	type ToggleVariant = 'simple' | 'advanced' | 'switch';
	type Props = {
		variant?: ToggleVariant;
	};

	let { variant = 'simple' }: Props = $props();

	const currentTheme = $derived($theme);
	const currentPreference = $derived($themePreference);
	const darkMode = $derived($isDark);

	let mounted = $state(false);
	let dropdownOpen = $state(false);

	const icons = {
		light: 'light_mode',
		dark: 'dark_mode',
		system: 'computer'
	} as const;

	const tooltips = {
		light: 'Switch to dark mode',
		dark: 'Switch to light mode',
		system: 'Follow system theme'
	} as const;

	const labels = {
		light: 'Light',
		dark: 'Dark',
		system: 'System'
	} as const;

	function handleThemeChange(newTheme: 'light' | 'dark' | 'system') {
		setTheme(newTheme);
		dropdownOpen = false;
	}

	function handleToggle() {
		toggleTheme();
	}

	function handleCycle() {
		cycleTheme();
	}

	function toggleDropdown() {
		dropdownOpen = !dropdownOpen;
	}

	function closeDropdown() {
		dropdownOpen = false;
	}
</script>

{#if variant === 'simple'}
	<div class="theme-toggle-simple">
		<button
			type="button"
			class="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
			onclick={handleToggle}
			title={tooltips[currentPreference]}
			aria-label="Toggle dark mode"
		>
			{#if browser}
				<span class="material-symbols-outlined text-xl">
					{!darkMode ? icons.dark : icons.light}
				</span>
			{:else}
				<span class="material-symbols-outlined text-xl opacity-0"> light_mode </span>
			{/if}
		</button>
	</div>
{:else if variant === 'advanced'}
	<div class="theme-toggle-advanced relative">
		<button
			type="button"
			class="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
			onclick={toggleDropdown}
			title={tooltips[currentPreference]}
			aria-label="Toggle theme"
		>
			{#if browser}
				<span class="material-symbols-outlined text-xl">
					{icons[currentPreference]}
				</span>
			{:else}
				<span class="material-symbols-outlined text-xl opacity-0"> computer </span>
			{/if}
		</button>

		{#if dropdownOpen}
			<div
				class="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
			>
				<button
					type="button"
					class="{currentPreference === 'light'
						? 'dark:bg-blue-900/20'
						: ''} flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
					class:bg-blue-50={currentPreference === 'light'}
					class:text-blue-600={currentPreference === 'light'}
					class:dark:text-blue-400={currentPreference === 'light'}
					onclick={() => handleThemeChange('light')}
				>
					<span class="material-symbols-outlined text-lg">{icons.light}</span>
					<span>{labels.light}</span>
					{#if currentPreference === 'light'}
						<span class="material-symbols-outlined ml-auto text-primary">check</span>
					{/if}
				</button>

				<button
					type="button"
					class="{currentPreference === 'light'
						? 'dark:bg-blue-900/20'
						: ''} flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
					class:bg-blue-50={currentPreference === 'dark'}
					class:text-blue-600={currentPreference === 'dark'}
					class:dark:text-blue-400={currentPreference === 'dark'}
					onclick={() => handleThemeChange('dark')}
				>
					<span class="material-symbols-outlined text-lg">{icons.dark}</span>
					<span>{labels.dark}</span>
					{#if currentPreference === 'dark'}
						<span class="material-symbols-outlined ml-auto text-primary">check</span>
					{/if}
				</button>

				<button
					type="button"
					class="{currentPreference === 'light'
						? 'dark:bg-blue-900/20'
						: ''} flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
					class:bg-blue-50={currentPreference === 'system'}
					class:text-blue-600={currentPreference === 'system'}
					class:dark:text-blue-400={currentPreference === 'system'}
					onclick={() => handleThemeChange('system')}
				>
					<span class="material-symbols-outlined text-lg">{icons.system}</span>
					<span>{labels.system}</span>
					{#if currentPreference === 'system'}
						<span class="material-symbols-outlined ml-auto text-primary">check</span>
					{/if}
				</button>
			</div>
			<button class="fixed inset-0 z-40" onclick={closeDropdown} aria-label="Close dropdown"
			></button>
		{/if}
	</div>
{:else if variant === 'switch'}
	<div class="theme-toggle-switch">
		<button
			type="button"
			class="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors dark:bg-gray-700"
			onclick={handleToggle}
			aria-label="Toggle dark mode"
		>
			<span
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {darkMode
					? 'translate-x-6'
					: 'translate-x-1'}"
			></span>
		</button>
	</div>
{/if}
