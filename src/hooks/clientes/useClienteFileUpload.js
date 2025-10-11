/**
 * 📁 Hook: useClienteFileUpload
 * 
 * Responsabilidad: Manejo unificado de subida de archivos
 * - Upload de documentos de cliente (cédula, etc.)
 * - Upload de documentos financieros (cartas de aprobación)
 * - Validaciones previas (cédula requerida)
 * - Toast notifications (loading, success, error)
 * - Actualización del estado via dispatch
 * 
 * Extraído de: useClienteForm.jsx (líneas 118-175)
 * ELIMINA DUPLICACIÓN: handleFileReplace y handleFinancialFileReplace eran 90% iguales
 * Complejidad: Media
 * Testing: Unit tests con mocks
 * Riesgo: 15% - Lógica crítica de archivos
 */

import { useCallback } from 'react';
import { useModernToast } from '../useModernToast.jsx';
import { uploadFile } from '../../services/fileService.js';

/**
 * Hook para gestionar la subida de archivos del cliente
 * 
 * @param {string} cedula - Cédula del cliente (requerida para path)
 * @param {Function} dispatch - Función dispatch del reducer
 * @returns {Object} { uploadClientFile, uploadFinancialFile, isUploading }
 * 
 * @example
 * const { uploadClientFile, uploadFinancialFile } = useClienteFileUpload(
 *   formData.datosCliente.cedula,
 *   dispatch
 * );
 * 
 * // Subir archivo de cliente
 * await uploadClientFile(file, 'urlCedula');
 * 
 * // Subir archivo financiero
 * await uploadFinancialFile(file, 'credito', 'urlCartaAprobacion');
 */
export const useClienteFileUpload = (cedula, dispatch) => {
    const toast = useModernToast();

    /**
     * Función genérica para subir cualquier archivo
     * Centraliza la lógica común de upload
     */
    const uploadGenericFile = useCallback(async (
        file,
        filePath,
        onSuccess,
        successMessage = '¡Archivo subido con éxito!'
    ) => {
        if (!file) {
            console.warn('No se proporcionó archivo');
            return null;
        }

        if (!cedula) {
            toast.error("Se requiere un número de cédula para subir el archivo.", {
                title: "Cédula Requerida"
            });
            return null;
        }

        const loadingToast = toast.loading('Subiendo archivo...');

        try {
            const downloadURL = await uploadFile(file, filePath);

            toast.dismiss(loadingToast);
            toast.success(successMessage, {
                title: "¡Archivo Actualizado!"
            });

            return downloadURL;
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('No se pudo subir el archivo.', {
                title: "Error de Subida"
            });
            console.error('Error al subir archivo:', error);
            return null;
        }
    }, [cedula, toast]);

    /**
     * Subir archivo de documento de cliente (cédula, etc.)
     * 
     * @param {File} file - Archivo a subir
     * @param {string} field - Campo del formulario ('urlCedula', etc.)
     * @returns {Promise<string|null>} URL del archivo o null si falla
     */
    const uploadClientFile = useCallback(async (file, field) => {
        if (!file) return null;

        const fileName = file.name;
        const filePath = `documentos_clientes/${cedula}/${field}-${fileName}`;

        const downloadURL = await uploadGenericFile(
            file,
            filePath,
            null,
            '¡Documento actualizado con éxito!'
        );

        if (downloadURL) {
            // Actualizar estado del formulario
            dispatch({
                type: 'UPDATE_DATOS_CLIENTE',
                payload: { field, value: downloadURL }
            });
        }

        return downloadURL;
    }, [cedula, dispatch, uploadGenericFile]);

    /**
     * Subir archivo financiero (cartas de aprobación, etc.)
     * 
     * @param {File} file - Archivo a subir
     * @param {string} section - Sección financiera ('credito', 'subsidioCaja')
     * @param {string} field - Campo del formulario ('urlCartaAprobacion')
     * @returns {Promise<string|null>} URL del archivo o null si falla
     */
    const uploadFinancialFile = useCallback(async (file, section, field) => {
        if (!file) return null;

        const fileName = file.name;
        const filePath = `documentos_clientes/${cedula}/${section}-${field}-${fileName}`;

        const downloadURL = await uploadGenericFile(
            file,
            filePath,
            null,
            '¡Documento financiero actualizado con éxito!'
        );

        if (downloadURL) {
            // Actualizar estado del formulario
            dispatch({
                type: 'UPDATE_FINANCIAL_FIELD',
                payload: { section, field, value: downloadURL }
            });
        }

        return downloadURL;
    }, [cedula, dispatch, uploadGenericFile]);

    /**
     * Subir archivo de documento general (promesa, etc.)
     * 
     * @param {File} file - Archivo a subir
     * @param {string} docId - ID del documento ('promesaEnviadaUrl', etc.)
     * @returns {Promise<string|null>} URL del archivo o null si falla
     */
    const uploadDocumentFile = useCallback(async (file, docId) => {
        if (!file) return null;

        const fileName = file.name;
        const filePath = `documentos_clientes/${cedula}/${docId}-${fileName}`;

        const downloadURL = await uploadGenericFile(
            file,
            filePath,
            null,
            '¡Documento actualizado con éxito!'
        );

        if (downloadURL) {
            // Actualizar estado del formulario
            dispatch({
                type: 'UPDATE_DOCUMENTO_URL',
                payload: { docId, url: downloadURL }
            });
        }

        return downloadURL;
    }, [cedula, dispatch, uploadGenericFile]);

    /**
     * Handler para eventos de input file
     * Extrae el archivo del evento y lo sube
     */
    const handleClientFileChange = useCallback(async (event, field) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadClientFile(file, field);
        }
    }, [uploadClientFile]);

    /**
     * Handler para eventos de input file financiero
     */
    const handleFinancialFileChange = useCallback(async (event, section, field) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadFinancialFile(file, section, field);
        }
    }, [uploadFinancialFile]);

    /**
     * Handler para eventos de input file de documento
     */
    const handleDocumentFileChange = useCallback(async (event, docId) => {
        const file = event.target.files?.[0];
        if (file) {
            await uploadDocumentFile(file, docId);
        }
    }, [uploadDocumentFile]);

    return {
        // Funciones principales
        uploadClientFile,
        uploadFinancialFile,
        uploadDocumentFile,

        // Handlers para eventos
        handleClientFileChange,
        handleFinancialFileChange,
        handleDocumentFileChange,

        // Función genérica (por si se necesita)
        uploadGenericFile
    };
};

export default useClienteFileUpload;
