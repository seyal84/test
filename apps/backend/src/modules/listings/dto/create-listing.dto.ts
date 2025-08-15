import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateListingDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	title!: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(5000)
	description!: string;

	@IsInt()
	@Min(0)
	price!: number;

	@IsArray()
	images!: Array<Record<string, unknown>>;

	@IsArray()
	@IsOptional()
	tags?: string[];
}