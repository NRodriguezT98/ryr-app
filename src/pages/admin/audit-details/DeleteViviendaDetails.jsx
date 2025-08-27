// src/pages/admin/audit-details/DeleteViviendaDetails.jsx

import React from 'react';
import { Home, MapPin, Clock, Trash, BookMarked, Scaling, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente auxiliar para una fila de detalle
const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        <div className="mt-0.5">{icon}</div>
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-red-200/70">{label}</p>
            <p className="text-red-900 dark:text-red-100">{value}</p>
        </div>
    </div>
);

const DeleteViviendaDetails = ({ log }) => {
    const details = log.details || {};
    const snapshot = details.snapshotVivienda || {}; // Obtenemos la ficha técnica
    const fechaAccion = log.timestamp?.toDate()
        ? format(log.timestamp.toDate(), "dd MMMM yyyy, hh:mm:ss a", { locale: es })
        : 'Fecha no disponible';

    return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg space-y-4">

            {/* --- Información General de la Eliminación --- */}
            <div>
                <h4 className="font-bold text-red-800 dark:text-red-200 flex items-center gap-2 mb-3">
                    <Trash size={18} /> Resumen de la Eliminación
                </h4>
                <div className="space-y-3">
                    <DetailRow icon={<Home size={14} className="text-red-700 dark:text-red-300" />} label="Vivienda Eliminada" value={details.viviendaNombre} />
                    <DetailRow icon={<MapPin size={14} className="text-red-700 dark:text-red-300" />} label="Proyecto" value={details.proyectoNombre} />
                    <DetailRow icon={<Clock size={14} className="text-red-700 dark:text-red-300" />} label="Hora de la Acción" value={fechaAccion} />
                </div>
            </div>

            {/* --- Snapshot de la Ficha Técnica --- */}
            <div>
                <h4 className="font-bold text-red-800 dark:text-red-200 flex items-center gap-2 mb-3 pt-3 border-t border-red-200 dark:border-red-500/30">
                    <BookMarked size={18} /> Ficha Técnica de la Vivienda Eliminada
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
                    <DetailRow icon={<BookMarked size={14} className="text-red-700 dark:text-red-300" />} label="Matrícula" value={snapshot.matricula} />
                    <DetailRow icon={<BookMarked size={14} className="text-red-700 dark:text-red-300" />} label="Nomenclatura" value={snapshot.nomenclatura} />
                    <DetailRow icon={<Scaling size={14} className="text-red-700 dark:text-red-300" />} label="Área del Lote" value={snapshot.areaLote} />
                    <DetailRow icon={<Scaling size={14} className="text-red-700 dark:text-red-300" />} label="Área Construida" value={snapshot.areaConstruida} />
                    <div className="md:col-span-2">
                        <DetailRow
                            icon={<Hash size={14} className="text-red-700 dark:text-red-300" />}
                            label="Linderos"
                            value={`Norte: ${snapshot.linderoNorte}, Sur: ${snapshot.linderoSur}, Oriente: ${snapshot.linderoOriente}, Occidente: ${snapshot.linderoOccidente}`}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DeleteViviendaDetails;