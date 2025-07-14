import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from "./useForm.jsx";
import { validateVivienda } from "../pages/viviendas/viviendaValidation.js";
import { addVivienda, getViviendas } from "../utils/storage";

const GASTOS_NOTARIALES_FIJOS = 5000000;

const initialState = {
    manzana: "", numero: "", matricula: "", nomenclatura: "",
    areaLote: "", areaConstruida: "", linderoNorte: "", linderoSur: "",
    linderoOriente: "", linderoOccidente: "", urlCertificadoTradicion: null,
    valorBase: "", esEsquinera: false, recargoEsquinera: "0"
};

const inputFilters = {
    numero: { regex: /^[0-9]*$/ },
    matricula: { regex: /^[0-9-]*$/ },
    areaLote: { regex: /^[0-9.,]*$/ },
    areaConstruida: { regex: /^[0-9.,]*$/ },
};

export const useViviendaForm = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [todasLasViviendas, setTodasLasViviendas] = useState([]);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const cargarDatosParaValidacion = async () => {
            try {
                const viviendasData = await getViviendas();
                setTodasLasViviendas(viviendasData);
            } catch (error) {
                toast.error("No se pudieron cargar los datos para validación.");
            } finally {
                setIsLoading(false);
            }
        };
        cargarDatosParaValidacion();
    }, []);

    const validateCallback = useCallback((data) => {
        return validateVivienda(data, todasLasViviendas, null);
    }, [todasLasViviendas]);

    const onSubmitCallback = useCallback(async (formData) => {
        const valorBaseNum = parseInt(String(formData.valorBase).replace(/\D/g, ''), 10) || 0;
        const recargoEsquineraNum = formData.esEsquinera ? parseInt(formData.recargoEsquinera, 10) || 0 : 0;
        const valorTotalVivienda = valorBaseNum + recargoEsquineraNum + GASTOS_NOTARIALES_FIJOS;

        const nuevaVivienda = {
            manzana: formData.manzana, numeroCasa: parseInt(formData.numero, 10),
            matricula: formData.matricula.trim(), nomenclatura: formData.nomenclatura,
            areaLote: formData.areaLote, areaConstruida: formData.areaConstruida,
            linderoNorte: formData.linderoNorte, linderoSur: formData.linderoSur,
            linderoOriente: formData.linderoOriente, linderoOccidente: formData.linderoOccidente,
            urlCertificadoTradicion: formData.urlCertificadoTradicion,
            valorBase: valorBaseNum, recargoEsquinera: recargoEsquineraNum,
            gastosNotariales: GASTOS_NOTARIALES_FIJOS, valorTotal: valorTotalVivienda,
        };

        try {
            await addVivienda(nuevaVivienda);
            toast.success("¡Vivienda registrada con éxito!");
            navigate("/viviendas/listar");
        } catch (error) {
            toast.error("No se pudo registrar la vivienda.");
            console.error("Error al crear vivienda:", error);
        }
    }, [navigate]);

    const form = useForm({
        initialState,
        validate: validateCallback,
        onSubmit: onSubmitCallback,
        options: { inputFilters }
    });

    const valorTotalCalculado = useMemo(() => {
        const valorBase = parseInt(String(form.formData.valorBase).replace(/\D/g, ''), 10) || 0;
        const recargoEsquinera = form.formData.esEsquinera ? parseInt(form.formData.recargoEsquinera, 10) || 0 : 0;
        return valorBase + recargoEsquinera + GASTOS_NOTARIALES_FIJOS;
    }, [form.formData.valorBase, form.formData.esEsquinera, form.formData.recargoEsquinera]);

    const handleNextStep = () => {
        const allErrors = validateVivienda(form.formData, todasLasViviendas, null);
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
        } else {
            toast.error("Por favor, completa los campos requeridos.");
        }
    };

    const handlePrevStep = () => setStep(s => s - 1);

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        form.dispatch({ type: 'TOGGLE_ESQUINERA', payload: checked });
    };

    return {
        step,
        isLoading,
        form,
        valorTotalCalculado,
        gastosNotarialesFijos: GASTOS_NOTARIALES_FIJOS,
        handleNextStep,
        handlePrevStep,
        handleCheckboxChange
    };
};