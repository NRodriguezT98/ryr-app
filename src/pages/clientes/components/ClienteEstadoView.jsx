import React from 'react';
import { Link } from 'react-router-dom';
import { UserX, Archive, AlertTriangle, ArrowDown, MinusCircle, ArrowUp } from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../../utils/textFormatters';

const EstadoCard = ({ icon, title, children }) => (
    <div className="animate-fade-in text-center p-8 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed dark:border-gray-700 h-full flex flex-col justify-center">
        {icon}
        <h3 className="mt-4 text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h3>
        {children}
    </div>
);

const ResumenFinancieroRenuncia = ({ icon, label, amount, colorClass }) => (
    <div className="flex flex-col">
        <div className={`mx-auto flex items-center justify-center w-10 h-10 rounded-full mb-2 ${colorClass}`}>
            {icon}
        </div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{formatCurrency(amount)}</p>
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
                icon={<UserX size={48} className="mx-auto text-gray-500 dark:text-gray-400" />}
                title="Renuncia Completada"
            >
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    El cliente se retiró del proyecto el {renuncia.fechaRenuncia ? formatDisplayDate(renuncia.fechaRenuncia) : 'N/A'}.
                </p>

                {/* --- INICIO DE LA MODIFICACIÓN: Mostramos el resumen financiero --- */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <ResumenFinancieroRenuncia
                        icon={<ArrowDown size={20} className="text-green-800" />}
                        label="Total Abonado por el Cliente"
                        amount={renuncia.totalAbonadoOriginal}
                        colorClass="bg-green-100"
                    />
                    <ResumenFinancieroRenuncia
                        icon={<MinusCircle size={20} className="text-red-800" />}
                        label="Penalidad Aplicada"
                        amount={renuncia.penalidadMonto}
                        colorClass="bg-red-100"
                    />
                    <ResumenFinancieroRenuncia
                        icon={<ArrowUp size={20} className="text-blue-800" />}
                        label="Valor Total Devuelto"
                        amount={renuncia.totalAbonadoParaDevolucion}
                        colorClass="bg-blue-100"
                    />
                </div>
                {/* --- FIN DE LA MODIFICACIÓN --- */}

                <Link to={`/renuncias/detalle/${renuncia.id}`} className="mt-8 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
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