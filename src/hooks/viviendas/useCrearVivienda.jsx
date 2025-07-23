import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from "../useForm.jsx";
import { validateVivienda } from "../../utils/validation.js"; // <-- RUTA ACTUALIZADA
import { addVivienda, getViviendas } from "../../utils/storage";

const GASTOS_NOTARIALES_FIJOS = 5000000;

const initialState = {
    manzana: "", numero: "", matricula: "", nomenclatura: "",
    areaLote: "", areaConstruida: "", linderoNorte: "", linderoSur: "",
    linderoOriente: "", linderoOccidente: "", urlCertificadoTradicion: null,
    valorBase: "", esEsquinera: false, recargoEsquinera: "0"
};

const inputFilters = {
    numero: { regex: /^[0-9]*$/, message: "Este campo solo permite números." },
    matricula: { regex: /^[0-9-]*$/, message: "Solo permite números y guiones." },
    areaLote: { regex: /^[0-9.,]*$/, message: "Solo permite números y separadores (, o .)" },
    areaConstruida: { regex: /^[0-9.,]*$/, message: "Solo permite números y separadores (, o .)" },
    nomenclatura: { regex: /^[a-zA-Z0-9\s#\-.]*$/, message: "Caracter no permitido, solo se permiten letras, números, #, () y separadores ( , o . )." },
    linderoNorte: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚ0-9\s.,\(\)-]*$/, message: "Caracter no permitido, solo se permiten letras (incluyendo acentos), números, ( ) y separadores ( , o . )." },
    linderoSur: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚ0-9\s.,\(\)-]*$/, message: "Caracter no permitido, solo se permiten letras (incluyendo acentos), números, ( ) y separadores ( , o . )." },
    linderoOriente: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚ0-9\s.,\(\)-]*$/, message: "Caracter no permitido, solo se permiten letras (incluyendo acentos), números, ( ) y separadores ( , o . )." },
    linderoOccidente: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚ0-9\s.,\(\)-]*$/, message: "Caracter no permitido, solo se permiten letras (incluyendo acentos), números, ( ) y separadores ( , o . )." }
};

export const useCrearVivienda = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [todasLasViviendas, setTodasLasViviendas] = useState([]);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        formData, errors, setErrors, handleInputChange,
        handleValueChange, dispatch, handleSubmit
    } = useForm({
        initialState,
        validate: (data) => validateVivienda(data, todasLasViviendas),
        onSubmit: async (formData) => {
            setIsSubmitting(true);
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
            } finally {
                setIsSubmitting(false);
            }
        },
        options: { inputFilters }
    });

    useEffect(() => {
        getViviendas().then(setTodasLasViviendas).finally(() => setIsLoading(false));
    }, []);

    const valorTotalCalculado = useMemo(() => {
        const valorBase = parseInt(String(formData.valorBase).replace(/\D/g, ''), 10) || 0;
        const recargoEsquinera = formData.esEsquinera ? parseInt(formData.recargoEsquinera, 10) || 0 : 0;
        return valorBase + recargoEsquinera + GASTOS_NOTARIALES_FIJOS;
    }, [formData.valorBase, formData.esEsquinera, formData.recargoEsquinera]);

    const handleNextStep = () => {
        const allErrors = validateVivienda(formData, todasLasViviendas);
        const fieldsToValidate = step === 1
            ? ['manzana', 'numero', 'linderoNorte', 'linderoSur', 'linderoOriente', 'linderoOccidente']
            : ['matricula', 'nomenclatura', 'areaLote', 'areaConstruida'];

        const stepErrors = {};
        fieldsToValidate.forEach(field => {
            if (allErrors[field]) stepErrors[field] = allErrors[field];
        });

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
        step, isLoading, formData, errors, isSubmitting, valorTotalCalculado,
        gastosNotarialesFijos: GASTOS_NOTARIALES_FIJOS,
        handlers: {
            handleNextStep, handlePrevStep, handleSubmit,
            handleInputChange, handleValueChange, handleCheckboxChange
        }
    };
};