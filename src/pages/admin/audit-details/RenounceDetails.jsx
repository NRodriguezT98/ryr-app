import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../../utils/textFormatters';
import { XCircle, CheckCircle, UserX, FileText, DollarSign, Clock, User, Hash, Home } from 'lucide-react';

const DetailSection = ({ icon, title, children }) => (
    <div>
        <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
            {icon} {title}
        </h4>
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
            {children}
        </div>
    </div>
);

const DetailRow = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-gray-800 dark:text-gray-200">{value || 'No especificado'}</p>
    </div>
);

const RenounceDetails = ({ log }) => {
    const details = log.details || {};
    const fechaAccion = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm:ss a", { locale: es })
        : 'Fecha no disponible';

    return (
        <div className="text-sm space-y-4">
            <DetailSection icon={<User size={16} />} title="Información del Cliente y Vivienda">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <DetailRow label="Cliente" value={details.clienteNombre} />
                    <DetailRow label="Cédula" value={details.clienteId} />
                    <div className="col-span-2">
                        <DetailRow label="Vivienda a la que Renunció" value={details.viviendaInfo} />
                    </div>
                </div>
            </DetailSection>

            <DetailSection icon={<FileText size={16} />} title="Detalles de la Renuncia">
                <DetailRow label="Motivo" value={details.motivoRenuncia} />
                {details.observaciones && (
                    <DetailRow label="Observaciones" value={details.observaciones} />
                )}
            </DetailSection>

            <DetailSection icon={<DollarSign size={16} />} title="Información de Penalidad">
                {details.penalidadAplicada ? (
                    <div className="space-y-2 text-green-700 dark:text-green-300">
                        <p className="flex items-center gap-2 font-semibold"><CheckCircle size={16} /> Sí se aplicó penalidad</p>
                        <div className="pl-6 grid grid-cols-2 gap-x-4">
                            <DetailRow label="Monto" value={formatCurrency(details.montoPenalidad)} />
                            <DetailRow label="Motivo" value={details.motivoPenalidad} />
                        </div>
                    </div>
                ) : (
                    <p className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
                        <XCircle size={16} /> No se aplicó penalidad
                    </p>
                )}
            </DetailSection>

            <DetailSection icon={<Clock size={16} />} title="Registro de la Acción">
                <DetailRow label="Hora Exacta" value={fechaAccion} />
            </DetailSection>
        </div>
    );
};

export default RenounceDetails;