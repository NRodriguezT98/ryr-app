import { useEffect, useState, useMemo, useCallback } from "react";
import toast from 'react-hot-toast';
import { useForm } from "../useForm.jsx";
import { validateVivienda } from "../../utils/validation.js"; // <-- RUTA ACTUALIZADA
import { updateVivienda } from "../../utils/storage";

const GASTOS_NOTARIALES_FIJOS = 5000000;

const inputFilters = {
    numero: { regex: /^[0-9]*$/, message: "Este campo solo permite números." },
    matricula: { regex: /^[0-9-]*$/, message: "Solo permite números y guiones." },
    areaLote: { regex: /^[0-9.,]*$/, message: "Solo permite números y separadores (, o .)" },
    areaConstruida: { regex: /^[0-9.,]*$/, message: "Solo permite números y separadores (, o .)" },
    nomenclatura: { regex: /^[a-zA-Z0-9\s#\-.]*$/, message: "Caracter no permitido." },
    linderoNorte: { regex: /^[a-zA-Z0-9\s.,\(\)-]*$/, message: "Caracter no permitido." },
    linderoSur: { regex: /^[a-zA-Z0-9\s.,\(\)-]*$/, message: "Caracter no permitido." },
    linderoOriente: { regex: /^[a-zA-Z0-9\s.,\(\)-]*$/, message: "Caracter no permitido." },
    linderoOccidente: { regex: /^[a-zA-Z0-9\s.,\(\)-]*$/, message: "Caracter no permitido." },
};

export const useEditarVivienda = (vivienda, todasLasViviendas, isOpen, onSave, onClose) => {
    const [step, setStep] = useState(1);
    const [isConfirming, setIsConfirming] = useState(false);
    const [cambios, setCambios] = useState([]);

    const initialState = useMemo(() => ({
        manzana: vivienda?.manzana || "",
        numero: vivienda?.numeroCasa?.toString() || "",
        matricula: vivienda?.matricula || "",
        nomenclatura: vivienda?.nomenclatura || "",
        areaLote: vivienda?.areaLote?.toString() || "",
        areaConstruida: vivienda?.areaConstruida?.toString() || "",
        linderoNorte: vivienda?.linderoNorte || "",
        linderoSur: vivienda?.linderoSur || "",
        linderoOriente: vivienda?.linderoOriente || "",
        linderoOccidente: vivienda?.linderoOccidente || "",
        urlCertificadoTradicion: vivienda?.urlCertificadoTradicion || null,
        valorBase: vivienda?.valorBase?.toString() || "0",
        esEsquinera: vivienda?.recargoEsquinera > 0,
        recargoEsquinera: vivienda?.recargoEsquinera?.toString() || "0",
    }), [vivienda]);

    const {
        formData, setFormData, errors, setErrors, isSubmitting,
        handleInputChange, handleValueChange, handleSubmit, dispatch
    } = useForm({
        initialState,
        validate: (data) => validateVivienda(data, todasLasViviendas, vivienda),
        onSubmit: async (data) => {
            const valorBaseNum = parseInt(String(data.valorBase).replace(/\D/g, ''), 10) || 0;
            const recargoEsquineraNum = data.esEsquinera ? parseInt(data.recargoEsquinera, 10) || 0 : 0;
            const datosActualizados = {
                ...formData,
                numeroCasa: parseInt(data.numero, 10),
                areaLote: parseFloat(String(data.areaLote).replace(',', '.')) || 0,
                areaConstruida: parseFloat(String(data.areaConstruida).replace(',', '.')) || 0,
                valorBase: valorBaseNum,
                recargoEsquinera: recargoEsquineraNum,
                valorTotal: valorBaseNum + recargoEsquineraNum + GASTOS_NOTARIALES_FIJOS,
            };
            try {
                await updateVivienda(vivienda.id, datosActualizados);
                toast.success("¡Vivienda actualizada con éxito!");
                onSave();
                onClose();
            } catch (error) {
                toast.error("No se pudo actualizar la vivienda.");
            } finally {
                setIsConfirming(false);
            }
        },
        options: { inputFilters, resetOnSuccess: false }
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(initialState);
            setErrors({});
            setStep(1);
        }
    }, [isOpen, initialState, setFormData, setErrors]);

    const hayCambios = useMemo(() => {
        if (!formData) return false;
        const currentData = { ...formData };
        delete currentData.errors;
        return JSON.stringify(currentData) !== JSON.stringify(initialState);
    }, [formData, initialState]);

    const handlePreSave = useCallback(() => {
        const validationErrors = validateVivienda(formData, todasLasViviendas, vivienda);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const cambiosDetectados = [];
        const fieldLabels = {
            manzana: 'Manzana', numero: 'Número de Casa', matricula: 'Matrícula', nomenclatura: 'Nomenclatura',
            areaLote: 'Área del Lote (m²)', areaConstruida: 'Área Construida (m²)', linderoNorte: 'Lindero Norte',
            linderoSur: 'Lindero Sur', linderoOriente: 'Lindero Oriente', linderoOccidente: 'Lindero Occidente',
            valorBase: 'Valor Base', esEsquinera: 'Esquinera', recargoEsquinera: 'Recargo Esquinera'
        };

        for (const key in formData) {
            if (key === 'urlCertificadoTradicion' || key === 'errors') continue;
            if (String(initialState[key]) !== String(formData[key])) {
                cambiosDetectados.push({
                    campo: fieldLabels[key] || key,
                    anterior: String(initialState[key]),
                    actual: String(formData[key])
                });
            }
        }

        if (cambiosDetectados.length === 0) {
            return;
        }

        setCambios(cambiosDetectados);
        setIsConfirming(true);
    }, [formData, todasLasViviendas, vivienda, initialState, setErrors]);

    const valorTotalCalculado = useMemo(() => {
        if (!formData) return 0;
        const valorBase = parseInt(String(formData.valorBase).replace(/\D/g, ''), 10) || 0;
        const recargoEsquinera = formData.esEsquinera ? parseInt(formData.recargoEsquinera, 10) || 0 : 0;
        return valorBase + recargoEsquinera + GASTOS_NOTARIALES_FIJOS;
    }, [formData]);

    const handleNextStep = () => {
        const allErrors = validateVivienda(formData, todasLasViviendas, vivienda);
        const stepFields = step === 1
            ? ['manzana', 'numero', 'linderoNorte', 'linderoSur', 'linderoOriente', 'linderoOccidente']
            : ['matricula', 'nomenclatura', 'areaLote', 'areaConstruida'];

        const stepErrors = {};
        stepFields.forEach(field => { if (allErrors[field]) stepErrors[field] = allErrors[field]; });

        setErrors(stepErrors);
        if (Object.keys(stepErrors).length === 0) {
            setStep(s => s + 1);
        }
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        dispatch({ type: 'UPDATE_FIELD', payload: { name, value: checked } });
        if (name === 'esEsquinera') {
            dispatch({ type: 'UPDATE_FIELD', payload: { name: 'recargoEsquinera', value: checked ? "5000000" : "0" } });
        }
    };

    return {
        step, formData, errors, isSubmitting, valorTotalCalculado, gastosNotarialesFijos: GASTOS_NOTARIALES_FIJOS,
        isConfirming, setIsConfirming, cambios, hayCambios,
        handlers: {
            handleNextStep, handlePrevStep, handleCheckboxChange, handlePreSave, handleSubmit,
            handleInputChange, handleValueChange
        }
    };
};