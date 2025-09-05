// src/services/proyectoService.js
import { db } from '../firebase/config';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { toTitleCase } from '../utils/textFormatters';
import { createAuditLog } from './auditService';

export const addProyecto = async (proyectoData) => {
    const proyectoParaGuardar = {
        nombre: toTitleCase(proyectoData.nombre),
        fechaCreacion: serverTimestamp(),
    };

    // 1. Se crea el documento del proyecto en Firestore
    const docRef = await addDoc(collection(db, "proyectos"), proyectoParaGuardar);

    // --- INICIO DE LA MODIFICACIÓN ---
    // 2. Se crea el registro de auditoría inmediatamente después
    await createAuditLog(
        `Creó el proyecto "${proyectoParaGuardar.nombre}"`,
        {
            action: 'CREATE_PROJECT',
            proyectoId: docRef.id, // Guardamos el ID del nuevo proyecto
            proyectoNombre: proyectoParaGuardar.nombre
        }
    );
    // --- FIN DE LA MODIFICACIÓN ---
};

export const updateProyecto = async (proyectoId, datosNuevos) => {
    const proyectoRef = doc(db, "proyectos", proyectoId);

    // 1. Extraemos el nombre y los cambios del objeto que recibimos.
    const { nombre, cambios } = datosNuevos;

    // 2. Actualizamos el documento con el nuevo nombre.
    await updateDoc(proyectoRef, {
        nombre: toTitleCase(nombre)
    });

    // 3. Creamos el registro de auditoría con los cambios.
    await createAuditLog(
        `Actualizó el proyecto "${toTitleCase(nombre)}"`,
        {
            action: 'UPDATE_PROJECT',
            proyectoId: proyectoId,
            cambios: cambios
        }
    );
};

export const deleteProyecto = async (proyectoId, viviendas) => {
    // Regla de negocio: Verificar si hay viviendas asociadas a este proyecto
    const viviendasEnProyecto = viviendas.filter(v => v.proyectoId === proyectoId);
    if (viviendasEnProyecto.length > 0) {
        // Si hay viviendas, lanzamos un error para detener la eliminación
        throw new Error('PROYECTO_CON_VIVIENDAS');
    }

    // Si no hay viviendas, procedemos a eliminar
    const proyectoRef = doc(db, "proyectos", proyectoId);
    const proyectoSnap = await getDoc(proyectoRef);
    const proyectoData = proyectoSnap.data();

    await deleteDoc(proyectoRef);

    await createAuditLog(
        `Eliminó permanentemente el proyecto "${proyectoData.nombre}"`,
        {
            action: 'DELETE_PROJECT',
            proyectoId: proyectoId,
            proyectoNombre: proyectoData.nombre
        }
    );
};