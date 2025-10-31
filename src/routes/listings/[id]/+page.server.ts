import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { ListingModel } from '$lib/server/models/Listing.model';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const listing = await ListingModel.findById(params.id).lean().exec();

		if (!listing) {
			throw error(404, 'Listing not found');
		}

		return { listing };
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
