import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORIES = ['rod', 'reel', 'lure', 'clothing'] as const;

const PRODUCT_NAMES = {
    rod: ['Pro Caster X', 'Lake Master 3000', 'River King Elite', 'Ocean Blue Deep', 'Carbon Lite S', 'Trout Whisperer', 'Bass Hunter Pro', 'Nordic Ice Rod', 'Fly Master Supreme', 'Shoreline Hero'],
    reel: ['Spin Doctor 500', 'Bait Runner GT', 'Trolling Titan', 'Fly Reel Classic', 'Ultra Cast 2000', 'Deep Sea 9000', 'Precision Drag Z', 'Smooth Op 400', 'River Rat Reel', 'Surf Caster 80'],
    lure: ['Neon Minnow', 'Deep Diver Crank', 'Surface Popper', 'Spinner Bait Gold', 'Soft Shad Real', 'Frog Walker', 'Spoon Silver', 'Jig Head Pack', 'Worm Tequila', 'Fly Nymph Set'],
    clothing: ['Performance Vest', 'Waders Pro Breathable', 'Sun Hoodie UV', 'Warm Fleece Jacket', 'Beanie Logo', 'Cap Outdoor', 'Rain Jacket Heavy', 'Fishing Gloves', 'T-Shirt Cotton', 'Cargo Pants']
};

const IMAGES = {
    rod: '/images/rod.png',
    reel: '/images/reel.png',
    lure: '/images/lures.png',
    clothing: '/images/clothing.png'
};

async function main() {
    console.log('Seeding products...');

    for (const cat of CATEGORIES) {
        for (let idx = 0; idx < PRODUCT_NAMES[cat].length; idx++) {
            const name = PRODUCT_NAMES[cat][idx];
            const id = `${cat}-${idx + 1}`;
            const price = (CATEGORIES.indexOf(cat) + 1) * 100 + (idx * 15) + 99;

            await prisma.product.upsert({
                where: { id },
                update: {},
                create: {
                    id,
                    name,
                    category: cat,
                    price,
                    image: IMAGES[cat],
                    description: `The ${name} is the ultimate choice for serious anglers. Precision engineered for the ${cat} category. Upgrade your gear today.`,
                    stock: idx % 3 === 0 ? 2 : 50,
                }
            });
        }
    }

    console.log('Seeding users...');

    // Admin user
    await prisma.user.upsert({
        where: { email: 'admin@test.se' },
        update: {},
        create: {
            email: 'admin@test.se',
            name: 'Admin User',
            password: 'Password123!', // In real app, hash this
            role: 'ADMIN'
        }
    });

    // Customer user
    await prisma.user.upsert({
        where: { email: 'customer@test.se' },
        update: {},
        create: {
            email: 'customer@test.se',
            name: 'Test Customer',
            password: 'Password123!',
            role: 'USER'
        }
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
