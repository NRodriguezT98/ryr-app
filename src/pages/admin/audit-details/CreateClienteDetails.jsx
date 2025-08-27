// src/pages/admin/audit-details/CreateClienteDetails.jsx

import React from 'react';
import { User, Home, MapPin, Phone, Mail, Map, Calendar, FileCheck2, DollarSign } from 'lucide-react';
import { formatCurrency, formatDisplayDate } from '../../../utils/textFormatters';

const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0">{icon}</div>
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-gray-800 dark:text-gray-200">{value}</p>
        </div>
    </div>
);

const CreateClienteDetails = ({ log }) => {
    const snapshot = log.details?.snapshotCliente || {};

    const sumaDeRecursos = snapshot.fuentesDePago?.reduce((sum, fuente) => sum + fuente.monto, 0) || 0;

    return (
        <div className="space-y-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                    <User size={16} /> Datos del Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DetailRow icon={<User size={14} className="text-gray-500" />} label="Nombre Completo" value={snapshot.nombreCompleto} />
                    <DetailRow icon={<User size={14} className="text-gray-500" />} label="Cédula" value={snapshot.cedula} />
                    <DetailRow icon={<Phone size={14} className="text-gray-500" />} label="Teléfono" value={snapshot.telefono} />
                    <DetailRow icon={<Mail size={14} className="text-gray-500" />} label="Correo" value={snapshot.correo} />
                    <DetailRow icon={<Map size={14} className="text-gray-500" />} label="Dirección" value={snapshot.direccion} />
                    <DetailRow icon={<Calendar size={14} className="text-gray-500" />} label="Fecha de Ingreso" value={formatDisplayDate(snapshot.fechaIngreso)} />
                </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                    <Home size={16} /> Propiedad y Documentos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <DetailRow icon={<Home size={14} className="text-gray-500" />} label="Vivienda Asignada" value={snapshot.viviendaAsignada} />
                    <DetailRow icon={<FileCheck2 size={14} className="text-gray-500" />} label="Cédula Adjuntada" value={snapshot.cedulaAdjuntada} />
                    <DetailRow icon={<FileCheck2 size={14} className="text-gray-500" />} label="Promesa Adjuntada" value={snapshot.promesaAdjuntada} />
                    <DetailRow icon={<FileCheck2 size={14} className="text-gray-500" />} label="Correo Adjuntado" value={snapshot.correoAdjuntado} />
                </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2">
                    <DollarSign size={16} /> Información Financiera
                </h4>
                {snapshot.fuentesDePago?.map((fuente, index) => (
                    <DetailRow key={index} icon={<DollarSign size={14} className="text-gray-500" />} label={fuente.nombre} value={formatCurrency(fuente.monto)} />
                ))}

                <hr className="dark:border-gray-600" />

                <DetailRow
                    icon={<DollarSign size={14} className="text-gray-500" />}
                    label="Suma de recursos"
                    value={formatCurrency(sumaDeRecursos)}
                    className="font-bold"
                />
                <DetailRow
                    icon={<Home size={14} className="text-gray-500" />}
                    label="Valor total vivienda"
                    value={formatCurrency(snapshot.valorVivienda)}
                />

                {/* Campo renombrado y con nueva lógica */}
                <DetailRow
                    icon={<FileCheck2 size={14} className="text-gray-500" />}
                    label="Valor Diferente en Escritura"
                    value={snapshot.usaValorEscrituraDiferente ? 'Sí' : 'No'}
                />
                {/* Mostramos el monto solo si la opción anterior es 'Sí' */}
                {snapshot.usaValorEscrituraDiferente && (
                    <DetailRow
                        icon={<DollarSign size={14} className="text-gray-500" />}
                        label="Monto en Escritura"
                        value={formatCurrency(snapshot.valorEscritura)}
                    />
                )}
            </div>
        </div>
    );
};

export default CreateClienteDetails;