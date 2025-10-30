import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { connectDB } from '$lib/server/db';
import { ListingModel } from '$lib/server/models/Listing.model';

const listingSchema = z.object({
  resourceType: z.enum(['storage', 'compute', 'bandwidth'], {
    error: 'Invalid resource type',
  }),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  duration: z.string().min(1, 'Duration is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Duration must be a positive number'
  ),
  price: z.string().min(1, 'Price is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Price must be a positive number'
  ),
  contact: z.string().min(1, 'Contact information is required').max(100, 'Contact information is too long')
});

export const load: PageServerLoad = async () => {
  return {};
};

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    
    const formData = {
      resourceType: data.get('resourceType'),
      amount: data.get('amount'),
      duration: data.get('duration'),
      price: data.get('price'),
      contact: data.get('contact')
    };
    
    const result = listingSchema.safeParse(formData);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const firstError = Object.values(errors)[0]?.[0] || 'Validation failed';
      
      return fail(400, { 
        error: true,
        message: firstError
      });
    }
    
    const { resourceType, amount, duration, price, contact } = result.data;
    
    const typeMap = {
      storage: 'Storage',
      compute: 'Compute',
      bandwidth: 'Bandwidth'
    } as const;
    
    const iconMap = {
      Storage: 'database',
      Compute: 'developer_board',
      Bandwidth: 'network_check'
    } as const;
    
    const type = typeMap[resourceType];
    const icon = iconMap[type];
    const title = `${amount}GB ${type}`;
    const durationStr = `${duration} Days`;
    
    try {
      await connectDB();
      
      const newListing = new ListingModel({
        title,
        type,
        duration: durationStr,
        provider: contact,
        price: parseInt(price),
        priceUnit: 'per day',
        icon
      });

	  console.log(newListing);
      
      await newListing.save();
      
      return {
        success: true,
        message: 'Listing created successfully!'
      };
    } catch (err) {
      console.error('Error creating listing:', err);
      return fail(500, { 
        error: true,
        message: 'Failed to create listing'
      });
    }
  }
};
