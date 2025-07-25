import React from 'react';
import { useCondonarSaldo } from '../../hooks/viviendas/useCondonarSaldo';
import Modal from '../../components/Modal.jsx';
import { HandCoins, FileText, XCircle, Loader } from 'lucide-react';
import { formatCurrency, getTodayString } from '../../utils/textFormatters';
import FileUpload from '../../components/FileUpload';

const CondonarSaldoModal = ({ isOpen, onClose, onSave, fuenteData }) => {
    const {
        formData,
        errors,
        isSubmitting,
        minDate, // <-- Recibimos la fecha mínima
        handlers
    } = useCondonarSaldo(fuenteData, onSave, onClose);

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Condonar Saldo de ${fuenteData.titulo}`}
            icon={<HandCoins size={28} className="text-green-500" />}
        >
            <form onSubmit={handlers.handleSubmit}>
                <div className="space-y-6">
                    <p className="text-center text-gray-500 dark:text-gray-400 -mt-4">
                        {`Se registrará un abono por el saldo restante de la fuente "${fuenteData.titulo}".`}
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 p-4 rounded-lg text-center">
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Monto a Condonar (Saldo Pendiente)</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{formatCurrency(fuenteData.saldoPendiente)}</p>
                    </div>

                    {/* --- INICIO DE LA MODIFICACIÓN --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium mb-1 dark:text-gray-200" htmlFor="fechaCondonacion">Fecha de Condonación <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                id="fechaCondonacion"
                                name="fechaCondonacion"
                                value={formData.fechaCondonacion}
                                onChange={handlers.handleInputChange}
                                min={minDate}
                                max={getTodayString()}
                                className={`w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:text-white ${errors.fechaCondonacion ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                            />
                            {errors.fechaCondonacion && <p className="text-red-600 text-sm mt-1">{errors.fechaCondonacion}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-medium mb-1 dark:text-gray-200" htmlFor="motivo">Motivo de la Condonación <span className="text-red-500">*</span></label>
                            <textarea
                                id="motivo"
                                name="motivo"
                                value={formData.motivo}
                                onChange={handlers.handleInputChange}
                                rows="3"
                                className={`w-full border p-2.5 rounded-lg text-sm dark:bg-gray-700 dark:text-white ${errors.motivo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                                placeholder="Ej: Aprobado por Gerencia por acuerdo de pago..."
                            />
                            {errors.motivo && <p className="text-red-600 text-sm mt-1">{errors.motivo}</p>}
                        </div>
                    </div>
                    {/* --- FIN DE LA MODIFICACIÓN --- */}

                    <div>
                        <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-200">
                            Soporte de Aprobación <span className="text-red-500">*</span>
                        </label>
                        {formData.urlSoporte ? (
                            <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center justify-between">
                                <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold'>
                                    <FileText />
                                    <a href={formData.urlSoporte} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        Ver Soporte
                                    </a>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handlers.handleValueChange('urlSoporte', null)}
                                    className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        ) : (
                            <FileUpload
                                label="Subir Soporte de Aprobación"
                                filePath={(fileName) => `documentos_condonaciones/${fuenteData.vivienda.id}/${fileName}`}
                                onUploadSuccess={(url) => handlers.handleValueChange('urlSoporte', url)}
                            />
                        )}
                        {errors.urlSoporte && <p className="text-red-600 text-sm mt-1">{errors.urlSoporte}</p>}
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-400 flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader size={18} className="animate-spin" /> : null}
                        {isSubmitting ? 'Procesando...' : 'Confirmar Condonación'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CondonarSaldoModal;