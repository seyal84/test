export declare class CreateListingDto {
    title: string;
    description: string;
    price: number;
    images: Array<Record<string, unknown>>;
    tags?: string[];
}
