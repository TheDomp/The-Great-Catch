export interface Product {
    id: string;
    name: string;
    category: 'rod' | 'reel' | 'lure' | 'clothing';
    price: number;
    image: string;
    description: string;
    stock: number;
    reviews: { id: string; user: string; rating: number; text: string }[];
}

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

export const PRODUCTS: Product[] = [];

CATEGORIES.forEach((cat, catIdx) => {
    PRODUCT_NAMES[cat].forEach((name, idx) => {
        const id = `${cat}-${idx + 1}`;
        const price = (catIdx + 1) * 100 + (idx * 15) + 99;

        PRODUCTS.push({
            id,
            name,
            category: cat,
            price,
            image: IMAGES[cat],
            description: `The ${name} is the ultimate choice for serious anglers. Precision engineered for the ${cat} category. Upgrade your gear today.`,
            stock: idx % 3 === 0 ? 2 : 50,
            reviews: idx % 2 === 0 ? [
                { id: `r-${id}-1`, user: "FisherMan88", rating: 5, text: "Best gear I ever bought!" },
                { id: `r-${id}-2`, user: "AnglerPro", rating: 4, text: "Solid performance, good value." }
            ] : []
        });
    });
});
