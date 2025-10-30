<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { ActionData } from './$types';

  let { form = $bindable() }: { form: ActionData } = $props();

  let formData = $state({
    resourceType: '',
    amount: 0,
    duration: '',
    price: 0,
    contact: ''
  });
</script>

<TopNavBar />

<main class="flex h-full grow flex-col">
  <div class="container mx-auto flex flex-1 justify-center px-4 py-10 sm:py-16">
    <div class="flex w-full max-w-2xl flex-col">
      <div class="mb-8 flex flex-wrap justify-between gap-3 p-4">
        <h1 class="text-white text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">List Your DePin Resource</h1>
      </div>

      <div class="flex w-full flex-col gap-6 rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 class="text-white text-2xl font-bold leading-tight tracking-[-0.015em]">Listing Details</h2>

        {#if form?.error}
          <div class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
            {form.message}
          </div>
        {/if}

        {#if form?.success}
          <div class="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
            {form.message}
          </div>
        {/if}

        <form 
          method="POST"
		  action="/list-resource?"
          use:enhance={() => {
            return async ({ result }) => {
			  console.log(result);
              if (result.type === 'success') {
                await goto('/');
              }
            };
          }}
          class="flex flex-col gap-6"
        >
          <div class="flex flex-col">
            <label class="text-white text-base font-medium leading-normal pb-2" for="resource-type">Resource Type</label>
            <div class="relative">
              <select 
                class="form-select w-full appearance-none rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 text-base font-normal leading-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary" 
                id="resource-type"
                name="resourceType"
                bind:value={formData.resourceType}
                required
              >
                <option value="">Select a resource type</option>
                <option value="storage">Storage</option>
                <option value="compute">Compute</option>
                <option value="bandwidth">Bandwidth</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <span class="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="flex flex-col">
              <label class="text-white text-base font-medium leading-normal pb-2" for="amount">Amount</label>
              <div class="relative">
                <input 
                  class="form-input w-full rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 pr-16 text-base font-normal leading-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary" 
                  id="amount" 
                  name="amount"
                  bind:value={formData.amount}
                  placeholder="e.g., 6" 
                  type="number"
                  required
                />
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-[#9db2b9]">GB</span>
              </div>
            </div>

            <div class="flex flex-col">
              <label class="text-white text-base font-medium leading-normal pb-2" for="duration">Duration</label>
              <div class="relative">
                <input 
                  class="form-input w-full rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 pr-20 text-base font-normal leading-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary" 
                  id="duration" 
                  name="duration"
                  bind:value={formData.duration}
                  placeholder="e.g., 30" 
                  type="number"
                  required
                />
                <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm text-[#9db2b9]">Days</span>
              </div>
            </div>
          </div>

          <div class="flex flex-col">
            <div class="flex items-center gap-2 pb-2">
              <label class="text-white text-base font-medium leading-normal" for="price">Price</label>
              <div class="group relative flex items-center">
                <span class="material-symbols-outlined cursor-help text-sm text-gray-400" data-icon="info">info</span>
                <div class="absolute bottom-full mb-2 hidden w-48 rounded-md bg-[#1c2427] p-2 text-center text-xs text-gray-300 opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                  Set the total price for the specified amount and duration.
                </div>
              </div>
            </div>
            <div class="relative">
              <input 
                class="form-input w-full rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 pr-16 text-base font-normal leading-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary" 
                id="price" 
                name="price"
                bind:value={formData.price}
                placeholder="e.g., 5" 
                type="number"
                required
              />
              <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-sm font-bold text-white">ETH</span>
            </div>
            <p class="mt-2 text-xs text-[#9db2b9]">Price per day in ETH.</p>
          </div>

          <div class="flex flex-col">
            <label class="text-white text-base font-medium leading-normal pb-2" for="contact">Contact Information</label>
            <input 
              class="form-input w-full rounded-lg border border-[#3b4d54] bg-[#1c2427] p-3.5 text-base font-normal leading-normal text-white placeholder:text-[#9db2b9] focus:border-primary focus:ring-1 focus:ring-primary" 
              id="contact" 
              name="contact"
              bind:value={formData.contact}
              placeholder="your_discord_handle" 
              type="text"
              required
            />
          </div>

          <div class="pt-4">
            <button 
              class="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-background-dark text-base font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-gray-500" 
              type="submit"
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

