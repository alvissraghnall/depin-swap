import * as z from 'zod';
import { query } from '$app/server';
import { error } from '@sveltejs/kit';
import { Listing, ListingModel } from '$lib/server/models/Listing.model';
import { isAddress } from 'ethers';
import { isValidObjectId } from 'mongoose';
import { instanceToPlain, plainToInstance } from 'class-transformer';

const providerSchema = z
	.string()
	.min(1, 'Provider address is required')
	.refine((val) => isAddress(val), 'Provider address must be a valid address!');

export const getUserListings = query(providerSchema, async (providerAddress) => {
	try {
		const listings = await ListingModel.find({
			provider: providerAddress
		})
			.limit(30)
			.sort({ createdAt: -1 })
			.lean();

		return listings.map((listing) => {
			const deserialized = plainToInstance(Listing, listing);
			const serialized = instanceToPlain(deserialized);

			return serialized;
		});
	} catch (err) {
		console.error('Error fetching user listings:', err);
		throw error(500, 'Failed to fetch listings');
	}
});

export const getAllListings = query(async () => {
	try {
		const listings = await ListingModel.find({ available: true })
			.limit(2 * 3 * 4 * 5)
			.sort({ createdAt: -1 })
			.lean();
		return listings.map((listing) => {
			const deserialized = plainToInstance(Listing, listing);
			const serialized = instanceToPlain(deserialized);

			return serialized;
		});
	} catch (err) {
		console.error('Error fetching listings:', err);
		throw error(500, 'Failed to fetch listings');
	}
});

export const getListing = query(
	z
		.string()
		.min(1, 'Listing ID is required')
		.refine((v) => isValidObjectId(v), 'Listing ID must be ObjectID!'),
	async (listingId) => {
		try {
			const listing = await ListingModel.findById(listingId).lean();

			const deserialized = plainToInstance(Listing, listing);
			const serialized = instanceToPlain(deserialized);
			if (!listing) {
				throw error(404, 'Listing not found');
			}

			return serialized;
		} catch (err) {
			console.error('Error fetching listing:', err);
			if (err instanceof Error && 'status' in err) {
				throw err;
			}
			throw error(500, 'Failed to fetch listing');
		}
	}
);

export const deleteListing = query(
	z
		.string()
		.min(1, 'Listing ID is required')
		.refine((v) => isValidObjectId(v), 'Listing ID must be ObjectID!'),
	async (listingId) => {
		try {
			const listing = await ListingModel.findByIdAndDelete(listingId);
			if (!listing) {
				throw error(404, 'Listing not found');
			}

			return { success: true, message: 'Listing deleted successfully' };
		} catch (err) {
			console.error('Error deleting listing:', err);
			if (err instanceof Error && 'status' in err) {
				throw err;
			}
			throw error(500, 'Failed to delete listing');
		}
	}
);
