<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import ResourceCard from '$lib/components/ResourceCard.svelte';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
</script>

<TopNavBar />

<main class="flex-1">
  <div class="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="max-w-2xl mx-auto">
      <ResourceCard 
        title={data.listing.title}
        type={data.listing.type}
        duration={data.listing.duration}
        provider={data.listing.provider}
        price={data.listing.price}
        priceUnit={data.listing.priceUnit}
        icon={data.listing.icon}
      />
    </div>
  </div>
</main>
