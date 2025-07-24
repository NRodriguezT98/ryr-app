import React from 'react';
import { useGestionarDevolucion } from '../../../hooks/renuncias/useGestionarDevolucion';
import Modal from '../../../components/Modal';
import FileUpload from '../../../components/FileUpload';
import { CheckCircle, FileText, XCircle } from 'lucide-react';
import { getTodayString } from '../../../utils/textFormatters';

const ModalGestionarDevolucion = ({ isOpen, onClose, onSave, renuncia }) => {
    const { formData, errors, isSubmitting, handlers } = useGestionarDevolucion(renuncia, onSave, onClose);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Devolución de Dinero"
            icon={<CheckCircle size={28} className="text-green-600" />}
        >
            <p className="text-center text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                Estás a punto de marcar la renuncia de <strong className='text-gray-700 dark:text-gray-200'>{renuncia.clienteNombre}</strong> como cerrada.
            </p>
            <form onSubmit={handlers.handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-medium mb-1 dark:text-gray-200" htmlFor="fechaDevolucion">Fecha de Devolución</label>
                    <input
                        type="date" id="fechaDevolucion" name="fechaDevolucion"
                        value={formData.fechaDevolucion} onChange={handlers.handleInputChange}
                        min={renuncia.fechaRenuncia}
                        max={getTodayString()}
                        className={`w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:text-white ${errors.fechaDevolucion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                    />
                    {errors.fechaDevolucion && <p className="text-red-600 text-sm mt-1">{errors.fechaDevolucion}</p>}
                </div>
                <div>
                    <label className="block font-medium mb-1 dark:text-gray-200" htmlFor="observacionDevolucion">Observaciones (Opcional)</label>
                    <textarea
                        id="observacionDevolucion" name="observacionDevolucion" rows="3"
                        value={formData.observacionDevolucion} onChange={handlers.handleInputChange}
                        className="w-full border p-2.5 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="Ej: Se realizó transferencia a la cuenta de ahorros del cliente."
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                        Soporte de Devolución <span className="text-red-500">*</span>
                    </label>
                    {formData.urlComprobanteDevolucion ? (
                        <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center justify-between">
                            <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold'>
                                <FileText />
                                <a href={formData.urlComprobanteDevolucion} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    Ver Soporte Actual
                                </a>
                            </div>
                            <button
                                type="button"
                                onClick={handlers.handleRemoveFile}
                                className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                title="Eliminar soporte"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                    ) : (
                        <FileUpload
                            label="Subir Soporte"
                            filePath={(fileName) => `documentos_renuncias/${renuncia.id}/${fileName}`}
                            onUploadSuccess={handlers.handleUploadSuccess}
                        />
                    )}
                    {errors.urlComprobanteDevolucion && <p className="text-red-600 text-sm mt-1">{errors.urlComprobanteDevolucion}</p>}
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-400">
                        {isSubmitting ? 'Confirmando...' : 'Confirmar Devolución'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ModalGestionarDevolucion;