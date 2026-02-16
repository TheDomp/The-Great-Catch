/**
 * Seed script: creates admin and test user accounts in Firebase Auth + Firestore.
 * Run once with: node seed-users.cjs
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

const TEST_USERS = [
    { email: 'admin@test.se', password: 'Password123!', name: 'Admin', role: 'ADMIN' },
    { email: 'customer@test.se', password: 'Password123!', name: 'Test User', role: 'USER' },
];

async function seedUser({ email, password, name, role }) {
    try {
        // Try to create the user
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        console.log(`✅ Created ${email}  (uid: ${cred.user.uid})`);

        // Write Firestore profile with role
        await setDoc(doc(db, 'users', cred.user.uid), {
            email,
            name,
            role,
            createdAt: new Date().toISOString(),
        });
        console.log(`   → Firestore doc written (role: ${role})`);
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
            console.log(`ℹ️  ${email} already exists – ensuring Firestore role...`);

            // Sign in to get the uid, then upsert the Firestore doc
            const cred = await signInWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'users', cred.user.uid), {
                email,
                name,
                role,
                createdAt: new Date().toISOString(),
            }, { merge: true });
            console.log(`   → Firestore role set to ${role}`);
        } else {
            console.error(`❌ Failed for ${email}:`, err.message);
        }
    }
}

(async () => {
    for (const u of TEST_USERS) {
        await seedUser(u);
    }
    console.log('\nDone! You can now log in from the Quick Access buttons.');
    process.exit(0);
})();
