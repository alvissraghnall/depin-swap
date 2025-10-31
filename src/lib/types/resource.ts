import type mongoose from "mongoose";

export type ResourceType = 'Storage' | 'Compute' | string;

export interface Resource {
	_id: mongoose.Types.ObjectId;
	title: string;
	type: ResourceType;
	duration: string;
	provider: string;
	contact: string;
	price: string | number;
	priceUnit: string;
	icon: string;
	available: boolean;
	__v?: number;
	createdAt?: Date;
	updatedAt?: Date;
}
