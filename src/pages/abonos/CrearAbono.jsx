import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import AnimatedPage from "../../components/AnimatedPage";
import { useData } from "../../context/DataContext";
import { Search, Calculator, User, Home, Sparkles, CreditCard } from "lucide-react";

const CrearAbono = () => {
    const { isLoading, clientes } = useData();
    const [searchTerm, setSearchTerm] = useState("");

    const clientesConVivienda = useMemo(() =>
        clientes.filter(c => c.vivienda && c.status === 'activo'),
        [clientes]);

    // Función de ordenamiento personalizada por Manzana + Casa
    const sortByVivienda = (a, b) => {
        const manzanaA = a.vivienda.manzana.toUpperCase();
        const manzanaB = b.vivienda.manzana.toUpperCase();
        const casaA = parseInt(a.vivienda.numeroCasa) || 0;
        const casaB = parseInt(b.vivienda.numeroCasa) || 0;

        // Primero ordenar por manzana alfabéticamente
        if (manzanaA !== manzanaB) {
            return manzanaA.localeCompare(manzanaB);
        }
        // Luego por número de casa numéricamente
        return casaA - casaB;
    };

    const clientesFiltrados = useMemo(() => {
        let clientesFinal = clientesConVivienda;

        if (searchTerm.trim()) {
            const lowerSearchTerm = searchTerm.toLowerCase().replace(/\s/g, '');
            clientesFinal = clientesConVivienda.filter(c => {
                const nombreCompleto = `${c.datosCliente.nombres} ${c.datosCliente.apellidos}`.toLowerCase();
                const cedula = c.datosCliente.cedula;
                const ubicacion = `mz ${c.vivienda.manzana} casa ${c.vivienda.numeroCasa}`.toLowerCase().replace(/\s/g, '');

                // Búsqueda por combinación Manzana+Casa (ej: A1, B2, etc.)
                const manzanaCasa = `${c.vivienda.manzana}${c.vivienda.numeroCasa}`.toLowerCase().replace(/\s/g, '');

                return nombreCompleto.includes(searchTerm.toLowerCase()) ||
                    cedula.includes(searchTerm) ||
                    ubicacion.includes(lowerSearchTerm) ||
                    manzanaCasa.includes(lowerSearchTerm);
            });
        }

        // Siempre ordenar por Manzana + Casa
        return clientesFinal.sort(sortByVivienda);
    }, [clientesConVivienda, searchTerm]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <CreditCard className="w-12 h-12 md:w-16 md:h-16 text-green-600 animate-pulse mx-auto mb-3 md:mb-4" />
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        Cargando clientes...
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 px-4">
                        Preparando la lista de clientes activos
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header optimizado */}
                    <div className="text-center mb-8 md:mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl md:rounded-3xl shadow-lg mb-4 md:mb-6">
                            <Calculator className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>

                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3 md:mb-4 px-4">
                            Gestionar Pagos
                        </h1>
                        <p className="text-sm md:text-base lg:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                            Selecciona un cliente para ver su estado de cuenta y registrar abonos
                        </p>
                    </div>

                    {/* Panel principal */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
                        {/* Header del panel */}
                        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 md:p-6">
                            <div className="flex items-center gap-2 md:gap-3">
                                <User className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-md" />
                                <h3 className="text-base md:text-lg font-bold text-white drop-shadow-md">Clientes Activos</h3>
                                <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse text-yellow-200 drop-shadow-md" />
                            </div>
                            <p className="text-white/90 text-xs md:text-sm mt-1 font-medium drop-shadow-sm">
                                {clientesFiltrados.length} de {clientesConVivienda.length} cliente{clientesConVivienda.length !== 1 ? 's' : ''} mostrado{clientesFiltrados.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Buscador */}
                        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-600">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, cédula, vivienda o ubicación (ej: A1, B2)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors duration-200"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <span className="text-lg">×</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Lista de clientes */}
                        <div className="p-3 md:p-6">
                            {clientesFiltrados.length === 0 ? (
                                <div className="text-center py-12">
                                    <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {searchTerm ? 'No se encontraron clientes con ese criterio' : 'No hay clientes activos disponibles'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3 md:gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                    {clientesFiltrados.map(cliente => (
                                        <Link
                                            key={cliente.id}
                                            to={`/abonos/gestionar/${cliente.id}`}
                                            className="group block p-4 md:p-5 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                                                    <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm md:text-base font-bold text-gray-800 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors truncate">
                                                        {`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`}
                                                    </h4>
                                                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-1">
                                                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                            <User size={12} className="md:w-3 md:h-3" />
                                                            C.C. {cliente.datosCliente.cedula}
                                                        </p>
                                                        <p className="text-xs md:text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                                                            <Home size={12} className="md:w-3 md:h-3" />
                                                            Mz {cliente.vivienda.manzana} - Casa {cliente.vivienda.numeroCasa}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center text-gray-400 group-hover:text-green-500 transition-colors">
                                                    <CreditCard size={20} className="md:w-6 md:h-6" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearAbono;