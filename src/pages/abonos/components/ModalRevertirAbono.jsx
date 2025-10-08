// src/pages/abonos/components/ModalRevertirAbono.jsx

import React, { useState } from 'react';
import { RefreshCw, User, Home, Building2, DollarSign, Calendar, Loader } from 'lucide-react';
import Modal from '../../../components/Modal';
import { formatCurrency, formatDisplayDate } from '../../../utils/textFormatters';
import Button from '../../../components/Button';

const ModalRevertirAbono = ({ isOpen, onClose, onConfirm, abonoARevertir, isSubmitting, size = '2xl' }) => {
    const [motivo, setMotivo] = useState('');

    const handleConfirm = () => {
        // La validación se hace aquí, igual que en tu modal de anulación
        if (motivo.trim().length >= 10) {
            onConfirm(motivo);
        }
    };

    const handleClose = () => {
        setMotivo('');
        onClose();
    };

    const isBotonDeshabilitado = motivo.trim().length < 10 || isSubmitting;

    // Leemos las propiedades del abono a revertir
    const montoFormateado = abonoARevertir ? formatCurrency(abonoARevertir.monto) : 'No disponible';
    const fechaFormateada = abonoARevertir ? formatDisplayDate(abonoARevertir.fechaPago) : 'No disponible';
    const nombreProyecto = abonoARevertir?.proyectoNombre || 'No disponible';
    const nombreCliente = abonoARevertir?.nombreCompletoCliente || 'No disponible';
    const infoVivienda = abonoARevertir?.viviendaInfo || 'No disponible';

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Revertir Anulación de Abono"
            size={size}
        >
            <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>Vas a reactivar el siguiente abono. Esta acción recalculará los saldos de la vivienda. Por favor, indica el motivo.</p>
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
                    <label htmlFor="motivo-reversion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <RefreshCw className="w-4 h-4 mr-2 text-blue-500" />
                        Motivo de la reversión (obligatorio)
                    </label>
                    <textarea
                        id="motivo-reversion"
                        name="motivo"
                        rows={3}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Se anuló por error, el pago sí fue confirmado..."
                    />
                </div>

                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse items-center">
                    <div className="relative">
                        <Button
                            type="button"
                            variant="primary" // Cambiado de 'danger' a 'primary'
                            onClick={handleConfirm}
                            disabled={isBotonDeshabilitado}
                            isLoading={isSubmitting}
                            loadingText="Confirmando..."
                            className="w-full sm:ml-3 sm:w-auto"
                        >
                            Confirmar Reversión
                        </Button>
                        {isBotonDeshabilitado && !isSubmitting && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-gray-700 text-white text-xs rounded py-1 px-2 pointer-events-none opacity-90">
                                Debes ingresar un motivo (mín. 10 caracteres).
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

// Componente interno para mostrar la información, igual al de tu modal de anulación
const InfoItem = ({ icon, label, value, isLarge = false }) => (
    <div className="flex items-start">
        <div className={`flex-shrink-0 mt-1 ${isLarge ? 'w-6' : 'w-5'}`}>{icon}</div>
        <div className="ml-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`font-semibold text-gray-800 dark:text-gray-200 ${isLarge ? 'text-lg' : 'text-base'}`}>{value}</p>
        </div>
    </div>
);

export default ModalRevertirAbono;