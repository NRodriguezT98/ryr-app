import { useMemo, useState } from 'react';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';

export const useDocumentacion = (cliente) => {
    const [filtro, setFiltro] = useState('importantes'); // Filtro por defecto

    const documentosSubidos = useMemo(() => {
        const documentos = [];
        if (!cliente.proceso) return [];

        PROCESO_CONFIG.forEach(pasoConfig => {
            if (pasoConfig.aplicaA(cliente.financiero || {}) && cliente.proceso[pasoConfig.key]) {
                const pasoData = cliente.proceso[pasoConfig.key];

                if (pasoData.evidencias) {
                    pasoConfig.evidenciasRequeridas.forEach(evidenciaConfig => {
                        const evidenciaData = pasoData.evidencias[evidenciaConfig.id];

                        if (evidenciaData?.url) {
                            documentos.push({
                                id: `${pasoConfig.key}-${evidenciaConfig.id}`,
                                label: evidenciaConfig.label,
                                pasoLabel: pasoConfig.label,
                                url: evidenciaData.url,
                                fechaSubida: evidenciaData.fechaSubida,
                                esImportante: !!evidenciaConfig.esImportante
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