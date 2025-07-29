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
                // --- INICIO DE LA CORRECCIÓN ---
                const docData = typeof doc.selector === 'function' ? doc.selector(cliente) : null;

                // Determinamos la URL final, ya sea que venga directamente o de una propiedad .url
                const finalUrl = docData?.url || (typeof docData === 'string' ? docData : null);

                return {
                    ...doc,
                    url: finalUrl,
                    // El estado ahora depende EXCLUSIVAMENTE de si existe una URL final.
                    estado: finalUrl ? 'Subido' : 'Pendiente'
                };
                // --- FIN DE LA CORRECCIÓN ---
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
        // Comprobamos si el destino es un objeto de evidencia o una URL directa
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