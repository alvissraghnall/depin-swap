import { getModelForClass, prop, pre } from '@typegoose/typegoose';
import { TimeStamps, type Base } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';

@pre<Listing>('save', function (next) {
	this.updatedAt = new Date();
	next();
})
export class Listing extends TimeStamps implements Base {

	public _id!: Types.ObjectId;

	id!: string;
	
	@prop({ required: true, type: String })
	title!: string;

	@prop({ required: true, enum: ['Storage', 'Compute', 'Bandwidth'], type: String })
	type!: 'Storage' | 'Compute' | 'Bandwidth';

	@prop({ required: true, type: String })
	duration!: string;

	@prop({ required: true, type: String })
	provider!: string;

	@prop({ required: true, type: String })
	contact!: string;

	@prop({ required: true, type: Number })
	price!: number;

	@prop({ required: true, type: String })
	priceUnit!: string;

	@prop({ required: true, type: String })
	icon!: string;

	@prop({ default: true, type: Boolean })
	available!: boolean;
}

export const ListingModel = getModelForClass(Listing);
