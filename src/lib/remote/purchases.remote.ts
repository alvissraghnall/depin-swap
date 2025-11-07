import * as z from 'zod';
import { query, command } from '$app/server';
import { error } from '@sveltejs/kit';
import { ListingModel } from '$lib/server/models/Listing.model';
import { PurchaseModel, Purchase } from '$lib/server/models/Purchase.model';
import { isAddress } from 'ethers';
import { plainToInstance, instanceToPlain } from 'class-transformer';
import { isObjectIdOrHexString } from 'mongoose';

const buyerAddressSchema = z.string()
		.min(1, 'Provider address is required')
		.refine((val) => isAddress(val), 'Invalid Ethereum address');

export const getUserPurchases = query(
  buyerAddressSchema,
  async (buyerAddress) => {
    try {
      
      const purchases = await PurchaseModel.find({
        buyerAddress,
      }).populate('listing')
        .limit(2*3*4)
        .sort({ createdAt: -1 })
        .lean();
		
		  return purchases.map((purchase) => {
  			const deserialized = plainToInstance(Purchase, purchase);
  			const serialized = instanceToPlain(deserialized);

  			return serialized;
  		});
      
    } catch (err) {
      console.error('Error fetchintg user purchases:', err);
      throw error(500, 'Failed to fetch purchases');
    }
  }
);

export const getPurchase = query(
  z.string().min(1, "Purchase ID is required").refine(val => isObjectIdOrHexString(val), "Purchase ID must be valid ObjectID!"),
  async (purchaseId) => {
    try {
      
      const purchase = await PurchaseModel.findById(purchaseId);
      if (!purchase) {
        throw error(404, 'Purchase not found');
      }
      
      const purchaseWithListing = await PurchaseModel.findById(purchaseId).populate('listing');
      
			const deserialized = plainToInstance(Purchase, purchaseWithListing);
			const serialized = instanceToPlain(deserialized);

			return serialized;
    } catch (err) {
      console.error('Error fetching purchase:', err);
      if (err instanceof Error && 'status' in err) {
        throw err;
      }
      throw error(500, 'Failed to fetch purchase');
    }
  }
);

export const createPurchase = command(
  z.object({
    listingId: z.string().min(10, "Listing ID is required").refine(val => isObjectIdOrHexString(val), "Listing ID must be valid ObjectID!"),
    buyerAddress: buyerAddressSchema,
    transactionHash: z.string().min(10, "Transaction Hash is required!")
  }),
  async ({ listingId, buyerAddress, transactionHash }) => {
    try {
      
      const listing = await ListingModel.findById(listingId);
      if (!listing) {
        throw error(404, 'Listing not found');
      }
      
      const newPurchase = new PurchaseModel({
        listingId,
        buyerAddress,
        transactionHash,
        status: 'completed',
        listing,
      });
      
      await newPurchase.save();
      
      return { success: true, purchaseId: newPurchase._id.toString() };
    } catch (err) {
      console.error('Error creating purchase:', err);
      if (err instanceof Error && 'status' in err) {
        throw err;
      }
      throw error(500, 'Failed to create purchase');
    }
  }
);
