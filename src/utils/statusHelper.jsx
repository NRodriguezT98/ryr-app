import React from 'react';
import { Award, ShieldCheck, Handshake, PenSquare, FileCheck2, Search, FileSignature, FileUp, UserPlus, AlertTriangle, FileText } from 'lucide-react';
import { PROCESO_CONFIG } from './procesoConfig'; // Importamos la configuración del proceso

// 1. GENERAMOS EL ORDEN DE LOS PASOS DINÁMICAMENTE
// Lo invertimos para que la lógica encuentre el último paso completado primero.
const PROCESS_STAGES_ORDER = [...PROCESO_CONFIG].map(p => p.key).reverse();

// 2. CONFIGURACIÓN DE ESTADOS MEJORADA Y CENTRALIZADA
// Ahora incluye todos los pasos del nuevo proceso.
const STATUS_CONFIG = {
    // Casos especiales
    'pazYSalvo': { text: 'A Paz y Salvo', color: 'bg-green-100 text-green-800', icon: <Award size={14} /> },
    'renunciaPendiente': { text: 'Renuncia Pendiente', color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle size={14} /> },
    'desconocido': { text: 'Estado Desconocido', color: 'bg-gray-100 text-gray-800', icon: <UserPlus size={14} /> },
    'documentacion': { text: 'Recopilando Documentación', color: 'bg-gray-100 text-gray-800', icon: <FileUp size={14} /> },

    // Mapeo de todos los pasos del proceso
    'promesaEnviada': { text: 'Promesa de Compraventa Enviada', color: 'bg-pink-100 text-pink-800', icon: <FileSignature size={14} /> },
    'promesaRecibida': { text: 'Promesa de Compraventa Firmada', color: 'bg-pink-100 text-pink-800', icon: <FileSignature size={14} /> },
    'envioDocumentacionAvaluo': { text: 'Doc. Avalúo Enviada', color: 'bg-purple-100 text-purple-800', icon: <Search size={14} /> },
    'cartaRatificacionRecibida': { text: 'Carta Ratificación Recibida', color: 'bg-purple-100 text-purple-800', icon: <FileText size={14} /> },
    'pagoEstudioTitulos': { text: 'Pago Estudio de Títulos', color: 'bg-purple-100 text-purple-800', icon: <Search size={14} /> },
    'minutaEnviadaAbogada': { text: 'Minuta de Compraventa en Revisión (Abogada)', color: 'bg-indigo-100 text-indigo-800', icon: <FileCheck2 size={14} /> },
    'minutaAprobadaAbogada': { text: 'Minuta de Compraventa Aprobada', color: 'bg-indigo-100 text-indigo-800', icon: <FileCheck2 size={14} /> },
    'minutaEnviadaNotaria': { text: 'Minuta de Compraventa en Notaría', color: 'bg-blue-100 text-blue-800', icon: <PenSquare size={14} /> },
    'minutaFirmada': { text: 'Minuta de Compraventa Firmada', color: 'bg-blue-100 text-blue-800', icon: <PenSquare size={14} /> },
    'actaEntregaEnviada': { text: 'Acta de Entrega Enviada', color: 'bg-cyan-100 text-cyan-800', icon: <ShieldCheck size={14} /> },
    'actaEntregaRecibida': { text: 'Acta de Entrega Firmada', color: 'bg-cyan-100 text-cyan-800', icon: <ShieldCheck size={14} /> },
    'pagoBoletaFiscal': { text: 'Pago Boleta Fiscal', color: 'bg-sky-100 text-sky-800', icon: <Handshake size={14} /> },
    'pagoBoletaRegistro': { text: 'Pago Boleta de Registro', color: 'bg-sky-100 text-sky-800', icon: <Handshake size={14} /> },
    'solicitudDesembolsoCredito': { text: 'Sol. Desembolso Crédito', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'desembolsoCredito': { text: 'Crédito Desembolsado', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'solicitudDesembolsoMCY': { text: 'Sol. Desembolso MCY', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'desembolsoMCY': { text: 'Subsidio MCY Desembolsado', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'solicitudDesembolsoCaja': { text: 'Sol. Desembolso Caja Comp.', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'desembolsoCaja': { text: 'Subsidio Caja Desembolsado', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'facturaVenta': { text: 'Factura de Venta', color: 'bg-green-100 text-green-800', icon: <Award size={14} /> },
};


// 3. LÓGICA DE DETERMINACIÓN DE ESTADO ACTUALIZADA
export const determineClientStatus = (cliente) => {
    if (!cliente) return STATUS_CONFIG.desconocido;
    if (cliente.tieneRenunciaPendiente) return STATUS_CONFIG.renunciaPendiente;
    if (cliente.vivienda && cliente.vivienda.saldoPendiente <= 0) return STATUS_CONFIG.pazYSalvo;

    // Usamos el nuevo objeto "proceso" en lugar de "seguimiento"
    const proceso = cliente.proceso || {};

    // Buscamos el último paso completado en el orden definido dinámicamente
    for (const stage of PROCESS_STAGES_ORDER) {
        if (proceso[stage]?.completado) {
            return STATUS_CONFIG[stage] || STATUS_CONFIG.desconocido;
        }
    }

    // Si ningún paso del proceso está completado, el estado por defecto es 'documentacion'
    return STATUS_CONFIG.documentacion;
};