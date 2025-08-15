import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const seller = await prisma.user.upsert({
		where: { email: 'seller@example.com' },
		update: {},
		create: { email: 'seller@example.com', fullName: 'Sally Seller', role: UserRole.SELLER },
	});
	const buyer = await prisma.user.upsert({
		where: { email: 'buyer@example.com' },
		update: {},
		create: { email: 'buyer@example.com', fullName: 'Bob Buyer', role: UserRole.BUYER },
	});

	const listing = await prisma.listing.create({
		data: {
			title: 'Charming Bungalow',
			description: '2 bed, 1 bath with updated kitchen and a sunny backyard.',
			price: 450000,
			images: [
				{ url: 'https://picsum.photos/seed/house1/800/600' },
				{ url: 'https://picsum.photos/seed/house2/800/600' },
			],
			tags: ['bungalow', 'sunny', 'updated'],
			sellerId: seller.id,
		},
	});

	await prisma.offer.create({
		data: {
			listingId: listing.id,
			buyerId: buyer.id,
			amount: 440000,
		},
	});
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});