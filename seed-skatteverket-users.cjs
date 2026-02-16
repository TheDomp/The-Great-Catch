const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const https = require('https');

const firebaseConfig = {
    apiKey: "AIzaSyBn54iQ5BAWrNVqgnDBJIkrZgvvEOnh2Nw",
    authDomain: "the-great-catch.firebaseapp.com",
    projectId: "the-great-catch",
    storageBucket: "the-great-catch.firebasestorage.app",
    messagingSenderId: "514171240388",
    appId: "1:514171240388:web:a92d79b873c0403cc3ae91",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const MALE_NAMES = ["Erik", "Lars", "Karl", "Anders", "Johan", "Per", "Nils", "Jan", "Lennart", "Mikael", "Olof", "Gunnar", "Roland", "Sven", "Bengt", "Bo", "Åke", "Rolf", "Ingemar", "Göran"];
const FEMALE_NAMES = ["Maria", "Anna", "Margareta", "Elisabeth", "Eva", "Birgitta", "Kristina", "Karin", "Ingrid", "Marie", "Gunilla", "Brita", "Marianne", "Lena", "Helena", "Kerstin", "Barbro", "Ulla", "Anita", "Susanne"];
const LAST_NAMES = ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson", "Pettersson", "Jonsson", "Jansson", "Hansson", "Bengtsson", "Jönsson", "Lindberg", "Jakobsson", "Magnusson", "Olofsson"];

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function seedUser({ email, password, name, role, pnr }) {
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', cred.user.uid), {
            email,
            name,
            role,
            pnr,
            createdAt: new Date().toISOString(),
        });
        return { success: true, email };
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
            // Optional: update pnr for existing user if needed
            return { success: false, reason: 'exists', email };
        }
        throw err;
    }
}

async function run() {
    console.log('Fetching test personnummer from Skatteverket...');
    let allPnrs = [];
    let limit = 100;

    // We need 350. Fetch 4 pages to be sure.
    for (let i = 0; i < 4; i++) {
        const url = `https://skatteverket.entryscape.net/rowstore/dataset/b4de7df7-63c0-4e7e-bb59-1f156a591763/json?_offset=${i * limit}&_limit=${limit}`;
        const data = await fetchJson(url);
        allPnrs = allPnrs.concat(data.results.map(r => r.testpersonnummer));
        console.log(`Fetched ${allPnrs.length} numbers...`);
    }

    const targetCount = 350;
    const usersToCreate = [];

    for (let i = 0; i < targetCount; i++) {
        const pnr = allPnrs[i % allPnrs.length];
        // The 12-digit format looks like: 189001019802
        // Digit 11 (second to last) determines gender
        const genderDigit = parseInt(pnr.charAt(10));
        const isMale = genderDigit % 2 !== 0;

        const firstName = isMale
            ? MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)]
            : FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        const fullName = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@thegreatcatch.test`;

        usersToCreate.push({
            email,
            password: 'Password123!',
            name: fullName,
            role: 'USER',
            pnr: pnr
        });
    }

    console.log(`Starting creation of ${usersToCreate.length} users...`);
    let created = 0;
    let skipped = 0;

    for (const u of usersToCreate) {
        try {
            const res = await seedUser(u);
            if (res.success) {
                created++;
                if (created % 50 === 0) console.log(`Created ${created} users...`);
            } else {
                skipped++;
            }
        } catch (e) {
            console.error(`Error creating ${u.email}:`, e.message);
        }
    }

    console.log(`\nFinished!`);
    console.log(`Created: ${created}`);
    console.log(`Skipped (already exists): ${skipped}`);
    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
