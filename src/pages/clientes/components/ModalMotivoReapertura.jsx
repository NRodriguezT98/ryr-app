// src/pages/clientes/components/ModalMotivoReapertura.jsx

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, RotateCcw, FileText, Info, CheckCircle } from 'lucide-react';
import { FormModal } from '../../../components/modals';

const ModalMotivoReapertura = ({ isOpen, onClose, onConfirm, titulo, nombrePaso }) => {
    const [motivo, setMotivo] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef(null);
    const MIN_CHARS = 15;
    const MAX_CHARS = 250;

    useEffect(() => {
        if (isOpen) {
            setMotivo('');
            // Auto-focus en el textarea cuando se abre
            setTimeout(() => textareaRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (motivo.trim().length >= MIN_CHARS) {
            onConfirm(motivo);
            onClose();
        }
    };

    const isValid = motivo.trim().length >= MIN_CHARS;
    const progress = Math.min((motivo.length / MIN_CHARS) * 100, 100);

    // Icono para el header con animación
    const headerIcon = (
        <div className="relative">
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-yellow-500 dark:from-orange-600 dark:to-yellow-600 rounded-xl shadow-lg">
                <RotateCcw className="w-6 h-6 text-white animate-[spin_3s_ease-in-out_infinite]" />
            </div>
            {/* Badge decorativo */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800">
                <AlertTriangle className="w-3 h-3 text-white" />
            </div>
        </div>
    );

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleSubmit}
            title={titulo}
            icon={headerIcon}
            size="xl"
            variant="warning"
            submitText={isValid ? '✓ Confirmar Reapertura' : '⏳ Completa el motivo'}
            cancelText="Cancelar"
            disabled={!isValid}
            isDirty={motivo.trim().length > 0}
            maxHeight="max-h-[calc(100vh-10rem)]"
        >
            {/* Banner informativo */}
            <div className="mb-6 flex items-start gap-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-l-4 border-orange-400 dark:border-orange-500 rounded-lg shadow-sm">
                <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800 dark:text-orange-200">
                    <strong className="font-semibold">Importante:</strong> Esta acción quedará registrada en el historial de auditoría del cliente
                </p>
            </div>

            {/* Info del paso con diseño moderno */}
            <div className="mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 dark:from-blue-400/5 dark:to-indigo-400/5 rounded-full blur-2xl"></div>

                <div className="relative flex items-start gap-3 p-5 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-blue-50 dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800/50 rounded-xl shadow-sm backdrop-blur-sm">
                    <div className="flex-shrink-0 p-2.5 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                            Paso a reabrir
                        </p>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100 truncate">
                            {nombrePaso}
                        </p>
                    </div>
                </div>
            </div>

            {/* Campo de texto mejorado con diseño moderno */}
            <div className="space-y-3">
                <label htmlFor="motivo-reapertura" className="flex items-center gap-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                    <span>Motivo de la reapertura</span>
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">*</span>
                </label>

                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        id="motivo-reapertura"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        rows={6}
                        maxLength={MAX_CHARS}
                        className={`
                            block w-full rounded-xl border-2 px-4 py-3
                            shadow-sm sm:text-sm 
                            dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 
                            transition-all duration-200 resize-none
                            focus:outline-none
                            ${isFocused
                                ? 'border-orange-500 ring-4 ring-orange-500/10 dark:border-orange-400 dark:ring-orange-400/10 shadow-md'
                                : isValid
                                    ? 'border-green-400 dark:border-green-600 shadow-sm'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }
                        `}
                        placeholder="Describe claramente el motivo de la reapertura. Ejemplo: El cliente solicitó actualizar la cláusula 4 del contrato debido a cambios en las condiciones acordadas..."
                    />

                    {/* Indicador de validación con animación */}
                    {motivo.length > 0 && (
                        <div className={`
                            absolute right-3 top-3 
                            transition-all duration-300 ease-out
                            ${isValid ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-45'}
                        `}>
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 ring-2 ring-white dark:ring-gray-800">
                                <CheckCircle className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Barra de progreso y contador con diseño mejorado */}
                <div className="space-y-2.5">
                    {/* Barra de progreso animada */}
                    {!isValid && motivo.length > 0 && (
                        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 bg-[length:200%_100%] rounded-full transition-all duration-300 ease-out animate-[shimmer_2s_ease-in-out_infinite]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}

                    {/* Contador y mensajes de validación */}
                    <div className="flex justify-between items-center text-xs">
                        {isValid ? (
                            <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold animate-[fadeIn_0.3s_ease-in]">
                                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                                </div>
                                ¡Listo para confirmar!
                            </span>
                        ) : motivo.length > 0 ? (
                            <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
                                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                                Faltan {MIN_CHARS - motivo.length} caracteres
                            </span>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400 font-medium">
                                Mínimo {MIN_CHARS} caracteres requeridos
                            </span>
                        )}

                        <span className={`
                            font-mono font-bold tabular-nums transition-colors duration-200
                            ${motivo.length > MAX_CHARS * 0.9
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }
                        `}>
                            {motivo.length} / {MAX_CHARS}
                        </span>
                    </div>

                    {/* Mensaje de ayuda cuando está cerca del límite */}
                    {motivo.length > MAX_CHARS * 0.9 && (
                        <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg animate-[fadeIn_0.3s_ease-in]">
                            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                                Estás cerca del límite de caracteres
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </FormModal>
    );
};

export default ModalMotivoReapertura;