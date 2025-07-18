import React from 'react';
import { Award, ShieldCheck, Handshake, PenSquare, FileCheck2, Search, FileSignature, FileUp, UserPlus, AlertTriangle } from 'lucide-react';

// El nuevo CONFIG ahora mapea los pasos de seguimiento a un estado visual
const STATUS_CONFIG = {
    // Casos especiales
    'pazYSalvo': { text: 'A Paz y Salvo', color: 'bg-green-100 text-green-800', icon: <Award size={14} /> },
    'renunciaPendiente': { text: 'Renuncia Pendiente', color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle size={14} /> },
    'desconocido': { text: 'Estado Desconocido', color: 'bg-gray-100 text-gray-800', icon: <UserPlus size={14} /> },

    // Mapeo de pasos de seguimiento
    'facturaVenta': { text: 'Factura de Venta', color: 'bg-green-100 text-green-800', icon: <Award size={14} /> },
    'desembolsoCaja': { text: 'Subsidio de Caja de Compensación desembolsado', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'solicitudDesembolsoCaja': { text: 'Solicitud Des. Sub. Caja de compensación', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'desembolsoMCY': { text: 'Subsidio MiCasaYa Desembolsado', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'solicitudDesembolsoMCY': { text: 'Solicitud Des. Sub. MCY', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'desembolsoCredito': { text: 'Crédito Desembolsado', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'solicitudDesembolsoCredito': { text: 'Solicitud Desembolso Crédito Enviado', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'pagoBoletaRegistro': { text: 'Pago Boleta de Registro', color: 'bg-sky-100 text-sky-800', icon: <Handshake size={14} /> },
    'pagoBoletaFiscal': { text: 'Pago Boleta Fiscal', color: 'bg-sky-100 text-sky-800', icon: <Handshake size={14} /> },
    'actaEntregaRecibida': { text: 'Acta de Entrega Firmada', color: 'bg-cyan-100 text-cyan-800', icon: <ShieldCheck size={14} /> },
    'actaEntregaEnviada': { text: 'Acta Entrega Enviada', color: 'bg-cyan-100 text-cyan-800', icon: <ShieldCheck size={14} /> },
    'minutaFirmada': { text: 'Escritura Firmada en Notaría', color: 'bg-blue-100 text-blue-800', icon: <PenSquare size={14} /> },
    'minutaEnviadaNotaria': { text: 'Minuta enviada Notaría', color: 'bg-blue-100 text-blue-800', icon: <PenSquare size={14} /> },
    'minutaAprobadaAbogada': { text: 'Minuta Recibida Aprobada', color: 'bg-indigo-100 text-indigo-800', icon: <FileCheck2 size={14} /> },
    'minutaEnviadaAbogada': { text: 'Minuta en revisión por Abogada', color: 'bg-indigo-100 text-indigo-800', icon: <FileCheck2 size={14} /> },
    'pagoEstudioTitulos': { text: 'Pago Estudio de Títulos', color: 'bg-purple-100 text-purple-800', icon: <Search size={14} /> },
    'envioDocumentacionAvaluo': { text: 'Documentación Avalúo Enviada', color: 'bg-purple-100 text-purple-800', icon: <Search size={14} /> },
    'promesaRecibida': { text: 'Promesa Recibida', color: 'bg-pink-100 text-pink-800', icon: <FileSignature size={14} /> },
    'promesaEnviada': { text: 'Promesa Enviada', color: 'bg-pink-100 text-pink-800', icon: <FileSignature size={14} /> },
    'documentacion': { text: 'Recopilando Documentación', color: 'bg-gray-100 text-gray-800', icon: <FileUp size={14} /> },
};

// El orden inverso de los pasos. El primero que encontremos completado será el estado actual.
const PROCESS_STAGES_ORDER = [
    'facturaVenta',
    'desembolsoCaja',
    'solicitudDesembolsoCaja',
    'desembolsoMCY',
    'solicitudDesembolsoMCY',
    'desembolsoCredito',
    'solicitudDesembolsoCredito',
    'pagoBoletaRegistro',
    'pagoBoletaFiscal',
    'actaEntregaRecibida',
    'actaEntregaEnviada',
    'minutaFirmada',
    'minutaEnviadaNotaria',
    'minutaAprobadaAbogada',
    'minutaEnviadaAbogada',
    'pagoEstudioTitulos',
    'envioDocumentacionAvaluo',
    'promesaRecibida',
    'promesaEnviada',
];

export const determineClientStatus = (cliente) => {
    if (!cliente) return STATUS_CONFIG.desconocido;
    if (cliente.tieneRenunciaPendiente) return STATUS_CONFIG.renunciaPendiente;
    if (cliente.vivienda && cliente.vivienda.saldoPendiente <= 0) return STATUS_CONFIG.pazYSalvo;

    const s = cliente.seguimiento || {};

    // Buscamos el último paso completado en el orden definido
    for (const stage of PROCESS_STAGES_ORDER) {
        if (s[stage]?.completado) {
            return STATUS_CONFIG[stage];
        }
    }

    // Si ningún paso está completado, el estado por defecto es 'documentacion'
    return STATUS_CONFIG.documentacion;
};