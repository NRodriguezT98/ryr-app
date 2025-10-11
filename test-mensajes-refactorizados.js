/**
 * TEST - Mensajes Refactorizados
 * 
 * Prueba las 3 plantillas refactorizadas según la lógica real del negocio:
 * 1. COMPLETACIÓN (Primera vez)
 * 2. EDICIÓN DE FECHA (Solo fecha)
 * 3. REAPERTURA (Con o sin cambios)
 */

// Mock de formatDisplayDate
function formatDisplayDate(fecha) {
    if (!fecha) return 'Fecha no disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Mock de getFlechaDireccion
function getFlechaDireccion(fechaAnterior, fechaNueva) {
    const dateAnterior = new Date(fechaAnterior);
    const dateNueva = new Date(fechaNueva);

    if (dateNueva > dateAnterior) {
        return '⬆️';
    } else if (dateNueva < dateAnterior) {
        return '⬇️';
    } else {
        return '➡️';
    }
}

// Mock de getDescripcionCambioFecha
function getDescripcionCambioFecha(fechaAnterior, fechaNueva) {
    const dateAnterior = new Date(fechaAnterior);
    const dateNueva = new Date(fechaNueva);

    const diferenciaDias = Math.abs(Math.floor((dateNueva - dateAnterior) / (1000 * 60 * 60 * 24)));

    if (dateNueva > dateAnterior) {
        if (diferenciaDias === 0) return 'Mismo día, hora ajustada';
        if (diferenciaDias === 1) return 'Adelantado 1 día';
        if (diferenciaDias < 7) return `Adelantado ${diferenciaDias} días`;
        if (diferenciaDias < 30) return `Adelantado ${Math.floor(diferenciaDias / 7)} semana(s)`;
        return `Adelantado ${Math.floor(diferenciaDias / 30)} mes(es)`;
    } else if (dateNueva < dateAnterior) {
        if (diferenciaDias === 0) return 'Mismo día, hora ajustada';
        if (diferenciaDias === 1) return 'Retrocedido 1 día';
        if (diferenciaDias < 7) return `Retrocedido ${diferenciaDias} días`;
        if (diferenciaDias < 30) return `Retrocedido ${Math.floor(diferenciaDias / 7)} semana(s)`;
        return `Retrocedido ${Math.floor(diferenciaDias / 30)} mes(es)`;
    } else {
        return 'Fecha sin cambios';
    }
}

// ═══════════════════════════════════════════════════════════════
// PLANTILLA 1: COMPLETACIÓN
// ═══════════════════════════════════════════════════════════════
function PLANTILLA_COMPLETACION(data) {
    const { pasoNombre, fecha, evidencias, cantidadEvidencias } = data;

    let mensaje = `
╔════════════════════════════════════════════════════════════════╗
║  🎉  PASO COMPLETADO CON ÉXITO                                ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO DEL PROCESO
   "${pasoNombre}"

📅 FECHA DE COMPLETADO
   ${formatDisplayDate(fecha)}
`;

    if (cantidadEvidencias > 0) {
        const iconoEvidencias = cantidadEvidencias === 1 ? '📄' : '📋';
        const textoEvidencias = cantidadEvidencias === 1
            ? 'Se adjuntó 1 evidencia'
            : `Se adjuntaron ${cantidadEvidencias} evidencias`;

        mensaje += `
${iconoEvidencias} EVIDENCIAS ADJUNTAS
   ${textoEvidencias}:
`;
        evidencias.forEach((ev, index) => {
            mensaje += `   ${index + 1}. ${ev.nombre}\n`;
        });
    } else {
        mensaje += `
📝 EVIDENCIAS
   No se adjuntaron evidencias en este paso
`;
    }

    mensaje += `
╔════════════════════════════════════════════════════════════════╗
║  ✅ Este paso ha sido marcado como completado exitosamente   ║
╚════════════════════════════════════════════════════════════════╝
`;

    return mensaje.trim();
}

// ═══════════════════════════════════════════════════════════════
// PLANTILLA 2: EDICIÓN DE FECHA
// ═══════════════════════════════════════════════════════════════
function PLANTILLA_EDICION_FECHA(data) {
    const { pasoNombre, fechaAnterior, fechaNueva } = data;

    let mensaje = `
╔════════════════════════════════════════════════════════════════╗
║  📅  FECHA DE COMPLETADO MODIFICADA                           ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO MODIFICADO
   "${pasoNombre}"

📅 CAMBIO DE FECHA
   Anterior: ${formatDisplayDate(fechaAnterior)}
   Nueva:    ${formatDisplayDate(fechaNueva)}
   
   ${getFlechaDireccion(fechaAnterior, fechaNueva)} ${getDescripcionCambioFecha(fechaAnterior, fechaNueva)}

╔════════════════════════════════════════════════════════════════╗
║  ✅ Fecha actualizada correctamente                           ║
╚════════════════════════════════════════════════════════════════╝
`;

    return mensaje.trim();
}

// ═══════════════════════════════════════════════════════════════
// PLANTILLA 3: REAPERTURA
// ═══════════════════════════════════════════════════════════════
function PLANTILLA_REAPERTURA(data) {
    const {
        pasoNombre,
        motivoReapertura,
        fechaAnterior,
        fechaNueva,
        evidenciasReemplazadas,
        evidenciasNuevas,
        cantidadEvidenciasAnterior,
        cantidadEvidenciasNueva,
        huboCambioFecha,
        huboCambioEvidencias
    } = data;

    let mensaje = `
╔════════════════════════════════════════════════════════════════╗
║  🔄  PASO REABIERTO Y COMPLETADO NUEVAMENTE                   ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO DEL PROCESO
   "${pasoNombre}"

⚠️  MOTIVO DE REAPERTURA
   ${motivoReapertura}

📊 ESTADO ANTERIOR (Antes de reapertura)
   📅 Fecha de completado: ${formatDisplayDate(fechaAnterior)}
   📄 Evidencias: ${cantidadEvidenciasAnterior} archivo(s)
`;

    const huboCambios = huboCambioFecha || huboCambioEvidencias;

    if (huboCambios) {
        mensaje += `
═══════════════════════════════════════════════════════════════

🔧 CAMBIOS REALIZADOS
`;

        if (huboCambioFecha) {
            mensaje += `
   📅 FECHA DE COMPLETADO MODIFICADA:
      Anterior: ${formatDisplayDate(fechaAnterior)}
      Nueva:    ${formatDisplayDate(fechaNueva)}
      
      ${getFlechaDireccion(fechaAnterior, fechaNueva)} ${getDescripcionCambioFecha(fechaAnterior, fechaNueva)}
`;
        }

        if (huboCambioEvidencias && evidenciasReemplazadas && evidenciasReemplazadas.length > 0) {
            mensaje += `
   📄 EVIDENCIAS REEMPLAZADAS:
`;
            evidenciasReemplazadas.forEach((reemplazo, index) => {
                mensaje += `      ${index + 1}. "${reemplazo.anterior}" ➡️  "${reemplazo.nueva}"\n`;
            });
        }
    } else {
        mensaje += `
═══════════════════════════════════════════════════════════════

✅ REAPERTURA SIN CAMBIOS
   El paso fue reabierto y completado nuevamente sin modificaciones
`;
    }

    mensaje += `
═══════════════════════════════════════════════════════════════

📊 ESTADO FINAL
   📅 Fecha de completado: ${formatDisplayDate(fechaNueva)}
   📄 Total de evidencias: ${cantidadEvidenciasNueva} archivo(s)
`;

    if (cantidadEvidenciasNueva > 0) {
        mensaje += `
📋 EVIDENCIAS FINALES
`;
        evidenciasNuevas.forEach((ev, index) => {
            mensaje += `   ${index + 1}. ${ev.nombre}\n`;
        });
    }

    mensaje += `
╔════════════════════════════════════════════════════════════════╗
║  ✅ Paso completado nuevamente con historial preservado      ║
╚════════════════════════════════════════════════════════════════╝
`;

    return mensaje.trim();
}

// ═══════════════════════════════════════════════════════════════
// CASOS DE PRUEBA
// ═══════════════════════════════════════════════════════════════

console.log('\n');
console.log('═'.repeat(70));
console.log(' 🎯 TEST - MENSAJES REFACTORIZADOS (3 PLANTILLAS)');
console.log('═'.repeat(70));
console.log('\n');

// ──────────────────────────────────────────────────────────────
// CASO 1: COMPLETACIÓN (Primera vez)
// ──────────────────────────────────────────────────────────────
console.log('═'.repeat(70));
console.log('CASO 1: COMPLETACIÓN DE PASO (Primera vez)');
console.log('═'.repeat(70));

const mensaje1 = PLANTILLA_COMPLETACION({
    pasoNombre: 'Promesa Enviada',
    fecha: '2025-10-11',
    evidencias: [
        { nombre: 'Promesa de Compra Venta firmada' },
        { nombre: 'Cédula del cliente' }
    ],
    cantidadEvidencias: 2
});

console.log(mensaje1);
console.log('\n');

// ──────────────────────────────────────────────────────────────
// CASO 2: EDICIÓN DE FECHA (Solo fecha, sin evidencias)
// ──────────────────────────────────────────────────────────────
console.log('═'.repeat(70));
console.log('CASO 2: EDICIÓN DE FECHA (Botón Editar Fecha)');
console.log('═'.repeat(70));

const mensaje2 = PLANTILLA_EDICION_FECHA({
    pasoNombre: 'Factura de Venta',
    fechaAnterior: '2025-10-05',
    fechaNueva: '2025-10-08'
});

console.log(mensaje2);
console.log('\n');

// ──────────────────────────────────────────────────────────────
// CASO 3: REAPERTURA - Solo reemplazo de evidencia
// ──────────────────────────────────────────────────────────────
console.log('═'.repeat(70));
console.log('CASO 3: REAPERTURA - Solo reemplazo de evidencia');
console.log('═'.repeat(70));

const mensaje3 = PLANTILLA_REAPERTURA({
    pasoNombre: 'Escritura Pública',
    motivoReapertura: 'Error en el documento de escritura',
    fechaAnterior: '2025-10-05',
    fechaNueva: '2025-10-05',
    evidenciasReemplazadas: [
        { anterior: 'Escritura pública con error', nueva: 'Escritura pública corregida' }
    ],
    evidenciasNuevas: [
        { nombre: 'Escritura pública corregida' }
    ],
    cantidadEvidenciasAnterior: 1,
    cantidadEvidenciasNueva: 1,
    huboCambioFecha: false,
    huboCambioEvidencias: true
});

console.log(mensaje3);
console.log('\n');

// ──────────────────────────────────────────────────────────────
// CASO 4: REAPERTURA - Solo cambio de fecha
// ──────────────────────────────────────────────────────────────
console.log('═'.repeat(70));
console.log('CASO 4: REAPERTURA - Solo cambio de fecha');
console.log('═'.repeat(70));

const mensaje4 = PLANTILLA_REAPERTURA({
    pasoNombre: 'Desembolso Realizado',
    motivoReapertura: 'Cambio en la fecha de desembolso',
    fechaAnterior: '2025-10-05',
    fechaNueva: '2025-10-11',
    evidenciasReemplazadas: [],
    evidenciasNuevas: [
        { nombre: 'Comprobante de desembolso' }
    ],
    cantidadEvidenciasAnterior: 1,
    cantidadEvidenciasNueva: 1,
    huboCambioFecha: true,
    huboCambioEvidencias: false
});

console.log(mensaje4);
console.log('\n');

// ──────────────────────────────────────────────────────────────
// CASO 5: REAPERTURA - Cambio de fecha + reemplazo de evidencia
// ──────────────────────────────────────────────────────────────
console.log('═'.repeat(70));
console.log('CASO 5: REAPERTURA - Cambio de fecha + reemplazo de evidencia');
console.log('═'.repeat(70));

const mensaje5 = PLANTILLA_REAPERTURA({
    pasoNombre: 'Avalúo Inmobiliario',
    motivoReapertura: 'Actualización de avalúo y fecha',
    fechaAnterior: '2025-10-01',
    fechaNueva: '2025-10-11',
    evidenciasReemplazadas: [
        { anterior: 'Avalúo inmobiliario antiguo', nueva: 'Avalúo inmobiliario actualizado' }
    ],
    evidenciasNuevas: [
        { nombre: 'Avalúo inmobiliario actualizado' }
    ],
    cantidadEvidenciasAnterior: 1,
    cantidadEvidenciasNueva: 1,
    huboCambioFecha: true,
    huboCambioEvidencias: true
});

console.log(mensaje5);
console.log('\n');

// ──────────────────────────────────────────────────────────────
// CASO 6: REAPERTURA - Sin cambios (solo se reabrió y completó)
// ──────────────────────────────────────────────────────────────
console.log('═'.repeat(70));
console.log('CASO 6: REAPERTURA - Sin cambios (NOTA: Este caso NO debería ocurrir)');
console.log('═'.repeat(70));

const mensaje6 = PLANTILLA_REAPERTURA({
    pasoNombre: 'Firma de Contrato',
    motivoReapertura: 'Revisión de documentación',
    fechaAnterior: '2025-10-05',
    fechaNueva: '2025-10-05',
    evidenciasReemplazadas: [],
    evidenciasNuevas: [
        { nombre: 'Contrato firmado' }
    ],
    cantidadEvidenciasAnterior: 1,
    cantidadEvidenciasNueva: 1,
    huboCambioFecha: false,
    huboCambioEvidencias: false
});

console.log(mensaje6);
console.log('\n');

// ══════════════════════════════════════════════════════════════
// RESUMEN
// ══════════════════════════════════════════════════════════════
console.log('═'.repeat(70));
console.log(' ✅ RESUMEN DE LA REFACTORIZACIÓN');
console.log('═'.repeat(70));
console.log('');
console.log('  ANTES: 7 plantillas con conceptos erróneos');
console.log('  AHORA: 3 plantillas según lógica real del negocio');
console.log('');
console.log('  1. ✅ COMPLETACIÓN - Primera vez que se completa');
console.log('  2. ✅ EDICIÓN DE FECHA - Solo modifica fecha (botón editar)');
console.log('  3. ✅ REAPERTURA - Reabre y completa (con o sin cambios)');
console.log('');
console.log('  CAMBIOS CLAVE:');
console.log('  • Eliminado concepto de "recompletación"');
console.log('  • Eliminado concepto de "revisión"');
console.log('  • Edición de fecha SIN mostrar evidencias');
console.log('  • Reapertura usa "REEMPLAZADAS" en vez de "agregadas/eliminadas"');
console.log('  • Reapertura SIEMPRE termina en completación');
console.log('');
console.log('═'.repeat(70));
console.log('\n');
