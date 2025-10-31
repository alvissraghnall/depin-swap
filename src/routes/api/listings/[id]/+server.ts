import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { ListingModel } from '$lib/server/models/Listing.model';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const listing = await ListingModel.findById(params.id).lean();

		if (!listing) {
			return json({ error: 'Listing not found' }, { status: 404 });
		}

		return json(listing);
	} catch (error) {
		console.error('Error fetching listing:', error);
		return json({ error: 'Failed to fetch listing' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const listing = await ListingModel.findByIdAndDelete(params.id);

		if (!listing) {
			return json({ error: 'Listing not found' }, { status: 404 });
		}

		return json({ success: true, message: 'Listing deleted successfully' });
	} catch (error) {
		console.error('Error deleting listing:', error);
		return json({ error: 'Failed to delete listing' }, { status: 500 });
	}
};
