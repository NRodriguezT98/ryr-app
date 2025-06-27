// Importa las funciones y la configuración de tu proyecto
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';

// Copia y pega aquí la configuración de tu archivo firebase/config.js
const firebaseConfig = {
    apiKey: "AIzaSyDG4HIAQRcbhf8VFzf1A3G2pdHULsW8lPI", // Reemplaza con tu API Key real
    authDomain: "ryr-constructora-app.firebaseapp.com",
    projectId: "ryr-constructora-app",
    storageBucket: "ryr-constructora-app.firebasestorage.app",
    messagingSenderId: "1061579478680",
    appId: "1:1061579478680:web:2709e19b6eb7002b94a2ed"
};

// Inicializa Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- INICIO DEL SCRIPT DE DIAGNÓSTICO FINAL ---

async function migrarDatosDeViviendas() {
    console.log("🚀 Iniciando migración de datos de viviendas (Versión de Diagnóstico Final)...");

    try {
        console.log("   - Obteniendo todas las colecciones...");
        const viviendasSnapshot = await getDocs(collection(db, "viviendas"));
        const clientesSnapshot = await getDocs(collection(db, "clientes"));
        const abonosSnapshot = await getDocs(collection(db, "abonos"));

        const todasLasViviendas = viviendasSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        const todosLosClientes = clientesSnapshot.docs.map(d => ({ id: d.id.trim(), ...d.data() }));
        const todosLosAbonos = abonosSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        // --- PASO DE DIAGNÓSTICO CLAVE ---
        // Vamos a imprimir la lista de IDs de cliente que el script ha encontrado.
        const idsDeClientesEncontrados = todosLosClientes.map(c => c.id);
        console.log("\n--- LISTA DE IDs DE CLIENTES ENCONTRADOS EN LA BASE DE DATOS ---");
        console.log(idsDeClientesEncontrados);
        console.log("------------------------------------------------------------\n");


        const batch = writeBatch(db);
        let viviendasActualizadas = 0;

        todasLasViviendas.forEach(vivienda => {
            console.log(`   - Procesando vivienda Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`);

            let clienteNombre = "";
            let clienteIdLimpio = vivienda.clienteId ? vivienda.clienteId.trim() : null;

            // Buscamos el cliente en la lista
            const clienteAsignado = todosLosClientes.find(c => c.id === clienteIdLimpio);

            if (clienteIdLimpio) {
                console.log(`     - Buscando cliente con ID: "${clienteIdLimpio}"`);
                if (clienteAsignado) {
                    if (clienteAsignado.datosCliente && clienteAsignado.datosCliente.nombres) {
                        clienteNombre = `${clienteAsignado.datosCliente.nombres || ''} ${clienteAsignado.datosCliente.apellidos || ''}`.trim();
                        console.log(`     ✅ ¡ÉXITO! Cliente encontrado. Nombre: "${clienteNombre}"`);
                    } else {
                        console.log(`     ⚠️  ADVERTENCIA: Se encontró un cliente, pero su estructura de datos es incorrecta.`);
                    }
                } else {
                    console.log(`     ❌ FALLO: No se encontró un cliente con el ID proporcionado en la lista de arriba.`);
                }
            } else {
                console.log("     - Vivienda sin cliente asignado.");
            }

            // Lógica financiera (sin cambios)
            const abonosDeLaVivienda = todosLosAbonos.filter(a => a.viviendaId === vivienda.id);
            const totalAbonado = abonosDeLaVivienda.reduce((sum, abono) => sum + (abono.monto || 0), 0);
            const valorTotal = vivienda.valorTotal || 0;
            const descuentoMonto = vivienda.descuentoMonto || 0;
            const valorFinal = valorTotal - descuentoMonto;
            const saldoPendiente = valorFinal - totalAbonado;

            const viviendaRef = doc(db, "viviendas", vivienda.id);
            batch.update(viviendaRef, {
                clienteNombre: clienteNombre,
                totalAbonado: totalAbonado,
                valorFinal: valorFinal,
                saldoPendiente: saldoPendiente
            });

            viviendasActualizadas++;
        });

        if (viviendasActualizadas > 0) {
            console.log(`\n   - Confirmando actualización de ${viviendasActualizadas} viviendas...`);
            await batch.commit();
            console.log("\n✅ ¡Migración completada exitosamente!");
        } else {
            console.log("\n- No se encontraron viviendas para migrar.");
        }

    } catch (error) {
        console.error("\n❌ Error fatal durante la migración:", error);
    }
}

migrarDatosDeViviendas().then(() => {
    console.log("\nScript finalizado.");
});