import * as z from 'zod';
import { query, command } from '$app/server';
import { error } from '@sveltejs/kit';
import { Wishlist, WishlistModel } from '$lib/server/models/Wishlist.model';
import { ListingModel } from '$lib/server/models/Listing.model';
import { isAddress } from 'ethers';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { isValidObjectId } from 'mongoose';

const addToWishlistSchema = z.object({
	listingId: z.string().min(1, 'Listing ID is required')
		.refine(val => isValidObjectId(val), "Enter valid Listing ID!"),
	userAddress: z
		.string()
		.min(30, 'User address is required')
		.refine((val) => isAddress(val), 'Enter a valid address!')
});

const removeFromWishlistSchema = z.object({
	wishlistId: z.string().min(1, 'Wishlist ID is required')
		.refine(val => isValidObjectId(val), "Enter valid Listing ID!"),
});

const isInWishlistSchema = z.object({
	listingId: z.string().min(1, 'Listing ID is required')
		.refine(val => { console.log(val); return isValidObjectId(val); }, "Enter valid Listing ID!"),
	userAddress: z
		.string()
		.min(30, 'User address is required')
		.refine((val) => isAddress(val), 'Enter a valid address!')
});

export const getUserWishlist = query(
	z.object({
		userAddress: z
			.string()
			.min(30, 'User address is required')
			.refine((val) => isAddress(val), 'Enter a valid address!')
	}),
	async ({ userAddress }) => {
		try {
			const wishlistItems = await WishlistModel.find({
				userAddress,
				active: true
			})
				.populate('listing')
				.sort({ createdAt: -1 })
				.lean();

			const items = wishlistItems.map((wishlistItem) => {
				const deserialized = plainToInstance(Wishlist, wishlistItem);
				const serialized = instanceToPlain(deserialized);

				return serialized;
			});
			console.log(items);
			return items;
		} catch (err) {
			console.error('Error fetching wishlist:', err);
			throw error(500, 'Failed to fetch wishlist');
		}
	}
);

export const isInWishlist = query(isInWishlistSchema, async ({ listingId, userAddress }) => {
	try {
		const wishlistItem = await WishlistModel.findOne({
			userAddress,
			listing: listingId,
			active: true
		});

		return !!wishlistItem;
	} catch (err) {
		console.error('Error checking wishlist status:', err);
		throw error(500, 'Failed to check wishlist status');
	}
});

export const addToWishlist = command(addToWishlistSchema, async ({ listingId, userAddress }) => {
	try {
		const listing = await ListingModel.findById(listingId);
		if (!listing) {
			throw error(404, 'Listing not found');
		}

		const existingItem = await WishlistModel.findOne({
			userAddress,
			listing: listingId,
			active: true
		});

		if (existingItem) {
			throw error(400, 'Listing already in wishlist');
		}

		const wishlistItem = new WishlistModel({
			userAddress,
			listing: listingId
		});

		await wishlistItem.save();

		return { success: true, wishlistId: wishlistItem._id.toString() };
	} catch (err) {
		console.error('Error adding to wishlist:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to add to wishlist');
	}
});

export const removeFromWishlist = command(removeFromWishlistSchema, async ({ wishlistId }) => {
	try {
		const wishlistItem = await WishlistModel.findById(wishlistId);
		if (!wishlistItem) {
			throw error(404, 'Wishlist item not found');
		}

		wishlistItem.active = false;
		await wishlistItem.save();

		return { success: true };
	} catch (err) {
		console.error('Error removing from wishlist:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to remove from wishlist');
	}
});

export const toggleWishlist = command(addToWishlistSchema, async ({ listingId, userAddress }) => {
	try {
		const listing = await ListingModel.findById(listingId);
		if (!listing) {
			throw error(404, 'Listing not found');
		}

		const existingItem = await WishlistModel.findOne({
			userAddress,
			listing: listingId,
			active: true
		});

		if (existingItem) {
			existingItem.active = false;
			await existingItem.save();
			return { success: true, action: 'removed', wishlistId: existingItem.toString() };
		} else {
			const wishlistItem = new WishlistModel({
				userAddress,
				listing: listingId
			});

			await wishlistItem.save();
			return { success: true, action: 'added', wishlistId: wishlistItem._id.toString() };
		}
	} catch (err) {
		console.error('Error toggling wishlist:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to update wishlist');
	}
});
