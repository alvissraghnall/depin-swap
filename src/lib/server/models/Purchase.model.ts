import { prop, type Ref, modelOptions, pre, getModelForClass } from '@typegoose/typegoose';
import { DocumentCT } from './DocumentCT.model';
import { Listing } from './Listing.model';

@pre<Purchase>('save', function (next) {
	this.updatedAt = new Date();
	next();
})
export class Purchase extends DocumentCT {

  @prop({ required: true, type: String })
  public buyerAddress!: string;

  @prop({ required: true, unique: true, type: String })
  public transactionHash!: string;

  @prop({ type: String })
  public tradeId?: string;

  @prop({ required: true, type: String })
  public listingId!: string;

  @prop({ ref: () => Listing, required: true, })
  public listing!: Ref<Listing>;
}

export const PurchaseModel = getModelForClass(Purchase);
