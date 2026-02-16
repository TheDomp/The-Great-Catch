const { initializeApp } = require('firebase/app');
const { getFirestore, collection, setDoc, doc } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
    apiKey: "AIzaSyBn54iQ5BAWrNVqgnDBJIkrZgvvEOnh2Nw",
    authDomain: "the-great-catch.firebaseapp.com",
    projectId: "the-great-catch",
    storageBucket: "the-great-catch.firebasestorage.app",
    messagingSenderId: "514171240388",
    appId: "1:514171240388:web:a92d79b873c0403cc3ae91",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadProducts() {
    const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
    console.log(`Starting upload of ${products.length} products...`);

    for (const p of products) {
        // Use the product ID as the document ID in Firestore
        await setDoc(doc(db, 'products', p.id), p);
        console.log(`✅ Uploaded: ${p.name}`);
    }

    console.log('Product upload complete!');
    process.exit(0);
}

uploadProducts().catch(err => {
    console.error(err);
    process.exit(1);
});
