/**
 * Expanded Seed script: adds more test users to Firebase Auth + Firestore.
 */
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

const EXPANDED_USERS = [
    { email: 'admin@test.se', password: 'Password123!', name: 'Admin', role: 'ADMIN' },
    { email: 'customer@test.se', password: 'Password123!', name: 'Test User', role: 'USER' },
    { email: 'erik.lindqvist@test.se', password: 'Password123!', name: 'Erik Lindqvist', role: 'USER' },
    { email: 'astrid.svensson@test.se', password: 'Password123!', name: 'Astrid Svensson', role: 'USER' },
    { email: 'bjorn.eriksson@test.se', password: 'Password123!', name: 'Björn Eriksson', role: 'USER' },
    { email: 'freja.holmberg@test.se', password: 'Password123!', name: 'Freja Holmberg', role: 'USER' },
    { email: 'gustav.nilsson@test.se', password: 'Password123!', name: 'Gustav Nilsson', role: 'USER' },
    { email: 'ivar.borg@test.se', password: 'Password123!', name: 'Ivar Borg', role: 'USER' },
    { email: 'klara.widlund@test.se', password: 'Password123!', name: 'Klara Widlund', role: 'USER' },
    { email: 'lars.petterson@test.se', password: 'Password123!', name: 'Lars Pettersson', role: 'USER' },
    { email: 'matilda.forsberg@test.se', password: 'Password123!', name: 'Matilda Forsberg', role: 'USER' },
    { email: 'oskar.dahlgren@test.se', password: 'Password123!', name: 'Oskar Dahlgren', role: 'USER' }
];

async function seedUser({ email, password, name, role }) {
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`✅ Created ${email}`);
        await setDoc(doc(db, 'users', cred.user.uid), {
            email,
            name,
            role,
            createdAt: new Date().toISOString(),
        });
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
            console.log(`ℹ️  ${email} already exists - skipping (to update role, use Admin SDK or correct password)`);
        } else {
            console.error(`❌ Failed for ${email}:`, err.message);
        }
    }
}

(async () => {
    for (const u of EXPANDED_USERS) {
        await seedUser(u);
    }
    console.log('\nExpansion Done!');
    process.exit(0);
})();
