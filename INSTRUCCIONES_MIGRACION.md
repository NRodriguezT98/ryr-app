# Instrucciones para Actualizar Logs de Creación de Clientes

## Opción Más Rápida: Ejecutar desde Consola del Navegador

1. Abre la aplicación en tu navegador
2. Inicia sesión como administrador
3. Abre la consola del navegador (F12)
4. Copia y pega el siguiente código:

```javascript
// Función para actualizar un log de creación específico
async function actualizarLogCreacion(clienteId) {
    try {
        const { db } = await import('./src/firebase/config.js');
        const { collection, getDocs, query, where, doc, updateDoc, getDoc } = await import('firebase/firestore');
        const { format } = await import('date-fns');
        const { es } = await import('date-fns/locale');
        
        console.log(`🔍 Buscando logs para cliente: ${clienteId}`);
        
        // Buscar log de creación
        const auditsRef = collection(db, 'audits');
        const q = query(
            auditsRef,
            where('rawData.entities.clienteId', '==', clienteId),
            where('actionType', '==', 'CREATE_CLIENT')
        );
        const logsSnap = await getDocs(q);
        
        if (logsSnap.empty) {
            console.log('❌ No se encontró log de creación para este cliente');
            return;
        }
        
        const logDoc = logsSnap.docs[0];
        console.log(`✅ Log encontrado: ${logDoc.id}`);
        
        // Obtener datos del cliente
        const clienteRef = doc(db, 'clientes', clienteId);
        const clienteSnap = await getDoc(clienteRef);
        
        if (!clienteSnap.exists()) {
            console.log('❌ Cliente no existe');
            return;
        }
        
        const clienteData = clienteSnap.data();
        const financiero = clienteData.financiero || {};
        
        // Construir sección financiera
        const valorVivienda = parseFloat(financiero.valorVivienda) || 0;
        const fuentesPago = [];
        let totalFuentes = 0;
        
        if (financiero.creditoHipotecario && financiero.valorCreditoHipotecario) {
            const valorCredito = parseFloat(financiero.valorCreditoHipotecario) || 0;
            const banco = financiero.bancoCredito || 'Banco no especificado';
            if (valorCredito > 0) {
                fuentesPago.push(`   💳 Crédito Hipotecario (${banco}): $${new Intl.NumberFormat('es-CO').format(valorCredito)}`);
                totalFuentes += valorCredito;
            }
        }
        
        if (financiero.cuotaInicial) {
            const valorCuota = parseFloat(financiero.cuotaInicial) || 0;
            if (valorCuota > 0) {
                fuentesPago.push(`   💵 Cuota Inicial: $${new Intl.NumberFormat('es-CO').format(valorCuota)}`);
                totalFuentes += valorCuota;
            }
        }
        
        if (financiero.subsidioMCY) {
            const valorMCY = parseFloat(financiero.subsidioMCY) || 0;
            if (valorMCY > 0) {
                fuentesPago.push(`   🏛️  Subsidio de Vivienda MCY: $${new Intl.NumberFormat('es-CO').format(valorMCY)}`);
                totalFuentes += valorMCY;
            }
        }
        
        if (financiero.subsidioCajaCompensacion) {
            const valorCaja = parseFloat(financiero.subsidioCajaCompensacion) || 0;
            if (valorCaja > 0) {
                fuentesPago.push(`   🏢 Subsidio Caja de Compensación: $${new Intl.NumberFormat('es-CO').format(valorCaja)}`);
                totalFuentes += valorCaja;
            }
        }
        
        if (financiero.recursosPropios) {
            const valorPropios = parseFloat(financiero.recursosPropios) || 0;
            if (valorPropios > 0) {
                fuentesPago.push(`   💰 Recursos Propios: $${new Intl.NumberFormat('es-CO').format(valorPropios)}`);
                totalFuentes += valorPropios;
            }
        }
        
        const fuentesPagoTexto = fuentesPago.length > 0 ? fuentesPago.join('\n') : '   No especificado';
        const totalFuentesTexto = fuentesPago.length > 0
            ? `\n   ────────────────────────────────────────\n   📊 Total Fuentes: $${new Intl.NumberFormat('es-CO').format(totalFuentes)}`
            : '';
        
        const seccionFinanciera = (valorVivienda > 0 || fuentesPago.length > 0)
            ? `\n💰 INFORMACIÓN FINANCIERA
   🏡 Valor de la Vivienda: $${new Intl.NumberFormat('es-CO').format(valorVivienda)}
   
   Fuentes de Financiamiento:
${fuentesPagoTexto}${totalFuentesTexto}\n`
            : '';
        
        // Obtener datos para reconstruir el mensaje
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
        
        // Reconstruir mensaje
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
        
        // Actualizar log
        await updateDoc(doc(db, 'audits', logDoc.id), {
            'rawData.message': nuevoMensaje
        });
        
        console.log('✅ Log actualizado exitosamente');
        console.log(`💰 Valor vivienda: $${new Intl.NumberFormat('es-CO').format(valorVivienda)}`);
        console.log(`📊 Total fuentes: $${new Intl.NumberFormat('es-CO').format(totalFuentes)}`);
        console.log('\n🔄 Recarga la página para ver los cambios');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ahora ejecuta la función con el ID del cliente que quieres actualizar
// Por ejemplo:
// actualizarLogCreacion('ID_DEL_CLIENTE_AQUI');
```

5. Luego ejecuta la función con el ID del cliente:
```javascript
actualizarLogCreacion('ID_DEL_CLIENTE');
```

6. Recarga la página para ver los cambios

## Alternativa: Crear Cliente Nuevo

La forma más sencilla de verificar que todo funciona es crear un nuevo cliente con información financiera. Los cambios que hice garantizan que:

1. El log de creación aparecerá PRIMERO
2. El log de paso completado aparecerá SEGUNDO
3. La información financiera se mostrará correctamente
4. Los nombres de evidencias serán descriptivos

