export type ResourceType = 'Storage' | 'Compute' | string;

export interface Resource {
	_id: string;
	title: string;
	type: ResourceType;
	duration: string;
	provider: string;
	price: string | number;
	priceUnit: string;
	icon: string;
	available: boolean
	__v: number;
	createdAt: Date;
	updatedAt: Date;
}
