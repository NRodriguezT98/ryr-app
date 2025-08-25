import React from 'react';
import { formatCurrency, toTitleCase } from '../../../utils/textFormatters';

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
    linderoNorte: 'Lindero Norte',
    linderoSur: 'Lindero Sur',
    linderoOriente: 'Lindero Oriente',
    linderoOccidente: 'Lindero Occidente',

    // Cliente
    nombres: 'Nombres',
    apellidos: 'Apellidos',
    cedula: 'Cédula',
    telefono: 'Teléfono',
    correo: 'Correo Electrónico',
    direccion: 'Dirección',
    fechaIngreso: 'Fecha de Ingreso',

    // Financiero
    'Banco (Crédito)': 'Banco (Crédito Hipotecario)',
    'Aplica Cuota Inicial': 'Aplica Cuota Inicial',
    'Monto Cuota Inicial': 'Monto Cuota Inicial',
    'Aplica Crédito': 'Aplica Crédito',
    'Monto Crédito': 'Monto Crédito',
    'Número de Caso (Crédito)': 'Número de Caso (Crédito)',
    'Aplica Sub. Mi Casa Ya': 'Aplica Sub. Mi Casa Ya',
    'Monto Sub. Mi Casa Ya': 'Monto Sub. Mi Casa Ya',
    'Aplica Sub. Caja Comp.': 'Aplica Sub. Caja Comp.',
    'Monto Sub. Caja Comp.': 'Monto Sub. Caja Comp.',
    'Caja de Compensación': 'Caja de Compensación',
    'Usa Valor Escritura Diferente': 'Usa Valor de Escritura Diferente',
    'Valor Escritura': 'Valor de Escritura'
};

// Diccionario para formatear valores específicos
const valueLabels = {
    'Banco (Crédito)': {
        'FondoNacionalDelAhorro': 'Fondo Nacional Del Ahorro',
    },
};

const camposAIgnorar = ['errors', 'numero'];

const formatValue = (value, field) => {
    if (value === null || value === undefined || value === '') return 'Vacío';

    if (valueLabels[field] && valueLabels[field][String(value)]) {
        return valueLabels[field][String(value)];
    }
    if (String(value) === 'true') return 'Sí';
    if (String(value) === 'false') return 'No';
    if ((field.toLowerCase().includes('monto') || field.toLowerCase().includes('valor')) && !String(value).includes('$')) {
        const numValue = typeof value === 'string' ? parseFloat(value.replace(/\D/g, '')) : value;
        if (!isNaN(numValue)) return formatCurrency(numValue);
    }
    return String(value);
};

const UpdateDetails = ({ log }) => {
    const details = log.details || {};
    const cambiosFiltrados = (details.cambios || []).filter(
        cambio => !camposAIgnorar.includes(cambio.campo.toLowerCase())
    );

    if (cambiosFiltrados.length === 0) {
        return <p className="text-sm text-gray-600 dark:text-gray-400">No se registraron cambios de datos relevantes.</p>;
    }

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
};

export default UpdateDetails;