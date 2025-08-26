// src/pages/admin/audit-details/CreateViviendaDetails.jsx

import React from 'react';
import { Home, MapPin, DollarSign, Clock, Hash, Scaling, BookMarked, FileCheck2 } from 'lucide-react';
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

const CreateViviendaDetails = ({ log }) => {
    const viviendaInfo = log.details?.viviendaInfo || {};
    const fechaAccion = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm:ss a", { locale: es })
        : 'Fecha no disponible';

    return (
        <div className="space-y-4">
            {/* Contenedor principal del grid de 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* --- Sección de Identificación (Columna 1) --- */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                        <Home size={16} /> Identificación de la Vivienda
                    </h4>
                    <DetailRow icon={<MapPin size={14} className="text-gray-500" />} label="Proyecto" value={viviendaInfo.proyectoNombre} />
                    <DetailRow icon={<Hash size={14} className="text-gray-500" />} label="Manzana y Número" value={`Manzana: ${viviendaInfo.manzana} | Número: ${viviendaInfo.numeroCasa}`} />
                    <DetailRow icon={<BookMarked size={14} className="text-gray-500" />} label="Matrícula" value={viviendaInfo.matricula} />
                    <DetailRow icon={<BookMarked size={14} className="text-gray-500" />} label="Nomenclatura" value={viviendaInfo.nomenclatura} />
                </div>

                {/* --- Sección de Información Financiera y Legal (Columna 2) --- */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                        <DollarSign size={16} /> Información Financiera y Legal
                    </h4>
                    <DetailRow icon={<DollarSign size={14} className="text-gray-500" />} label="Valor Base" value={formatCurrency(viviendaInfo.valorBase)} />
                    <DetailRow icon={<Hash size={14} className="text-gray-500" />} label="¿Es esquinera?" value={viviendaInfo.esEsquinera} />
                    <DetailRow icon={<DollarSign size={14} className="text-gray-500" />} label="Recargo por Esquinera" value={formatCurrency(viviendaInfo.recargoEsquinera)} />
                    {/* 👇 AGREGAMOS EL VALOR TOTAL 👇 */}
                    <DetailRow icon={<DollarSign size={14} className="text-gray-500" />} label="Valor Total" value={formatCurrency(viviendaInfo.valorTotal)} />
                    {/* 👆 FIN DE LA ADICIÓN 👆 */}
                    <DetailRow icon={<FileCheck2 size={14} className="text-gray-500" />} label="Certificado de Tradición" value={viviendaInfo.certificadoTradicionAnexado} />
                </div>

                {/* --- Sección de Linderos y Áreas (Ocupa ambas columnas) --- */}
                <div className="md:col-span-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                        <Scaling size={16} /> Linderos y Áreas
                    </h4>
                    <DetailRow icon={<Scaling size={14} className="text-gray-500" />} label="Área del Lote" value={`${viviendaInfo.areaLote} m²`} />
                    <DetailRow icon={<Scaling size={14} className="text-gray-500" />} label="Área Construida" value={`${viviendaInfo.areaConstruida} m²`} />
                    <div className="flex items-start gap-2">
                        <Hash size={14} className="text-gray-500 mt-1 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Linderos</p>
                            <p className="text-gray-800 dark:text-gray-200 text-sm">
                                {`Norte: ${viviendaInfo.linderoNorte}, Sur: ${viviendaInfo.linderoSur}, Oriente: ${viviendaInfo.linderoOriente}, Occidente: ${viviendaInfo.linderoOccidente}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Hora de la Acción --- */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <DetailRow icon={<Clock size={14} className="text-gray-500" />} label="Hora de la Acción" value={fechaAccion} />
            </div>
        </div>
    );
};

export default CreateViviendaDetails;