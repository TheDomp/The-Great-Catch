const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCvHNaxspVhPkcdfRr265IzT5qzNP9Tqkc",
    authDomain: "the-great-catch-test.firebaseapp.com",
    projectId: "the-great-catch-test",
    storageBucket: "the-great-catch-test.firebasestorage.app",
    messagingSenderId: "992101300478",
    appId: "1:992101300478:web:fc58b92ac49305bc2dcdaf",
    measurementId: "G-ELG68JTML9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const FISHING_TYPES = ["Gäddfiske", "Abborrfiske", "Flugfiske", "Havsfiske", "Isfiske", "Trolling"];
const TITLES = ["Pro Fisherman", "Weekend Angler", "Lure Collector", "Fly Fishing Guru", "Ice Fishing Expert", "Catch & Release Advocate"];
const REGIONS = ["Stockholms skärgård", "Vänern", "Mörrumsån", "Kvarken", "Vättern", "Lapplands fjällvärld"];

async function seedTestUsers() {
    console.log("🚀 Refreshing Synthetic User Profiles with Address/Payment data...");

    let created = 0;

    // We create NEW users starting from 400 to avoid conflicts with existing ones
    // and ensure we get the full document creation flow
    for (let i = 401; i <= 405; i++) {
        const fishingType = FISHING_TYPES[Math.floor(Math.random() * FISHING_TYPES.length)];
        const title = TITLES[Math.floor(Math.random() * TITLES.length)];
        const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];

        const firstName = "Expert";
        const lastName = `Angler${i}`;
        const fullName = `${firstName} ${lastName}`;
        const email = `fishing.enthusiast.${i}@thegreatcatch.test`;
        const password = "Password123!";

        const year = 1950 + Math.floor(Math.random() * 50);
        const pnr = `${year}0101-9999`;

        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);

            await setDoc(doc(db, 'users', cred.user.uid), {
                email,
                name: fullName,
                role: 'USER',
                title: title,
                bio: `Brinner för ${fishingType}. Favoritplats: ${region}. Har fiskat i över ${Math.floor(Math.random() * 30)} år.`,
                pnr: pnr,
                address: {
                    street: `${region}svägen ${Math.floor(Math.random() * 100) + 1}`,
                    city: region,
                    zip: `${Math.floor(Math.random() * 90000) + 10000}`
                },
                payment: {
                    cardNumber: `4539${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`,
                    expiry: '12/28',
                    cvc: '123'
                },
                isSynthetic: true,
                createdAt: new Date().toISOString(),
            });

            created++;
            console.log(`✅ Created: ${email}`);

        } catch (err) {
            console.error(`❌ Error with ${email}:`, err.message);
        }
    }

    console.log(`\n✨ Finished! Created ${created} new experts.`);
    process.exit(0);
}

seedTestUsers().catch(err => {
    console.error(err);
    process.exit(1);
});
