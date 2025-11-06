import { isAddress } from 'ethers';
import { z } from 'zod';

export const listingSchema = z.object({
	resourceType: z.enum(['storage', 'compute', 'bandwidth'], {
		error: 'Invalid resource type'
	}),
	amount: z
		.string()
		.min(1, 'Amount is required')
		.refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number')
		.transform((val) => parseInt(val, 10)),
	duration: z
		.string()
		.min(1, 'Duration is required')
		.refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Duration must be a positive number')
		.transform((val) => parseInt(val, 10)),
	price: z
		.string()
		.min(1, 'Price is required')
		.refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) < 1_000_000, 'Price must be a positive number and not more than 1M')
		.transform((val) => (parseFloat(val) * (10 ** 9))),
	contact: z
		.string()
		.min(1, 'Contact information is required')
		.max(100, 'Contact information is too long'),
	provider: z
		.string()
		.min(1, 'Provider address is required')
		.refine((val) => isAddress(val), 'Invalid Ethereum address')
});

export type ListingInput = z.infer<typeof listingSchema>;
