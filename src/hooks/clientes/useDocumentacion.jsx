import { useMemo, useState } from 'react';
import { DOCUMENTACION_CONFIG } from '../../utils/documentacionConfig';
import { PROCESO_CONFIG } from '../../utils/procesoConfig';

const pasoLabels = new Map(PROCESO_CONFIG.map(p => [p.key, p.label]));

export const useDocumentacion = (cliente) => {
    const [filtro, setFiltro] = useState('importantes');

    const documentosRequeridos = useMemo(() => {
        if (!cliente) return [];

        return DOCUMENTACION_CONFIG
            .filter(docConfig => docConfig.aplicaA(cliente.financiero || {}))
            .map(docConfig => {
                let url = null;
                let fechaSubida = null;
                let estado = 'Pendiente';

                if (docConfig.id === 'cedula') {
                    url = cliente.datosCliente?.urlCedula;
                    fechaSubida = cliente.datosCliente?.fechaIngreso;
                } else if (docConfig.id === 'cartaAprobacionCredito') {
                    url = cliente.financiero?.credito?.urlCartaAprobacion;
                    fechaSubida = cliente.datosCliente?.fechaIngreso;
                } else if (docConfig.id === 'actaAprobacionCaja') {
                    url = cliente.financiero?.subsidioCaja?.urlCartaAprobacion;
                    fechaSubida = cliente.datosCliente?.fechaIngreso;
                } else if (docConfig.vinculadoA) {
                    const evidencia = cliente.proceso?.[docConfig.vinculadoA]?.evidencias?.[docConfig.id];
                    if (evidencia) {
                        url = evidencia.url;
                        fechaSubida = evidencia.fechaSubida;
                    }
                }

                if (url) {
                    estado = 'Subido';
                }

                return {
                    ...docConfig,
                    url,
                    fechaSubida,
                    estado,
                    pasoLabel: pasoLabels.get(docConfig.vinculadoA) || 'Registro del Cliente',
                };
            });
    }, [cliente]);

    const documentosFiltrados = useMemo(() => {
        if (filtro === 'importantes') {
            return documentosRequeridos.filter(d => d.esImportante);
        }
        return documentosRequeridos;
    }, [documentosRequeridos, filtro]);

    return {
        filtro,
        setFiltro,
        documentosFiltrados,
    };
};