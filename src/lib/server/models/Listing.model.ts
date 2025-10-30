import { getModelForClass, prop, pre } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

@pre<Listing>('save', function (next) {
    this.updatedAt = new Date();
    next();
})
export class Listing extends TimeStamps {
  @prop({ required: true, type: String })
  title!: string;

  @prop({ required: true, enum: ['Storage', 'Compute', 'Bandwidth'], type: String })
  type!: 'Storage' | 'Compute' | 'Bandwidth';

  @prop({ required: true, type: String })
  duration!: string;

  @prop({ required: true, type: String })
  provider!: string;

  @prop({ required: true, type: String })
  price!: string;

  @prop({ required: true, type: String })
  priceUnit!: string;

  @prop({ required: true, type: String })
  icon!: string;

  @prop({ default: true, type: Boolean })
  available!: boolean;

}

export const ListingModel = getModelForClass(Listing);
