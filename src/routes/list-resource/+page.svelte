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
		price: 0.001,
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
				<h1
					class="text-4xl leading-tight font-black tracking-[-0.033em] text-text-primary sm:text-5xl"
				>
					List Your DePin Resource
				</h1>
			</div>

			<div class="flex w-full flex-col gap-6 rounded-xl border border-border bg-surface p-6 sm:p-8">
				<h2 class="text-2xl leading-tight font-bold tracking-[-0.015em] text-text-primary">
					Listing Details
				</h2>

				{#if !$wallet.isConnected}
					<div
						class="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-yellow-400"
					>
						<div class="flex items-center justify-between gap-4">
							<span>Please connect your wallet to list a resource.</span>
							<button
								onclick={handleConnect}
								class="flex h-9 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-primary-foreground transition-opacity hover:opacity-90"
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
								await goto('/my-listings');
							}
						};
					}}
					class="flex flex-col gap-6"
				>
					<div class="flex flex-col">
						<label
							class="pb-2 text-base leading-normal font-medium text-text-primary"
							for="resource-type">Resource Type</label
						>
						<div class="relative">
							<select
								class="form-select w-full appearance-none rounded-lg border border-border bg-surface p-3.5 text-base leading-normal font-normal text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
								id="resource-type"
								name="resourceType"
								bind:value={formData.resourceType}
								disabled={!$wallet.isConnected}
								required
							>
								<option class="bg-background text-text-primary" value=""
									>Select a resource type</option
								>
								<option class="bg-background text-text-primary" value="storage">Storage</option>
								<option class="bg-background text-text-primary" value="compute">Compute</option>
								<option class="bg-background text-text-primary" value="bandwidth">Bandwidth</option>
							</select>
							<div
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary"
							>
								<span class="material-symbols-outlined">expand_more</span>
							</div>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div class="flex flex-col">
							<label
								class="pb-2 text-base leading-normal font-medium text-text-primary"
								for="amount">Amount</label
							>
							<div class="relative">
								<input
									class="form-input w-full rounded-lg border border-border bg-surface p-3.5 pr-16 text-base leading-normal font-normal text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
									id="amount"
									name="amount"
									bind:value={formData.amount}
									step="0.01"
									placeholder="e.g., 6"
									type="number"
									disabled={!$wallet.isConnected}
									required
								/>
								<span
									class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-text-secondary"
									>{amountUnit}</span
								>
							</div>
						</div>

						<div class="flex flex-col">
							<label
								class="pb-2 text-base leading-normal font-medium text-text-primary"
								for="duration">Duration</label
							>
							<div class="relative">
								<input
									class="form-input w-full rounded-lg border border-border bg-surface p-3.5 pr-20 text-base leading-normal font-normal text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
									id="duration"
									name="duration"
									bind:value={formData.duration}
									placeholder="e.g., 30"
									type="number"
									disabled={!$wallet.isConnected}
									required
								/>
								<span
									class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-text-secondary"
									>Days</span
								>
							</div>
						</div>
					</div>

					<div class="flex flex-col">
						<div class="flex items-center gap-2 pb-2">
							<label class="text-base leading-normal font-medium text-text-primary" for="price"
								>Price</label
							>
							<div class="group relative flex items-center">
								<span
									class="material-symbols-outlined cursor-help text-sm text-text-secondary"
									data-icon="info">info</span
								>
								<div
									class="absolute bottom-full mb-2 hidden w-48 rounded-md border border-border bg-background p-2 text-center text-xs text-text-secondary opacity-0 shadow-lg transition-opacity group-hover:block group-hover:opacity-100"
								>
									Set the total price for the specified amount and duration.
								</div>
							</div>
						</div>
						<div class="relative">
							<input
								class="form-input w-full rounded-lg border border-border bg-surface p-3.5 pr-16 text-base leading-normal font-normal text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
								id="price"
								name="price"
								bind:value={formData.price}
								placeholder="e.g., 0.005"
								step="any"
								type="number"
								disabled={!$wallet.isConnected}
								required
							/>
							<span
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm font-bold text-text-primary"
								>ETH</span
							>
						</div>
						<p class="mt-2 text-xs text-text-secondary">Price per day in ETH.</p>
					</div>

					<div class="flex flex-col">
						<label class="pb-2 text-base leading-normal font-medium text-text-primary" for="contact"
							>Contact Information</label
						>
						<input
							class="form-input w-full rounded-lg border border-border bg-surface p-3.5 text-base leading-normal font-normal text-text-primary placeholder:text-text-secondary focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
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
						<div class="rounded-lg border border-border bg-surface p-4">
							<p class="mb-1 text-sm text-text-secondary">Provider Address (Your Wallet)</p>
							<p class="font-mono text-sm break-all text-text-primary">
								{$wallet.address}
							</p>
						</div>
					{/if}

					<div class="pt-4">
						<button
							class="flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-base leading-normal font-bold tracking-[0.015em] text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
							type="submit"
							disabled={!$wallet.isConnected}
						>
							<span class="truncate">Submit Listing</span>
						</button>
						<p class="mt-4 text-center text-xs text-text-secondary">
							Submitting the listing will require a wallet signature and a small gas fee.
						</p>
					</div>
				</form>
			</div>
		</div>
	</div>
</main>
