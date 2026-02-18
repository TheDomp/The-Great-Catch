const { initializeApp } = require('firebase/app');
const { getFirestore, collection, setDoc, doc } = require('firebase/firestore');
const fs = require('fs');

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
const db = getFirestore(app);

async function uploadProducts() {
    const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
    console.log(`Starting upload of ${products.length} products to TEST environment...`);

    for (const p of products) {
        await setDoc(doc(db, 'products', p.id), p);
        console.log(`✅ Uploaded: ${p.name}`);
    }

    console.log('TEST Product upload complete!');
    process.exit(0);
}

uploadProducts().catch(err => {
    console.error(err);
    process.exit(1);
});
