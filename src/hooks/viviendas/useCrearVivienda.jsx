import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from "../useForm.jsx";
import { validateVivienda } from "../../utils/validation.js";
import { addVivienda } from "../../services/viviendaService";
import { createAuditLog } from "../../services/auditService";
import { useData } from '../../context/DataContext.jsx';
import { useDataSync } from '../useDataSync'; // ✅ Sistema de sincronización inteligente

const GASTOS_NOTARIALES_FIJOS = 5000000;

const initialState = {
    proyectoId: "", manzana: "", numeroCasa: "", matricula: "", nomenclatura: "",
    areaLote: "", areaConstruida: "", linderoNorte: "", linderoSur: "",
    linderoOriente: "", linderoOccidente: "", urlCertificadoTradicion: null,
    valorBase: "", esEsquinera: false, recargoEsquinera: "0", tipoVivienda: "Regular"
};

const inputFilters = {
    numeroCasa: { regex: /^[0-9]*$/, message: "Este campo solo permite números." },
    matricula: { regex: /^[0-9-]*$/, message: "Solo permite números y guiones." },
    areaLote: { regex: /^[0-9.,]*$/, message: "Solo permite números y separadores (, o .)" },
    areaConstruida: { regex: /^[0-9.,]*$/, message: "Solo permite números y separadores (, o .)" },
    nomenclatura: { regex: /^[a-zA-Z0-9\s#\-.]*$/, message: "Caracter no permitido, solo se permiten letras, números, #, () y separadores ( , o . )." },
    linderoNorte: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚ0-9\s.,\(\)-]*$/, message: "Caracter no permitido, solo se permiten letras (incluyendo acentos), números, ( ) y separadores ( , o . )." },
    linderoSur: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚ0-9\s.,\(\)-]*$/, message: "Caracter no permitido, solo se permiten letras (incluyendo acentos), números, ( ) y separadores ( , o . )." },
    linderoOriente: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚ0-9\s.,\(\)-]*$/, message: "Caracter no permitido, solo se permiten letras (incluyendo acentos), números, ( ) y separadores ( , o . )." },
    linderoOccidente: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚ0-9\s.,\(\)-]*$/, message: "Caracter no permitido, solo se permiten letras (incluyendo acentos), números, ( ) y separadores ( , o . )." }
};

/**
 * Hook para crear viviendas
 * 🔥 OPTIMIZADO: Usa viviendas de DataContext (no llamada redundante a getViviendas)
 */
export const useCrearVivienda = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { proyectos, viviendas, isLoading: isLoadingData } = useData();
    const { afterViviendaMutation } = useDataSync(); // ✅ Sincronización granular

    const {
        formData, errors, setErrors, handleInputChange,
        handleValueChange, dispatch, handleSubmit
    } = useForm({
        initialState,
        validate: (data) => validateVivienda(data, viviendas), // ✅ Usa viviendas del contexto
        onSubmit: async (formData) => {
            setIsSubmitting(true);
            const valorBaseNum = parseInt(String(formData.valorBase).replace(/\D/g, ''), 10) || 0;
            const recargoEsquineraNum = formData.esEsquinera ? parseInt(formData.recargoEsquinera, 10) || 0 : 0;
            const valorTotalVivienda = valorBaseNum + recargoEsquineraNum + GASTOS_NOTARIALES_FIJOS;

            const nuevaVivienda = {
                manzana: formData.manzana, numeroCasa: parseInt(formData.numeroCasa, 10),
                matricula: formData.matricula.trim(), nomenclatura: formData.nomenclatura,
                areaLote: formData.areaLote, areaConstruida: formData.areaConstruida,
                linderoNorte: formData.linderoNorte, linderoSur: formData.linderoSur,
                linderoOriente: formData.linderoOriente, linderoOccidente: formData.linderoOccidente,
                urlCertificadoTradicion: formData.urlCertificadoTradicion,
                valorBase: valorBaseNum, recargoEsquinera: recargoEsquineraNum,
                gastosNotariales: GASTOS_NOTARIALES_FIJOS, valorTotal: valorTotalVivienda,
                proyectoId: formData.proyectoId, tipoVivienda: formData.tipoVivienda,
            };
            try {
                const viviendaDocRef = await addVivienda(nuevaVivienda);

                // 🔥 Mostrar éxito inmediatamente (Optimistic)
                toast.success("¡Vivienda registrada con éxito!");

                // Auditoría
                const proyectoAsignado = proyectos.find(p => p.id === formData.proyectoId);
                const nombreProyecto = proyectoAsignado ? proyectoAsignado.nombre : 'Proyecto no encontrado';

                const auditDetails = {
                    action: 'CREATE_VIVIENDA',
                    proyecto: {
                        id: formData.proyectoId,
                        nombre: nombreProyecto
                    },
                    manzana: formData.manzana,
                    numeroCasa: formData.numeroCasa,
                    linderoNorte: formData.linderoNorte,
                    linderoSur: formData.linderoSur,
                    linderoOriente: formData.linderoOriente,
                    linderoOccidente: formData.linderoOccidente,
                    matricula: formData.matricula,
                    nomenclatura: formData.nomenclatura,
                    areaLote: formData.areaLote,
                    areaConstruida: formData.areaConstruida,
                    certificadoTradicionAnexado: formData.urlCertificadoTradicion ? 'Sí' : 'No',
                    tipoVivienda: formData.tipoVivienda,
                    valorBase: valorBaseNum,
                    esEsquinera: formData.esEsquinera ? 'Sí' : 'No',
                    recargoEsquinera: recargoEsquineraNum,
                    valorTotal: valorTotalVivienda
                };

                await createAuditLog(
                    `Creó la vivienda Mz ${formData.manzana} - Casa ${formData.numeroCasa} en el proyecto '${nombreProyecto}'.`,
                    auditDetails
                );

                // ✅ Sincronización inteligente (solo viviendas)
                console.log('🔄 Sincronizando viviendas después de creación...');
                await afterViviendaMutation();

                navigate("/viviendas/listar");
            } catch (error) {
                console.error("Error al crear vivienda:", error);
                toast.error("No se pudo registrar la vivienda.");
            } finally {
                setIsSubmitting(false);
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
        const allErrors = validateVivienda(formData, viviendas);
        const fieldsToValidate = step === 1
            ? ['proyectoId', 'manzana', 'numeroCasa', 'linderoNorte', 'linderoSur', 'linderoOriente', 'linderoOccidente']
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
        step, isLoading: isLoadingData, formData, errors, isSubmitting, valorTotalCalculado,
        gastosNotarialesFijos: GASTOS_NOTARIALES_FIJOS, proyectos,
        handlers: {
            handleNextStep, handlePrevStep, handleSubmit,
            handleInputChange, handleValueChange, handleCheckboxChange
        }
    };
};