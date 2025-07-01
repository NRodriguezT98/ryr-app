import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getClientes, getViviendas } from '../../utils/storage';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, Edit, User, Mail, Phone, MapPin, Home, BadgePercent, Briefcase, Download } from 'lucide-react';

// Helpers
const formatCurrency = (value) => (value || 0).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
const getInitials = (nombres = '', apellidos = '') => `${(nombres[0] || '')}${(apellidos[0] || '')}`.toUpperCase();

// --- NUEVO COMPONENTE REUTILIZABLE PARA LAS FILAS DE DOCUMENTOS ---
const DocumentRow = ({ label, url }) => {
    // Si no hay URL, el componente no renderiza nada. ¡Simple y limpio!
    if (!url) {
        return null;
    }

    return (
        <div className="flex justify-between items-center py-2 border-b last:border-b-0">
            <span className="text-sm text-gray-700">{label}</span>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
            >
                <Download size={14} /> Ver Documento
            </a>
        </div>
    );
};

const DetalleCliente = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);
    const [vivienda, setVivienda] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const cargarDatos = useCallback(async () => {
        setIsLoading(true);
        try {
            const todosClientes = await getClientes();
            const clienteEncontrado = todosClientes.find(c => c.id === clienteId);

            if (!clienteEncontrado) {
                toast.error("Cliente no encontrado.");
                navigate("/clientes/listar");
                return;
            }
            setCliente(clienteEncontrado);

            if (clienteEncontrado.viviendaId) {
                const todasViviendas = await getViviendas();
                const viviendaAsignada = todasViviendas.find(v => v.id === clienteEncontrado.viviendaId);
                setVivienda(viviendaAsignada || null);
            }
        } catch (error) {
            toast.error("Error al cargar los datos del cliente.");
        } finally {
            setIsLoading(false);
        }
    }, [clienteId, navigate]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    if (isLoading) {
        return <div className="text-center p-10 animate-pulse">Cargando perfil del cliente...</div>;
    }

    if (!cliente) {
        return <div className="text-center p-10 text-red-500">No se pudo cargar la información del cliente.</div>;
    }

    const { datosCliente, financiero } = cliente;

    return (
        <AnimatedPage>
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-3xl flex-shrink-0">
                            {getInitials(datosCliente.nombres, datosCliente.apellidos)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">{`${datosCliente.nombres} ${datosCliente.apellidos}`}</h2>
                            <p className="text-gray-500">{datosCliente.correo}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate('/clientes/listar')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors">
                            <ArrowLeft size={16} /> Volver
                        </button>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors">
                            <Edit size={16} /> Editar
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-5 rounded-xl border">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">Información Personal</h3>
                            <div className="space-y-3 text-sm">
                                <p className="flex items-center gap-3"><Phone className="text-gray-400" size={16} /> {datosCliente.telefono}</p>
                                <p className="flex items-center gap-3"><User className="text-gray-400" size={16} /> C.C. {datosCliente.cedula}</p>
                                <p className="flex items-center gap-3"><MapPin className="text-gray-400" size={16} /> {datosCliente.direccion}</p>
                            </div>
                        </div>

                        {vivienda && (
                            <div className="bg-white p-5 rounded-xl border">
                                <h3 className="font-bold text-lg mb-4 border-b pb-2">Vivienda Asignada</h3>
                                <div className="space-y-3 text-sm">
                                    <p className="flex items-center gap-3"><Home className="text-gray-400" size={16} /> {`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</p>
                                    {vivienda.descuentoMonto > 0 && <p className="flex items-center gap-3 text-purple-600"><BadgePercent className="text-purple-400" size={16} /> ¡Con descuento aplicado!</p>}
                                    <div className="pt-2 border-t text-right">
                                        <p>Saldo Pendiente: <span className="font-bold text-red-600">{formatCurrency(vivienda.saldoPendiente)}</span></p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-5 rounded-xl border">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2">Estructura Financiera</h3>
                            <div className="space-y-4">
                                {financiero.aplicaCuotaInicial && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="font-semibold">Cuota Inicial</p>
                                        <p className="text-sm text-gray-600">Monto: {formatCurrency(financiero.cuotaInicial.monto)} ({financiero.cuotaInicial.metodo})</p>
                                    </div>
                                )}
                                {financiero.aplicaCredito && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="font-semibold">Crédito Hipotecario</p>
                                        <p className="text-sm text-gray-600">Monto: {formatCurrency(financiero.credito.monto)} ({financiero.credito.banco})</p>
                                    </div>
                                )}
                                {financiero.aplicaSubsidioVivienda && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="font-semibold">Subsidio Mi Casa Ya</p>
                                        <p className="text-sm text-gray-600">Monto: {formatCurrency(financiero.subsidioVivienda.monto)}</p>
                                    </div>
                                )}
                                {financiero.aplicaSubsidioCaja && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="font-semibold">Subsidio Caja de Compensación</p>
                                        <p className="text-sm text-gray-600">Monto: {formatCurrency(financiero.subsidioCaja.monto)} ({financiero.subsidioCaja.caja})</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tarjeta de Documentos con lógica funcional */}
                        <div className="bg-white p-5 rounded-xl border">
                            <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2"><Briefcase size={20} /> Centro de Documentos</h3>
                            <div className="space-y-2">
                                <DocumentRow label="Cédula de Ciudadanía" url={datosCliente.urlCedula} />
                                <DocumentRow label="Soporte Cuota Inicial" url={financiero.cuotaInicial?.urlSoportePago} />
                                <DocumentRow label="Aprobación de Crédito" url={financiero.credito?.urlCartaAprobacion} />
                                <DocumentRow label="Soporte Subsidio Mi Casa Ya" url={financiero.subsidioVivienda?.urlSoporte} />
                                <DocumentRow label="Soporte Subsidio Caja Comp." url={financiero.subsidioCaja?.urlSoporte} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DetalleCliente;