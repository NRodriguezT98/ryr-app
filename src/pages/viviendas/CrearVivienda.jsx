import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import AnimatedPage from "../../components/AnimatedPage";
import toast from 'react-hot-toast';
import { useForm } from "../../hooks/useForm.jsx";
import { validateVivienda } from "./viviendaValidation.js";
import { addVivienda, getViviendas } from "../../utils/storage";

const initialState = { manzana: "", numero: "", matricula: "", nomenclatura: "", valor: "" };
const inputFilters = { numero: { regex: /^[0-9]*$/ }, matricula: { regex: /^[0-9-]*$/ }, nomenclatura: { regex: /^[a-zA-Z0-9\s#-]*$/ } };

const CrearVivienda = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccess, setIsSuccess] = useState(false);
    const [todasLasViviendas, setTodasLasViviendas] = useState([]);

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

    const onSubmitLogic = useCallback(async (formData) => {
        const nuevaVivienda = { manzana: formData.manzana, numeroCasa: parseInt(formData.numero, 10), matricula: formData.matricula.trim(), nomenclatura: formData.nomenclatura.trim(), valorTotal: parseInt(formData.valor.replace(/\D/g, ''), 10), clienteId: null };
        try {
            await addVivienda(nuevaVivienda);
            setIsSuccess(true);
        } catch (error) {
            toast.error("No se pudo registrar la vivienda.");
        }
    }, []);

    const { formData, errors, enviando, handleInputChange, handleValueChange, handleSubmit } = useForm({
        initialState,
        validate: (formData) => validateVivienda(formData, todasLasViviendas, null),
        onSubmit: onSubmitLogic,
        options: { inputFilters }
    });

    useEffect(() => {
        if (isSuccess) {
            toast.success("Vivienda registrada exitosamente.");
            const timer = setTimeout(() => navigate("/viviendas/listar"), 2500);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, navigate]);

    if (isLoading) return <div className="text-center p-10 animate-pulse">Preparando formulario...</div>;

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto">
                {isSuccess ? (
                    <div className="bg-white p-8 rounded-xl shadow-lg text-center py-10">
                        <div className="text-green-500 w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mt-6">¡Vivienda Registrada!</h2>
                        <p className="text-gray-500 mt-2">Serás redirigido a la lista de viviendas...</p>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-center text-[#c62828]">
                            🏠 Crear Nueva Vivienda
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="manzana">Manzana <span className="text-red-600">*</span></label>
                                <select id="manzana" name="manzana" value={formData.manzana} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.manzana ? "border-red-600" : "border-gray-300"}`}>
                                    <option value="">Selecciona</option>
                                    {["A", "B", "C", "D", "E", "F"].map((op) => (<option key={op} value={op}>{op}</option>))}
                                </select>
                                {errors.manzana && <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="numero">Número de casa <span className="text-red-600">*</span></label>
                                <input id="numero" name="numero" type="text" value={formData.numero} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.numero ? "border-red-600" : "border-gray-300"}`} maxLength={6} />
                                {errors.numero && <p className="text-red-600 text-sm mt-1">{errors.numero}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="matricula">Matrícula inmobiliaria <span className="text-red-600">*</span></label>
                                <input id="matricula" name="matricula" type="text" value={formData.matricula} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.matricula ? "border-red-600" : "border-gray-300"}`} maxLength={15} />
                                {errors.matricula && <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1" htmlFor="nomenclatura">Nomenclatura <span className="text-red-600">*</span></label>
                                <input id="nomenclatura" name="nomenclatura" type="text" value={formData.nomenclatura} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.nomenclatura ? "border-red-600" : "border-gray-300"}`} maxLength={25} />
                                {errors.nomenclatura && <p className="text-red-600 text-sm mt-1">{errors.nomenclatura}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block font-semibold mb-1" htmlFor="valor">Valor total <span className="text-red-600">*</span></label>
                                <NumericFormat id="valor" name="valor" value={formData.valor} onValueChange={(values) => handleValueChange('valor', values.value)} thousandSeparator="." decimalSeparator="," prefix="$ " className={`w-full border p-2 rounded-lg ${errors.valor ? "border-red-600" : "border-gray-300"}`} />
                                {errors.valor && <p className="text-red-600 text-sm mt-1">{errors.valor}</p>}
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <button type="submit" disabled={enviando} className={`px-5 py-2.5 rounded-full transition text-white ${enviando ? "bg-gray-400 cursor-not-allowed" : "bg-[#28a745] hover:bg-green-700"}`}>{enviando ? "Guardando..." : "Guardar Vivienda"}</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default CrearVivienda;