import React from 'react';
import { Award, ShieldCheck, Handshake, PenSquare, FileCheck2, Search, FileSignature, FileUp, UserPlus, AlertTriangle } from 'lucide-react';

const STATUS_CONFIG = {
    'pazYSalvo': { text: 'A Paz y Salvo', color: 'bg-green-100 text-green-800', icon: <Award size={14} /> },
    'viviendaEntregada': { text: 'Vivienda Entregada', color: 'bg-teal-100 text-teal-800', icon: <ShieldCheck size={14} /> },
    'procesoRegistro': { text: 'En Proceso de Registro', color: 'bg-sky-100 text-sky-800', icon: <Handshake size={14} /> },
    'firmaEscritura': { text: 'Firma de Escritura', color: 'bg-blue-100 text-blue-800', icon: <PenSquare size={14} /> },
    'estudioTitulos': { text: 'Estudio de Títulos', color: 'bg-indigo-100 text-indigo-800', icon: <FileCheck2 size={14} /> },
    'procesoAvaluo': { text: 'En Proceso de Avalúo', color: 'bg-purple-100 text-purple-800', icon: <Search size={14} /> },
    'procesoPromesa': { text: 'En Proceso de Promesa', color: 'bg-pink-100 text-pink-800', icon: <FileSignature size={14} /> },
    'documentacion': { text: 'Recopilando Documentación', color: 'bg-gray-100 text-gray-800', icon: <FileUp size={14} /> },
    'renunciaPendiente': { text: 'Renuncia Pendiente', color: 'bg-orange-100 text-orange-800', icon: <AlertTriangle size={14} /> },
    'desconocido': { text: 'Estado Desconocido', color: 'bg-gray-100 text-gray-800', icon: <UserPlus size={14} /> },
};

export const determineClientStatus = (cliente) => {
    if (!cliente) return STATUS_CONFIG.desconocido;

    if (cliente.tieneRenunciaPendiente) {
        return STATUS_CONFIG.renunciaPendiente;
    }

    if (cliente.vivienda && cliente.vivienda.saldoPendiente <= 0) {
        return STATUS_CONFIG.pazYSalvo;
    }

    const s = cliente.seguimiento || {};
    if (s.actaEntregaRecibida?.completado) return STATUS_CONFIG.viviendaEntregada;
    if (s.boletaRegistro?.completado) return STATUS_CONFIG.procesoRegistro;
    if (s.escrituraFirmada?.completado) return STATUS_CONFIG.firmaEscritura;
    if (s.pagoEstudioTitulos?.completado) return STATUS_CONFIG.estudioTitulos;
    if (s.avaluoRealizado?.completado) return STATUS_CONFIG.procesoAvaluo;
    if (s.promesaRecibida?.completado) return STATUS_CONFIG.procesoPromesa;

    return STATUS_CONFIG.documentacion;
};