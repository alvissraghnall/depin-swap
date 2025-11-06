import type { PageServerLoad, Actions } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { Listing, ListingModel } from '$lib/server/models/Listing.model';
import { listingSchema } from '$lib/server/schemas/listing.schema';
import z from 'zod';
import { instanceToPlain, plainToInstance } from 'class-transformer';

const editListingSchema = listingSchema.omit({
	resourceType: true
}).extend({
	amountUnit: z.string().min(2, 'Amount Unit is required').max(5, 'Amount unit is too long'),
	durationUnit: z.string().min(3, 'Duration Unit is required').max(10, 'Duration unit is too long')
});

export const load: PageServerLoad = async ({ params }) => {
	try {
		const listing = await ListingModel.findById(params.id).lean();
		const deserialized = plainToInstance(Listing, listing);
		const serialized = instanceToPlain(deserialized);

		if (!listing) {
			return error(404, 'Listing not found');
		}

		return { listing: serialized };
	} catch (err) {
		if (err instanceof Error && 'status' in err) {
			throw err;
		} else if (err instanceof Error && err.name === 'CastError') {
			throw error(400, 'Invalid ID provided!');
		}

		console.error('Error fetching listing:', err);
		throw error(500, 'Failed to fetch listing');
	}
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const data = await request.formData();
		const formData = {
			amount: data.get('amount'),
			amountUnit: data.get('amountUnit'),
			durationUnit: data.get('durationUnit'),
			duration: data.get('duration'),
			price: data.get('price'),
			contact: data.get('contact'),
			provider: data.get('provider')
		};

		const result = editListingSchema.safeParse(formData);

		if (!result.success) {
			const errors = result.error.flatten().fieldErrors;
			console.log(errors);
			const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';

			return fail(400, {
				error: true,
				message: firstError
			});
		}

		const { amountUnit, durationUnit, amount, duration, price, provider, contact } = result.data;

		try {
			const listing = await ListingModel.findById(params.id);
			if (!listing) {
				return fail(404, {
					error: 'Listing not found'
				});
			}

			if (listing.provider !== provider) {
				return fail(400, {
					error: 'You cannot edit this listing!'
				});
			}

			listing.title = `${amount} ${amountUnit}`;
			listing.duration = `${duration} ${durationUnit}`;
			listing.price = price;
			listing.contact = contact;

			if (listing.type === 'Storage') {
				listing.icon = 'database';
			} else if (listing.type === 'Compute') {
				listing.icon = 'developer_board';
			} else if (listing.type === 'Bandwidth') {
				listing.icon = 'wifi';
			}

			await listing.save();

			return { success: true };
		} catch (err) {
			console.error('Error updating listing:', err);
			return fail(500, {
				error: 'Failed to update listing'
			});
		}
	}
};
