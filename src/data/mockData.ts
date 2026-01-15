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

export const PRODUCTS: Product[] = [
    // RODS
    {
        id: 'rod-1',
        name: 'Carbon-Elite Caster',
        category: 'rod',
        price: 2499,
        image: '/images/rod_pro_caster.png',
        description: 'Ultra-high modulus carbon fiber construction. Precision-balanced for long, accurate casts. The ultimate choice for tournament anglers.',
        stock: 12,
        reviews: [{ id: 'r1', user: 'FisherPro', rating: 5, text: 'The weight-to-strength ratio is incredible.' }]
    },
    {
        id: 'rod-2',
        name: 'Ocean-Blue Deep Sea',
        category: 'rod',
        price: 3899,
        image: '/images/rod_ocean_blue.png',
        description: 'Built to withstand the toughest ocean conditions. Reinforced golden guides and a solid backbone for big game battles.',
        stock: 5,
        reviews: [{ id: 'r2', user: 'SeaHunter', rating: 5, text: 'Handled a 100lb tuna with ease.' }]
    },
    {
        id: 'rod-3',
        name: 'Trout-Whisperer Lite',
        category: 'rod',
        price: 1899,
        image: '/images/rod_trout_whisperer.png',
        description: 'A delicate fly rod with a soft touch. Perfect for presentation in crystal clear mountain streams. Features a premium cork handle.',
        stock: 8,
        reviews: []
    },

    // REELS
    {
        id: 'reel-1',
        name: 'Spin-Doctor Precision',
        category: 'reel',
        price: 1599,
        image: '/images/reel_spin_doctor.png',
        description: '12+1 stainless steel ball bearings for butter-smooth rotation. Sealed drag system ensures performance in any environment.',
        stock: 15,
        reviews: [{ id: 'r3', user: 'SmoothCast', rating: 4, text: 'Very nice drag, but a bit heavy.' }]
    },
    {
        id: 'reel-2',
        name: 'Bait-Runner Carbon GT',
        category: 'reel',
        price: 2199,
        image: '/images/reel_bait_runner.png',
        description: 'Stealthy matte black finish with carbon fiber handle. High-speed gear ratio for quick retrievals and aggressive hook sets.',
        stock: 10,
        reviews: []
    },
    {
        id: 'reel-3',
        name: 'Classic-Aura Fly Reel',
        category: 'reel',
        price: 1299,
        image: '/images/reel_fly_classic.png',
        description: 'Timeless design meeting modern engineering. Vintage aesthetic with a wide-arbor spool for reduced line memory.',
        stock: 20,
        reviews: []
    },

    // LURES (Going All In)
    {
        id: 'lure-1',
        name: 'Neon Ghost Minnow',
        category: 'lure',
        price: 129,
        image: '/images/lure_neon_ghost.png',
        description: 'Translucent ghost-body with internal neon neuro-light technology. Irresistible to predators in low-light conditions.',
        stock: 50,
        reviews: [{ id: 'r4', user: 'NightFish', rating: 5, text: 'They hit it like a truck at dusk!' }]
    },
    {
        id: 'lure-2',
        name: 'Deep-Sea Kraken Jig',
        category: 'lure',
        price: 189,
        image: '/images/lure_kraken_jig.png',
        description: 'Hyper-realistic multi-tentacle action. Iridescent scales and emerald glowing eyes designed to mimic deep-sea cephalopods.',
        stock: 30,
        reviews: []
    },
    {
        id: 'lure-3',
        name: 'Voltage Electric Eel',
        category: 'lure',
        price: 159,
        image: '/images/lure_electric_eel.png',
        description: 'Sinuous swimming motion with blue lightning patterns. Creates micro-vibrations that trigger lateral line responses.',
        stock: 45,
        reviews: []
    },
    {
        id: 'lure-4',
        name: 'Molten Magma Crank',
        category: 'lure',
        price: 149,
        image: '/images/lure_magma_crank.png',
        description: 'Built for high-energy aggression. The cracked-lava finish creates unique light reflections in murky waters.',
        stock: 25,
        reviews: []
    },
    {
        id: 'lure-5',
        name: 'Cyber-Byte Robotic Frog',
        category: 'lure',
        price: 199,
        image: '/images/lure_cyber_frog.png',
        description: 'Steampunk-inspired surface popper. Brass gears and robotic movements create a erratic splashing profile.',
        stock: 15,
        reviews: []
    },

    // CLOTHING
    {
        id: 'clothing-1',
        name: 'Storm-Shield Chest Waders',
        category: 'clothing',
        price: 2999,
        image: '/images/clothing_storm_waders.png',
        description: 'Professional grade camouflage waders. 5-layer breathable fabric with reinforced puncture-resistant knees.',
        stock: 10,
        reviews: [{ id: 'r5', user: 'DryGuy', rating: 5, text: 'Best waders I have owned. No leaks after a season.' }]
    },
    {
        id: 'clothing-2',
        name: 'Aqua-Shield UV Hoodie',
        category: 'clothing',
        price: 699,
        image: '/images/clothing_uv_hoodie.png',
        description: 'Lightweight, cooling fabric with SPF 50+ protection. Integrated neck gaiter for total sun coverage on the water.',
        stock: 25,
        reviews: []
    },
    {
        id: 'clothing-3',
        name: 'Offshore Heavy Jacket',
        category: 'clothing',
        price: 1499,
        image: '/images/clothing_heavy_jacket.png',
        description: 'Tested in the North Sea. Extreme wind and water protection with high-visibility reflective elements.',
        stock: 15,
        reviews: []
    }
];
