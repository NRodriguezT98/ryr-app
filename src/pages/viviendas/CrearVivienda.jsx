import React, { useEffect, useState, useCallback, useMemo, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import { useForm } from "../../hooks/useForm.jsx";
import { validateVivienda } from "./viviendaValidation.js";
import { addVivienda, getViviendas } from "../../utils/storage";
import { MapPin, FileText, CircleDollarSign, Check, Loader } from 'lucide-react';
import FormularioVivienda from "./FormularioVivienda";

const GASTOS_NOTARIALES_FIJOS = 5000000;

const initialState = {
    manzana: "", numero: "", matricula: "", nomenclatura: "",
    areaLote: "", areaConstruida: "", linderoNorte: "", linderoSur: "",
    linderoOriente: "", linderoOccidente: "", urlCertificadoTradicion: null,
    valorBase: "", esEsquinera: false, recargoEsquinera: "0"
};

// --- FILTROS DE INPUT ACTUALIZADOS ---
const inputFilters = {
    numero: { regex: /^[0-9]*$/, message: "Este campo solo permite números." },
    matricula: { regex: /^[0-9-]*$/, message: "Solo permite números y guiones." },
    areaLote: { regex: /^[0-9.,]*$/, message: "Solo permite números y separadores (, o .)" },
    areaConstruida: { regex: /^[0-9.,]*$/, message: "Solo permite números y separadores (, o .)" },
    nomenclatura: { regex: /^[a-zA-Z0-9\s#\-]*$/, message: "Solo permite letras, números, # y -." },
    linderoNorte: { regex: /^[a-zA-Z0-9\s.,\(\)-]*$/, message: "Caracter no permitido." },
    linderoSur: { regex: /^[a-zA-Z0-9\s.,\(\)-]*$/, message: "Caracter no permitido." },
    linderoOriente: { regex: /^[a-zA-Z0-9\s.,\(\)-]*$/, message: "Caracter no permitido." },
    linderoOccidente: { regex: /^[a-zA-Z0-9\s.,\(\)-]*$/, message: "Caracter no permitido." },
};

const CrearVivienda = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [todasLasViviendas, setTodasLasViviendas] = useState([]);
    const [step, setStep] = useState(1);

    useEffect(() => {
        const cargarDatosParaValidacion = async () => {
            try {
                const viviendasData = await getViviendas();
                setTodasLasViviendas(viviendasData);
            } catch (error) { toast.error("No se pudieron cargar los datos para validación."); }
            finally { setIsLoading(false); }
        };
        cargarDatosParaValidacion();
    }, []);

    const { formData, errors, setErrors, isSubmitting, handleInputChange, handleValueChange, handleSubmit, dispatch } = useForm({
        initialState,
        validate: (data) => validateVivienda(data, todasLasViviendas, null),
        onSubmit: async (formData) => {
            const valorBaseNum = parseInt(String(formData.valorBase).replace(/\D/g, ''), 10) || 0;
            const recargoEsquineraNum = formData.esEsquinera ? parseInt(formData.recargoEsquinera, 10) || 0 : 0;
            const valorTotalVivienda = valorBaseNum + recargoEsquineraNum + GASTOS_NOTARIALES_FIJOS;

            const nuevaVivienda = {
                manzana: formData.manzana,
                numeroCasa: parseInt(formData.numero, 10),
                matricula: formData.matricula.trim(),
                nomenclatura: formData.nomenclatura,
                areaLote: formData.areaLote,
                areaConstruida: formData.areaConstruida,
                linderoNorte: formData.linderoNorte,
                linderoSur: formData.linderoSur,
                linderoOriente: formData.linderoOriente,
                linderoOccidente: formData.linderoOccidente,
                urlCertificadoTradicion: formData.urlCertificadoTradicion,
                valorBase: valorBaseNum,
                recargoEsquinera: recargoEsquineraNum,
                gastosNotariales: GASTOS_NOTARIALES_FIJOS,
                valorTotal: valorTotalVivienda,
            };
            try {
                await addVivienda(nuevaVivienda);
                toast.success("¡Vivienda registrada con éxito!");
                navigate("/viviendas/listar");
            } catch (error) {
                toast.error("No se pudo registrar la vivienda.");
                console.error("Error al crear vivienda:", error);
            }
        },
        options: { inputFilters }
    });

    const valorTotalCalculado = useMemo(() => {
        const valorBase = parseInt(String(formData.valorBase).replace(/\D/g, ''), 10) || 0;
        const recargoEsquinera = formData.esEsquinera ? parseInt(formData.recargoEsquinera, 10) || 0 : 0;
        return valorBase + recargoEsquinera + GASTOS_NOTARIALES_FIJOS;
    }, [formData.valorBase, formData.esEsquinera, formData.recargoEsquinera]);

    const handleNextStep = () => {
        const allErrors = validateVivienda(formData, todasLasViviendas, null);
        let stepErrors = {};
        if (step === 1) {
            const step1Fields = ['manzana', 'numero', 'linderoNorte', 'linderoSur', 'linderoOriente', 'linderoOccidente'];
            step1Fields.forEach(field => { if (allErrors[field]) stepErrors[field] = allErrors[field]; });
        } else if (step === 2) {
            const step2Fields = ['matricula', 'nomenclatura', 'areaLote', 'areaConstruida'];
            step2Fields.forEach(field => { if (allErrors[field]) stepErrors[field] = allErrors[field]; });
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
        dispatch({ type: 'UPDATE_FIELD', payload: { name, value: checked } });
        if (name === 'esEsquinera') {
            dispatch({ type: 'UPDATE_FIELD', payload: { name: 'recargoEsquinera', value: checked ? "5000000" : "0" } });
        }
    };

    const STEPS_CONFIG = [
        { number: 1, title: 'Ubicación y Linderos', icon: MapPin },
        { number: 2, title: 'Info. Legal', icon: FileText },
        { number: 3, title: 'Valor', icon: CircleDollarSign },
    ];

    if (isLoading) return <div className="text-center p-10 animate-pulse">Preparando formulario...</div>;

    return (
        <AnimatedPage>
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-3xl font-extrabold mb-4 text-center text-[#c62828]">
                        🏠 Registrar Nueva Vivienda
                    </h2>
                    <div className="flex items-center justify-center my-8">
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
                        gastosNotarialesFijos={GASTOS_NOTARIALES_FIJOS}
                    />
                    <div className="mt-10 flex justify-between">
                        {step > 1 ? (
                            <button type="button" onClick={handlePrevStep} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors">Anterior</button>
                        ) : <div />}
                        {step < 3 ? (
                            <button type="button" onClick={handleNextStep} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors ml-auto">
                                Siguiente
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:bg-gray-400 ml-auto flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (<><Loader size={20} className="animate-spin" /><span>Guardando...</span></>) : ("Finalizar y Guardar")}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CrearVivienda;