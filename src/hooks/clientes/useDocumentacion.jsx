import { useMemo, useState, useCallback } from 'react';
import { DOCUMENTACION_CONFIG } from '../../utils/documentacionConfig';
import { updateCliente } from '../../utils/storage';
import toast from 'react-hot-toast';

export const useDocumentacion = (cliente) => {
    const [filtro, setFiltro] = useState('importantes');

    const documentosFiltrados = useMemo(() => {
        const { datosCliente, financiero, proceso } = cliente;
        if (!datosCliente || !financiero || !proceso) return [];

        const docs = DOCUMENTACION_CONFIG
            .filter(doc => doc.aplicaA(financiero))
            .map(doc => {
                const docData = typeof doc.selector === 'function' ? doc.selector(cliente) : null;
                return {
                    ...doc,
                    url: docData?.url || (typeof docData === 'string' ? docData : null),
                    estado: (docData?.url || typeof docData === 'string') ? 'Subido' : 'Pendiente'
                };
            });

        if (filtro === 'importantes') {
            return docs.filter(doc => doc.esImportante);
        }
        return docs;
    }, [cliente, filtro]);

    const handleFileAction = useCallback(async (path, url) => {
        const keys = path.split('.');
        let tempCliente = JSON.parse(JSON.stringify(cliente));

        let current = tempCliente;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        const finalKey = keys[keys.length - 1];
        if (typeof current[finalKey] === 'object' && current[finalKey] !== null) {
            current[finalKey].url = url;
        } else {
            current[finalKey] = url;
        }

        const { vivienda, ...datosParaGuardar } = tempCliente;
        try {
            await updateCliente(cliente.id, datosParaGuardar, cliente.viviendaId);
            toast.success(`Documento ${url ? 'subido' : 'eliminado'} correctamente.`);
        } catch (error) {
            toast.error("Error al actualizar el documento.");
        }
    }, [cliente]);

    return {
        filtro,
        setFiltro,
        documentosFiltrados,
        handleFileAction
    };
};