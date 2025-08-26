// src/pages/admin/audit-details/UpdateViviendaDetails.jsx

import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../../../utils/textFormatters';

// Componente auxiliar para una fila de detalle
const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
        {icon}
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

// Mapea las claves de los campos a nombres legibles
const FIELD_LABELS = {
    proyectoId: 'Proyecto',
    manzana: 'Manzana',
    numero: 'Número de Casa',
    matricula: 'Matrícula',
    nomenclatura: 'Nomenclatura',
    areaLote: 'Área del Lote',
    areaConstruida: 'Área Construida',
    linderoNorte: 'Lindero Norte',
    linderoSur: 'Lindero Sur',
    linderoOriente: 'Lindero Oriente',
    linderoOccidente: 'Lindero Occidente',
    valorBase: 'Valor Base',
    esEsquinera: '¿Es esquinera?',
    recargoEsquinera: 'Recargo Esquinera',
    urlCertificadoTradicion: 'Certificado de Tradición',
    valorTotal: 'Valor Total',
};

const MONETARY_FIELDS = ['valorBase', 'recargoEsquinera', 'valorTotal', 'valorFinal', 'saldoPendiente'];
const AREA_FIELDS = ['areaLote', 'areaConstruida'];

const UpdateViviendaDetails = ({ log }) => {
    const cambios = log.details?.cambios || [];
    const fechaAccion = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm:ss a", { locale: es })
        : 'Fecha no disponible';

    const formatDisplayValue = (campo, value) => {
        if (MONETARY_FIELDS.includes(campo)) {
            return formatCurrency(Number(value));
        }
        if (AREA_FIELDS.includes(campo)) {
            return `${value} m²`;
        }
        return value;
    };

    return (
        <div className="space-y-4">
            {/* Sección principal de cambios */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Cambios Detectados:
                </h4>
                {cambios.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        {cambios.map((cambio, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <span className="font-semibold">{cambio.campo === 'Proyecto' ? 'Proyecto' : (FIELD_LABELS[cambio.campo] || cambio.campo)}:</span>

                                <span className="text-gray-500 dark:text-gray-400">{formatDisplayValue(cambio.campo, cambio.anterior)}</span>
                                <ArrowRight size={14} className="flex-shrink-0 text-red-500" />
                                <span className="text-gray-800 dark:text-gray-200">{formatDisplayValue(cambio.campo, cambio.actual)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400">No se detectaron cambios específicos.</p>
                )}
            </div>

            {/* Hora de la Acción */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <DetailRow icon={<Clock size={14} className="text-gray-500" />} label="Hora de la Acción" value={fechaAccion} />
            </div>
        </div>
    );
};

export default UpdateViviendaDetails;