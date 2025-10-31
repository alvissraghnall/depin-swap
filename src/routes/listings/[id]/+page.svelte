<script lang="ts">
	import { page } from '$app/state';
	import TopNavBar from '$lib/components/TopNavBar.svelte';
	import { wallet, walletAddress, isConnected } from '$lib/stores/wallet';
	import { escrowService } from '$lib/services/escrow';
	import type { Listing } from '$lib/server/models/Listing.model';
	import type { PageProps } from './$types';
	import { isInWishlist, toggleWishlist } from '$lib/remote/wishlist.remote';
	import type { Base } from '@typegoose/typegoose/lib/defaultClasses';

	let listing = $state<(Listing & Base) | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let isProcessing = $state(false);
	let statusMessage = $state<string | null>(null);
	let isWatchlisted = $state(false);
	let showTechnicalDetails = $state(false);
	let inWishlist = $state(false);
	let wishlistLoading = $state(true);

	const listingId = $derived(page.params.id);

	const { data }: PageProps = $props();

	listing = data.listing as Listing & Base;

	async function checkWishlistStatus() {
		if ($isConnected && $walletAddress && listing) {
			try {
				wishlistLoading = true;
				inWishlist = await isInWishlist({
					listingId: listing._id.toString(),
					userAddress: $walletAddress
				});
			} catch (error) {
				console.error('Error checking wishlist status:', error);
			} finally {
				wishlistLoading = false;
			}
		}
	}

	$effect(() => {
		if ($isConnected && $walletAddress) {
			checkWishlistStatus();
		} else {
			inWishlist = false;
			wishlistLoading = false;
		}
	});

	async function handleBuyNow() {
		if (!listing) return;

		if (!$isConnected) {
			await wallet.connect();
			return;
		}

		const isCorrectNetwork = await escrowService.checkNetwork();
		if (!isCorrectNetwork) {
			const switched = await escrowService.switchToSepolia();
			if (!switched) {
				alert('Please switch to Sepolia testnet to continue');
				return;
			}
		}

		isProcessing = true;
		statusMessage = 'Preparing transaction...';

		try {
			statusMessage = 'Waiting for confirmation...';

			const result = await escrowService.createTrade({
				sellerAddress: listing.provider,
				priceInEth: listing.price
			});

			if (result.success) {
				statusMessage = 'Trade created successfully!';
				alert(`Trade created successfully! Transaction hash: ${result.transactionHash}`);
			} else {
				statusMessage = null;
				alert(result.error || 'Transaction failed');
			}
		} catch (error) {
			console.error('Unexpected error:', error);
			statusMessage = null;
			alert('An unexpected error occurred. Please try again.');
		} finally {
			isProcessing = false;
			setTimeout(() => {
				statusMessage = null;
			}, 3000);
		}
	}

	function toggleWatchlist() {
		isWatchlisted = !isWatchlisted;
	}

	async function handleToggleWishlist() {
		if (!$isConnected || !listing) {
			await wallet.connect();
			return;
		}

		isProcessing = true;
		statusMessage = inWishlist ? 'Removing from wishlist...' : 'Adding to wishlist...';

		try {
			const result = await toggleWishlist({
				listingId: listing._id.toString(),
				userAddress: $walletAddress!
			});

			if (result.success) {
				inWishlist = result.action === 'added';
				statusMessage = result.action === 'added' ? 'Added to wishlist!' : 'Removed from wishlist!';
			} else {
				statusMessage = null;
				alert('Failed to update wishlist');
			}
		} catch (error) {
			console.error('Error toggling wishlist:', error);
			statusMessage = null;
			alert('Failed to update wishlist');
		} finally {
			isProcessing = false;
			setTimeout(() => {
				statusMessage = null;
			}, 3000);
		}
	}

	function formatAddress(address: string) {
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	}

	function getIcon(type: string) {
		switch (type) {
			case 'Storage':
				return 'database';
			case 'Compute':
				return 'developer_board';
			case 'Bandwidth':
				return 'wifi';
			default:
				return 'dns';
		}
	}

	function getTypeColor(type: string) {
		switch (type) {
			case 'Storage':
				return 'bg-purple-500/20 text-purple-400';
			case 'Compute':
				return 'bg-teal-500/20 text-teal-400';
			case 'Bandwidth':
				return 'bg-blue-500/20 text-blue-400';
			default:
				return 'bg-primary/20 text-primary';
		}
	}
</script>

<TopNavBar />

<main class="container mx-auto flex-grow px-4 py-8 md:py-12">
	{#if loading}
		<div class="flex h-64 items-center justify-center">
			<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
		</div>
	{:else if error}
		<div class="flex h-64 flex-col items-center justify-center gap-4">
			<span class="material-symbols-outlined text-5xl text-red-400">error</span>
			<p class="text-xl font-medium text-red-400">{error}</p>
			<a href="/" class="text-primary hover:underline">Return to marketplace</a>
		</div>
	{:else if listing}
		<div class="flex flex-col gap-8">
			<!-- Breadcrumb -->
			<div class="flex flex-wrap gap-2 text-sm">
				<a class="text-white/60 hover:text-white" href="/">Marketplace</a>
				<span class="text-white/60">/</span>
				<a class="text-white/60 hover:text-white" href="/">{listing.type}</a>
				<span class="text-white/60">/</span>
				<span class="font-medium text-white">Listing #{listing._id.toString().slice(-6)}</span>
			</div>

			<div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
				<!-- Listing Icon -->
				<div class="flex items-start justify-center lg:col-span-1">
					<div
						class="flex h-64 w-64 items-center justify-center rounded-xl border border-white/10 bg-white/5 shadow-sm"
					>
						<span class="material-symbols-outlined text-9xl text-primary">
							{getIcon(listing.type)}
						</span>
					</div>
				</div>

				<!-- Listing Details -->
				<div class="flex flex-col gap-8 lg:col-span-2">
					<!-- Title and Tags -->
					<div class="flex flex-col gap-4">
						<div class="flex flex-wrap gap-3">
							<div
								class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full {getTypeColor(
									listing.type
								)}"
							>
								<p class="text-sm font-medium">{listing.type}</p>
							</div>
							<div
								class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/20 text-primary"
							>
								<p class="text-sm font-medium">Available</p>
							</div>
							<div
								class="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full border border-white/20 bg-white/10 px-4"
							>
								<p class="text-sm font-medium">Verified Lister</p>
							</div>
						</div>
						<div>
							<h1 class="text-4xl font-bold tracking-tighter text-white">{listing.title}</h1>
							<p class="mt-2 text-white/60">
								High-performance {listing.type.toLowerCase()} resource for your needs.
							</p>
						</div>
					</div>

					<!-- Details Grid -->
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="rounded-lg border border-white/10 bg-white/5 p-4">
							<p class="text-sm text-white/60">Amount</p>
							<p class="text-lg font-semibold text-white">{listing.title}</p>
						</div>
						<div class="rounded-lg border border-white/10 bg-white/5 p-4">
							<p class="text-sm text-white/60">Duration</p>
							<p class="text-lg font-semibold text-white">{listing.duration}</p>
						</div>
						<div class="rounded-lg border border-white/10 bg-white/5 p-4">
							<p class="text-sm text-white/60">Price (ETH)</p>
							<p class="text-lg font-semibold text-white">{listing.price} ETH</p>
						</div>
						<div class="rounded-lg border border-white/10 bg-white/5 p-4">
							<p class="text-sm text-white/60">Price Unit</p>
							<p class="text-lg font-semibold text-white">{listing.priceUnit}</p>
						</div>
					</div>

					<!-- Lister Information -->
					<div class="rounded-lg border border-white/10 bg-white/5 p-6">
						<h3 class="text-lg font-bold text-white">Lister Information</h3>
						<div class="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
							<div class="flex items-center gap-3">
								<div
									class="flex aspect-square size-12 items-center justify-center rounded-full bg-white/10 bg-cover bg-center bg-no-repeat"
								>
									<span class="material-symbols-outlined text-white">person</span>
								</div>
								<div>
									<p class="font-semibold text-white">{formatAddress(listing.provider)}</p>
									<div class="flex items-center gap-1 text-sm text-primary">
										<span class="material-symbols-outlined text-base">verified</span>
										<span>5 successful trades</span>
									</div>
								</div>
							</div>
							<button
								class="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium hover:bg-white/10"
							>
								<span class="material-symbols-outlined text-base">chat_bubble</span>
								<span class="hidden sm:inline">Contact</span>
							</button>
						</div>
					</div>

					<!-- Status Message -->
					{#if statusMessage}
						<div
							class="rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-400"
						>
							{statusMessage}
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="flex flex-col gap-4 sm:flex-row">
						<button
							onclick={handleBuyNow}
							disabled={isProcessing}
							class="text-background-dark flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-bold shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{#if isProcessing}
								<span class="material-symbols-outlined animate-spin">refresh</span>
								<span>Processing...</span>
							{:else if !$isConnected}
								<span>Connect & Buy</span>
							{:else}
								<span>Buy Now</span>
							{/if}
						</button>
						<button
							onclick={handleToggleWishlist}
							disabled={isProcessing || wishlistLoading}
							class="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10 sm:w-auto"
							title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
						>
							<span class="material-symbols-outlined">
								{inWishlist ? 'bookmark' : 'bookmark_add'}
							</span>
							<span class="hidden sm:inline">
								{inWishlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
							</span>
						</button>
					</div>

					<!-- Technical Details -->
					<div class="border-t border-white/10 pt-6">
						<details
							class="group"
							ontoggle={(e) => (showTechnicalDetails = (e.target as HTMLDetailsElement)?.open)}
						>
							<summary
								class="flex cursor-pointer list-none items-center justify-between font-medium"
							>
								<h3 class="text-lg font-bold text-white">Technical Details</h3>
								<div class="transition-transform group-open:rotate-180">
									<span class="material-symbols-outlined text-white">expand_more</span>
								</div>
							</summary>
							<div class="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
								<div class="flex justify-between border-b border-white/10 py-2 sm:border-none">
									<span class="text-white/60">Provider ID:</span>
									<span class="font-mono text-white">{formatAddress(listing.provider)}</span>
								</div>
								<div class="flex justify-between border-b border-white/10 py-2 sm:border-none">
									<span class="text-white/60">Resource Type:</span>
									<span class="text-white">{listing.type}</span>
								</div>
								<div class="flex justify-between border-b border-white/10 py-2 sm:border-none">
									<span class="text-white/60">Created:</span>
									<span class="text-white"
										>{new Date(listing.createdAt as unknown as string).toLocaleDateString()}</span
									>
								</div>
								<div class="flex justify-between py-2 sm:border-none">
									<span class="text-white/60">Status:</span>
									<span class="text-white">{listing.available ? 'Available' : 'Unavailable'}</span>
								</div>
							</div>
						</details>
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>
