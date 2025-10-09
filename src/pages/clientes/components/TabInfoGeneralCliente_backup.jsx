import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../hooks/auth/usePermissions';
import { User, Phone, Mail, MapPin, Home, Wallet, Calendar, AlertTriangle, Building, Building2, Banknote, Landmark, Award, Briefcase, PlusCircle, FileKey } from 'lucide-react';
import { formatID, formatDisplayDate, formatCurrency } from '../../../utils/textFormatters';
import ClienteEstadoView from './ClienteEstadoView';
import Button from '../../../components/Button';

// --- Sub-componentes para un código más limpio ---

const InfoCard = ({ title, icon, children, headerActions = null }) => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border dark:border-gray-700 h-full">
        <div className="flex justify-between items-center mb-4 border-b dark:border-gray-600 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-gray-700 dark:text-gray-200">{icon} {title}</h3>
            {headerActions && <div>{headerActions}</div>}
        </div>
        <div className="text-sm space-y-3">{children}</div>
    </div>
);

const InfoRow = ({ icon, label, value, valueClassName = '' }) => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-gray-400 mt-0.5">{icon}</div>
        <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{label}:</span>
            <span className={`text-gray-600 dark:text-gray-300 ${valueClassName}`}> {value || 'No especificado'}</span>
        </div>
    </div>
);

const FuenteFinancieraCard = ({ icon, titulo, banco, children, montoAbonado, montoPactado }) => (
    <div className="flex items-center gap-3 py-1.5">
        <div className="flex-shrink-0 text-blue-500">{icon}</div>
        <div className="flex-grow">
            <p className="font-semibold text-gray-700 dark:text-gray-200">{titulo}</p>
            {banco && <div className="text-xs text-gray-500 dark:text-gray-400">{banco}</div>}
        </div>
        <div className="text-right">
            {children}
        </div>
    </div>
);

// --- Componente Principal Reestructurado ---

const TabInfoGeneralCliente = ({ cliente, renuncia, vivienda, historialAbonos, proyecto, isReadOnly }) => {
    const { can } = usePermissions();
    const navigate = useNavigate();

    if (!cliente) return null; // Protección en caso de que el cliente sea nulo

    if (cliente.status === 'renunciado' || cliente.status === 'inactivo') {
        return <ClienteEstadoView cliente={cliente} renuncia={renuncia} contexto="infoGeneral" />;
    }

    const { datosCliente, financiero } = cliente;

    // --- Lógica para los datos financieros ---
    const valorTotalVivienda = [
        financiero?.cuotaInicial?.monto,
        financiero?.credito?.monto,
        financiero?.subsidioVivienda?.monto,
        financiero?.subsidioCaja?.monto
    ].reduce((acc, monto) => acc + (monto || 0), 0);

    const totalAbonado = (historialAbonos || []).reduce((acc, abono) => acc + abono.monto, 0);
    const saldoPendiente = valorTotalVivienda - totalAbonado;
    const progresoPago = valorTotalVivienda > 0 ? (totalAbonado / valorTotalVivienda) * 100 : 0;

    const handleGoToAbonos = () => {
        navigate(`/abonos/gestionar/${cliente.id}`);
    };

    return (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">


            {/* 1. Datos de Contacto */}
            <InfoCard title="Datos de Contacto" icon={<User size={20} />}>
                <InfoRow icon={<User size={14} />} label="Cédula" value={formatID(datosCliente.cedula)} />
                <InfoRow icon={<Phone size={14} />} label="Teléfono" value={datosCliente.telefono} />
                <InfoRow icon={<Mail size={14} />} label="Correo" value={datosCliente.correo} />
                <InfoRow icon={<MapPin size={14} />} label="Dirección" value={datosCliente.direccion} />
            </InfoCard>

            {/* 2. Vivienda Asignada (Enriquecida) */}
            {vivienda ? (
                <InfoCard title="Vivienda Asignada" icon={<Home size={20} />}>
                    <Link to={`/viviendas/detalle/${vivienda.id}`} className="font-bold text-lg text-blue-600 dark:text-blue-400 hover:underline">
                        {`Mz. ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}
                    </Link>
                    <div className="mt-3 pt-3 border-t border-dashed dark:border-gray-600 space-y-2">
                        <InfoRow icon={<Building size={14} />} label="Matrícula" value={vivienda.matricula} />
                        <InfoRow icon={<MapPin size={14} />} label="Nomenclatura" value={vivienda.nomenclatura} />
                        {proyecto && <InfoRow icon={<Building2 size={14} />} label="Proyecto" value={proyecto.nombre} />}
                    </div>
                </InfoCard>
            ) : (
                <InfoCard title="Vivienda Asignada" icon={<Home size={20} />}><p>No tiene vivienda asignada.</p></InfoCard>
            )}

            {/* 3. Resumen Financiero (con Acciones) */}
            <InfoCard
                title="Resumen Financiero"
                icon={<Wallet size={20} />}
                headerActions={
                    can('abonos', 'crear') && vivienda && (
                        <div
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={isReadOnly ? "No se pueden agregar abonos a un cliente con renuncia en proceso." : "Agregar un nuevo abono"}
                        >
                            <Button
                                variant="primary"
                                onClick={handleGoToAbonos}
                                icon={<PlusCircle size={14} />}
                                size="sm"
                                className="rounded-full"
                                disabled={isReadOnly}
                            >
                                Agregar Abono
                            </Button>
                        </div>
                    )
                }
            >
                {Object.keys(financiero || {}).length > 0 && vivienda ? (
                    <>
                        <div className="pt-2">
                            <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                <span>Progreso General de Pago</span>
                                <span>{`${Math.round(progresoPago)}%`}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progresoPago}%` }}></div>
                            </div>
                        </div>

                        <div className="divide-y dark:divide-gray-600 -my-3">
                            {cliente.financiero.aplicaCuotaInicial && (
                                <FuenteFinancieraCard icon={<Banknote size={20} />} titulo="Cuota Inicial">
                                    <p className="text-sm">
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency((historialAbonos || []).filter(a => a.fuente === 'cuotaInicial').reduce((s, a) => s + a.monto, 0))}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {' / ' + formatCurrency(cliente.financiero.cuotaInicial.monto)}
                                        </span>
                                    </p>
                                </FuenteFinancieraCard>
                            )}
                            {cliente.financiero.aplicaCredito && (
                                <FuenteFinancieraCard
                                    icon={<Landmark size={20} />}
                                    titulo="Crédito Hipotecario"
                                    banco={
                                        <>
                                            <span>{cliente.financiero.credito.banco}</span>
                                            {cliente.financiero.credito.caso && (
                                                <div className="mt-1">
                                                    <span className="font-semibold text-gray-600 dark:text-gray-300">Referencia del Crédito: </span>
                                                    <span>{cliente.financiero.credito.caso}</span>
                                                </div>
                                            )}
                                        </>
                                    }
                                >
                                    {/* Usamos un Fragmento para pasar múltiples elementos */}
                                    <>
                                        <p className="text-sm">
                                            <span className="font-bold text-green-600 dark:text-green-400">
                                                {formatCurrency((historialAbonos || []).filter(a => a.fuente === 'credito').reduce((s, a) => s + a.monto, 0))}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {' / ' + formatCurrency(cliente.financiero.credito.monto)}
                                            </span>
                                        </p>
                                    </>
                                </FuenteFinancieraCard>
                            )}
                            {/* --- CÓDIGO AÑADIDO --- */}
                            {cliente.financiero.aplicaSubsidioVivienda && (
                                <FuenteFinancieraCard icon={<Award size={20} />} titulo="Subsidio Mi Casa Ya">
                                    <p className="text-sm">
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency((historialAbonos || []).filter(a => a.fuente === 'subsidioVivienda').reduce((s, a) => s + a.monto, 0))}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {' / ' + formatCurrency(cliente.financiero.subsidioVivienda.monto)}
                                        </span>
                                    </p>
                                </FuenteFinancieraCard>
                            )}
                            {cliente.financiero.aplicaSubsidioCaja && (
                                <FuenteFinancieraCard icon={<Briefcase size={20} />} titulo="Subsidio Caja Comp.">
                                    <p className="text-sm">
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {formatCurrency((historialAbonos || []).filter(a => a.fuente === 'subsidioCaja').reduce((s, a) => s + a.monto, 0))}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {' / ' + formatCurrency(cliente.financiero.subsidioCaja.monto)}
                                        </span>
                                    </p>
                                </FuenteFinancieraCard>
                            )}
                            {/* --- FIN DEL CÓDIGO AÑADIDO --- */}
                        </div>

                        <div className="pt-3 mt-3 border-t border-dashed dark:border-gray-600 space-y-3">
                            <InfoRow label="Valor Total Pactado" value={formatCurrency(valorTotalVivienda)} valueClassName="font-bold" />
                            <InfoRow label="Total Abonado" value={formatCurrency(totalAbonado)} valueClassName="font-bold text-green-600" />
                            <InfoRow label="Saldo Pendiente" value={formatCurrency(saldoPendiente)} valueClassName="font-bold text-red-600" />
                        </div>
                    </>
                ) : (
                    <p>No se ha definido una estructura financiera.</p>
                )}
            </InfoCard>

            {/* 4. Resumen del Proceso */}
            <InfoCard title="Resumen del Proceso" icon={<Calendar size={20} />}>
                <InfoRow icon={<Calendar size={14} />} label="Cliente desde" value={formatDisplayDate(cliente.fechaCreacion)} />
                <InfoRow icon={<Calendar size={14} />} label="Inicio de Proceso" value={formatDisplayDate(cliente.fechaInicioProceso)} />
            </InfoCard>
        </div>
    );
};

export default TabInfoGeneralCliente;