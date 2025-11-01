import { getModelForClass, prop, pre } from '@typegoose/typegoose';
import { Listing } from './Listing.model';
import { DocumentCT } from './DocumentCT.model';

@pre<Wishlist>('save', function (next) {
	this.updatedAt = new Date();
	next();
})
export class Wishlist extends DocumentCT {
	_id!: string;

	@prop({ required: true, type: String })
	userAddress!: string;

	@prop({ required: true, ref: () => Listing })
	listing!: Listing;

	@prop({ default: true, type: String })
	active!: boolean;
}

export const WishlistModel = getModelForClass(Wishlist);
