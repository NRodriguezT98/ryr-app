import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Home, Wallet, CheckCircle, Briefcase, HelpCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatID } from '../../../utils/textFormatters';
import ClienteEstadoView from './ClienteEstadoView';
import { useDocumentacion } from '../../../hooks/clientes/useDocumentacion';
import DocumentoRow from '../../../components/documentos/DocumentoRow';

const InfoCard = ({ title, icon, children, filterControls = null }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 h-full">
        <div className="flex justify-between items-center mb-4 border-b dark:border-gray-600 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 dark:text-gray-200">
                {icon} {title}
            </h3>
            {filterControls}
        </div>
        <div className="text-sm">
            {children}
        </div>
    </div>
);

const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 py-1">
        <div className="flex-shrink-0 text-gray-400 mt-0.5">{icon}</div>
        <div className="flex-grow">
            <span className="font-semibold text-gray-800 dark:text-gray-200">{label}: </span>
            <span className="text-gray-600 dark:text-gray-300">{value}</span>
        </div>
    </div>
);

const FuenteFinancieraCard = ({ titulo, montoPactado, abonos, fuente }) => {
    const totalAbonado = (abonos || []).filter(a => a.fuente === fuente).reduce((sum, abono) => sum + abono.monto, 0);
    const isCompletada = totalAbonado >= montoPactado;

    return (
        <div className={`p-3 rounded-lg flex items-center justify-between ${isCompletada ? 'bg-green-50 dark:bg-green-900/30' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
            <span className={`font-semibold ${isCompletada ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-200'}`}>{titulo}</span>
            <div className="text-right">
                <p className={`font-bold text-sm ${isCompletada ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-gray-100'}`}>{formatCurrency(totalAbonado)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">de {formatCurrency(montoPactado)}</p>
            </div>
        </div>
    );
};

const TabInfoGeneralCliente = ({ cliente, renuncia, historialAbonos }) => {
    const { status, tieneRenunciaPendiente } = cliente;
    const { filtro, setFiltro, documentosFiltrados } = useDocumentacion(cliente);

    const isArchivado = status === 'inactivo';
    const isRenunciado = status === 'renunciado';
    const isClientInactiveOrPending = isArchivado || isRenunciado || tieneRenunciaPendiente;

    if (isClientInactiveOrPending) {
        return <ClienteEstadoView cliente={cliente} renuncia={renuncia} contexto="infoGeneral" />;
    }

    const { datosCliente, vivienda, financiero } = cliente;

    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 flex flex-col gap-6">
                <InfoCard title="Datos de Contacto" icon={<User size={20} />}>
                    <div className="space-y-3">
                        <InfoRow icon={<User size={14} />} label="Cédula" value={formatID(datosCliente.cedula)} />
                        <InfoRow icon={<Phone size={14} />} label="Teléfono" value={datosCliente.telefono} />
                        <InfoRow icon={<Mail size={14} />} label="Correo" value={datosCliente.correo} />
                        <InfoRow icon={<MapPin size={14} />} label="Dirección" value={datosCliente.direccion} />
                    </div>
                </InfoCard>

                {vivienda ? (
                    <InfoCard title="Vivienda Asignada" icon={<Home size={20} />}>
                        <div className="space-y-4">
                            <Link to={`/viviendas/detalle/${vivienda.id}`} className="font-bold text-lg text-blue-600 dark:text-blue-400 hover:underline">
                                {`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}
                            </Link>
                            <div>
                                <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                    <span>Progreso</span>
                                    <span>{`${Math.round((vivienda.totalAbonado / vivienda.valorFinal) * 100)}%`}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(vivienda.totalAbonado / vivienda.valorFinal) * 100}%` }}></div>
                                </div>
                            </div>
                            <div className="text-sm space-y-2 pt-2 border-t dark:border-gray-600">
                                <InfoRow label="Valor Total" value={formatCurrency(vivienda.valorFinal)} />
                                <InfoRow label="Total Abonado" value={<span className="text-green-600 font-semibold">{formatCurrency(vivienda.totalAbonado)}</span>} />
                                <InfoRow label="Saldo Pendiente" value={<span className="text-red-600 font-semibold">{formatCurrency(vivienda.saldoPendiente)}</span>} />
                            </div>
                        </div>
                    </InfoCard>
                ) : (
                    <InfoCard title="Vivienda Asignada" icon={<Home size={20} />}>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Este cliente no tiene una vivienda asignada actualmente.</p>
                    </InfoCard>
                )}
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
                <InfoCard title="Resumen de Cierre Financiero" icon={<Wallet size={20} />}>
                    {Object.keys(financiero || {}).length > 0 ? (
                        <div className="space-y-3">
                            {financiero.aplicaCuotaInicial && <FuenteFinancieraCard titulo="Cuota Inicial" montoPactado={financiero.cuotaInicial.monto} abonos={historialAbonos} fuente="cuotaInicial" />}
                            {financiero.aplicaCredito && <FuenteFinancieraCard titulo="Crédito Hipotecario" montoPactado={financiero.credito.monto} abonos={historialAbonos} fuente="credito" />}
                            {financiero.aplicaSubsidioVivienda && <FuenteFinancieraCard titulo="Subsidio Mi Casa Ya" montoPactado={financiero.subsidioVivienda.monto} abonos={historialAbonos} fuente="subsidioVivienda" />}
                            {financiero.aplicaSubsidioCaja && <FuenteFinancieraCard titulo="Subsidio Caja de Compensación" montoPactado={financiero.subsidioCaja.monto} abonos={historialAbonos} fuente="subsidioCaja" />}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No se ha definido una estructura financiera para este cliente.</p>
                    )}
                </InfoCard>

                <InfoCard
                    title="Repositorio de Documentos"
                    icon={<Briefcase size={20} />}
                    filterControls={
                        <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg">
                            <button onClick={() => setFiltro('importantes')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filtro === 'importantes' ? 'bg-white dark:bg-gray-900 shadow text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>Importantes</button>
                            <button onClick={() => setFiltro('todos')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${filtro === 'todos' ? 'bg-white dark:bg-gray-900 shadow text-gray-800' : 'text-gray-600 dark:text-gray-300'}`}>Todos</button>
                        </div>
                    }
                >
                    <div className="-m-5">
                        <div className="divide-y dark:divide-gray-700">
                            {documentosFiltrados.length > 0 ? (
                                documentosFiltrados.map(doc => (
                                    <DocumentoRow
                                        key={doc.id}
                                        label={doc.label}
                                        isRequired={true}
                                        currentFileUrl={doc.url}
                                        isReadOnly={true} // <-- FORZAMOS EL MODO SOLO LECTURA
                                    />
                                ))
                            ) : (
                                <p className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    No hay documentos que coincidan con el filtro actual.
                                </p>
                            )}
                        </div>
                    </div>
                </InfoCard>
            </div>
        </div>
    );
};

export default TabInfoGeneralCliente;