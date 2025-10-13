import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '../../../firebase/config';
import { toTitleCase } from '../../../utils/textFormatters';
import { createClientAuditLog } from '../../unifiedAuditService';

/**
 * Agrega una nota al historial del cliente
 */
export const addNotaToHistorial = async (clienteId, nota, userName) => {
    if (!nota || !nota.trim()) {
        throw new Error("La nota no puede estar vacía.");
    }

    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);

    if (!clienteSnap.exists()) {
        throw new Error("El cliente no existe.");
    }

    const clienteData = clienteSnap.data();
    const clienteNombre = toTitleCase(`${clienteData.datosCliente.nombres} ${clienteData.datosCliente.apellidos}`);

    await createClientAuditLog(
        'ADD_NOTE',
        {
            id: clienteId,
            nombre: clienteNombre,
            numeroDocumento: clienteId
        },
        {
            actionData: {
                contenidoNota: nota
            }
        }
    );
};

/**
 * Edita una nota existente del historial
 */
export const updateNotaHistorial = async (notaOriginal, nuevoTexto, userName) => {
    const notaRef = doc(db, "audits", notaOriginal.id);

    await updateDoc(notaRef, {
        message: nuevoTexto,
        editado: true,
        fechaEdicion: new Date(),
        editadoPor: userName
    });

    const clienteNombre = notaOriginal.details.clienteNombre || '[Cliente no encontrado]';

    await createClientAuditLog(
        'EDIT_NOTE',
        {
            id: notaOriginal.details.clienteId,
            nombre: clienteNombre,
            numeroDocumento: notaOriginal.details.clienteId
        },
        {
            actionData: {
                notaId: notaOriginal.id,
                contenidoAnterior: notaOriginal.message,
                contenidoNuevo: nuevoTexto
            }
        }
    );
};
