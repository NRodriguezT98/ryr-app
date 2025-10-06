// src/pages/admin/audit-details/components/UpdateViviendaDetails.jsx

import React from 'react';
import { Home, Ruler, DollarSign, Edit3, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../../utils/textFormatters';

// La misma función de formateo que usamos en DetalleCambios
const formatValue = (key, valor) => {
    if (valor === undefined || valor === null || valor === '') return 'N/A';
    const camposMoneda = ['valorBase', 'recargoEsquinera', 'valorTotal', 'gastosNotariales', 'valorFinal', 'saldoPendiente'];
    if (camposMoneda.includes(key)) {
        const valorNumerico = Number(String(valor).replace(/[^\d.-]/g, ''));
        return formatCurrency(valorNumerico);
    }
    if (key === 'esEsquinera') {
        return valor === true || String(valor).toLowerCase() === 'true' ? 'Sí' : 'No';
    }
    return valor;
};

// Un mapa para traducir los nombres de campo a etiquetas legibles
const CAMPO_LABELS = {
    manzana: 'Manzana',
    numeroCasa: 'Número de Casa',
    matricula: 'Matrícula',
    nomenclatura: 'Nomenclatura',
    areaLote: 'Área del Lote',
    areaConstruida: 'Área Construida',
    tipoVivienda: 'Tipo de Vivienda',
    linderoNorte: 'Lindero Norte',
    linderoSur: 'Lindero Sur',
    linderoOriente: 'Lindero Oriente',
    linderoOccidente: 'Lindero Occidente',
    valorBase: 'Valor Base',
    esEsquinera: 'Esquinera',
    recargoEsquinera: 'Recargo Esquinera',
    valorTotal: 'Valor Total',
    Proyecto: 'Proyecto'
};

const SeccionCambios = ({ titulo, icono, cambios, campos }) => {
    const cambiosRelevantes = cambios.filter(c => campos.includes(c.campo));
    if (cambiosRelevantes.length === 0) return null;

    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                {icono} {titulo}
            </h4>
            <div className="space-y-2">
                {cambiosRelevantes.map((cambio, index) => (
                    <div key={index} className="text-sm">
                        <span className="font-medium text-gray-600 dark:text-gray-300">{CAMPO_LABELS[cambio.campo] || cambio.campo}:</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-red-500 line-through">{formatValue(cambio.campo, cambio.anterior)}</span>
                            <ArrowRight size={14} className="text-gray-400" />
                            <span className="font-bold text-green-500">{formatValue(cambio.campo, cambio.actual)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UpdateViviendaDetails = ({ details }) => {
    const { cambios } = details;

    // AHORA ESTE COMPONENTE SOLO RENDERIZA LAS SECCIONES DE CAMBIOS
    return (
        <div className="space-y-4">
            <SeccionCambios
                titulo="Cambios Principales"
                icono={<Home size={16} />}
                cambios={cambios}
                campos={['Proyecto', 'manzana', 'numeroCasa', 'matricula', 'nomenclatura']}
            />
            <SeccionCambios
                titulo="Cambios Físicos"
                icono={<Ruler size={16} />}
                cambios={cambios}
                campos={['areaLote', 'areaConstruida', 'tipoVivienda', 'linderoNorte', 'linderoSur', 'linderoOriente', 'linderoOccidente']}
            />
            <SeccionCambios
                titulo="Cambios Financieros"
                icono={<DollarSign size={16} />}
                cambios={cambios}
                campos={['valorBase', 'esEsquinera', 'recargoEsquinera', 'valorTotal']}
            />
        </div>
    );
};

export default UpdateViviendaDetails;