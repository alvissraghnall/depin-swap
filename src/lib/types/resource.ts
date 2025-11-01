export type ResourceType = 'Storage' | 'Compute' | 'Bandwidth';

export interface Resource {
	_id: string;
	id: string;
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
