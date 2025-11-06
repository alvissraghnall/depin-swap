<script lang="ts">
	import TopNavBar from '$lib/components/TopNavBar.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import type { Listing } from '$lib/server/models/Listing.model';
	import { wallet, isConnected, walletAddress } from '$lib/stores/wallet';

	let { data, form }: PageProps = $props();

	let amount = $state('');
	let amountUnit = $state('TB');
	let duration = $state('');
	let durationUnit = $state('Days');
	let price = $state('');
	let currency = $state('FIL');
	let contact = $state(data.listing.contact);
	let provider = $state(data.listing.provider);
	let isProcessing = $state(false);
	let statusMessage = $state<string | null>(null);

	if (data.listing) {
		const title = data.listing.title;
		if (title.includes('TB')) {
			amount = title.split('TB')[0];
			amountUnit = 'TB';
		} else if (title.includes('GB')) {
			amount = title.split('GB')[0];
			amountUnit = 'GB';
		} else if (title.includes('PB')) {
			amount = title.split('PB')[0];
			amountUnit = 'PB';
		} else if (title.includes('vCPU')) {
			amount = title.split('vCPU')[0];
			amountUnit = 'vCPU';
		} else if (title.includes('Mbps')) {
			amount = title.split('Mbps')[0];
			amountUnit = 'Mbps';
		}

		const durationStr = data.listing.duration;
		if (durationStr.includes('Days')) {
			duration = durationStr.split('Days')[0];
			durationUnit = 'Days';
		} else if (durationStr.includes('Weeks')) {
			duration = durationStr.split('Weeks')[0];
			durationUnit = 'Weeks';
		} else if (durationStr.includes('Months')) {
			duration = durationStr.split('Months')[0];
			durationUnit = 'Months';
		} else if (durationStr.includes('Hours')) {
			duration = durationStr.split('Hours')[0];
			durationUnit = 'Hours';
		}
		duration = duration.trim();

		const priceStr = (data.listing.price / 10 ** 9).toString();
		price = priceStr.includes('ETH') ? priceStr.split('ETH')[0] : priceStr;

		contact = data.listing.contact;
	}

	const amountUnits = $derived.by(() => {
		if (!data.listing) return ['GB', 'TB', 'PB'];

		switch (data.listing.type) {
			case 'Storage':
				return ['GB', 'TB', 'PB'];
			case 'Compute':
				return ['vCPU', 'RAM', 'GPU'];
			case 'Bandwidth':
				return ['Mbps', 'Gbps'];
			default:
				return ['GB', 'TB', 'PB'];
		}
	});

	const durationUnits = $derived.by(() => {
		if (!data.listing) return ['Hours', 'Days', 'Weeks', 'Months'];

		switch (data.listing.type) {
			case 'Compute':
				return ['Hours', 'Days'];
			case 'Storage':
			case 'Bandwidth':
				return ['Days', 'Weeks', 'Months'];
			default:
				return ['Hours', 'Days', 'Weeks', 'Months'];
		}
	});

	const handleConnectWallet = async () => {
		await wallet.connect();
	};

	const handleCancel = () => {
		goto('/my-listings');
	};

	function getResourceIcon(type: string) {
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
</script>

<main class="flex flex-1 justify-center px-4 py-10 sm:px-6 lg:px-8">
	<div class="flex w-full max-w-4xl flex-1 flex-col">
		<div class="flex flex-wrap justify-between gap-3 p-4">
			<h1
				class="min-w-72 text-3xl leading-tight font-black tracking-[-0.033em] text-gray-100 sm:text-4xl dark:text-white"
			>
				Edit Listing: {data.listing?.title || 'Loading...'}
			</h1>
		</div>

		{#if form?.error}
			<div class="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
				{form.error}
			</div>
		{/if}

		{#if statusMessage}
			<div class="mb-6 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-blue-400">
				{statusMessage}
			</div>
		{/if}

		{#if !$isConnected}
			<div
				class="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 text-center sm:p-8 dark:border-white/10 dark:bg-black/10"
			>
				<div class="flex flex-col items-center gap-4">
					<span class="material-symbols-outlined text-5xl text-primary">account_circle</span>
					<h2 class="text-xl font-semibold text-white">Connect Your Wallet</h2>
					<p class="max-w-md text-gray-300">
						You need to connect your wallet to edit this listing. This ensures that only the owner
						can modify their listings.
					</p>
					<button
						onclick={handleConnectWallet}
						class="flex h-12 min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-sm leading-normal font-bold tracking-[0.015em] text-[#111618] transition-opacity hover:opacity-90"
					>
						<span class="truncate">Connect Wallet</span>
					</button>
				</div>
			</div>
		{:else}
			<form
				method="POST"
				use:enhance={({ formData }) => {
					isProcessing = true;
					statusMessage = 'Saving changes...';
					formData.set('provider', $walletAddress);

					return async ({ result }) => {
						if (result.type === 'success') {
							statusMessage = 'Listing updated successfully!';
							setTimeout(() => {
								goto('/my-listings');
							}, 1500);
						} else if (result.type === 'failure') {
							console.log(result);
							statusMessage = (result.data?.message as string) || 'Failed to update listing';
						}
						isProcessing = false;
					};
				}}
				class="mt-6 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8 dark:border-white/10 dark:bg-black/10"
			>
				<h2
					class="px-4 pt-2 pb-3 text-[22px] leading-tight font-bold tracking-[-0.015em] text-gray-100 dark:text-white"
				>
					Resource Details
				</h2>

				<div class="grid grid-cols-1 gap-x-8 gap-y-6 p-4 md:grid-cols-2">
					<label class="flex min-w-40 flex-1 flex-col">
						<p class="pb-2 text-base leading-normal font-medium text-gray-200 dark:text-gray-200">
							Resource Type
						</p>
						<div
							class="flex items-center gap-3 rounded-lg border border-[#3b4d54] bg-[#1c2427]/50 p-3"
						>
							<span class="material-symbols-outlined text-primary">
								{getResourceIcon(data.listing?.type || 'Storage')}
							</span>
							<input
								class="form-input flex h-14 w-full min-w-0 flex-1 cursor-not-allowed resize-none overflow-hidden rounded-lg border border-[#3b4d54] bg-[#1c2427]/50 p-[15px] text-base leading-normal font-normal text-gray-400 focus:border-primary focus:ring-0 focus:outline-0 dark:text-gray-400"
								disabled
								value={data.listing?.type || ''}
							/>
						</div>
						<p class="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
							Resource type cannot be changed after listing.
						</p>
					</label>
					<div></div>

					<div class="flex flex-wrap items-end gap-4">
						<label class="flex min-w-40 flex-1 flex-col">
							<p class="pb-2 text-base leading-normal font-medium text-gray-200 dark:text-gray-200">
								Total Amount
							</p>
							<input
								name="amount"
								class="form-input flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#3b4d54] bg-[#1c2427] p-[15px] text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-0"
								bind:value={amount}
								required
							/>
						</label>
						<label class="flex min-w-[120px] flex-auto flex-col">
							<p class="pb-2 text-base leading-normal font-medium text-gray-200 dark:text-gray-200">
								Unit
							</p>
							<div class="relative">
								<select
									name="amountUnit"
									class="form-select h-14 w-full min-w-0 flex-1 resize-none appearance-none overflow-hidden rounded-lg border border-[#3b4d54] bg-[#1c2427] p-[15px] pr-10 pl-4 text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-0"
									bind:value={amountUnit}
								>
									{#each amountUnits as unit}
										<option value={unit}>{unit}</option>
									{/each}
								</select>
								<span
									class="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
									>expand_more</span
								>
							</div>
						</label>
					</div>

					<div class="flex flex-wrap items-end gap-4">
						<label class="flex min-w-40 flex-1 flex-col">
							<p class="pb-2 text-base leading-normal font-medium text-gray-200 dark:text-gray-200">
								Lease Duration
							</p>
							<input
								name="duration"
								class="form-input flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#3b4d54] bg-[#1c2427] p-[15px] text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-0"
								bind:value={duration}
								required
							/>
						</label>
						<label class="flex min-w-[120px] flex-auto flex-col">
							<p class="pb-2 text-base leading-normal font-medium text-gray-200 dark:text-gray-200">
								Period
							</p>
							<div class="relative">
								<select
									name="durationUnit"
									class="form-select h-14 w-full min-w-0 flex-1 resize-none appearance-none overflow-hidden rounded-lg border border-[#3b4d54] bg-[#1c2427] p-[15px] pr-10 pl-4 text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-0"
									bind:value={durationUnit}
								>
									{#each durationUnits as unit}
										<option value={unit}>{unit}</option>
									{/each}
								</select>
								<span
									class="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
									>expand_more</span
								>
							</div>
						</label>
					</div>

					<div class="flex flex-wrap items-end gap-4">
						<label class="flex min-w-40 flex-1 flex-col">
							<p class="pb-2 text-base leading-normal font-medium text-gray-200 dark:text-gray-200">
								Price (per {amountUnit}/day)
							</p>
							<input
								name="price"
								class="form-input flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#3b4d54] bg-[#1c2427] p-[15px] text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-0"
								bind:value={price}
								required
							/>
						</label>
						<label class="flex min-w-[120px] flex-auto flex-col">
							<p class="pb-2 text-base leading-normal font-medium text-gray-200 dark:text-gray-200">
								Currency
							</p>
							<div class="relative">
								<select
									name="currency"
									class="form-select h-14 w-full min-w-0 flex-1 resize-none appearance-none overflow-hidden rounded-lg border border-[#3b4d54] bg-[#1c2427] p-[15px] pr-10 pl-4 text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-0"
									bind:value={currency}
								>
									<option value="ETH">ETH</option>
								</select>
								<span
									class="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
									>expand_more</span
								>
							</div>
						</label>
					</div>

					<label class="flex min-w-40 flex-1 flex-col">
						<p class="pb-2 text-base leading-normal font-medium text-gray-200 dark:text-gray-200">
							Contact Information
						</p>
						<input
							name="contact"
							class="form-input flex h-14 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-[#3b4d54] bg-[#1c2427] p-[15px] text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-2 focus:ring-primary/50 focus:outline-0"
							placeholder="e.g., Telegram handle or encrypted email"
							bind:value={contact}
							required
						/>
						<p class="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
							Provide a secure way for buyers to contact you.
						</p>
					</label>
				</div>

				<div class="mt-6 flex justify-end gap-4 border-t border-white/10 p-4 dark:border-white/10">
					<button
						type="button"
						onclick={handleCancel}
						class="flex h-12 max-w-[480px] min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-transparent bg-transparent px-6 text-sm leading-normal font-bold tracking-[0.015em] text-gray-300 transition-colors hover:bg-white/10 dark:text-gray-300 dark:hover:bg-black/20"
					>
						<span class="truncate">Cancel</span>
					</button>
					<button
						type="submit"
						disabled={isProcessing}
						class="flex h-12 max-w-[480px] min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-sm leading-normal font-bold tracking-[0.015em] text-[#111618] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span class="truncate">
							{#if isProcessing}
								<span class="material-symbols-outlined mr-2 animate-spin">refresh</span>
								Saving...
							{:else}
								Save Changes
							{/if}
						</span>
					</button>
				</div>
			</form>
		{/if}
	</div>
</main>
