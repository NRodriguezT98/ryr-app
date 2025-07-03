import React, { useMemo } from 'react';
import { useForm } from '../../../hooks/useForm';
import toast from 'react-hot-toast';
import { marcarDevolucionComoPagada } from '../../../utils/storage';
import Modal from '../../../components/Modal';
import FileUpload from '../../../components/FileUpload';
import { CheckCircle } from 'lucide-react';

const getTodayString = () => new Date().toISOString().split('T')[0];

const ModalGestionarDevolucion = ({ isOpen, onClose, onSave, renuncia }) => {

    const initialState = useMemo(() => ({
        fechaDevolucion: getTodayString(),
        observacionDevolucion: '',
        urlComprobanteDevolucion: null
    }), []);

    const { formData, handleInputChange, handleValueChange, handleSubmit, isSubmitting } = useForm({
        initialState,
        onSubmit: async (data) => {
            try {
                await marcarDevolucionComoPagada(renuncia.id, data);
                toast.success('Devolución registrada con éxito.');
                onSave();
                onClose();
            } catch (error) {
                toast.error('No se pudo registrar la devolución.');
                console.error("Error al registrar devolución:", error);
            }
        }
    });

    const handleUploadSuccess = (url) => {
        handleValueChange('urlComprobanteDevolucion', url);
    };

    const handleRemoveFile = () => {
        handleValueChange('urlComprobanteDevolucion', null);
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Devolución de Dinero"
            icon={<CheckCircle size={28} className="text-green-600" />}
        >
            <p className="text-center text-gray-500 -mt-4 mb-6">
                Estás a punto de marcar la renuncia de <strong className='text-gray-700'>{renuncia.clienteNombre}</strong> como pagada.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-medium mb-1" htmlFor="fechaDevolucion">Fecha de Devolución</label>
                    <input
                        type="date" id="fechaDevolucion" name="fechaDevolucion"
                        value={formData.fechaDevolucion} onChange={handleInputChange} max={getTodayString()}
                        className="w-full border p-2.5 rounded-lg border-gray-300"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1" htmlFor="observacionDevolucion">Observaciones (Opcional)</label>
                    <textarea
                        id="observacionDevolucion" name="observacionDevolucion" rows="3"
                        value={formData.observacionDevolucion} onChange={handleInputChange}
                        className="w-full border p-2.5 rounded-lg border-gray-300 text-sm"
                        placeholder="Ej: Se realizó transferencia a la cuenta de ahorros del cliente."
                    />
                </div>
                <div>
                    <FileUpload
                        label="Soporte de Devolución (Opcional)"
                        filePath={(fileName) => `documentos_renuncias/${renuncia.id}/${fileName}`}
                        currentFileUrl={formData.urlComprobanteDevolucion}
                        onUploadSuccess={handleUploadSuccess}
                        onRemove={handleRemoveFile}
                    />
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
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