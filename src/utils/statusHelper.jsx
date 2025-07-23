import React from 'react';
import { Award, ShieldCheck, Handshake, PenSquare, FileCheck2, Search, FileSignature, FileUp, UserPlus, AlertTriangle, FileText, UserX } from 'lucide-react';
import { PROCESO_CONFIG } from './procesoConfig';

const PROCESS_STAGES_ORDER = [...PROCESO_CONFIG].map(p => p.key).reverse();

const STATUS_CONFIG = {
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se añade un estado específico para clientes que han renunciado.
    'renunciado': { text: 'Renunció', color: 'bg-orange-100 text-orange-800', icon: <UserX size={14} /> },
    // --- FIN DE LA MODIFICACIÓN ---
    'renunciaPendiente': { text: 'Renuncia Pendiente', color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle size={14} /> },
    'desconocido': { text: 'Estado Desconocido', color: 'bg-gray-100 text-gray-800', icon: <UserPlus size={14} /> },
    'documentacion': { text: 'Recopilando Documentación', color: 'bg-gray-100 text-gray-800', icon: <FileUp size={14} /> },
    'promesaEnviada': { text: 'Promesa Enviada', color: 'bg-pink-100 text-pink-800', icon: <FileSignature size={14} /> },
    'promesaRecibida': { text: 'Promesa Firmada', color: 'bg-pink-100 text-pink-800', icon: <FileSignature size={14} /> },
    'envioDocumentacionAvaluo': { text: 'Doc. Avalúo Enviada', color: 'bg-purple-100 text-purple-800', icon: <Search size={14} /> },
    'cartaRatificacionRecibida': { text: 'Carta Ratificación Recibida', color: 'bg-purple-100 text-purple-800', icon: <FileText size={14} /> },
    'pagoEstudioTitulos': { text: 'Pago Estudio de Títulos', color: 'bg-purple-100 text-purple-800', icon: <Search size={14} /> },
    'minutaEnviadaAbogada': { text: 'Minuta en Revisión (Abogada)', color: 'bg-indigo-100 text-indigo-800', icon: <FileCheck2 size={14} /> },
    'minutaAprobadaAbogada': { text: 'Minuta Aprobada', color: 'bg-indigo-100 text-indigo-800', icon: <FileCheck2 size={14} /> },
    'minutaEnviadaNotaria': { text: 'Minuta en Notaría', color: 'bg-blue-100 text-blue-800', icon: <PenSquare size={14} /> },
    'minutaFirmada': { text: 'Escritura Firmada', color: 'bg-blue-100 text-blue-800', icon: <PenSquare size={14} /> },
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
    'facturaVenta': { text: 'A Paz y Salvo', color: 'bg-green-100 text-green-800', icon: <Award size={14} /> },
};

export const determineClientStatus = (cliente) => {
    if (!cliente) return STATUS_CONFIG.desconocido;

    // --- INICIO DE LA MODIFICACIÓN ---
    // Se prioriza el estado de 'renunciado' por encima de todo lo demás.
    if (cliente.status === 'renunciado') return STATUS_CONFIG.renunciado;
    // --- FIN DE LA MODIFICACIÓN ---

    if (cliente.tieneRenunciaPendiente) return STATUS_CONFIG.renunciaPendiente;

    const proceso = cliente.proceso || {};

    for (const stage of PROCESS_STAGES_ORDER) {
        if (proceso[stage]?.completado) {
            return STATUS_CONFIG[stage] || STATUS_CONFIG.desconocido;
        }
    }

    return STATUS_CONFIG.documentacion;
};