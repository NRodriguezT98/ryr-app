import { useMemo, useState } from 'react';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';
import { DOCUMENTACION_CONFIG } from '../../utils/documentacionConfig';

export const useDocumentacion = (cliente) => {
    const [filtro, setFiltro] = useState('importantes');

    const documentosSubidos = useMemo(() => {
        const documentos = [];

        // 1. Añadimos la Cédula primero, ya que es un caso especial y siempre es importante.
        if (cliente.datosCliente?.urlCedula) {
            documentos.push({
                id: 'documento-cedula',
                label: 'Cédula de Ciudadanía',
                pasoLabel: 'Registro del Cliente',
                url: cliente.datosCliente.urlCedula,
                fechaSubida: cliente.datosCliente.fechaIngreso,
                esImportante: true,
            });
        }

        if (!cliente.proceso) return documentos;

        // 2. Creamos un mapa para buscar eficientemente si un paso del proceso
        // está vinculado a un documento marcado como "importante".
        const importanciaPorPaso = new Map();
        DOCUMENTACION_CONFIG.forEach(doc => {
            if (doc.vinculadoA && doc.esImportante) {
                importanciaPorPaso.set(doc.vinculadoA, true);
            }
        });

        // 3. Recorremos los pasos del proceso para encontrar las evidencias que se han subido.
        PROCESO_CONFIG.forEach(pasoConfig => {
            if (pasoConfig.aplicaA(cliente.financiero || {}) && cliente.proceso[pasoConfig.key]) {
                const pasoData = cliente.proceso[pasoConfig.key];

                if (pasoData.evidencias) {
                    pasoConfig.evidenciasRequeridas.forEach(evidenciaConfig => {
                        const evidenciaData = pasoData.evidencias[evidenciaConfig.id];

                        if (evidenciaData?.url) {
                            // 4. Verificamos si la evidencia pertenece a un paso importante
                            // O si la propia evidencia está marcada como importante (más flexible).
                            const esImportante = importanciaPorPaso.has(pasoConfig.key) || !!evidenciaConfig.esImportante;

                            documentos.push({
                                id: `${pasoConfig.key}-${evidenciaConfig.id}`,
                                label: evidenciaConfig.label,
                                pasoLabel: pasoConfig.label,
                                url: evidenciaData.url,
                                fechaSubida: evidenciaData.fechaSubida,
                                esImportante: esImportante // Asignamos el valor correcto
                            });
                        }
                    });
                }
            }
        });
        return documentos;
    }, [cliente]);

    const documentosFiltrados = useMemo(() => {
        if (filtro === 'importantes') {
            return documentosSubidos.filter(d => d.esImportante);
        }
        return documentosSubidos;
    }, [documentosSubidos, filtro]);

    return {
        filtro,
        setFiltro,
        documentosFiltrados
    };
};