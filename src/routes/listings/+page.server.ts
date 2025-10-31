import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { ListingModel } from '$lib/server/models/Listing.model';
import { listingSchema, type ListingInput } from '$lib/server/schemas/listing.schema';

export const load: PageServerLoad = async () => {
	try {
		const listings = await ListingModel.find().limit(24).sort({ createdAt: -1 }).exec();
		return {
			listings: JSON.parse(JSON.stringify(listings))
		};
	} catch (error) {
		console.error('Error fetching listings:', error);
		return {
			listings: [],
			error: 'Failed to fetch listings'
		};
	}
};
