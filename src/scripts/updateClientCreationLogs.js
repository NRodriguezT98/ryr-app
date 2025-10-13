/**
 * Script para actualizar logs de creación de clientes existentes
 * Agrega información financiera faltante y corrige el orden de timestamps
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

async function updateClientCreationLogs() {
    try {
        console.log('🔄 Iniciando actualización de logs de creación de clientes...\n');

        // 1. Obtener todos los logs de creación de clientes
        const auditsRef = collection(db, 'audits');
        const q = query(auditsRef, where('actionType', '==', 'CREATE_CLIENT'));
        const snapshot = await getDocs(q);

        console.log(`📊 Encontrados ${snapshot.size} logs de creación de clientes\n`);

        let updated = 0;
        let skipped = 0;
        let errors = 0;

        for (const auditDoc of snapshot.docs) {
            const log = auditDoc.data();
            const clienteId = log.rawData?.entities?.clienteId;

            if (!clienteId) {
                console.log(`⚠️  Log ${auditDoc.id} no tiene clienteId, saltando...`);
                skipped++;
                continue;
            }

            console.log(`\n🔍 Procesando cliente: ${clienteId}`);

            try {
                // 2. Obtener datos del cliente
                const clienteRef = doc(db, 'clientes', clienteId);
                const clienteSnap = await getDoc(clienteRef);

                if (!clienteSnap.exists()) {
                    console.log(`   ⚠️  Cliente ${clienteId} no existe, saltando...`);
                    skipped++;
                    continue;
                }

                const clienteData = clienteSnap.data();
                const financiero = clienteData.financiero || {};

                // 3. Verificar si tiene información financiera
                const valorVivienda = parseFloat(financiero.valorVivienda) || 0;
                const tieneFinanciero = valorVivienda > 0 ||
                    financiero.creditoHipotecario ||
                    financiero.cuotaInicial ||
                    financiero.subsidioMCY ||
                    financiero.subsidioCajaCompensacion ||
                    financiero.recursosPropios;

                if (!tieneFinanciero) {
                    console.log(`   ℹ️  Cliente no tiene información financiera, saltando...`);
                    skipped++;
                    continue;
                }

                // 4. Construir sección financiera
                const fuentesPago = [];
                let totalFuentes = 0;

                // Crédito hipotecario
                if (financiero.creditoHipotecario && financiero.valorCreditoHipotecario) {
                    const valorCredito = parseFloat(financiero.valorCreditoHipotecario) || 0;
                    const banco = financiero.bancoCredito || 'Banco no especificado';
                    if (valorCredito > 0) {
                        fuentesPago.push(`   💳 Crédito Hipotecario (${banco}): $${new Intl.NumberFormat('es-CO').format(valorCredito)}`);
                        totalFuentes += valorCredito;
                    }
                }

                // Cuota inicial
                if (financiero.cuotaInicial) {
                    const valorCuota = parseFloat(financiero.cuotaInicial) || 0;
                    if (valorCuota > 0) {
                        fuentesPago.push(`   💵 Cuota Inicial: $${new Intl.NumberFormat('es-CO').format(valorCuota)}`);
                        totalFuentes += valorCuota;
                    }
                }

                // Subsidio MCY
                if (financiero.subsidioMCY) {
                    const valorMCY = parseFloat(financiero.subsidioMCY) || 0;
                    if (valorMCY > 0) {
                        fuentesPago.push(`   🏛️  Subsidio de Vivienda MCY: $${new Intl.NumberFormat('es-CO').format(valorMCY)}`);
                        totalFuentes += valorMCY;
                    }
                }

                // Subsidio Caja de Compensación
                if (financiero.subsidioCajaCompensacion) {
                    const valorCaja = parseFloat(financiero.subsidioCajaCompensacion) || 0;
                    if (valorCaja > 0) {
                        fuentesPago.push(`   🏢 Subsidio Caja de Compensación: $${new Intl.NumberFormat('es-CO').format(valorCaja)}`);
                        totalFuentes += valorCaja;
                    }
                }

                // Recursos propios adicionales
                if (financiero.recursosPropios) {
                    const valorPropios = parseFloat(financiero.recursosPropios) || 0;
                    if (valorPropios > 0) {
                        fuentesPago.push(`   💰 Recursos Propios: $${new Intl.NumberFormat('es-CO').format(valorPropios)}`);
                        totalFuentes += valorPropios;
                    }
                }

                const fuentesPagoTexto = fuentesPago.length > 0
                    ? fuentesPago.join('\n')
                    : '   No especificado';

                const totalFuentesTexto = fuentesPago.length > 0
                    ? `\n   ────────────────────────────────────────\n   📊 Total Fuentes: $${new Intl.NumberFormat('es-CO').format(totalFuentes)}`
                    : '';

                const seccionFinanciera = (valorVivienda > 0 || fuentesPago.length > 0)
                    ? `\n💰 INFORMACIÓN FINANCIERA
   🏡 Valor de la Vivienda: $${new Intl.NumberFormat('es-CO').format(valorVivienda)}
   
   Fuentes de Financiamiento:
${fuentesPagoTexto}${totalFuentesTexto}\n`
                    : '';

                // 5. Obtener datos para reconstruir el mensaje
                const nombreCompleto = `${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`;
                const fechaIngreso = clienteData.datosCliente.fechaIngreso?.toDate?.() || new Date(clienteData.datosCliente.fechaIngreso);
                const fechaIngresoFormateada = format(fechaIngreso, "d 'de' MMMM, yyyy", { locale: es });

                // Obtener datos de vivienda y proyecto
                const viviendaId = clienteData.viviendaId;
                const viviendaRef = doc(db, 'viviendas', viviendaId);
                const viviendaSnap = await getDoc(viviendaRef);
                const viviendaData = viviendaSnap.exists() ? viviendaSnap.data() : {};

                const proyectoId = viviendaData.proyectoId;
                const proyectoRef = doc(db, 'proyectos', proyectoId);
                const proyectoSnap = await getDoc(proyectoRef);
                const proyectoData = proyectoSnap.exists() ? proyectoSnap.data() : {};

                // 6. Reconstruir mensaje con información financiera
                const nuevoMensaje = `╔════════════════════════════════════════════════════════════════╗
║  ✨  NUEVO CLIENTE REGISTRADO                                 ║
╚════════════════════════════════════════════════════════════════╝

👤 DATOS DEL CLIENTE
   Nombre: ${nombreCompleto}
   Identificación: ${clienteData.datosCliente.cedula}
   Teléfono: ${clienteData.datosCliente.telefono || 'No registrado'}
   Email: ${clienteData.datosCliente.email || 'No registrado'}

🏠 VIVIENDA ASIGNADA
   Proyecto: ${proyectoData.nombre || 'No asignado'}
   Manzana: ${viviendaData.manzana || 'N/A'}
   Casa: ${viviendaData.numeroCasa || 'N/A'}

📅 FECHA DE INGRESO
   ${fechaIngresoFormateada}
${seccionFinanciera}
╔════════════════════════════════════════════════════════════════╗
║  ✅ Cliente creado exitosamente en el sistema                 ║
╚════════════════════════════════════════════════════════════════╝`;

                // 7. Actualizar el log
                await updateDoc(doc(db, 'audits', auditDoc.id), {
                    'rawData.message': nuevoMensaje
                });

                console.log(`   ✅ Log actualizado con información financiera`);
                console.log(`   💰 Valor vivienda: $${new Intl.NumberFormat('es-CO').format(valorVivienda)}`);
                console.log(`   📊 Total fuentes: $${new Intl.NumberFormat('es-CO').format(totalFuentes)}`);

                updated++;

            } catch (error) {
                console.error(`   ❌ Error procesando cliente ${clienteId}:`, error.message);
                errors++;
            }
        }

        console.log('\n' + '═'.repeat(60));
        console.log('📊 RESUMEN DE MIGRACIÓN');
        console.log('═'.repeat(60));
        console.log(`✅ Actualizados: ${updated}`);
        console.log(`⏭️  Saltados: ${skipped}`);
        console.log(`❌ Errores: ${errors}`);
        console.log('═'.repeat(60));

        // Ahora corregir el orden de timestamps
        console.log('\n🔄 Corrigiendo orden de timestamps...\n');
        await fixTimestampOrder();

    } catch (error) {
        console.error('❌ Error general en la migración:', error);
    }
}

async function fixTimestampOrder() {
    try {
        // Obtener todos los clientes
        const clientesRef = collection(db, 'clientes');
        const clientesSnap = await getDocs(clientesRef);

        let fixed = 0;
        let skipped = 0;

        for (const clienteDoc of clientesSnap.docs) {
            const clienteId = clienteDoc.id;

            // Buscar logs de este cliente
            const auditsRef = collection(db, 'audits');
            const q = query(
                auditsRef,
                where('rawData.entities.clienteId', '==', clienteId)
            );
            const logsSnap = await getDocs(q);

            // Buscar el log de creación y el de primer paso completado
            let createLog = null;
            let completeLog = null;

            logsSnap.forEach(doc => {
                const log = doc.data();
                if (log.actionType === 'CREATE_CLIENT') {
                    createLog = { id: doc.id, ...log };
                } else if (log.actionType === 'COMPLETE_PROCESS_STEP' &&
                    log.rawData?.actionData?.esPrimeraComplecion) {
                    completeLog = { id: doc.id, ...log };
                }
            });

            if (!createLog || !completeLog) {
                skipped++;
                continue;
            }

            // Verificar si el orden está correcto
            const createTime = createLog.timestamp?.toDate?.() || new Date(createLog.timestamp);
            const completeTime = completeLog.timestamp?.toDate?.() || new Date(completeLog.timestamp);

            if (completeTime <= createTime) {
                // Orden incorrecto, corregir
                const nuevoCreateTime = new Date(completeTime.getTime() - 1000); // 1 segundo antes

                await updateDoc(doc(db, 'audits', createLog.id), {
                    timestamp: Timestamp.fromDate(nuevoCreateTime)
                });

                console.log(`✅ Corregido orden para cliente ${clienteId}`);
                console.log(`   Creación: ${nuevoCreateTime.toISOString()}`);
                console.log(`   Completado: ${completeTime.toISOString()}`);

                fixed++;
            } else {
                skipped++;
            }
        }

        console.log('\n📊 Corrección de timestamps:');
        console.log(`✅ Corregidos: ${fixed}`);
        console.log(`⏭️  Ya estaban bien: ${skipped}`);

    } catch (error) {
        console.error('❌ Error corrigiendo timestamps:', error);
    }
}

// Ejecutar
console.log('🚀 Iniciando script de migración...\n');
updateClientCreationLogs().then(() => {
    console.log('\n✅ Migración completada');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Error en la migración:', error);
    process.exit(1);
});
