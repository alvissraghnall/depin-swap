import type { PageServerLoad } from './$types';
import { ListingModel } from '$lib/server/models/Listing.model';
import type { Resource } from '$lib/types/resource';

export const load: PageServerLoad = async () => {
	try {
		const listings = await ListingModel.find()
			.limit(2 * 3 * 4)
			.sort({ createdAt: -1 })
			.lean();

		return { listings: JSON.parse(JSON.stringify(listings)) as Resource };
	} catch (error) {
		console.error('Error fetching listings:', error);
		return { listings: [], error: 'Failed to fetch listings' };
	}
};
