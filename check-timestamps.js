/**
 * Script para verificar timestamps de auditoría de un cliente específico
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDG4HIAQRcbhf8VFzf1A3G2pdHULsW8lPI",
    authDomain: "ryr-constructora-app.firebaseapp.com",
    projectId: "ryr-constructora-app",
    storageBucket: "ryr-constructora-app.firebasestorage.app",
    messagingSenderId: "1061579478680",
    appId: "1:1061579478680:web:2709e19b6eb7002b94a2ed"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkClientTimestamps() {
    const clienteId = '1211'; // Cliente con cédula 1211

    console.log(`\n🔍 Verificando timestamps para cliente: ${clienteId}\n`);
    console.log('='.repeat(80));

    try {
        // Consultar logs del cliente
        const auditsRef = collection(db, 'audits');
        const q = query(
            auditsRef,
            where('entities.clienteId', '==', clienteId),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);

        console.log(`\n📊 Total de logs encontrados: ${snapshot.size}\n`);

        let counter = 1;
        snapshot.forEach((doc) => {
            const data = doc.data();
            const ts = data.timestamp?.toDate?.() || new Date(data.timestamp);

            console.log(`\n${counter}. LOG ID: ${doc.id}`);
            console.log(`   Action Type: ${data.actionType}`);
            console.log(`   Timestamp (ISO): ${ts.toISOString()}`);
            console.log(`   Timestamp (Local): ${ts.toLocaleString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            })}`);
            console.log(`   Timestamp (Raw): ${data.timestamp}`);

            // Mostrar mensaje si existe
            if (data.rawData?.message) {
                const messagePreview = data.rawData.message.substring(0, 100).replace(/\n/g, ' ');
                console.log(`   Message Preview: ${messagePreview}...`);
            }

            console.log(`   ${'-'.repeat(76)}`);
            counter++;
        });

        console.log('\n' + '='.repeat(80));
        console.log('✅ Verificación completada\n');

        // Verificar si hay timestamps duplicados
        const timestamps = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            const ts = data.timestamp?.toDate?.() || new Date(data.timestamp);
            timestamps.push(ts.getTime());
        });

        const uniqueTimestamps = new Set(timestamps);

        if (timestamps.length !== uniqueTimestamps.size) {
            console.log('⚠️  ADVERTENCIA: Se detectaron timestamps duplicados!');
            console.log(`   Total logs: ${timestamps.length}`);
            console.log(`   Timestamps únicos: ${uniqueTimestamps.size}`);
            console.log(`   Duplicados: ${timestamps.length - uniqueTimestamps.size}`);
        } else {
            console.log('✅ Todos los timestamps son únicos');
        }

    } catch (error) {
        console.error('❌ Error al verificar timestamps:', error);
    }

    process.exit(0);
}

checkClientTimestamps();
