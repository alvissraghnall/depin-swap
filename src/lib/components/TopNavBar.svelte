<script lang="ts">
	import { page } from '$app/state';
	import Logo from './Logo.svelte';
	import DarkModeToggle from './DarkModeToggle.svelte';
	import { appKit } from '$lib/appkit';
	import { wallet, walletAddress, isConnected } from '$lib/stores/wallet';

	const currentPath = $derived(page.url.pathname);
	let mobileMenuOpen = $state(false);

	const navLinks = [
		{ href: '/', label: 'Marketplace' },
		{ href: '/my-listings', label: 'My Listings' },
		{ href: '/wishlist', label: 'Wishlist' },
		{ href: '/list-resource', label: 'List Resource' }
		//{ href: '/faq', label: 'FAQ' }
	];

	function isActive(href: string) {
		if (href === '/') {
			return currentPath === '/';
		}
		return currentPath.startsWith(href);
	}

	function closeMenu() {
		mobileMenuOpen = false;
	}

	function openConnectModal() {
		appKit?.open({ view: 'Connect' });
	}

	function handleDisconnect() {
		wallet.disconnect();
	}

	function formatAddress(address: string | null) {
		if (!address) return '';
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}

	function copyAddress() {
		if ($walletAddress) {
			navigator.clipboard.writeText($walletAddress);
		}
	}
</script>

<header class="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-sm">
	<div
		class="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
	>
		<div class="flex items-center gap-4 text-text-primary">
			<div class="size-6 text-primary">
				<Logo />
			</div>
			<h2 class="text-lg leading-tight font-bold tracking-[-0.015em] text-text-primary">Oimat</h2>
		</div>

		<nav class="hidden items-center gap-9 md:flex">
			{#each navLinks as { href, label }}
				<a
					{href}
					class="text-sm font-medium transition-colors hover:text-text-primary {!isActive(href)
						? 'text-text-secondary'
						: ''}"
					class:text-primary={isActive(href)}
				>
					{label}
				</a>
			{/each}
		</nav>

		<div class="flex items-center gap-4">
			{#if $isConnected}
				<div class="hidden items-center gap-2 md:flex">
					<div
						class="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 transition-colors hover:bg-surface-hover"
						onclick={copyAddress}
						title="Click to copy address"
					>
						<div class="h-2 w-2 rounded-full bg-green-500"></div>
						<span class="text-sm font-medium text-text-primary">
							{formatAddress($walletAddress)}
						</span>
					</div>
					<button
						onclick={handleDisconnect}
						class="flex items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
						title="Disconnect wallet"
					>
						<span class="material-symbols-outlined">logout</span>
					</button>
				</div>
			{:else}
				<button
					onclick={openConnectModal}
					class="hidden h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-primary-foreground transition-opacity hover:opacity-80 md:flex"
				>
					<span class="truncate">Connect Wallet</span>
				</button>
			{/if}

			<DarkModeToggle />

			<button
				class="flex items-center justify-center text-text-primary md:hidden"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
				aria-label="Toggle menu"
			>
				<span class="material-symbols-outlined text-3xl">
					{mobileMenuOpen ? 'close' : 'menu'}
				</span>
			</button>
		</div>
	</div>

	{#if mobileMenuOpen}
		<div class="border-t border-border bg-background md:hidden">
			<nav class="container mx-auto flex flex-col px-4 py-4">
				{#each navLinks as { href, label }}
					<a
						{href}
						onclick={closeMenu}
						class="border-b border-surface py-3 text-base font-medium transition-colors last:border-b-0 hover:text-text-primary {!isActive(
							href
						)
							? 'text-text-secondary'
							: ''}"
						class:text-primary={isActive(href)}
					>
						{label}
					</a>
				{/each}

				<div class="pt-4">
					{#if $isConnected}
						<div
							class="mb-3 flex items-center justify-between rounded-lg border border-border bg-surface p-3"
						>
							<div class="flex items-center gap-2">
								<div class="h-2 w-2 rounded-full bg-green-500"></div>
								<span class="text-sm font-medium text-text-primary">
									{formatAddress($walletAddress)}
								</span>
							</div>
							<button
								onclick={handleDisconnect}
								class="flex items-center justify-center rounded-lg p-1 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
								title="Disconnect wallet"
							>
								<span class="material-symbols-outlined text-lg">logout</span>
							</button>
						</div>
					{:else}
						<button
							onclick={openConnectModal}
							class="flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-primary-foreground transition-opacity hover:opacity-80"
						>
							<span class="truncate">Connect Wallet</span>
						</button>
					{/if}
				</div>
			</nav>
		</div>
	{/if}
</header>
