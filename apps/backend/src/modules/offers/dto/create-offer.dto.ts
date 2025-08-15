import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateOfferDto {
	@IsString()
	@IsNotEmpty()
	listingId!: string;

	@IsInt()
	@Min(0)
	amount!: number;
}