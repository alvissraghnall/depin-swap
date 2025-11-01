import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { Listing, ListingModel } from '$lib/server/models/Listing.model';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import type { Resource } from '$lib/types/resource';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const listing = await ListingModel.findById(params.id).lean();

		const deserialized = plainToInstance(Listing, listing);
		const serialized = instanceToPlain<Listing>(deserialized) as Resource;

		if (!listing) {
			throw error(404, 'Listing not found');
		}

		return { listing: serialized };
	} catch (err) {
		// Re-throw the error if it's already a SvelteKit error
		if (err instanceof Error && 'status' in err) {
			throw err;
		} else if (err instanceof Error && err.name === 'CastError') {
			throw error(400, 'Invalid ID provided!');
		}

		console.error('Error fetching listing:', err);
		throw error(500, 'Failed to fetch listing');
	}
};
