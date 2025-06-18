import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { useToast } from "../../components/ToastContext";

const MANZANAS = ["A", "B", "C", "D", "E", "F"];

const camposMostrar = [
    { key: "manzana", label: "Manzana" },
    { key: "numero", label: "Número de casa" },
    { key: "matricula", label: "Matrícula" },
    { key: "nomenclatura", label: "Nomenclatura" },
    { key: "valor", label: "Valor total" },
];

const EditarVivienda = ({
    isOpen,
    onClose,
    onCierreFinalizado,
    onGuardar,
    vivienda,
}) => {
    const [formData, setFormData] = useState({
        manzana: "",
        numero: "",
        matricula: "",
        nomenclatura: "",
        valor: "",
    });
    const [errors, setErrors] = useState({});
    const [cerrandoModal, setCerrandoModal] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (vivienda) {
            setFormData({
                manzana: vivienda.manzana || "",
                numero: vivienda.numeroCasa?.toString() || "",
                matricula: vivienda.matricula || "",
                nomenclatura: vivienda.nomenclatura || "",
                valor: vivienda.valorTotal?.toString() || "",
            });
            setErrors({}); // Limpiar errores al cargar datos
        }
    }, [vivienda]);

    const validar = (fieldValues = formData) => {
        const temp = { ...errors };

        if ("manzana" in fieldValues) {
            temp.manzana = fieldValues.manzana ? "" : "La manzana es obligatoria.";
        }

        if ("numero" in fieldValues) {
            if (!fieldValues.numero || !fieldValues.numero.trim()) {
                temp.numero = "El número de casa es obligatorio.";
            } else if (!/^\d+$/.test(fieldValues.numero.trim())) {
                temp.numero = "El número debe ser un valor numérico válido.";
            } else {
                temp.numero = "";
            }
        }

        if ("matricula" in fieldValues) {
            if (!fieldValues.matricula || !fieldValues.matricula.trim()) {
                temp.matricula = "La matrícula es obligatoria.";
            } else {
                temp.matricula = "";
            }
        }

        if ("nomenclatura" in fieldValues) {
            if (!fieldValues.nomenclatura || !fieldValues.nomenclatura.trim()) {
                temp.nomenclatura = "La nomenclatura es obligatoria.";
            } else {
                temp.nomenclatura = "";
            }
        }

        if ("valor" in fieldValues) {
            if (!fieldValues.valor || !fieldValues.valor.trim()) {
                temp.valor = "El valor es obligatorio.";
            } else if (!/^\d+$/.test(fieldValues.valor.trim())) {
                temp.valor = "El valor debe ser un número válido.";
            } else {
                temp.valor = "";
            }
        }

        setErrors({
            ...temp,
        });

        if (fieldValues === formData) {
            return (
                temp.manzana === "" &&
                temp.numero === "" &&
                temp.matricula === "" &&
                temp.nomenclatura === "" &&
                temp.valor === ""
            );
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((f) => ({ ...f, [name]: value }));
        validar({ [name]: value });
    };

    const handleValorChange = (values) => {
        setFormData((f) => ({ ...f, valor: values.value }));
        validar({ valor: values.value });
    };

    const cerrarAnimado = () => {
        setCerrandoModal(true);
        setTimeout(() => {
            setCerrandoModal(false);
            if (onClose) onClose();
            if (onCierreFinalizado) onCierreFinalizado();
        }, 200);
    };

    const handleGuardar = (e) => {
        e.preventDefault();

        if (validar()) {
            setMostrarConfirmacion(true);
        }
    };

    const obtenerCambios = () => {
        if (!vivienda) return [];
        return camposMostrar
            .map((campo) => {
                let anterior = vivienda[campo.key];
                let actual = formData[campo.key];

                if (campo.key === "numero") {
                    anterior = vivienda.numeroCasa?.toString() || "";
                }
                if (campo.key === "valor") {
                    anterior = vivienda.valorTotal?.toString() || "";
                }

                if (String(anterior) !== String(actual)) {
                    return {
                        campo: campo.label,
                        anterior:
                            campo.key === "valor"
                                ? Number(anterior || 0).toLocaleString("es-CO", {
                                    style: "currency",
                                    currency: "COP",
                                    minimumFractionDigits: 0,
                                })
                                : anterior,
                        actual:
                            campo.key === "valor"
                                ? Number(actual || 0).toLocaleString("es-CO", {
                                    style: "currency",
                                    currency: "COP",
                                    minimumFractionDigits: 0,
                                })
                                : actual,
                    };
                }
                return null;
            })
            .filter(Boolean);
    };

    const confirmarGuardar = () => {
        setCerrandoModal(true);
        setMostrarConfirmacion(false);
        setTimeout(() => {
            onGuardar({
                ...vivienda,
                manzana: formData.manzana,
                numeroCasa: parseInt(formData.numero),
                matricula: formData.matricula,
                nomenclatura: formData.nomenclatura,
                valorTotal: parseInt(formData.valor),
            });
            showToast("Cambios guardados correctamente.", "success");
            setCerrandoModal(false);
            if (onClose) onClose();
            if (onCierreFinalizado) onCierreFinalizado();
        }, 200);
    };

    if (!isOpen) return null;

    const cambios = obtenerCambios();

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div
                className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 mx-4 ${cerrandoModal ? "animate-fade-out" : "animate-fade-in"
                    }`}
            >
                <h2 className="text-3xl font-bold text-[#c62828] text-center mb-8">
                    ✏️ Editar Vivienda
                </h2>
                <form
                    onSubmit={handleGuardar}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    noValidate
                >
                    <div>
                        <label className="block font-medium mb-1" htmlFor="manzana">
                            Manzana <span className="text-red-600">*</span>
                        </label>
                        <select
                            name="manzana"
                            id="manzana"
                            value={formData.manzana}
                            onChange={handleChange}
                            className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.manzana ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                        >
                            <option value="">Selecciona</option>
                            {MANZANAS.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                        {errors.manzana && (
                            <p className="text-red-600 text-sm mt-1">{errors.manzana}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1" htmlFor="numero">
                            Número <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="numero"
                            name="numero"
                            type="number"
                            value={formData.numero}
                            onChange={handleChange}
                            className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.numero ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                        />
                        {errors.numero && (
                            <p className="text-red-600 text-sm mt-1">{errors.numero}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1" htmlFor="matricula">
                            Matrícula <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="matricula"
                            name="matricula"
                            type="text"
                            value={formData.matricula}
                            onChange={handleChange}
                            className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.matricula ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                        />
                        {errors.matricula && (
                            <p className="text-red-600 text-sm mt-1">{errors.matricula}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1" htmlFor="nomenclatura">
                            Nomenclatura <span className="text-red-600">*</span>
                        </label>
                        <input
                            id="nomenclatura"
                            name="nomenclatura"
                            type="text"
                            value={formData.nomenclatura}
                            onChange={handleChange}
                            className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.nomenclatura ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                        />
                        {errors.nomenclatura && (
                            <p className="text-red-600 text-sm mt-1">{errors.nomenclatura}</p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block font-medium mb-1" htmlFor="valor">
                            Valor <span className="text-red-600">*</span>
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
                            className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828] ${errors.valor ? "border-red-600" : "border-gray-300"
                                }`}
                            required
                        />
                        {errors.valor && (
                            <p className="text-red-600 text-sm mt-1">{errors.valor}</p>
                        )}
                    </div>

                    <div className="md:col-span-2 flex justify-end mt-8 space-x-4">
                        <button
                            type="button"
                            onClick={cerrarAnimado}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-full transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-[#28a745] hover:bg-green-700 text-white px-5 py-2.5 rounded-full transition"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>

                {mostrarConfirmacion && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                            <h3 className="text-lg font-semibold text-center mb-4">
                                Confirmar cambios
                            </h3>
                            <div className="text-left mb-5">
                                {cambios.length === 0 ? (
                                    <div className="text-sm text-yellow-600 text-center mb-2">
                                        No hay cambios detectados, pero puedes guardar igualmente si lo
                                        deseas.
                                    </div>
                                ) : (
                                    <ul className="text-sm text-gray-700">
                                        {cambios.map(({ campo, anterior, actual }) => (
                                            <li key={campo} className="mb-1">
                                                <span className="font-semibold">{campo}:</span>{" "}
                                                <span className="text-red-600">{anterior || <i>Vacío</i>}</span>{" "}
                                                <span className="font-bold">&rarr;</span>{" "}
                                                <span className="text-green-600">{actual || <i>Vacío</i>}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <p className="text-center mb-6">
                                ¿Deseas guardar los cambios de esta vivienda?
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setMostrarConfirmacion(false)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarGuardar}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditarVivienda;
