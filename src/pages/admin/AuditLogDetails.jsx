import React from 'react';
import { formatCurrency, toTitleCase } from '../../utils/textFormatters';

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
    'credito.banco': 'Banco (Crédito)',
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

// --- INICIO DE LA MODIFICACIÓN ---
// 1. Lista de campos que no queremos mostrar en la auditoría
const camposAIgnorar = ['errors', 'numero'];
// --- FIN DE LA MODIFICACIÓN ---

const formatValue = (value, field) => {
    if (value === null || value === undefined || value === '') return 'Vacío';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (field.toLowerCase().includes('monto') || field.toLowerCase().includes('valor')) {
        return formatCurrency(value);
    }
    return String(value);
};


const AuditLogDetails = ({ details }) => {
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