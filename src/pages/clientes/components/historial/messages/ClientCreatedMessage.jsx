/**
 * Componente para mostrar mensajes de cliente creado
 */

import { Icons } from '../HistorialIcons';

const getFuenteIcon = (fuenteTexto) => {
    if (fuenteTexto.includes('Crédito Hipotecario')) {
        return <Icons.CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />;
    }
    if (fuenteTexto.includes('Cuota Inicial')) {
        return <Icons.Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />;
    }
    if (fuenteTexto.includes('Subsidio de Vivienda MCY') || fuenteTexto.includes('Subsidio MCY')) {
        return <Icons.Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />;
    }
    if (fuenteTexto.includes('Subsidio Caja de Compensación')) {
        return <Icons.Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />;
    }
    if (fuenteTexto.includes('Recursos Propios')) {
        return <Icons.Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />;
    }
    return <Icons.Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />;
};

export const ClientCreatedMessage = ({ clientInfo }) => {
    const {
        nombre,
        identificacion,
        telefono,
        email,
        proyecto,
        manzana,
        casa,
        fechaIngreso,
        valorVivienda,
        fuentesFinanciamiento,
        totalFuentes
    } = clientInfo;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
                <Icons.UserPlus className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Nuevo Cliente Registrado
                    </p>
                </div>
            </div>

            {/* Datos del Cliente */}
            <div className="pl-8 space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Icons.User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">Datos del Cliente</span>
                    </div>
                    <div className="space-y-1.5 text-sm">
                        {nombre && (
                            <div className="flex gap-2">
                                <span className="text-blue-700 dark:text-blue-300 font-medium min-w-[100px]">Nombre:</span>
                                <span className="text-blue-900 dark:text-blue-100">{nombre}</span>
                            </div>
                        )}
                        {identificacion && (
                            <div className="flex gap-2">
                                <span className="text-blue-700 dark:text-blue-300 font-medium min-w-[100px]">Identificación:</span>
                                <span className="text-blue-900 dark:text-blue-100">{identificacion}</span>
                            </div>
                        )}
                        {telefono && telefono !== 'No registrado' && (
                            <div className="flex gap-2">
                                <span className="text-blue-700 dark:text-blue-300 font-medium min-w-[100px]">Teléfono:</span>
                                <span className="text-blue-900 dark:text-blue-100">{telefono}</span>
                            </div>
                        )}
                        {email && email !== 'No registrado' && (
                            <div className="flex gap-2">
                                <span className="text-blue-700 dark:text-blue-300 font-medium min-w-[100px]">Email:</span>
                                <span className="text-blue-900 dark:text-blue-100">{email}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vivienda Asignada */}
                {(proyecto || manzana || casa) && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Icons.Home className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-purple-900 dark:text-purple-200">Vivienda Asignada</span>
                        </div>
                        <div className="space-y-1.5 text-sm">
                            {proyecto && (
                                <div className="flex gap-2">
                                    <span className="text-purple-700 dark:text-purple-300 font-medium min-w-[80px]">Proyecto:</span>
                                    <span className="text-purple-900 dark:text-purple-100">{proyecto}</span>
                                </div>
                            )}
                            {manzana && (
                                <div className="flex gap-2">
                                    <span className="text-purple-700 dark:text-purple-300 font-medium min-w-[80px]">Manzana:</span>
                                    <span className="text-purple-900 dark:text-purple-100">{manzana}</span>
                                </div>
                            )}
                            {casa && (
                                <div className="flex gap-2">
                                    <span className="text-purple-700 dark:text-purple-300 font-medium min-w-[80px]">Casa:</span>
                                    <span className="text-purple-900 dark:text-purple-100">{casa}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Fecha de Ingreso */}
                {fechaIngreso && (
                    <div className="flex items-center gap-2 text-sm">
                        <Icons.Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Fecha de ingreso:</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{fechaIngreso}</span>
                    </div>
                )}

                {/* Información Financiera */}
                {(valorVivienda || fuentesFinanciamiento.length > 0) && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Icons.DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Información Financiera</span>
                        </div>
                        <div className="space-y-2 text-sm">
                            {valorVivienda && (
                                <div className="flex gap-2">
                                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">Valor de la Vivienda:</span>
                                    <span className="text-emerald-900 dark:text-emerald-100 font-semibold">{valorVivienda}</span>
                                </div>
                            )}
                            {fuentesFinanciamiento.length > 0 && (
                                <div>
                                    <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-1.5">Fuentes de Financiamiento:</p>
                                    <ul className="space-y-1.5">
                                        {fuentesFinanciamiento.map((fuente, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                {getFuenteIcon(fuente)}
                                                <span className="text-emerald-800 dark:text-emerald-200 text-sm">{fuente}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {totalFuentes && (
                                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-700">
                                    <div className="flex gap-2">
                                        <span className="text-emerald-700 dark:text-emerald-300 font-medium">Total Fuentes:</span>
                                        <span className="text-emerald-900 dark:text-emerald-100 font-semibold">{totalFuentes}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
