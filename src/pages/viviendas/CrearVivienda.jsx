import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import AnimatedPage from "../../components/AnimatedPage";
import { useToast } from "../../components/ToastContext";

const CrearVivienda = () => {
    const [formData, setFormData] = useState({
        manzana: "",
        numero: "",
        matricula: "",
        nomenclatura: "",
        valor: "",
    });

    const [errors, setErrors] = useState({});
    const [enviando, setEnviando] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false); // <--- Nuevo estado

    const navigate = useNavigate();
    const { showToast } = useToast();

    const validar = (fieldValues = formData) => {
        const temp = { ...errors };

        if ("manzana" in fieldValues)
            temp.manzana = fieldValues.manzana ? "" : "La manzana es obligatoria.";

        if ("numero" in fieldValues) {
            if (!fieldValues.numero) {
                temp.numero = "El número de casa es obligatorio.";
            } else if (!/^\d+$/.test(fieldValues.numero)) {
                temp.numero = "Solo se permiten números en el número de casa.";
            } else {
                temp.numero = "";
            }
        }

        if ("matricula" in fieldValues) {
            if (!fieldValues.matricula || !fieldValues.matricula.trim()) {
                temp.matricula = "La matrícula es obligatoria.";
            } else if (!/^[0-9-]+$/.test(fieldValues.matricula.trim())) {
                temp.matricula = "La matrícula solo puede contener números y guiones.";
            } else {
                temp.matricula = "";
            }
        }

        if ("nomenclatura" in fieldValues) {
            if (!fieldValues.nomenclatura || !fieldValues.nomenclatura.trim()) {
                temp.nomenclatura = "La nomenclatura es obligatoria.";
            } else if (
                !/^[a-zA-Z0-9\s\-#]+$/.test(fieldValues.nomenclatura.trim())
            ) {
                temp.nomenclatura =
                    "La nomenclatura solo puede contener letras, números, espacios, guión (-) y numeral (#).";
            } else {
                temp.nomenclatura = "";
            }
        }

        if ("valor" in fieldValues) {
            if (fieldValues.valor === "" || fieldValues.valor == null) {
                temp.valor = "El valor total es obligatorio.";
            } else if (!/^\d+$/.test(fieldValues.valor)) {
                temp.valor = "Solo se permiten números en el valor total.";
            } else {
                temp.valor = "";
            }
        }

        // Validación para no repetir manzana + número de casa
        if (fieldValues.manzana && fieldValues.numero) {
            const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
            const existeVivienda = viviendas.some(
                (v) =>
                    v.manzana === fieldValues.manzana &&
                    Number(v.numeroCasa) === Number(fieldValues.numero)
            );
            if (existeVivienda) {
                temp.numero = "Ya existe una vivienda con esta manzana y número de casa.";
            }
        }

        // Validar que no se repita matrícula inmobiliaria (sin importar espacios y mayúsculas)
        if (fieldValues.matricula && fieldValues.matricula.trim()) {
            const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
            const matriculaNormalizada = fieldValues.matricula.trim().toLowerCase();
            const existeMatricula = viviendas.some(
                (v) => v.matricula.trim().toLowerCase() === matriculaNormalizada
            );
            if (existeMatricula) {
                temp.matricula = "Ya existe una vivienda con esta matrícula inmobiliaria.";
            }
        }

        // Validar que no se repita nomenclatura (sin importar espacios extras y mayúsculas)
        if (fieldValues.nomenclatura && fieldValues.nomenclatura.trim()) {
            const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
            const normalizarNomenclatura = (str) =>
                str
                    .toLowerCase()
                    .replace(/\s+/g, " ")
                    .trim();

            const nomenclaturaNormalizada = normalizarNomenclatura(fieldValues.nomenclatura);
            const existeNomenclatura = viviendas.some(
                (v) => normalizarNomenclatura(v.nomenclatura) === nomenclaturaNormalizada
            );
            if (existeNomenclatura) {
                temp.nomenclatura = "Ya existe una vivienda con esta nomenclatura.";
            }
        }

        setErrors({
            ...temp,
        });

        if (fieldValues === formData) {
            // Solo retornamos true si no hay errores y el formulario fue enviado
            return (
                Object.values(temp).every((x) => x === "") &&
                formSubmitted
            );
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "numero") {
            const filteredValue = value.replace(/[^0-9]/g, "");
            if (value !== filteredValue) {
                setErrors((prev) => ({
                    ...prev,
                    numero: "Solo se permiten números en el número de casa.",
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    numero: "",
                }));
            }
            setFormData({ ...formData, [name]: filteredValue });
            if (formSubmitted) validar({ [name]: filteredValue });
        } else if (name === "matricula") {
            const filteredValue = value.replace(/[^0-9-]/g, "");
            if (value !== filteredValue) {
                setErrors((prev) => ({
                    ...prev,
                    matricula: "La matrícula solo puede contener números y guiones.",
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    matricula: "",
                }));
            }
            setFormData({ ...formData, [name]: filteredValue });
            if (formSubmitted) validar({ [name]: filteredValue });
        } else if (name === "nomenclatura") {
            const filteredValue = value.replace(/[^a-zA-Z0-9\s\-#]/g, "");
            if (value !== filteredValue) {
                setErrors((prev) => ({
                    ...prev,
                    nomenclatura:
                        "La nomenclatura solo puede contener letras, números, espacios, guión (-) y numeral (#).",
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    nomenclatura: "",
                }));
            }
            setFormData({ ...formData, [name]: filteredValue });
            if (formSubmitted) validar({ [name]: filteredValue });
        } else if (name === "valor") {
            const filteredValue = value.replace(/[^0-9]/g, "");
            if (value !== filteredValue) {
                setErrors((prev) => ({
                    ...prev,
                    valor: "Solo se permiten números en el valor total.",
                }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    valor: "",
                }));
            }
            setFormData({ ...formData, [name]: filteredValue });
            if (formSubmitted) validar({ [name]: filteredValue });
        } else {
            setFormData({ ...formData, [name]: value });
            if (formSubmitted) validar({ [name]: value });
        }
    };

    const handleValorChange = ({ value }) => {
        const filteredValue = value.replace(/[^0-9]/g, "");
        if (value !== filteredValue) {
            setErrors((prev) => ({
                ...prev,
                valor: "Solo se permiten números en el valor total.",
            }));
        } else {
            setErrors((prev) => ({
                ...prev,
                valor: "",
            }));
        }
        setFormData({ ...formData, valor: filteredValue });
        if (formSubmitted) validar({ valor: filteredValue });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true); // <--- Marcar que el formulario fue enviado para mostrar errores

        if (validar()) {
            setEnviando(true);

            const nuevasViviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
            nuevasViviendas.push({
                id: Date.now(),
                manzana: formData.manzana,
                numeroCasa: parseInt(formData.numero),
                matricula: formData.matricula,
                nomenclatura: formData.nomenclatura,
                valorTotal: parseInt(formData.valor),
                clienteId: null,
            });

            localStorage.setItem("viviendas", JSON.stringify(nuevasViviendas));

            // Limpiar formulario y errores después de guardar
            setFormData({
                manzana: "",
                numero: "",
                matricula: "",
                nomenclatura: "",
                valor: "",
            });
            setErrors({});
            setFormSubmitted(false); // <-- Resetear para que no siga mostrando errores

            showToast("✅ Vivienda registrada exitosamente.", "success");

            setTimeout(() => {
                setEnviando(false);
                navigate("/viviendas/listar");
            }, 2000);
        }
    };

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#c62828]">
                    🏠 Crear Nueva Vivienda
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    noValidate
                >
                    <div>
                        <label className="block font-semibold mb-1" htmlFor="manzana">
                            Manzana <span className="text-red-600">*</span>
                        </label>
                        <select
                            id="manzana"
                            name="manzana"
                            value={formData.manzana}
                            onChange={handleInputChange}
                            className={`w-full border p-2 rounded-lg ${errors.manzana ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                        >
                            <option value="">Selecciona</option>
                            {["A", "B", "C", "D", "E", "F"].map((op) => (
                                <option key={op} value={op}>
                                    {op}
                                </option>
                            ))}
                        </select>
                        {errors.manzana && (
                            <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>
                        )}
                    </div>

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
                            className={`w-full border p-2 rounded-lg ${errors.numero ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                            maxLength={6}
                            inputMode="numeric"
                            pattern="[0-9]*"
                        />
                        {errors.numero && (
                            <p className="text-red-600 text-sm mt-1">{errors.numero}</p>
                        )}
                    </div>

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
                            className={`w-full border p-2 rounded-lg ${errors.matricula ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                            maxLength={15}
                        />
                        {errors.matricula && (
                            <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>
                        )}
                    </div>

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
                            className={`w-full border p-2 rounded-lg ${errors.nomenclatura ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                            maxLength={25}
                        />
                        {errors.nomenclatura && (
                            <p className="text-red-600 text-sm mt-1">{errors.nomenclatura}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block font-semibold mb-1" htmlFor="valor">
                            Valor total <span className="text-red-600">*</span>
                        </label>
                        <NumericFormat
                            id="valor"
                            value={formData.valor}
                            onValueChange={handleValorChange}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="$ "
                            allowNegative={false}
                            decimalScale={0}
                            className={`w-full border p-2 rounded-lg ${errors.valor ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                        />
                        {errors.valor && (
                            <p className="text-red-600 text-sm mt-1">{errors.valor}</p>
                        )}
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={enviando}
                            className={`px-5 py-2.5 rounded-full transition text-white ${enviando
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#28a745] hover:bg-green-700"
                                }`}
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
