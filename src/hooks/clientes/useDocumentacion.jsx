import { useMemo, useState, useCallback } from 'react';
import { DOCUMENTACION_CONFIG } from '../../utils/documentacionConfig';
import { updateCliente } from "../../services/clienteService";
import toast from 'react-hot-toast';

export const useDocumentacion = (cliente, renuncia) => {
    const [filtro, setFiltro] = useState('importantes');

    const documentosFiltrados = useMemo(() => {
        // Si el cliente ha renunciado y tenemos el objeto renuncia...
        if (cliente.status === 'renunciado' && renuncia?.documentosArchivados) {
            return renuncia.documentosArchivados.map(doc => ({
                ...doc,
                id: doc.label
            }));
        }

        const { financiero, proceso } = cliente;
        if (!financiero || !proceso) return [];

        const docs = DOCUMENTACION_CONFIG
            .filter(doc => doc.aplicaA(financiero))
            .map(doc => {
                const docData = typeof doc.selector === 'function' ? doc.selector(cliente) : null;
                const finalUrl = docData?.url || (typeof docData === 'string' ? docData : null);

                return {
                    ...doc,
                    url: finalUrl,
                    estado: finalUrl ? 'Subido' : 'Pendiente'
                };
            });

        if (filtro === 'importantes' && cliente.status !== 'renunciado') {
            return docs.filter(doc => doc.esImportante);
        }

        return docs;
    }, [cliente, renuncia, filtro]);

    return {
        filtro,
        setFiltro,
        documentosFiltrados
    };
};