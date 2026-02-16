const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
    apiKey: "AIzaSyBn54iQ5BAWrNVqgnDBJIkrZgvvEOnh2Nw",
    authDomain: "the-great-catch.firebaseapp.com",
    projectId: "the-great-catch",
    storageBucket: "the-great-catch.firebasestorage.app",
    messagingSenderId: "514171240388",
    appId: "1:514171240388:web:a92d79b873c0403cc3ae91",
    measurementId: "G-48HVFF08WC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sync() {
    const data = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf8'));
    console.log('Syncing products to Firestore...');

    const q = collection(db, 'products');
    const snap = await getDocs(q);

    for (const remoteDoc of snap.docs) {
        const remoteData = remoteDoc.data();
        const local = data.find(p => p.id === remoteData.id);
        if (local) {
            console.log(`Updating ${local.name}...`);
            await updateDoc(doc(db, 'products', remoteDoc.id), {
                image: local.image
            });
        }
    }
    console.log('Done.');
    process.exit(0);
}

sync().catch(err => {
    console.error(err);
    process.exit(1);
});
