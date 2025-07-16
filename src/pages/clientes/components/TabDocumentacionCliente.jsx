import React, { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { updateCliente } from '../../../utils/storage';
import DocumentoRow from '../../../components/documentos/DocumentoRow';
import ModalConfirmacion from '../../../components/ModalConfirmacion'; // <-- 1. Importamos el modal

const TabDocumentacionCliente = ({ cliente, onDatosRecargados }) => {

    if (!cliente) {
        return <p className="p-4 text-center text-gray-500">No hay información de cliente disponible.</p>;
    }

    // --- 2. AÑADIMOS ESTADO PARA MANEJAR EL MODAL ---
    const [documentoAEliminar, setDocumentoAEliminar] = useState(null);

    const datosCliente = cliente.datosCliente || {};
    const financiero = cliente.financiero || {};

    const handleFileUpload = useCallback(async (fieldPath, url) => {
        const clienteActualizado = JSON.parse(JSON.stringify(cliente));

        const keys = fieldPath.split('.');
        let current = clienteActualizado;
        for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = current[keys[i]] || {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = url;

        try {
            const { vivienda, ...datosParaGuardar } = clienteActualizado;
            await updateCliente(cliente.id, datosParaGuardar, cliente.viviendaId);
            toast.success('Documento actualizado correctamente.');
            onDatosRecargados();
        } catch (error) {
            console.error("Error al actualizar el documento:", error);
            toast.error("No se pudo actualizar el documento.");
        } finally {
            setDocumentoAEliminar(null); // Cerramos el modal después de la acción
        }
    }, [cliente, onDatosRecargados]);

    const todosLosPosiblesDocumentos = [
        { label: "Cédula de Ciudadanía", isRequired: true, currentFileUrl: datosCliente.urlCedula, fieldPath: 'datosCliente.urlCedula', filePath: (fileName) => `documentos_clientes/${cliente.id}/cedula-${fileName}` },
        { label: "Carta Aprobación Crédito", isRequired: financiero.aplicaCredito, currentFileUrl: financiero.credito?.urlCartaAprobacion, fieldPath: 'financiero.credito.urlCartaAprobacion', filePath: (fileName) => `documentos_clientes/${cliente.id}/aprobacion-credito-${fileName}` },
        { label: "Soporte Subsidio Mi Casa Ya", isRequired: financiero.aplicaSubsidioVivienda, currentFileUrl: financiero.subsidioVivienda?.urlSoporte, fieldPath: 'financiero.subsidioVivienda.urlSoporte', filePath: (fileName) => `documentos_clientes/${cliente.id}/subsidio-vivienda-${fileName}` },
        { label: "Soporte Subsidio Caja Comp.", isRequired: financiero.aplicaSubsidioCaja, currentFileUrl: financiero.subsidioCaja?.urlSoporte, fieldPath: 'financiero.subsidioCaja.urlSoporte', filePath: (fileName) => `documentos_clientes/${cliente.id}/subsidio-caja-${fileName}` }
    ];

    const documentosRequeridos = todosLosPosiblesDocumentos.filter(doc => doc.isRequired);

    return (
        <>
            <div className="animate-fade-in bg-white border rounded-xl shadow-sm">
                <div className="p-4 border-b">
                    <h3 className="font-bold text-lg">Lista de Documentos Requeridos</h3>
                </div>
                <div className="divide-y">
                    {documentosRequeridos.length > 0 ? (
                        documentosRequeridos.map(doc => (
                            <DocumentoRow
                                key={doc.label}
                                label={doc.label}
                                isRequired={doc.isRequired}
                                currentFileUrl={doc.currentFileUrl}
                                filePath={doc.filePath}
                                onUploadSuccess={(url) => handleFileUpload(doc.fieldPath, url)}
                                // --- 3. AHORA 'onRemove' ABRE EL MODAL ---
                                onRemove={() => setDocumentoAEliminar(doc)}
                                disabled={!cliente.id}
                            />
                        ))
                    ) : (
                        <p className="p-4 text-center text-gray-500">Este cliente no tiene documentos requeridos según su estructura financiera.</p>
                    )}
                </div>
            </div>

            {/* --- 4. RENDERIZADO CONDICIONAL DEL MODAL --- */}
            {documentoAEliminar && (
                <ModalConfirmacion
                    isOpen={!!documentoAEliminar}
                    onClose={() => setDocumentoAEliminar(null)}
                    onConfirm={() => handleFileUpload(documentoAEliminar.fieldPath, null)}
                    titulo="¿Eliminar Documento?"
                    mensaje={`¿Estás seguro de que deseas eliminar el documento "${documentoAEliminar.label}"? Esta acción no se puede deshacer.`}
                />
            )}
        </>
    );
};

export default TabDocumentacionCliente;