import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { ListingModel } from '$lib/server/models/Listing.model';

export const GET: RequestHandler = async ({ params }) => {
	try {
		//await connectDB();
		const listing = await ListingModel.findById(params.id);

		if (!listing) {
			return json({ error: 'Listing not found' }, { status: 404 });
		}

		return json(listing);
	} catch (error) {
		console.error('Error fetching listing:', error);
		return json({ error: 'Failed to fetch listing' }, { status: 500 });
	}
};
