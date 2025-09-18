import React, { useState } from 'react';
import { AlertTriangle, User, Home, Building2, DollarSign, Calendar, Loader } from 'lucide-react';
import Modal from '../../../components/Modal';
import { formatCurrency, formatDisplayDate } from '../../../utils/textFormatters';
import Button from '../../../components/Button';

const ModalAnularAbono = ({ isOpen, onClose, onAnulacionConfirmada, abonoAAnular, isSubmitting, size = '2xl' }) => {
    const [motivo, setMotivo] = useState('');

    const handleConfirm = () => {
        if (motivo.trim()) {
            onAnulacionConfirmada(motivo);
        }
    };

    const handleClose = () => {
        setMotivo('');
        onClose();
    };

    const isBotonDeshabilitado = !motivo.trim() || isSubmitting;

    // ✨ LA SOLUCIÓN: Leemos las propiedades directamente del objeto 'abonoAAnular'
    const montoFormateado = abonoAAnular ? formatCurrency(abonoAAnular.monto) : 'No disponible';
    const fechaFormateada = abonoAAnular ? formatDisplayDate(abonoAAnular.fechaPago) : 'No disponible';
    const nombreProyecto = abonoAAnular?.proyectoNombre || 'No disponible';
    const nombreCliente = abonoAAnular?.clienteInfo || 'No disponible';
    // Se lee directamente la propiedad 'viviendaInfo' que ya viene preparada del hook.
    const infoVivienda = abonoAAnular?.viviendaInfo || 'No disponible';

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Anular Abono"
            size={size}
        >
            <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Vas a anular el siguiente abono. Esta acción recalculará los saldos de la vivienda y no se puede deshacer.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InfoItem icon={<User className="text-purple-500" />} label="Cliente" value={nombreCliente} />
                        <InfoItem icon={<Home className="text-teal-500" />} label="Vivienda" value={infoVivienda} />
                        <InfoItem icon={<Building2 className="text-orange-500" />} label="Proyecto" value={nombreProyecto} />
                    </div>
                    <hr className="border-gray-200 dark:border-gray-600" />
                    <div className="flex justify-between items-start">
                        <InfoItem icon={<DollarSign className="text-green-500" />} label="Monto del Abono" value={montoFormateado} isLarge={true} />
                        <InfoItem icon={<Calendar className="text-blue-500" />} label="Fecha del Abono" value={fechaFormateada} />
                    </div>
                </div>
                <hr className="my-4 border-gray-200 dark:border-gray-600" />

                <div>
                    <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                        Motivo de la anulación (obligatorio)
                    </label>
                    <textarea
                        id="motivo"
                        name="motivo"
                        rows={3}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-red-500 focus:border-red-500 px-3 py-2"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Error al digitar el monto, pago duplicado..."
                    />
                </div>

                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse items-center">
                    <div className="relative">
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleConfirm}
                            disabled={isBotonDeshabilitado}
                            isLoading={isSubmitting}
                            loadingText="Anulando..."
                            className="w-full sm:ml-3 sm:w-auto"
                        >
                            Confirmar Anulación
                        </Button>
                        {isBotonDeshabilitado && !isSubmitting && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-700 text-white text-xs rounded py-1 px-2 pointer-events-none opacity-90">
                                Debes ingresar un motivo para anular.
                            </div>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="mt-3 w-full sm:mt-0 sm:w-auto"
                    >
                        Cancelar
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const InfoItem = ({ icon, label, value, isLarge = false }) => (
    <div className="flex items-start">
        <div className={`flex-shrink-0 mt-1 ${isLarge ? 'w-6' : 'w-5'}`}>{icon}</div>
        <div className="ml-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`font-semibold text-gray-800 dark:text-gray-200 ${isLarge ? 'text-lg' : 'text-base'}`}>{value}</p>
        </div>
    </div>
);

export default ModalAnularAbono;