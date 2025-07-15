import { useEffect, useState, useMemo, useCallback } from "react";
import toast from 'react-hot-toast';
import { useForm } from "./useForm.jsx"; // Esta ruta es correcta PORQUE ambos hooks están en /src/hooks/
import { validateVivienda } from "../pages/viviendas/viviendaValidation.js";
import { updateVivienda } from "../utils/storage";
import { formatCurrency } from "../utils/textFormatters.js";

const GASTOS_NOTARIALES_FIJOS = 5000000;

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

    const form = useForm({
        initialState,
        validate: (data) => validateVivienda(data, todasLasViviendas, vivienda),
        onSubmit: async (data) => {
            const valorBaseNum = parseInt(String(data.valorBase).replace(/\D/g, ''), 10) || 0;
            const recargoEsquineraNum = data.esEsquinera ? parseInt(data.recargoEsquinera, 10) || 0 : 0;
            const datosActualizados = {
                manzana: data.manzana,
                numeroCasa: parseInt(data.numero, 10),
                matricula: data.matricula.trim(),
                nomenclatura: data.nomenclatura,
                areaLote: data.areaLote,
                areaConstruida: data.areaConstruida,
                linderoNorte: data.linderoNorte,
                linderoSur: data.linderoSur,
                linderoOriente: data.linderoOriente,
                linderoOccidente: data.linderoOccidente,
                urlCertificadoTradicion: data.urlCertificadoTradicion,
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
        options: { resetOnSuccess: false }
    });

    useEffect(() => {
        if (isOpen) {
            form.setFormData(initialState);
            form.setErrors({});
            setStep(1);
        }
    }, [isOpen, initialState, form.setFormData, form.setErrors]);

    const hayCambios = useMemo(() => {
        if (!form.formData) return false;
        const currentData = { ...form.formData };
        delete currentData.errors;
        return JSON.stringify(currentData) !== JSON.stringify(initialState);
    }, [form.formData, initialState]);

    const handlePreSave = useCallback(() => {
        const validationErrors = validateVivienda(form.formData, todasLasViviendas, vivienda);
        form.setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const cambiosDetectados = [];
        const fieldLabels = {
            manzana: 'Manzana', numero: 'Número de Casa', matricula: 'Matrícula', nomenclatura: 'Nomenclatura',
            areaLote: 'Área del Lote', areaConstruida: 'Área Construida', linderoNorte: 'Lindero Norte',
            linderoSur: 'Lindero Sur', linderoOriente: 'Lindero Oriente', linderoOccidente: 'Lindero Occidente',
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

        for (const key in form.formData) {
            if (key === 'urlCertificadoTradicion' || key === 'errors') continue;
            const valorAnterior = initialState[key];
            const valorActual = form.formData[key];

            if (String(valorAnterior) !== String(valorActual)) {
                cambiosDetectados.push({
                    campo: fieldLabels[key] || key,
                    anterior: formatValue(key, valorAnterior),
                    actual: formatValue(key, valorActual)
                });
            }
        }

        if (cambiosDetectados.length === 0) {
            toast('No se han detectado cambios para guardar.', { icon: 'ℹ️' });
            return;
        }

        setCambios(cambiosDetectados);
        setIsConfirming(true);
    }, [form.formData, todasLasViviendas, vivienda, initialState, form.setErrors]);

    const valorTotalCalculado = useMemo(() => {
        const valorBase = parseInt(String(form.formData.valorBase).replace(/\D/g, ''), 10) || 0;
        const recargoEsquinera = form.formData.esEsquinera ? parseInt(form.formData.recargoEsquinera, 10) || 0 : 0;
        return valorBase + recargoEsquinera + GASTOS_NOTARIALES_FIJOS;
    }, [form.formData.valorBase, form.formData.esEsquinera, form.formData.recargoEsquinera]);

    const handleNextStep = () => {
        const allErrors = validateVivienda(form.formData, todasLasViviendas, vivienda);
        let stepErrors = {};
        if (step === 1) {
            const step1Fields = ['manzana', 'numero', 'linderoNorte', 'linderoSur', 'linderoOriente', 'linderoOccidente'];
            step1Fields.forEach(field => { if (allErrors[field]) stepErrors[field] = allErrors[field]; });
        } else if (step === 2) {
            const step2Fields = ['matricula', 'nomenclatura', 'areaLote', 'areaConstruida'];
            step2Fields.forEach(field => { if (allErrors[field]) stepErrors[field] = allErrors[field]; });
        }
        form.setErrors(stepErrors);
        if (Object.keys(stepErrors).length === 0) {
            setStep(s => s + 1);
        }
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        form.dispatch({ type: 'UPDATE_FIELD', payload: { name, value: checked } });
        if (name === 'esEsquinera') {
            form.dispatch({ type: 'UPDATE_FIELD', payload: { name: 'recargoEsquinera', value: checked ? "5000000" : "0" } });
        }
    };

    return {
        step, form, valorTotalCalculado, gastosNotarialesFijos: GASTOS_NOTARIALES_FIJOS,
        isConfirming, setIsConfirming, cambios, hayCambios,
        handlers: {
            handleNextStep, handlePrevStep, handleCheckboxChange,
            handlePreSave, handleSubmit: form.handleSubmit,
            handleInputChange: form.handleInputChange,
            handleValueChange: form.handleValueChange
        }
    };
};