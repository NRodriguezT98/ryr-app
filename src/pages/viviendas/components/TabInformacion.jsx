import React from 'react';
import { Home, User, FileText, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const TabInformacion = ({ vivienda, cliente }) => {
    return (
        <div className="bg-white p-6 rounded-xl border animate-fade-in">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Detalles de la Propiedad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                    <Home size={16} className="text-gray-500" />
                    <span className="font-medium">Ubicación:</span>
                    <span>{`Manzana ${vivienda.manzana}, Casa ${vivienda.numeroCasa}`}</span>
                </div>
                <div className="flex items-center gap-3">
                    <FileText size={16} className="text-gray-500" />
                    <span className="font-medium">Matrícula:</span>
                    <span>{vivienda.matricula}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Hash size={16} className="text-gray-500" />
                    <span className="font-medium">Nomenclatura:</span>
                    <span>{vivienda.nomenclatura}</span>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Cliente Asignado</h3>
                {cliente ? (
                    <Link to={`/clientes/detalle/${cliente.id}`} className="block p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-200 p-3 rounded-full">
                                <User size={20} className="text-blue-700" />
                            </div>
                            <div>
                                <p className="font-bold text-blue-800">{toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`)}</p>
                                <p className="text-sm text-blue-600">C.C. {cliente.datosCliente.cedula}</p>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <p className="text-gray-500">Esta vivienda no tiene un cliente asignado actualmente.</p>
                )}
            </div>
        </div>
    );
};

export default TabInformacion;