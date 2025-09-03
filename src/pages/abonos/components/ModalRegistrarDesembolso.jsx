import React from 'react';
import Modal from '../../../components/Modal';
import { Banknote, FileText, XCircle, Gift, Landmark } from 'lucide-react'; // Añadimos iconos
import { useRegistrarDesembolso } from '../../../hooks/abonos/useRegistrarDesembolso';
import { formatCurrency, getTodayString } from '../../../utils/textFormatters';
import FileUpload from '../../../components/FileUpload';
import { FUENTE_PROCESO_MAP } from '../../../utils/procesoConfig';

// Un pequeño helper para seleccionar el icono correcto
const ICONS = {
    credito: <Banknote size={28} className="text-blue-600" />,
    subsidioVivienda: <Gift size={28} className="text-green-600" />,
    subsidioCaja: <Banknote size={28} className="text-purple-600" />,
};

const ModalRegistrarDesembolso = ({ isOpen, onClose, onSave, fuenteData }) => {
    // Protección por si el modal se renderiza sin datos
    if (!fuenteData) return null;

    const { formData, isSubmitting, errors, handlers } = useRegistrarDesembolso(fuenteData, isOpen, onSave, onClose);

    // --- LÓGICA DINÁMICA ---
    const { fuente, titulo, abonos, montoPactado, cliente } = fuenteData;
    const montoADesembolsar = montoPactado - abonos.reduce((sum, a) => sum + a.monto, 0);

    // 1. Buscamos el paso de prerrequisito dinámicamente usando la 'fuente'
    const pasoConfig = FUENTE_PROCESO_MAP[fuente];
    const pasoSolicitud = cliente.proceso?.[pasoConfig.solicitudKey];
    const minDate = (pasoSolicitud?.completado && pasoSolicitud.fecha) ? pasoSolicitud.fecha : null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            // 2. Título e Icono ahora son dinámicos
            title={`Registrar Desembolso de ${titulo}`}
            icon={ICONS[fuente] || <Banknote size={28} className="text-gray-600" />}
            size="2xl"
        >
            <form onSubmit={handlers.handleSubmit} noValidate className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    {/* 3. Mensaje dinámico */}
                    <p className="text-sm text-gray-600 dark:text-gray-300">Se registrará un abono por el monto total pendiente de esta fuente:</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(montoADesembolsar)}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-200" htmlFor="fechaPago">Fecha del Desembolso</label>
                        <input
                            type="date"
                            id="fechaPago"
                            name="fechaPago"
                            value={formData.fechaPago}
                            onChange={handlers.handleInputChange}
                            min={minDate}
                            max={getTodayString()}
                            className={`w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:text-white ${errors.fechaPago ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                        />
                        {errors.fechaPago && <p className="text-red-600 text-sm mt-1">{errors.fechaPago}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="block font-medium mb-1 dark:text-gray-200">Comprobante de Pago <span className="text-red-500">*</span></label>
                        {formData.urlComprobante ? (
                            <div className="bg-green-50 dark:bg-green-900/50 border-2 border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center justify-between">
                                <div className='flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold text-sm'>
                                    <FileText size={16} />
                                    <a href={formData.urlComprobante} target="_blank" rel="noopener noreferrer" className="hover:underline">Ver Comprobante</a>
                                </div>
                                <button type="button" onClick={() => handlers.handleFileChange(null)} className="p-1 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Eliminar"><XCircle size={18} /></button>
                            </div>
                        ) : (
                            <FileUpload
                                label="Subir Comprobante"
                                filePath={(fileName) => `comprobantes_desembolso/${cliente.id}/${fuente}-${fileName}`}
                                onUploadSuccess={handlers.handleFileChange}
                                disabled={!cliente.id}
                            />
                        )}
                        {errors.urlComprobante && <p className="text-red-600 text-sm mt-1">{errors.urlComprobante}</p>}
                    </div>
                </div>

                <div>
                    <label htmlFor="observacion" className="block font-medium mb-1 dark:text-gray-200">Observaciones (Opcional)</label>
                    <textarea
                        id="observacion" name="observacion" rows="3"
                        value={formData.observacion} onChange={handlers.handleInputChange}
                        className="w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
                        placeholder="Añade cualquier detalle adicional sobre el desembolso."
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-400">
                        {isSubmitting ? 'Registrando...' : 'Confirmar Desembolso'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ModalRegistrarDesembolso;