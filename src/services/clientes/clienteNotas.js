/**
 * clienteNotas.js
 * 
 * Módulo para gestión de notas en el historial de clientes.
 * Permite añadir y editar notas de auditoría asociadas a clientes.
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { createAuditLog } from '../auditService';
import { toTitleCase } from '../../utils/textFormatters';

/**
 * Añade una nota al historial de un cliente.
 * 
 * @param {string} clienteId - ID del cliente.
 * @param {string} nota - Contenido de la nota a añadir.
 * @param {string} userName - Nombre del usuario que añade la nota.
 * @throws {Error} Si la nota está vacía.
 * 
 * @example
 * await addNotaToHistorial('cliente123', 'Cliente solicitó información adicional', 'Juan Pérez');
 */
export const addNotaToHistorial = async (clienteId, nota, userName) => {
    if (!nota || !nota.trim()) {
        throw new Error("La nota no puede estar vacía.");
    }

    // Obtenemos los datos del cliente para el mensaje de auditoría
    const clienteRef = doc(db, "clientes", clienteId);
    const clienteSnap = await getDoc(clienteRef);
    const clienteNombre = clienteSnap.exists()
        ? toTitleCase(`${clienteSnap.data().datosCliente.nombres} ${clienteSnap.data().datosCliente.apellidos}`)
        : '';

    // 1. Creamos un mensaje CORTO para el log general
    const auditMessage = `Añadió una nota al historial del cliente ${clienteNombre}`;

    // 2. Guardamos la NOTA COMPLETA dentro de los detalles
    await createAuditLog(
        auditMessage,
        {
            action: 'ADD_NOTE',
            clienteId: clienteId,
            clienteNombre: clienteNombre,
            nota: nota, // <-- Aquí guardamos el contenido de la nota
        }
    );
};

/**
 * Actualiza una nota existente en el historial.
 * 
 * @param {object} notaOriginal - Objeto completo del log de auditoría original.
 * @param {string} notaOriginal.id - ID del documento de auditoría.
 * @param {string} notaOriginal.message - Mensaje original de la nota.
 * @param {object} notaOriginal.details - Detalles del log (clienteId, clienteNombre).
 * @param {string} nuevoTexto - Nuevo contenido de la nota.
 * @param {string} userName - Nombre del usuario que edita la nota.
 * 
 * @example
 * await updateNotaHistorial(
 *   { id: 'audit123', message: 'Nota original', details: { clienteId: 'c1', clienteNombre: 'Juan Pérez' } },
 *   'Nota actualizada',
 *   'Admin'
 * );
 */
export const updateNotaHistorial = async (notaOriginal, nuevoTexto, userName) => {
    // La 'notaOriginal' es el objeto 'log' completo
    const notaRef = doc(db, "audits", notaOriginal.id);

    // 1. Actualizamos el mensaje de la nota original y añadimos la marca de edición
    await updateDoc(notaRef, {
        message: nuevoTexto,
        editado: true,
        fechaEdicion: new Date(),
        editadoPor: userName
    });

    const clienteNombre = notaOriginal.details.clienteNombre || '[Cliente no encontrado]';

    // Creamos el nuevo registro de auditoría para la acción de editar.
    await createAuditLog(
        `Editó una nota en el historial del cliente ${clienteNombre}`,
        {
            action: 'EDIT_NOTE',
            clienteId: notaOriginal.details.clienteId,
            notaId: notaOriginal.id,
            cambios: [{
                campo: "Contenido de la Nota",
                anterior: notaOriginal.message,
                actual: nuevoTexto
            }]
        }
    );
};
