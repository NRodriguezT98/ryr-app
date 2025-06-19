import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import AnimatedPage from "../../components/AnimatedPage";
import { useToast } from "../../components/ToastContext";
import { useForm } from "../../hooks/useForm.jsx";
import { validateVivienda } from "./viviendaValidation.js";

const initialState = {
    manzana: "",
    numero: "",
    matricula: "",
    nomenclatura: "",
    valor: "",
};

const inputFilters = {
    numero: {
        regex: /^[0-9]*$/,
        message: 'En "Número de casa" solo se permiten números.'
    },
    matricula: {
        regex: /^[0-9-]*$/,
        message: 'En "Matrícula" solo se permiten números y guiones.'
    },
    nomenclatura: {
        regex: /^[a-zA-Z0-9\s#-]*$/,
        message: 'Nomenclatura: solo se admiten letras, números, espacios, guión (-) y numeral (#).'
    }
};

const CrearVivienda = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const onSubmitLogic = (formData) => {
        const nuevasViviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
        nuevasViviendas.push({
            id: Date.now(),
            manzana: formData.manzana,
            numeroCasa: parseInt(formData.numero, 10),
            matricula: formData.matricula.trim(),
            nomenclatura: formData.nomenclatura.trim(),
            valorTotal: parseInt(formData.valor, 10),
            clienteId: null,
        });

        localStorage.setItem("viviendas", JSON.stringify(nuevasViviendas));
        showToast("✅ Vivienda registrada exitosamente.", "success");

        setTimeout(() => {
            navigate("/viviendas/listar");
        }, 1500);
    };

    const {
        formData,
        errors,
        setErrors,
        enviando,
        handleInputChange,
        handleValueChange,
        handleSubmit,
    } = useForm(initialState, validateVivienda, onSubmitLogic, {
        inputFilters
    });

    // --- Validación instantánea para Manzana + Número ---
    useEffect(() => {
        // ----> AJUSTE: No validar si ya se está enviando
        if (enviando) return;

        const { manzana, numero } = formData;
        const errorDeDuplicado = "Esta vivienda (Manzana y Número) ya se encuentra registrada.";

        if (manzana && numero) {
            const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
            const existeVivienda = viviendas.some(
                (v) => v.manzana === manzana && Number(v.numeroCasa) === Number(numero)
            );

            if (existeVivienda) {
                setErrors((prev) => ({ ...prev, numero: errorDeDuplicado }));
            } else {
                if (errors.numero === errorDeDuplicado) {
                    setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.numero;
                        return newErrors;
                    });
                }
            }
        }
    }, [formData.manzana, formData.numero, errors.numero, setErrors, enviando]);

    // --- Validación instantánea para Matrícula ---
    useEffect(() => {
        // ----> AJUSTE: No validar si ya se está enviando
        if (enviando) return;

        const { matricula } = formData;
        const errorDeDuplicado = "Esta matrícula ya está registrada.";

        if (matricula.trim()) {
            const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
            const existeMatricula = viviendas.some(
                (v) => v.matricula.trim().toLowerCase() === matricula.trim().toLowerCase()
            );

            if (existeMatricula) {
                setErrors((prev) => ({ ...prev, matricula: errorDeDuplicado }));
            } else {
                if (errors.matricula === errorDeDuplicado) {
                    setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.matricula;
                        return newErrors;
                    });
                }
            }
        }
    }, [formData.matricula, errors.matricula, setErrors, enviando]);


    // --- Validación instantánea para Nomenclatura ---
    useEffect(() => {
        // ----> AJUSTE: No validar si ya se está enviando
        if (enviando) return;

        const { nomenclatura } = formData;
        const errorDeDuplicado = "Esta nomenclatura ya está registrada.";
        const normalizar = (str) => str.toLowerCase().replace(/\s+/g, " ").trim();

        if (nomenclatura.trim()) {
            const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
            const nomenclaturaNormalizada = normalizar(nomenclatura);
            const existeNomenclatura = viviendas.some(
                (v) => normalizar(v.nomenclatura) === nomenclaturaNormalizada
            );

            if (existeNomenclatura) {
                setErrors((prev) => ({ ...prev, nomenclatura: errorDeDuplicado }));
            } else {
                if (errors.nomenclatura === errorDeDuplicado) {
                    setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.nomenclatura;
                        return newErrors;
                    });
                }
            }
        }
    }, [formData.nomenclatura, errors.nomenclatura, setErrors, enviando]);


    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#c62828]">
                    🏠 Crear Nueva Vivienda
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
                    {/* El JSX del formulario no cambia */}
                    {/* Manzana */}
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="manzana">
                            Manzana <span className="text-red-600">*</span>
                        </label>
                        <select
                            id="manzana"
                            name="manzana"
                            value={formData.manzana}
                            onChange={handleInputChange}
                            className={`w-full border p-2 rounded-lg ${errors.manzana ? "border-red-600" : "border-gray-300"}`}
                        >
                            <option value="">Selecciona</option>
                            {["A", "B", "C", "D", "E", "F"].map((op) => (
                                <option key={op} value={op}>{op}</option>
                            ))}
                        </select>
                        {errors.manzana && <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>}
                    </div>

                    {/* Número de casa */}
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="numero">
                            Número de casa <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="numero"
                            name="numero"
                            type="text"
                            value={formData.numero}
                            onChange={handleInputChange}
                            className={`w-full border p-2 rounded-lg ${errors.numero ? "border-red-600" : "border-gray-300"}`}
                            maxLength={6}
                        />
                        {errors.numero && <p className="text-red-600 text-sm mt-1">{errors.numero}</p>}
                    </div>

                    {/* Matrícula */}
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="matricula">
                            Matrícula inmobiliaria <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="matricula"
                            name="matricula"
                            type="text"
                            value={formData.matricula}
                            onChange={handleInputChange}
                            className={`w-full border p-2 rounded-lg ${errors.matricula ? "border-red-600" : "border-gray-300"}`}
                            maxLength={15}
                        />
                        {errors.matricula && <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>}
                    </div>

                    {/* Nomenclatura */}
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="nomenclatura">
                            Nomenclatura <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="nomenclatura"
                            name="nomenclatura"
                            type="text"
                            value={formData.nomenclatura}
                            onChange={handleInputChange}
                            className={`w-full border p-2 rounded-lg ${errors.nomenclatura ? "border-red-600" : "border-gray-300"}`}
                            maxLength={25}
                        />
                        {errors.nomenclatura && <p className="text-red-600 text-sm mt-1">{errors.nomenclatura}</p>}
                    </div>

                    {/* Valor total */}
                    <div className="md:col-span-2">
                        <label className="block font-semibold mb-1" htmlFor="valor">
                            Valor total <span className="text-red-600">*</span>
                        </label>
                        <NumericFormat
                            id="valor"
                            name="valor"
                            value={formData.valor}
                            onValueChange={(values) => handleValueChange('valor', values.value)}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="$ "
                            className={`w-full border p-2 rounded-lg ${errors.valor ? "border-red-600" : "border-gray-300"}`}
                        />
                        {errors.valor && <p className="text-red-600 text-sm mt-1">{errors.valor}</p>}
                    </div>

                    {/* Botón de envío */}
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={enviando}
                            className={`px-5 py-2.5 rounded-full transition text-white ${enviando ? "bg-gray-400 cursor-not-allowed" : "bg-[#28a745] hover:bg-green-700"}`}
                        >
                            {enviando ? "Guardando..." : "Guardar Vivienda"}
                        </button>
                    </div>
                </form>
            </div>
        </AnimatedPage>
    );
};

export default CrearVivienda;