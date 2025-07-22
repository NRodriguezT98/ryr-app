import React from 'react';
import { NumericFormat } from 'react-number-format';
import { Tooltip } from 'react-tooltip';
import { useDescuentoModal } from '../../hooks/viviendas/useDescuentoModal'; // 1. Importamos el nuevo hook
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import { formatCurrency } from '../../utils/textFormatters.js';
import Modal from '../../components/Modal.jsx';
import { Tag, Loader } from 'lucide-react';

const DescuentoModal = ({ isOpen, onClose, onSave, vivienda }) => {
    // 2. El componente ahora solo consume el hook
    const {
        formData,
        errors,
        isSubmitting,
        isConfirming,
        setIsConfirming,
        cambios,
        hayCambios,
        valorFinalCalculado,
        handlers
    } = useDescuentoModal(vivienda, onSave, onClose);

    if (!isOpen) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Gestionar Descuento"
                icon={<Tag size={28} className="text-purple-500" />}
            >
                <p className="text-center text-gray-500 dark:text-gray-400 -mt-4 mb-6">
                    {`Vivienda: Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}`}
                </p>
                <div className="space-y-6">
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-200" htmlFor="descuentoMonto">Monto del Descuento</label>
                        <NumericFormat id="descuentoMonto" name="descuentoMonto" value={formData.descuentoMonto} onValueChange={(values) => handlers.handleValueChange('descuentoMonto', values.value)} className={`w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.descuentoMonto ? 'border-red-500' : 'border-gray-300'}`} thousandSeparator="." decimalSeparator="," prefix="$ " />
                        {errors.descuentoMonto && <p className="text-red-600 text-sm mt-1">{errors.descuentoMonto}</p>}
                    </div>
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-200" htmlFor="descuentoMotivo">Motivo del Descuento (opcional si el monto es 0)</label>
                        <input type="text" id="descuentoMotivo" name="descuentoMotivo" value={formData.descuentoMotivo} onChange={handlers.handleInputChange} className={`w-full border p-2.5 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.descuentoMotivo ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.descuentoMotivo && <p className="text-red-600 text-sm mt-1">{errors.descuentoMotivo}</p>}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 p-4 rounded-lg mt-8 space-y-2">
                    <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Valor de Lista:</span><span className="font-medium dark:text-gray-200">{formatCurrency(vivienda.valorTotal)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600 dark:text-gray-400">Descuento Aplicado:</span><span className="font-medium text-red-500 dark:text-red-400">- {formatCurrency(parseInt(String(formData.descuentoMonto).replace(/\D/g, ''), 10) || 0)}</span></div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-600 mt-2">
                        <span className='dark:text-gray-200'>Valor Final:</span>
                        <span className="text-green-600 dark:text-green-400">{formatCurrency(valorFinalCalculado)}</span>
                    </div>
                </div>
                <div className="flex justify-end mt-8 pt-6 border-t dark:border-gray-700 space-x-4">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <span data-tooltip-id="app-tooltip" data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}>
                        <button
                            type="button"
                            onClick={handlers.handleInitialSubmit}
                            disabled={!hayCambios || isSubmitting}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader size={18} className="animate-spin" /> : null}
                            {isSubmitting ? 'Guardando...' : 'Guardar Descuento'}
                        </button>
                    </span>
                </div>
            </Modal>

            <ModalConfirmacion
                isOpen={isConfirming}
                onClose={() => setIsConfirming(false)}
                onConfirm={handlers.handleSubmit}
                titulo="Confirmar Descuento"
                cambios={cambios}
                isSubmitting={isSubmitting}
            />

            <Tooltip id="app-tooltip" />
        </>
    );
};

export default DescuentoModal;