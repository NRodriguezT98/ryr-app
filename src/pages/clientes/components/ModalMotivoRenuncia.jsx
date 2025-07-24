import React from 'react';
import Modal from '../../../components/Modal.jsx';
import Select from 'react-select';
import { UserX } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import { formatCurrency, getTodayString } from '../../../utils/textFormatters';
import { useMotivoRenuncia } from '../../../hooks/clientes/useMotivoRenuncia';
import { AnimatePresence, motion } from 'framer-motion';

const motivosOptions = [
    {
        label: "Motivos Financieros",
        options: [
            { value: 'Crédito Negado', label: 'Crédito Negado por el Banco' },
            { value: 'Subsidio Insuficiente', label: 'Subsidio Insuficiente o No Aprobado' }
        ]
    },
    {
        label: "Decisión del Cliente",
        options: [
            { value: 'Desistimiento Voluntario', label: 'Desistimiento Voluntario del Cliente' },
            { value: 'Cambio de Circunstancias Personales', label: 'Cambio en Circunstancias Personales' },
            { value: 'Encontró otra Propiedad', label: 'Encontró otra Propiedad' }
        ]
    },
    {
        label: "Motivos Operativos (Constructora)",
        options: [
            { value: 'Incumplimiento de Pagos', label: 'Incumplimiento en el Plan de Pagos' },
            { value: 'Retrasos en la Entrega', label: 'Retrasos en la Entrega de la Vivienda' },
            { value: 'Inconformidad con el Inmueble', label: 'Inconformidad con el Inmueble' }
        ]
    },
    {
        label: "Otro",
        options: [
            { value: 'Otro', label: 'Otro Motivo (Especificar abajo)' }
        ]
    }
];

// --- INICIO DE LA CORRECCIÓN ---
// Se añade la función 'getSelectStyles' que faltaba.
const getSelectStyles = (hasError) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: 'var(--color-bg-form)',
        borderColor: hasError ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#4b5563'),
        '&:hover': {
            borderColor: hasError ? '#ef4444' : '#3b82f6',
        },
        boxShadow: 'none',
    }),
    singleValue: (base) => ({ ...base, color: 'var(--color-text-form)' }),
    menu: (base) => ({ ...base, backgroundColor: 'var(--color-bg-form)' }),
    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#2563eb' : 'var(--color-bg-form)', color: state.isFocused ? 'white' : 'var(--color-text-form)' }),
    input: (base) => ({ ...base, color: 'var(--color-text-form)' }),
});
// --- FIN DE LA CORRECCIÓN ---

const ModalMotivoRenuncia = ({ isOpen, onClose, onConfirm, cliente }) => {
    const { formData, errors, calculos, handlers } = useMotivoRenuncia(cliente, onConfirm);
    const { motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo, aplicaPenalidad } = formData;
    const { totalAbonado, montoPenalidadNum, totalADevolver, minDate } = calculos;
    const { setMotivo, setObservacion, setFechaRenuncia, setPenalidadMonto, setPenalidadMotivo, setAplicaPenalidad, handleConfirmar } = handlers;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Motivo de Renuncia"
            icon={<UserX size={28} className="text-orange-500" />}
        >
            <style>{`
                :root {
                  --color-bg-form: ${document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff'};
                  --color-text-form: ${document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937'};
                }
            `}</style>
            <div className="space-y-4">
                <p className="text-center text-gray-600 dark:text-gray-400 -mt-4 mb-4">
                    Estás iniciando el proceso de renuncia para <strong className='text-gray-800 dark:text-gray-200'>{cliente?.datosCliente?.nombres} {cliente?.datosCliente?.apellidos}</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-200">Fecha de Renuncia</label>
                        <input
                            type="date"
                            value={fechaRenuncia}
                            onChange={(e) => setFechaRenuncia(e.target.value)}
                            min={minDate}
                            max={getTodayString()}
                            className={`w-full border p-2 rounded-lg dark:bg-gray-700 ${errors.fechaRenuncia ? 'border-red-500' : 'dark:border-gray-600'}`}
                        />
                        {errors.fechaRenuncia && <p className="text-red-600 text-sm mt-1">{errors.fechaRenuncia}</p>}
                    </div>
                    <div>
                        <label className="block font-medium mb-1 dark:text-gray-200">Motivo Principal</label>
                        <Select
                            options={motivosOptions}
                            value={motivo}
                            onChange={setMotivo}
                            placeholder="Selecciona un motivo..."
                            styles={getSelectStyles(!!errors.motivo)}
                        />
                        {errors.motivo && <p className="text-red-600 text-sm mt-1">{errors.motivo}</p>}
                    </div>
                </div>

                {motivo?.value === 'Otro' && (
                    <div className='animate-fade-in'>
                        <label className="block font-medium mb-1 dark:text-gray-200">Especifica el motivo</label>
                        <textarea
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            rows="2"
                            className={`w-full border p-2 rounded-lg text-sm dark:bg-gray-700 ${errors.observacion ? 'border-red-500' : 'dark:border-gray-600'}`}
                            placeholder="Detalla aquí la razón específica de la renuncia..."
                        />
                        {errors.observacion && <p className="text-red-600 text-sm mt-1">{errors.observacion}</p>}
                    </div>
                )}

                <div className="pt-4 mt-4 border-t dark:border-gray-600 space-y-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={aplicaPenalidad}
                            onChange={(e) => setAplicaPenalidad(e.target.checked)}
                            className="h-5 w-5 rounded text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-500 dark:bg-gray-700"
                        />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">¿Desea aplicar penalidad?</span>
                    </label>

                    <AnimatePresence>
                        {aplicaPenalidad && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dashed dark:border-gray-700">
                                    <div>
                                        <label className="block font-medium mb-1 dark:text-gray-200">Monto de Penalidad</label>
                                        <NumericFormat
                                            value={penalidadMonto}
                                            onValueChange={(values) => setPenalidadMonto(values.value)}
                                            className={`w-full border p-2 rounded-lg dark:bg-gray-700 ${errors.penalidadMonto ? 'border-red-500' : 'dark:border-gray-600'}`}
                                            thousandSeparator="." decimalSeparator="," prefix="$ "
                                        />
                                        {errors.penalidadMonto && <p className="text-red-600 text-sm mt-1">{errors.penalidadMonto}</p>}
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1 dark:text-gray-200">Motivo de Penalidad</label>
                                        <input
                                            type="text"
                                            value={penalidadMotivo}
                                            onChange={(e) => setPenalidadMotivo(e.target.value)}
                                            className={`w-full border p-2 rounded-lg dark:bg-gray-700 ${errors.penalidadMotivo ? 'border-red-500' : 'dark:border-gray-600'}`}
                                            placeholder="Ej: Cláusula de incumplimiento"
                                        />
                                        {errors.penalidadMotivo && <p className="text-red-600 text-sm mt-1">{errors.penalidadMotivo}</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Total Abonado:</span><span className="font-medium dark:text-gray-100">{formatCurrency(totalAbonado)}</span></div>
                    {aplicaPenalidad && montoPenalidadNum > 0 && (
                        <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-300">Penalidad:</span><span className="font-medium text-red-600 dark:text-red-400">- {formatCurrency(montoPenalidadNum)}</span></div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-blue-700 mt-2"><span className="dark:text-gray-100">Total a Devolver:</span><span className="text-green-600 dark:text-green-400">{formatCurrency(totalADevolver)}</span></div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t dark:border-gray-700">
                    <button onClick={onClose} type="button" className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold px-6 py-2 rounded-lg transition">Cancelar</button>
                    <button onClick={handleConfirmar} disabled={!motivo} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg disabled:bg-gray-300">
                        Continuar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ModalMotivoRenuncia;