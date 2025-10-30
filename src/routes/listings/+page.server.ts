import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { connectDB } from '$lib/server/db';
import { ListingModel } from '$lib/server/models/Listing.model';
import { listingSchema, type ListingInput } from '$lib/server/schemas/listing.schema';

export const load: PageServerLoad = async () => {
	try {
		const listings = await ListingModel.find().sort({ createdAt: -1 }).exec();
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

export const actions: Actions = {
	default: async ({ request }) => {

		const formData = Object.fromEntries(await request.formData());

		const result = listingSchema.safeParse(formData);

		if (!result.success) {
			return fail(400, {
				errors: result.error.flatten(),
				values: formData
			});
		}

		try {
			const listingData: ListingInput = result.data;

			const newListing = new ListingModel(listingData);
			await newListing.save();
		} catch (error) {
			console.error('Error creating listing:', error);
			return fail(500, {
				error: 'Failed to create listing'
			});
		}

		throw redirect(303, '/listings');
	}
};
