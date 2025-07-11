import React, { useEffect, useState, useMemo, Fragment, useCallback } from "react";
import toast from 'react-hot-toast';
import { useForm } from "../../hooks/useForm.jsx";
import { validateVivienda } from "./viviendaValidation.js";
import { updateVivienda } from "../../utils/storage";
import { MapPin, FileText, CircleDollarSign, Check, Edit } from 'lucide-react';
import FormularioVivienda from "./FormularioVivienda";
import Modal from "../../components/Modal";
import ModalConfirmacion from '../../components/ModalConfirmacion.jsx';
import { Tooltip } from 'react-tooltip';
import { formatCurrency } from "../../utils/textFormatters.js";

const EditarVivienda = ({ isOpen, onClose, onSave, vivienda, todasLasViviendas }) => {
    const [step, setStep] = useState(1);
    const [isConfirming, setIsConfirming] = useState(false);
    const [cambios, setCambios] = useState([]);

    const initialState = useMemo(() => ({
        manzana: vivienda?.manzana || "",
        numero: vivienda?.numeroCasa?.toString() || "",
        matricula: vivienda?.matricula || "",
        nomenclatura: vivienda?.nomenclatura || "",
        linderoNorte: vivienda?.linderoNorte || "",
        linderoSur: vivienda?.linderoSur || "",
        linderoOriente: vivienda?.linderoOriente || "",
        linderoOccidente: vivienda?.linderoOccidente || "",
        urlCertificadoTradicion: vivienda?.urlCertificadoTradicion || null,
        valorBase: vivienda?.valorBase?.toString() || "0",
        esEsquinera: vivienda?.recargoEsquinera > 0,
        recargoEsquinera: vivienda?.recargoEsquinera?.toString() || "0",
    }), [vivienda]);

    const { formData, errors, setErrors, isSubmitting, handleInputChange, handleValueChange, handleSubmit, setFormData, initialData } = useForm({
        initialState,
        onSubmit: async (data) => {
            const valorBaseNum = parseInt(String(data.valorBase).replace(/\D/g, ''), 10) || 0;
            const recargoEsquineraNum = data.esEsquinera ? parseInt(data.recargoEsquinera, 10) || 0 : 0;
            const datosActualizados = {
                manzana: data.manzana,
                numeroCasa: parseInt(data.numero, 10),
                matricula: data.matricula.trim(),
                nomenclatura: data.nomenclatura,
                linderoNorte: data.linderoNorte,
                linderoSur: data.linderoSur,
                linderoOriente: data.linderoOriente,
                linderoOccidente: data.linderoOccidente,
                urlCertificadoTradicion: data.urlCertificadoTradicion,
                valorBase: valorBaseNum,
                recargoEsquinera: recargoEsquineraNum,
                valorTotal: valorBaseNum + recargoEsquineraNum + 5000000,
            };
            try {
                await updateVivienda(vivienda.id, datosActualizados);
                toast.success("¡Vivienda actualizada con éxito!");
                onSave();
                onClose();
            } catch (error) {
                toast.error("No se pudo actualizar la vivienda.");
                console.error("Error al actualizar vivienda:", error);
            } finally {
                setIsConfirming(false);
            }
        },
        options: { resetOnSuccess: false }
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
            setErrors({});
            setStep(1);
        }
    }, [isOpen, initialState, setFormData, setErrors]);

    const hayCambios = useMemo(() => {
        if (!initialData) return false;
        // Comparamos el estado actual con el inicial, ignorando 'errors'
        const currentData = { ...formData, errors: null };
        const originalData = { ...initialData, errors: null };
        return JSON.stringify(currentData) !== JSON.stringify(originalData);
    }, [formData, initialData]);


    const handlePreSave = useCallback(() => {
        const validationErrors = validateVivienda(formData, todasLasViviendas, vivienda);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            toast.error("Por favor, corrige los errores del formulario.");
            return;
        }

        const cambiosDetectados = [];
        const fieldLabels = {
            manzana: 'Manzana', numero: 'Número de Casa', matricula: 'Matrícula', nomenclatura: 'Nomenclatura',
            linderoNorte: 'Lindero Norte', linderoSur: 'Lindero Sur', linderoOriente: 'Lindero Oriente', linderoOccidente: 'Lindero Occidente',
            valorBase: 'Valor Base', esEsquinera: '¿Esquinera?', recargoEsquinera: 'Recargo Esquinera'
        };

        const formatValue = (key, value) => {
            if (key === 'valorBase' || key === 'recargoEsquinera') {
                return formatCurrency(parseInt(String(value).replace(/\D/g, '')) || 0);
            }
            if (key === 'esEsquinera') {
                return value ? 'Sí' : 'No';
            }
            return String(value);
        };

        for (const key in formData) {
            if (key === 'urlCertificadoTradicion' || key === 'errors') continue;

            const valorAnterior = initialData[key];
            const valorActual = formData[key];

            if (String(valorAnterior) !== String(valorActual)) {
                cambiosDetectados.push({
                    campo: fieldLabels[key] || key,
                    anterior: formatValue(key, valorAnterior),
                    actual: formatValue(key, valorActual)
                });
            }
        }

        // Esta comprobación ahora es redundante si el botón está deshabilitado, pero la mantenemos como una doble seguridad.
        if (cambiosDetectados.length === 0) {
            // Ya no mostramos el toast. El botón deshabilitado es la señal principal.
            return;
        }

        setCambios(cambiosDetectados);
        setIsConfirming(true);
    }, [formData, todasLasViviendas, vivienda, initialData, setErrors]);

    const valorTotalCalculado = useMemo(() => {
        const valorBase = parseInt(String(formData.valorBase).replace(/\D/g, ''), 10) || 0;
        const recargoEsquinera = formData.esEsquinera ? parseInt(formData.recargoEsquinera, 10) || 0 : 0;
        return valorBase + recargoEsquinera + 5000000;
    }, [formData.valorBase, formData.esEsquinera, formData.recargoEsquinera]);

    const handleNextStep = () => {
        const allErrors = validateVivienda(formData, todasLasViviendas, vivienda);
        let stepErrors = {};
        if (step === 1) {
            if (allErrors.manzana) stepErrors.manzana = allErrors.manzana;
            if (allErrors.numero) stepErrors.numero = allErrors.numero;
            if (allErrors.linderoNorte) stepErrors.linderoNorte = allErrors.linderoNorte;
            if (allErrors.linderoSur) stepErrors.linderoSur = allErrors.linderoSur;
            if (allErrors.linderoOriente) stepErrors.linderoOriente = allErrors.linderoOriente;
            if (allErrors.linderoOccidente) stepErrors.linderoOccidente = allErrors.linderoOccidente;
        } else if (step === 2) {
            if (allErrors.matricula) stepErrors.matricula = allErrors.matricula;
            if (allErrors.nomenclatura) stepErrors.nomenclatura = allErrors.nomenclatura;
        }
        setErrors(stepErrors);
        if (Object.keys(stepErrors).length === 0) {
            setStep(s => s + 1);
        } else {
            toast.error("Por favor, completa los campos requeridos.");
        }
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: checked };
            if (name === 'esEsquinera') {
                newState.recargoEsquinera = checked ? "5000000" : "0";
            }
            return newState;
        });
    };

    const STEPS_CONFIG = [
        { number: 1, title: 'Ubicación y Linderos', icon: MapPin },
        { number: 2, title: 'Info. Legal', icon: FileText },
        { number: 3, title: 'Valor', icon: CircleDollarSign },
    ];

    if (!isOpen) return null;

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Editar Vivienda"
                icon={<Edit size={28} className="text-[#c62828]" />}
            >
                <div className="flex items-center justify-center my-6">
                    {STEPS_CONFIG.map((s, index) => (
                        <Fragment key={s.number}>
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${step >= s.number ? 'bg-red-500 border-red-500 text-white' : 'bg-gray-100 border-gray-300 text-gray-400'}`}>
                                    {step > s.number ? <Check size={24} /> : <s.icon size={24} />}
                                </div>
                                <p className={`mt-2 text-xs font-semibold ${step >= s.number ? 'text-red-500' : 'text-gray-400'}`}>{s.title}</p>
                            </div>
                            {index < STEPS_CONFIG.length - 1 && (
                                <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${step > s.number ? 'border-red-500' : 'border-gray-300'}`}></div>
                            )}
                        </Fragment>
                    ))}
                </div>

                <FormularioVivienda
                    step={step}
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    handleValueChange={handleValueChange}
                    handleCheckboxChange={handleCheckboxChange}
                    valorTotalCalculado={valorTotalCalculado}
                    gastosNotarialesFijos={5000000}
                />

                <div className="mt-10 pt-6 border-t flex justify-between">
                    {step > 1 ? (
                        <button type="button" onClick={handlePrevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">Anterior</button>
                    ) : <div />}

                    {step < 3 ? (
                        <button type="button" onClick={handleNextStep} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">
                            Siguiente
                        </button>
                    ) : (
                        <span
                            className="ml-auto"
                            data-tooltip-id="app-tooltip"
                            data-tooltip-content={!hayCambios ? "No hay cambios para guardar" : ''}
                        >
                            <button
                                type="button"
                                onClick={handlePreSave}
                                disabled={!hayCambios || isSubmitting}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
                            >
                                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </span>
                    )}
                </div>
            </Modal>

            {isConfirming && (
                <ModalConfirmacion
                    isOpen={isConfirming}
                    onClose={() => setIsConfirming(false)}
                    onConfirm={handleSubmit}
                    titulo="Confirmar Cambios de la Vivienda"
                    cambios={cambios}
                    isSubmitting={isSubmitting}
                />
            )}
        </>
    );
};

export default EditarVivienda;