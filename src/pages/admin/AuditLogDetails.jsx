import React from 'react';
import { formatCurrency, toTitleCase } from '../../utils/textFormatters';
import { XCircle, CheckCircle, Home, TrendingUp, User, Landmark, Building, PiggyBank, Award, FileSignature } from 'lucide-react';

// Diccionario para traducir los nombres de los campos
const fieldLabels = {
    // Vivienda
    manzana: 'Manzana',
    numeroCasa: 'Número de Casa',
    areaLote: 'Área del Lote (m²)',
    areaConstruida: 'Área Construida (m²)',
    nomenclatura: 'Nomenclatura',
    valorTotal: 'Valor Total',
    descuentoMonto: 'Monto de Descuento',
    valorFinal: 'Valor Final',
    esEsquinera: 'Es Esquinera',
    // --- INICIO DE LA MODIFICACIÓN ---
    linderoNorte: 'Lindero Norte:',
    linderoSur: 'Lindero Sur:',
    linderoOriente: 'Lindero Oriente:',
    linderoOccidente: 'Lindero Occidente:',
    // --- FIN DE LA MODIFICACIÓN ---

    // Cliente
    nombres: 'Nombres',
    apellidos: 'Apellidos',
    cedula: 'Cédula',
    telefono: 'Teléfono',
    correo: 'Correo Electrónico',
    direccion: 'Dirección',
    fechaIngreso: 'Fecha de Ingreso',
    // Financiero
    aplicaCuotaInicial: 'Aplica Cuota Inicial',
    'cuotaInicial.monto': 'Monto Cuota Inicial',
    aplicaCredito: 'Aplica Crédito',
    'Banco (Crédito)': 'Banco (Crédito Hipotecario)',
    'credito.monto': 'Monto Crédito',
    'credito.caso': 'Número de Caso (Crédito)',
    aplicaSubsidioVivienda: 'Aplica Sub. Mi Casa Ya',
    'subsidioVivienda.monto': 'Monto Sub. Mi Casa Ya',
    aplicaSubsidioCaja: 'Aplica Sub. Caja Comp.',
    'subsidioCaja.caja': 'Caja de Compensación',
    'subsidioCaja.monto': 'Monto Sub. Caja Comp.',
    usaValorEscrituraDiferente: 'Usa Valor de Escritura Diferente',
    valorEscritura: 'Valor de Escritura'
};

// Diccionario 2: Traduce VALORES específicos de ciertos campos
const valueLabels = {
    'Banco (Crédito)': {
        'FondoNacionalDelAhorro': 'Fondo Nacional Del Ahorro',
        'Bancolombia': 'Bancolombia',
        'Davivienda': 'Davivienda',
        'Banco de Bogotá': 'Banco de Bogotá',
        'Banco Agrario': 'Banco Agrario',
        'Otro': 'Otro'
    },
    'Esquinera': {
        'true': 'Sí',
        'false': 'No'
    }
};

// Lista de campos que no queremos mostrar en la auditoría
const camposAIgnorar = ['errors', 'numero'];


const formatValue = (value, field) => {
    if (value === null || value === undefined || value === '') return 'Vacío';
    if (valueLabels[field] && valueLabels[field][value]) {
        return valueLabels[field][value];
    }
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (field.toLowerCase().includes('monto') || field.toLowerCase().includes('valor')) {
        return formatCurrency(value);
    }
    return String(value);
};

// Componente auxiliar para mostrar la información
const DetailRow = ({ label, value }) => (
    <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-gray-800 dark:text-gray-200">{value || 'No especificado'}</p>
    </div>
);

const AuditLogDetails = ({ details }) => {

    // Añadimos un caso especial para iniciar nuevo proceso de cliente.
    if (details?.action === 'RESTART_CLIENT_PROCESS' && details.snapshotCompleto) {
        const { datosCliente, financiero } = details.snapshotCompleto;
        return (
            <div className="text-sm space-y-4">
                {/* Sección Datos del Cliente */}
                <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2"><User size={16} /> Datos del Cliente</h4>
                <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                    <div className="space-y-3 pl-8">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-8">
                            <DetailRow label="Nombres" value={datosCliente.nombres} />
                            <DetailRow label="Apellidos" value={datosCliente.apellidos} />
                            <DetailRow label="Cédula" value={datosCliente.cedula} />
                            <DetailRow label="Teléfono" value={datosCliente.telefono} />
                            <DetailRow label="Correo" value={datosCliente.correo} />
                            <DetailRow label="Dirección" value={datosCliente.direccion} />
                        </div>
                    </div>
                </div>

                {/* Sección Vivienda */}
                <div className="pt-3 border-t dark:border-gray-700">
                    <div className="space-y-3 pl-8">
                        <p className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2"><Home size={16} /> Vivienda Asignada</p>
                        <div className="p-2 bg-gray-20 dark:bg-gray-700/50 rounded-md">
                            <p className="text-gray-800 dark:text-gray-200 pl-8 align-left">{details.nombreNuevaVivienda}</p>
                        </div>
                    </div>
                </div>

                {/* Sección Financiera */}
                <div className="pt-3 border-t dark:border-gray-700">
                    <h4 className="font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-2"><TrendingUp size={16} /> Cierre Financiero</h4>
                    <div className="space-y-3 pl-8">
                        {/* --- INICIO DE LA MODIFICACIÓN (Íconos y nuevos campos) --- */}
                        {financiero.aplicaCuotaInicial && (
                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"><FileSignature size={14} /> Cuota Inicial:</p>
                                <div className="grid grid-cols-2 gap-x-4 mt-1 pl-4">
                                    <DetailRow label="Monto" value={formatCurrency(financiero.cuotaInicial.monto)} />
                                </div>
                            </div>
                        )}

                        {financiero.aplicaCredito && (
                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"><Landmark size={14} /> Crédito Hipotecario</p>
                                <div className="grid grid-cols-2 gap-x-4 mt-1 pl-4">
                                    <DetailRow label="Monto" value={formatCurrency(financiero.credito.monto)} />
                                    <DetailRow label="Banco" value={financiero.credito.banco} />
                                </div>
                            </div>
                        )}

                        {financiero.aplicaSubsidioVivienda && (
                            <div className="flex items-center gap-2"><Award size={14} className="text-gray-500" /> <DetailRow label="Subsidio Mi Casa Ya" value={formatCurrency(financiero.subsidioVivienda.monto)} /></div>
                        )}

                        {financiero.aplicaSubsidioCaja && (
                            <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"><Building size={14} /> Subsidio Caja de Comp.</p>
                                <div className="grid grid-cols-2 gap-x-4 mt-1 pl-4">
                                    <DetailRow label="Monto" value={formatCurrency(financiero.subsidioCaja.monto)} />
                                    <DetailRow label="Caja" value={financiero.subsidioCaja.caja} />
                                </div>
                            </div>
                        )}

                        {/* Añadimos la sección para el valor de escritura */}
                        {financiero.usaValorEscrituraDiferente && (
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-md">
                                <p className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1"><FileSignature size={14} /> Valor para Escritura Diferente:</p>
                                <div className="grid grid-cols-2 gap-x-4 mt-1 pl-4">
                                    <DetailRow label="Monto Escritura" value={formatCurrency(financiero.valorEscritura)} />
                                </div>
                            </div>
                        )}
                        {/* --- FIN DE LA MODIFICACIÓN --- */}
                    </div>
                </div>
            </div>
        );
    }

    // Añadimos un caso especial para mostrar los detalles de una renuncia.
    if (details?.action === 'CLIENT_RENOUNCE') {
        return (
            <div className="text-sm space-y-3">
                <div>
                    <p className="font-semibold text-gray-500 dark:text-gray-400">Motivo de la Renuncia</p>
                    <p className="text-gray-800 dark:text-gray-200">{details.motivoRenuncia || 'No especificado'}</p>
                </div>
                {details.observaciones && (
                    <div>
                        <p className="font-semibold text-gray-500 dark:text-gray-400">Observaciones Adicionales</p>
                        <p className="text-gray-800 dark:text-gray-200">{details.observaciones}</p>
                    </div>
                )}
                <div className="pt-2 border-t dark:border-gray-700">
                    <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">Penalidad</p>
                    {details.penalidadAplicada ? (
                        <div className="space-y-1 text-green-700 dark:text-green-300">
                            <p className="flex items-center gap-2"><CheckCircle size={16} /> Sí se aplicó penalidad.</p>
                            <p><strong>Monto:</strong> {formatCurrency(details.montoPenalidad)}</p>
                            <p><strong>Motivo:</strong> {details.motivoPenalidad || 'No especificado'}</p>
                        </div>
                    ) : (
                        <p className="flex items-center gap-2 text-red-700 dark:text-red-400"><XCircle size={16} /> No se aplicó penalidad.</p>
                    )}
                </div>
            </div>
        );
    }
    if (details?.cambios && Array.isArray(details.cambios) && details.cambios.length > 0) {

        // --- INICIO DE LA MODIFICACIÓN ---
        // 2. Filtramos el array de cambios para excluir los campos no deseados
        const cambiosFiltrados = details.cambios.filter(
            cambio => !camposAIgnorar.includes(cambio.campo)
        );

        // Si después de filtrar no quedan cambios, mostramos un mensaje
        if (cambiosFiltrados.length === 0) {
            return (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>No hay cambios de datos relevantes para mostrar.</p>
                </div>
            );
        }
        // --- FIN DE LA MODIFICACIÓN ---

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                        <tr>
                            <th className="py-2 pr-4 font-semibold">Dato</th>
                            <th className="py-2 px-4 font-semibold">Antes</th>
                            <th className="py-2 pl-4 font-semibold">Después</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700 dark:text-gray-300">
                        {/* 3. Mapeamos sobre la lista ya filtrada */}
                        {cambiosFiltrados.map((cambio, index) => (
                            <tr key={index} className="border-t dark:border-gray-700">
                                <td className="py-2 pr-4 font-medium">{fieldLabels[cambio.campo] || toTitleCase(cambio.campo)}</td>
                                <td className="py-2 px-4 text-gray-500 line-through">{formatValue(cambio.anterior, cambio.campo)}</td>
                                <td className="py-2 pl-4 text-blue-600 dark:text-blue-400 font-semibold">{formatValue(cambio.actual, cambio.campo)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>No hay detalles de cambios específicos para esta acción.</p>
        </div>
    );
};

export default AuditLogDetails;