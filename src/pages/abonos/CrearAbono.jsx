import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AnimatedPage from "../../components/AnimatedPage";
import { useData } from "../../context/DataContext";
import { Search } from "lucide-react";

const CrearAbono = () => {
    const { isLoading, clientes } = useData();
    const [searchTerm, setSearchTerm] = useState("");

    const clientesConVivienda = useMemo(() =>
        clientes.filter(c => c.vivienda && c.status === 'activo'),
        [clientes]);

    const clientesFiltrados = useMemo(() => {
        if (!searchTerm.trim()) { return []; }
        const lowerCaseSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
        return clientesConVivienda.filter(c => {
            const nombreCompleto = `${c.datosCliente.nombres} ${c.datosCliente.apellidos}`.toLowerCase();
            const ubicacion = `mz ${c.vivienda.manzana} casa ${c.vivienda.numeroCasa}`.toLowerCase().replace(/\s/g, '');
            const cedula = c.datosCliente.cedula;
            return nombreCompleto.includes(searchTerm.toLowerCase()) || ubicacion.includes(lowerCaseSearchTerm) || cedula.includes(searchTerm);
        }).sort((a, b) => a.datosCliente.nombres.localeCompare(b.datosCliente.nombres));
    }, [clientesConVivienda, searchTerm]);

    if (isLoading) return <div className="text-center p-10 animate-pulse">Cargando clientes...</div>;

    return (
        <AnimatedPage>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-xl border">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-[#1976d2] mb-2">Gestionar Pagos</h2>
                        <p className="text-gray-500">Busca y selecciona un cliente para ver su estado de cuenta y registrar abonos.</p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, cédula o vivienda (ej: Mz A Casa 1)..."
                            className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {searchTerm && (
                        <ul className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto">
                            {clientesFiltrados.map(cliente => (
                                <li key={cliente.id}>
                                    <Link
                                        to={`/abonos/gestionar/${cliente.id}`}
                                        className="w-full text-left p-4 rounded-lg transition-colors hover:bg-blue-50 block border"
                                    >
                                        <p className="font-semibold text-blue-800">{`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}</p>
                                        <p className="text-sm text-gray-600">{`C.C. ${cliente.datosCliente.cedula}`}</p>
                                        <p className="text-sm text-green-700 font-medium">{`Vivienda: Mz ${cliente.vivienda.manzana} - Casa ${cliente.vivienda.numeroCasa}`}</p>
                                    </Link>
                                </li>
                            ))}
                            {clientesFiltrados.length === 0 && (
                                <li className="p-4 text-center text-sm text-gray-500">No se encontraron clientes que coincidan con la búsqueda.</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearAbono;