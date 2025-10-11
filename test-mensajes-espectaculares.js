/**
 * TEST DE MENSAJES ESPECTACULARES
 * 
 * Script para probar cómo quedan los mensajes generados por el sistema de plantillas.
 * Ejecutar con: node test-mensajes-espectaculares.js
 */

// Simular importaciones (sin Firebase)
const PROCESO_CONFIG = [
    {
        key: 'promesaEnviada',
        label: '1. Promesa Enviada',
        evidenciasRequeridas: [
            { id: 'promesaCompraVenta', nombre: 'Promesa de Compra Venta firmada' },
            { id: 'cedulaCliente', nombre: 'Cédula del cliente' }
        ]
    },
    {
        key: 'desembolso',
        label: '5. Desembolso Realizado',
        evidenciasRequeridas: [
            { id: 'comprobanteDesembolso', nombre: 'Comprobante de desembolso' }
        ]
    }
];

// Mock de formatDisplayDate
const formatDisplayDate = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// ============================================
// COPIAR PLANTILLAS DESDE mensajesPlantillas.js
// ============================================

const PLANTILLA_COMPLETACION = (data) => {
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
};

const PLANTILLA_RECOMPLETACION = (data) => {
    const {
        pasoNombre,
        fechaNueva,
        motivoReapertura,
        fechaReapertura,
        cambios,
        estadoAnterior,
        evidenciasNuevas,
        cantidadEvidenciasNuevas
    } = data;

    let mensaje = `
╔════════════════════════════════════════════════════════════════╗
║  🔄➡️✅  PASO RE-COMPLETADO DESPUÉS DE REAPERTURA             ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO DEL PROCESO
   "${pasoNombre}"

🔄 CONTEXTO DE REAPERTURA
   ⚠️  Motivo: ${motivoReapertura}
   📅 Fecha de reapertura: ${formatDisplayDate(fechaReapertura)}
`;

    if (estadoAnterior && estadoAnterior.fecha) {
        mensaje += `
📊 ESTADO ANTERIOR (Antes de reapertura)
   📅 Fecha: ${formatDisplayDate(estadoAnterior.fecha)}
`;
        if (estadoAnterior.evidencias && estadoAnterior.evidencias.length > 0) {
            mensaje += `   📄 Evidencias: ${estadoAnterior.evidencias.length} archivo(s)\n`;
        }
    }

    if (cambios && cambios.length > 0) {
        mensaje += `
🔧 CAMBIOS REALIZADOS AL RE-COMPLETAR
`;
        cambios.forEach(cambio => {
            if (cambio.tipo === 'fecha') {
                mensaje += `   📅 Fecha modificada:\n`;
                mensaje += `      • Anterior: ${formatDisplayDate(cambio.fechaAnterior)}\n`;
                mensaje += `      • Nueva: ${formatDisplayDate(cambio.fechaNueva)}\n`;
            }

            if (cambio.tipo === 'evidencias') {
                mensaje += `   📄 Evidencias modificadas:\n`;

                if (cambio.agregadas && cambio.agregadas.length > 0) {
                    mensaje += `      ✅ Agregadas (${cambio.agregadas.length}):\n`;
                    cambio.agregadas.forEach(ev => {
                        mensaje += `         • ${ev.nombre}\n`;
                    });
                }

                if (cambio.eliminadas && cambio.eliminadas.length > 0) {
                    mensaje += `      ❌ Eliminadas (${cambio.eliminadas.length}):\n`;
                    cambio.eliminadas.forEach(ev => {
                        mensaje += `         • ${ev.nombre}\n`;
                    });
                }

                if (cambio.mantenidas && cambio.mantenidas.length > 0) {
                    mensaje += `      ➡️  Mantenidas (${cambio.mantenidas.length}):\n`;
                    cambio.mantenidas.forEach(ev => {
                        mensaje += `         • ${ev.nombre}\n`;
                    });
                }
            }
        });
    } else {
        mensaje += `
✅ RE-COMPLETACIÓN SIN CAMBIOS ADICIONALES
   El paso fue re-completado manteniendo los mismos datos
`;
    }

    mensaje += `
📅 FECHA FINAL DE COMPLETADO
   ${formatDisplayDate(fechaNueva)}
`;

    if (cantidadEvidenciasNuevas > 0) {
        mensaje += `
📋 EVIDENCIAS FINALES (${cantidadEvidenciasNuevas})
`;
        evidenciasNuevas.forEach((ev, index) => {
            mensaje += `   ${index + 1}. ${ev.nombre}\n`;
        });
    }

    mensaje += `
╔════════════════════════════════════════════════════════════════╗
║  ✅ Paso re-completado exitosamente con historial preservado ║
╚════════════════════════════════════════════════════════════════╝
`;

    return mensaje.trim();
};

const PLANTILLA_CAMBIO_FECHA = (data) => {
    const {
        pasoNombre,
        fechaAnterior,
        fechaNueva,
        evidencias,
        cantidadEvidencias
    } = data;

    // Helper para dirección
    const getFlechaDireccion = (fechaAnt, fechaNue) => {
        const dateAnterior = new Date(fechaAnt);
        const dateNueva = new Date(fechaNue);
        return dateNueva > dateAnterior ? '⬆️' : dateNueva < dateAnterior ? '⬇️' : '➡️';
    };

    // Helper para descripción
    const getDescripcionCambioFecha = (fechaAnt, fechaNue) => {
        const dateAnterior = new Date(fechaAnt);
        const dateNueva = new Date(fechaNue);
        const diferenciaDias = Math.abs(Math.floor((dateNueva - dateAnterior) / (1000 * 60 * 60 * 24)));

        if (dateNueva > dateAnterior) {
            if (diferenciaDias === 0) return 'Mismo día, hora ajustada';
            if (diferenciaDias === 1) return 'Adelantado 1 día';
            if (diferenciaDias < 7) return `Adelantado ${diferenciaDias} días`;
            return `Adelantado ${Math.floor(diferenciaDias / 7)} semana(s)`;
        } else if (dateNueva < dateAnterior) {
            if (diferenciaDias === 1) return 'Retrocedido 1 día';
            if (diferenciaDias < 7) return `Retrocedido ${diferenciaDias} días`;
            return `Retrocedido ${Math.floor(diferenciaDias / 7)} semana(s)`;
        }
        return 'Fecha sin cambios';
    };

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
`;

    if (cantidadEvidencias > 0) {
        mensaje += `
📄 EVIDENCIAS ACTUALES DEL PASO (${cantidadEvidencias})
   Las evidencias se mantuvieron sin cambios:
`;
        evidencias.forEach((ev, index) => {
            mensaje += `   ${index + 1}. ${ev.nombre}\n`;
        });
    }

    mensaje += `
╔════════════════════════════════════════════════════════════════╗
║  ✅ Fecha actualizada correctamente                           ║
╚════════════════════════════════════════════════════════════════╝
`;

    return mensaje.trim();
};

// ============================================
// CASOS DE PRUEBA
// ============================================

console.log('\n' + '='.repeat(70));
console.log('🧪 PRUEBA DE MENSAJES ESPECTACULARES');
console.log('='.repeat(70) + '\n');

// PRUEBA 1: Completación simple
console.log('\n📝 CASO 1: Completación de paso (primera vez)\n');
console.log(PLANTILLA_COMPLETACION({
    pasoNombre: 'Promesa Enviada',
    fecha: '2025-10-11',
    evidencias: [
        { nombre: 'Promesa de Compra Venta firmada' },
        { nombre: 'Cédula del cliente' }
    ],
    cantidadEvidencias: 2
}));

// PRUEBA 2: Re-completación con cambios
console.log('\n\n📝 CASO 2: Re-completación después de reapertura\n');
console.log(PLANTILLA_RECOMPLETACION({
    pasoNombre: 'Desembolso Realizado',
    fechaNueva: '2025-10-11',
    motivoReapertura: 'Error en monto del desembolso',
    fechaReapertura: '2025-10-10',
    cambios: [
        {
            tipo: 'fecha',
            fechaAnterior: '2025-10-05',
            fechaNueva: '2025-10-11'
        },
        {
            tipo: 'evidencias',
            agregadas: [
                { nombre: 'Comprobante de desembolso corregido' },
                { nombre: 'Autorización de corrección' }
            ],
            eliminadas: [],
            mantenidas: [
                { nombre: 'Solicitud de desembolso original' }
            ]
        }
    ],
    estadoAnterior: {
        fecha: '2025-10-05',
        evidencias: [{ nombre: 'Solicitud de desembolso original' }]
    },
    evidenciasNuevas: [
        { nombre: 'Comprobante de desembolso corregido' },
        { nombre: 'Autorización de corrección' },
        { nombre: 'Solicitud de desembolso original' }
    ],
    cantidadEvidenciasNuevas: 3
}));

// PRUEBA 3: Cambio de fecha
console.log('\n\n📝 CASO 3: Modificación solo de fecha\n');
console.log(PLANTILLA_CAMBIO_FECHA({
    pasoNombre: 'Factura de Venta',
    fechaAnterior: '2025-10-05',
    fechaNueva: '2025-10-08',
    evidencias: [
        { nombre: 'Factura de venta firmada' }
    ],
    cantidadEvidencias: 1
}));

console.log('\n\n' + '='.repeat(70));
console.log('✅ PRUEBA COMPLETADA');
console.log('='.repeat(70) + '\n');
