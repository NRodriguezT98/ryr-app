import React from 'react';
import { Link } from 'react-router-dom';
import { UserX, Archive, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../../utils/textFormatters';

const EstadoCard = ({ icon, title, children }) => (
    <div className="animate-fade-in text-center p-8 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed dark:border-gray-700 h-full flex flex-col justify-center">
        {icon}
        <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        {children}
    </div>
);

const ClienteEstadoView = ({ cliente, renuncia, contexto }) => {
    const { status, tieneRenunciaPendiente } = cliente;

    // --- LÓGICA PARA MENSAJES ESPECÍFICOS ---
    let message = '';
    if (contexto === 'proceso') {
        message = "La línea de tiempo y las acciones del proceso están deshabilitadas.";
    } else if (contexto === 'documentacion') {
        message = "La gestión de documentos se encuentra en modo de solo lectura.";
    }

    if (tieneRenunciaPendiente && renuncia) {
        return (
            <EstadoCard
                icon={<AlertTriangle size={48} className="mx-auto text-orange-400" />}
                title="Proceso en Pausa por Renuncia Pendiente"
            >
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
                <Link to={`/renuncias/detalle/${renuncia.id}`} className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Ir a Gestionar Renuncia
                </Link>
            </EstadoCard>
        );
    }

    if (status === 'renunciado' && renuncia) {
        return (
            <EstadoCard
                icon={<UserX size={48} className="mx-auto text-orange-400" />}
                title="Proceso Anterior Finalizado por Renuncia"
            >
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    El historial de este cliente se conserva en el registro de su última renuncia.
                </p>
                <Link to={`/renuncias/detalle/${renuncia.id}`} className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    Ver Detalle Completo de la Renuncia
                </Link>
            </EstadoCard>
        );
    }

    if (status === 'inactivo') {
        return (
            <EstadoCard
                icon={<Archive size={48} className="mx-auto text-gray-400" />}
                title="Cliente Archivado"
            >
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {message} Para realizar cambios, primero debe ser restaurado.
                </p>
                {renuncia && (
                    <Link to={`/renuncias/detalle/${renuncia.id}`} className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                        Consultar Historial en la Última Renuncia
                    </Link>
                )}
            </EstadoCard>
        );
    }

    return null; // No renderiza nada si el cliente está activo
};

export default ClienteEstadoView;