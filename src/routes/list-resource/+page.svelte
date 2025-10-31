<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { wallet } from '$lib/stores/wallet';
	import type { ActionData } from './$types';

	let { form = $bindable() }: { form: ActionData } = $props();

	let formData = $state({
		resourceType: '',
		amount: 0,
		duration: '',
		price: 0,
		contact: ''
	});

	const amountUnit = $derived.by(() => {
		switch (formData.resourceType) {
			case 'storage':
				return `GB`;
			case 'compute':
				return `vCPU`;
			case 'bandwidth':
				return `Mbps`;
			default:
				return 'GB';
		}
	});

	async function handleConnect() {
		await wallet.connect();
	}

</script>

<main class="flex h-full grow flex-col">
	<div class="container mx-auto flex flex-1 justify-center px-4 py-10 sm:py-16">
		<div class="flex w-full max-w-2xl flex-col">
			<div class="mb-8 flex flex-wrap justify-between gap-3 p-4">
				<h1 class="text-4xl leading-tight font-black tracking-[-0.033em] text-white sm:text-5xl">
					List Your DePin Resource
				</h1>
			</div>

			<div
				class="flex w-full flex-col gap-6 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8"
			>
				<h2 class="text-2xl leading-tight font-bold tracking-[-0.015em] text-white">
					Listing Details
				</h2>

				{#if !$wallet.isConnected}
					<div class="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-yellow-400">
						<div class="flex items-center justify-between gap-4">
							<span>Please connect your wallet to list a resource.</span>
							<button
								onclick={handleConnect}
								class="flex h-9 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm font-bold leading-normal tracking-[0.015em] text-background-dark transition-opacity hover:opacity-90"
							>
								Connect Wallet
							</button>
						</div>
					</div>
				{/if}

				{#if form?.error}
					<div class="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
						{form.message}
					</div>
				{/if}

				{#if form?.success}
					<div
						class="rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-green-400"
					>
						{form.message}
					</div>
				{/if}

				<form
					method="POST"
					action="/list-resource?"
					use:enhance={async ({ formData, cancel, controller }) => {

						if (!$wallet.isConnected || !$wallet.address) {
							alert('Please connect your wallet before submitting a listing.');
							handleConnect();
							cancel();
							controller.abort('Wallet not connected!');
							return;
						}
						formData.set('provider', $wallet.address);
						return async ({ result }) => {
							console.log(result);
							if (result.type === 'success') {
								await goto('/my-resources');
							}
						};
					}}
					class="flex flex-col gap-6"
				>
					<div class="flex flex-col">
						<label class="pb-2 text-base leading-normal font-medium text-white" for="resource-type"
							>Resource Type</label
						>
						<div class="relative">
							<select
								class="form-select w-full appearance-none rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
								id="resource-type"
								name="resourceType"
								bind:value={formData.resourceType}
								disabled={!$wallet.isConnected}
								required
							>
								<option value="">Select a resource type</option>
								<option value="storage">Storage</option>
								<option value="compute">Compute</option>
								<option value="bandwidth">Bandwidth</option>
							</select>
							<div
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
							>
								<span class="material-symbols-outlined">expand_more</span>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div class="flex flex-col">
							<label class="pb-2 text-base leading-normal font-medium text-white" for="amount"
								>Amount</label
							>
							<div class="relative">
								<input
									class="form-input w-full rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 pr-16 text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
									id="amount"
									name="amount"
									bind:value={formData.amount}
									placeholder="e.g., 6"
									type="number"
									disabled={!$wallet.isConnected}
									required
								/>
								<span
									class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-[#9db2b9]"
									>{amountUnit}</span
								>
							</div>
						</div>

						<div class="flex flex-col">
							<label class="pb-2 text-base leading-normal font-medium text-white" for="duration"
								>Duration</label
							>
							<div class="relative">
								<input
									class="form-input w-full rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 pr-20 text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
									id="duration"
									name="duration"
									bind:value={formData.duration}
									placeholder="e.g., 30"
									type="number"
									disabled={!$wallet.isConnected}
									required
								/>
								<span
									class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-[#9db2b9]"
									>Days</span
								>
							</div>
						</div>
					</div>

					<div class="flex flex-col">
						<div class="flex items-center gap-2 pb-2">
							<label class="text-base leading-normal font-medium text-white" for="price"
								>Price</label
							>
							<div class="group relative flex items-center">
								<span
									class="material-symbols-outlined cursor-help text-sm text-gray-400"
									data-icon="info">info</span
								>
								<div
									class="absolute bottom-full mb-2 hidden w-48 rounded-md bg-[#1c2427] p-2 text-center text-xs text-gray-300 opacity-0 transition-opacity group-hover:block group-hover:opacity-100"
								>
									Set the total price for the specified amount and duration.
								</div>
							</div>
						</div>
						<div class="relative">
							<input
								class="form-input w-full rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 pr-16 text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
								id="price"
								name="price"
								bind:value={formData.price}
								placeholder="e.g., 5"
								type="number"
								disabled={!$wallet.isConnected}
								required
							/>
							<span
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm font-bold text-white"
								>ETH</span
							>
						</div>
						<p class="mt-2 text-xs text-[#9db2b9]">Price per day in ETH.</p>
					</div>

					<div class="flex flex-col">
						<label class="pb-2 text-base leading-normal font-medium text-white" for="contact"
							>Contact Information</label
						>
						<input
							class="form-input w-full rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 text-base leading-normal font-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
							id="contact"
							name="contact"
							bind:value={formData.contact}
							placeholder="your_discord_handle"
							type="text"
							disabled={!$wallet.isConnected}
							required
						/>
					</div>

					{#if $wallet.isConnected && $wallet.address}
						<div class="rounded-lg border border-white/10 bg-white/5 p-4">
							<p class="text-sm text-white/60 mb-1">Provider Address (Your Wallet)</p>
							<p class="text-sm font-mono text-white break-all">{$wallet.address}</p>
						</div>
					{/if}

					<div class="pt-4">
						<button
							class="flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base leading-normal font-bold tracking-[0.015em] text-background-dark transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
							type="submit"
							disabled={!$wallet.isConnected}
						>
							<span class="truncate">Submit Listing</span>
						</button>
						<p class="mt-4 text-center text-xs text-[#9db2b9]">
							Submitting the listing will require a wallet signature and a small gas fee.
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</main>
