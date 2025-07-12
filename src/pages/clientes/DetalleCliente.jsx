import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getClientes, getViviendas, getAbonos, updateCliente } from '../../utils/storage';
import AnimatedPage from '../../components/AnimatedPage';
import { ArrowLeft, User, Phone, MapPin, Home, BadgePercent, Briefcase, FileDown, Info, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/textFormatters';
import { generateClientStatementPDF } from '../../utils/pdfGenerator';
import DocumentoRow from '../../components/documentos/DocumentoRow';

// Helpers
const getInitials = (nombres = '', apellidos = '') => `${(nombres[0] || '')}${(apellidos[0] || '')}`.toUpperCase();

// Componente para los botones de las pestañas
const TabButton = ({ activeTab, tabName, label, icon, onClick }) => (
    <button
        onClick={() => onClick(tabName)}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
        {icon}
        {label}
    </button>
);

// Componente para una fila de fuente financiera
const FuenteFinanciera = ({ titulo, montoPactado, abonos, fuente, banco = '' }) => {
    const totalAbonado = abonos.filter(a => a.fuente === fuente).reduce((sum, abono) => sum + abono.monto, 0);
    const saldoPendiente = montoPactado - totalAbonado;

    return (
        <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-semibold">{titulo}</p>
            <p className="text-sm text-gray-600">
                Monto: {formatCurrency(montoPactado)} {banco && `(${banco})`}
            </p>
            <div className="mt-2 pt-2 border-t border-gray-200">
                {saldoPendiente <= 0 ? (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                        <CheckCircle size={14} /> A paz y salvo
                    </p>
                ) : (
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                        <AlertTriangle size={14} /> Pendiente: {formatCurrency(saldoPendiente)}
                    </p>
                )}
            </div>
        </div>
    );
};


const DetalleCliente = () => {
    const { clienteId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'info');

    const [cliente, setCliente] = useState(null);
    const [vivienda, setVivienda] = useState(null);
    const [historialAbonos, setHistorialAbonos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const cargarDatos = useCallback(async () => {
        setIsLoading(true);
        try {
            const [todosClientes, todasViviendas, todosAbonos] = await Promise.all([
                getClientes(),
                getViviendas(),
                getAbonos()
            ]);

            const clienteEncontrado = todosClientes.find(c => c.id === clienteId);

            if (!clienteEncontrado) {
                toast.error("Cliente no encontrado.");
                navigate("/clientes/listar");
                return;
            }
            setCliente(clienteEncontrado);

            if (clienteEncontrado.viviendaId) {
                const viviendaAsignada = todasViviendas.find(v => v.id === clienteEncontrado.viviendaId);
                setVivienda(viviendaAsignada || null);
            }

            setHistorialAbonos(todosAbonos.filter(a => a.clienteId === clienteId));

        } catch (error) {
            toast.error("Error al cargar los datos del cliente.");
        } finally {
            setIsLoading(false);
        }
    }, [clienteId, navigate]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleFileUpload = useCallback(async (fieldPath, url) => {
        if (!cliente) return;

        const clienteActualizado = JSON.parse(JSON.stringify(cliente));

        const keys = fieldPath.split('.');
        let current = clienteActualizado;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = url;

        try {
            const { vivienda, ...datosParaGuardar } = clienteActualizado;
            await updateCliente(cliente.id, datosParaGuardar, cliente.viviendaId);
            toast.success('Documento actualizado correctamente.');
            cargarDatos(); // Recarga los datos para reflejar cambios
        } catch (error) {
            console.error("Error al actualizar el documento:", error);
            toast.error("No se pudo actualizar el documento.");
        }
    }, [cliente, cargarDatos]);

    const handleGeneratePdf = () => {
        if (cliente && vivienda) {
            generateClientStatementPDF(cliente, vivienda, historialAbonos);
        } else {
            toast.error("Faltan datos para generar el reporte.");
        }
    };

    if (isLoading || !cliente) {
        return <div className="text-center p-10 animate-pulse">Cargando perfil del cliente...</div>;
    }

    const { datosCliente, financiero } = cliente;

    const documentos = [
        { label: "Cédula de Ciudadanía", isRequired: true, currentFileUrl: datosCliente.urlCedula, fieldPath: 'datosCliente.urlCedula', filePath: (fileName) => `documentos_clientes/${clienteId}/cedula-${fileName}` },
        { label: "Carta Aprobación Crédito", isRequired: financiero.aplicaCredito, currentFileUrl: financiero.credito.urlCartaAprobacion, fieldPath: 'financiero.credito.urlCartaAprobacion', filePath: (fileName) => `documentos_clientes/${clienteId}/aprobacion-credito-${fileName}` },
        { label: "Soporte Subsidio Mi Casa Ya", isRequired: financiero.aplicaSubsidioVivienda, currentFileUrl: financiero.subsidioVivienda.urlSoporte, fieldPath: 'financiero.subsidioVivienda.urlSoporte', filePath: (fileName) => `documentos_clientes/${clienteId}/subsidio-vivienda-${fileName}` },
        { label: "Soporte Subsidio Caja Comp.", isRequired: financiero.aplicaSubsidioCaja, currentFileUrl: financiero.subsidioCaja.urlSoporte, fieldPath: 'financiero.subsidioCaja.urlSoporte', filePath: (fileName) => `documentos_clientes/${clienteId}/subsidio-caja-${fileName}` }
    ];

    return (
        <AnimatedPage>
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-3xl flex-shrink-0">
                            {getInitials(datosCliente.nombres, datosCliente.apellidos)}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800">{`${datosCliente.nombres} ${datosCliente.apellidos}`}</h2>
                            <p className="text-gray-500">{datosCliente.correo}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => navigate('/clientes/listar')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors">
                            <ArrowLeft size={16} /> Volver
                        </button>
                        <button onClick={handleGeneratePdf} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 transition-colors" disabled={!vivienda}>
                            <FileDown size={16} /> PDF
                        </button>
                    </div>
                </div>

                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-2">
                        <TabButton activeTab={activeTab} tabName="info" label="Información General" icon={<Info size={16} />} onClick={setActiveTab} />
                        <TabButton activeTab={activeTab} tabName="documentos" label="Documentación" icon={<Briefcase size={16} />} onClick={setActiveTab} />
                    </nav>
                </div>

                {activeTab === 'info' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
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
                                    <Link to={`/viviendas/detalle/${vivienda.id}`} className="space-y-3 text-sm hover:bg-gray-50 -m-5 p-5 block rounded-xl">
                                        <p className="flex items-center gap-3"><Home className="text-gray-400" size={16} /> {`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}</p>
                                        {vivienda.descuentoMonto > 0 && <p className="flex items-center gap-3 text-purple-600"><BadgePercent className="text-purple-400" size={16} /> ¡Con descuento aplicado!</p>}
                                        <div className="pt-2 border-t text-right">
                                            <p>Saldo Pendiente: <span className="font-bold text-red-600">{formatCurrency(vivienda.saldoPendiente)}</span></p>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-5 rounded-xl border">
                                <h3 className="font-bold text-lg mb-4 border-b pb-2">Cierre Financiero</h3>
                                <div className="space-y-4">
                                    {financiero.aplicaCuotaInicial && <FuenteFinanciera titulo="Cuota Inicial" montoPactado={financiero.cuotaInicial.monto} abonos={historialAbonos} fuente="cuotaInicial" />}
                                    {financiero.aplicaCredito && <FuenteFinanciera titulo="Crédito Hipotecario" montoPactado={financiero.credito.monto} abonos={historialAbonos} fuente="credito" banco={financiero.credito.banco} />}
                                    {financiero.aplicaSubsidioVivienda && <FuenteFinanciera titulo="Subsidio Mi Casa Ya" montoPactado={financiero.subsidioVivienda.monto} abonos={historialAbonos} fuente="subsidioVivienda" />}
                                    {financiero.aplicaSubsidioCaja && <FuenteFinanciera titulo="Subsidio Caja de Compensación" montoPactado={financiero.subsidioCaja.monto} abonos={historialAbonos} fuente="subsidioCaja" banco={financiero.subsidioCaja.caja} />}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'documentos' && (
                    <div className="animate-fade-in bg-white border rounded-xl shadow-sm">
                        <div className="p-4 border-b">
                            <h3 className="font-bold text-lg">Lista de Documentos Requeridos</h3>
                        </div>
                        <div className="divide-y">
                            {documentos.filter(doc => doc.isRequired).length > 0 ? (
                                documentos.map(doc => (
                                    <DocumentoRow
                                        key={doc.label}
                                        label={doc.label}
                                        isRequired={doc.isRequired}
                                        currentFileUrl={doc.currentFileUrl}
                                        filePath={doc.filePath}
                                        onUploadSuccess={(url) => handleFileUpload(doc.fieldPath, url)}
                                        onRemove={() => handleFileUpload(doc.fieldPath, null)}
                                    />
                                ))
                            ) : (
                                <p className="p-4 text-center text-gray-500">No hay documentos requeridos para la estructura financiera de este cliente.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default DetalleCliente;