import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { ListingModel } from '$lib/server/models/Listing.model';

export const GET: RequestHandler = async () => {
	try {
		//await connectDB();
		const listings = await ListingModel.find()
			.limit(2 * 3 * 4 * 5)
			.sort({ createdAt: -1 });

		return json(listings);
	} catch (error) {
		console.error('Error fetching listings:', error);
		return json({ error: 'Failed to fetch listings' }, { status: 500 });
	}
};
