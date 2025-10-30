import { z } from 'zod';

export const listingSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	type: z.enum(['Storage', 'Compute']),
	duration: z.string().min(1, 'Duration is required'),
	provider: z.string().min(1, 'Provider is required'),
	price: z.string().min(1, 'Price is required'),
	priceUnit: z.string().min(1, 'Price unit is required'),
	icon: z.string().min(1, 'Icon is required'),
	available: z.boolean().optional()
});

export type ListingInput = z.infer<typeof listingSchema>;
