import { db } from './src/firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import productsData from './src/data/products.json' assert { type: 'json' };

async function syncProducts() {
    console.log('Starting sync...');
    try {
        const q = collection(db, 'products');
        const querySnapshot = await getDocs(q);

        for (const remoteDoc of querySnapshot.docs) {
            const remoteProduct = remoteDoc.data();
            const localProduct = productsData.find(p => p.id === remoteProduct.id);

            if (localProduct) {
                console.log(`Updating product ${localProduct.name} (${remoteDoc.id})`);
                await updateDoc(doc(db, 'products', remoteDoc.id), {
                    image: localProduct.image,
                    name: localProduct.name,
                    description: localProduct.description,
                    price: localProduct.price,
                    category: localProduct.category
                });
            }
        }
        console.log('Sync complete!');
    } catch (error) {
        console.error('Error syncing:', error);
    }
}

syncProducts();
