import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import UndoToast from '../components/UndoToast';

/**
 * Hook personalizado para manejar la eliminación de elementos con opción de deshacer.
 * @param {Function} deleteFunction La función asíncrona que ejecuta el borrado definitivo.
 * @param {Function} onSuccessfulDelete Callback que se ejecuta tras un borrado exitoso.
 * @param {string}itemName Nombre del tipo de item que se elimina (e.g., "Cliente", "Vivienda").
 */
export const useUndoableDelete = (deleteFunction, onSuccessfulDelete, itemName = 'Elemento') => {
    const [hiddenItems, setHiddenItems] = useState([]);
    const deletionTimeouts = useRef({});

    const initiateDelete = (item) => {
        setHiddenItems(prev => [...prev, item.id]);

        toast.custom(
            (t) => (
                <UndoToast
                    t={t}
                    message={`${itemName} eliminado`}
                    onUndo={() => undoDelete(item.id)}
                />
            ),
            { duration: 5000 }
        );

        const timeoutId = setTimeout(() => {
            confirmDelete(item);
        }, 5000);

        deletionTimeouts.current[item.id] = timeoutId;
    };

    const confirmDelete = async (item) => {
        try {
            await deleteFunction(item);
            if (onSuccessfulDelete) {
                onSuccessfulDelete();
            }
        } catch (error) {
            toast.error(`No se pudo eliminar el ${itemName.toLowerCase()}.`);
            // Si la eliminación en la base de datos falla, volvemos a mostrar el elemento en la UI.
            setHiddenItems(prev => prev.filter(id => id !== item.id));
        } finally {
            delete deletionTimeouts.current[item.id];
        }
    };

    const undoDelete = (id) => {
        clearTimeout(deletionTimeouts.current[id]);
        delete deletionTimeouts.current[id];
        setHiddenItems(prev => prev.filter(itemId => itemId !== id));
        toast.success("Eliminación deshecha.");
    };

    // Devolvemos los items ocultos y la función para iniciar el borrado
    return { hiddenItems, initiateDelete };
};