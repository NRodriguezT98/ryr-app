import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Compass, User, FileText, Download, Maximize, Building, Home } from 'lucide-react';
import { toTitleCase, formatID } from '../../../utils/textFormatters';

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-3">
        <div className="text-gray-400 mt-1">{icon}</div>
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{value || 'N/A'}</p>
        </div>
    </div>
);

const LinderoVerticalItem = ({ label, value }) => (
    <div className="py-2">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{label.toUpperCase()}</p>
        <p className="text-sm text-gray-800 dark:text-gray-200 break-words">{value || 'N/A'}</p>
    </div>
);


const TabInformacion = ({ vivienda, cliente }) => {
    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-200"><ClipboardList /> Ficha Técnica</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 dark:divide-gray-700">
                    <div className='divide-y dark:divide-gray-700'>
                        <InfoItem icon={<FileText size={16} />} label="Matrícula" value={vivienda.matricula} />
                        <InfoItem icon={<Maximize size={16} />} label="Área del Lote" value={`${vivienda.areaLote} m²`} />
                    </div>
                    <div className='divide-y dark:divide-gray-700'>
                        <InfoItem icon={<Home size={16} />} label="Nomenclatura" value={vivienda.nomenclatura} />
                        <InfoItem icon={<Building size={16} />} label="Área Construida" value={`${vivienda.areaConstruida} m²`} />
                    </div>
                </div>
                <div className='pt-4 mt-4 border-t dark:border-gray-700'>
                    <h4 className='font-semibold text-md mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-200'><Compass /> Linderos</h4>
                    <div className="grid grid-cols-1 divide-y dark:divide-gray-700 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                        <LinderoVerticalItem label="Norte" value={vivienda.linderoNorte} />
                        <LinderoVerticalItem label="Sur" value={vivienda.linderoSur} />
                        <LinderoVerticalItem label="Oriente" value={vivienda.linderoOriente} />
                        <LinderoVerticalItem label="Occidente" value={vivienda.linderoOccidente} />
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200"><User /> Cliente Asignado</h3>
                    {cliente ? (
                        <Link to={`/clientes/detalle/${cliente.id}`} className="block p-4 rounded-lg bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                            <p className="font-bold text-blue-800 dark:text-blue-300">{toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`)}</p>
                            <p className="text-sm text-blue-600 dark:text-blue-400">C.C. {formatID(cliente.datosCliente.cedula)}</p>
                        </Link>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Esta vivienda no tiene un cliente asignado.</p>
                    )}
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200"><FileText /> Documentación</h3>
                    {vivienda.urlCertificadoTradicion ? (
                        <a href={vivienda.urlCertificadoTradicion} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                            <Download size={16} /> Ver Certificado de Tradición
                        </a>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No se ha adjuntado el Certificado.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TabInformacion;