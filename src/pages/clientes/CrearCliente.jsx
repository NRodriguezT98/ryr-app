import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import AnimatedPage from "../../components/AnimatedPage";
import { normalizarViviendas } from "../../utils/storage";
import { useToast } from "../../components/ToastContext";

const CrearCliente = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        cedula: "",
        telefono: "",
        correo: "",
        direccion: "",
        viviendaId: "",
    });

    const [errors, setErrors] = useState({});
    const [viviendasDisponibles, setViviendasDisponibles] = useState([]);
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        normalizarViviendas();
        const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
        const disponibles = viviendas.filter((v) => v.clienteId === null);
        setViviendasDisponibles(disponibles);
    }, []);

    const validar = (fieldValues = formData) => {
        const temp = { ...errors };

        if ("nombre" in fieldValues) {
            if (!fieldValues.nombre.trim()) {
                temp.nombre = "El nombre es obligatorio.";
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(fieldValues.nombre.trim())) {
                temp.nombre = "El nombre solo puede contener letras y espacios.";
            } else {
                temp.nombre = "";
            }
        }

        if ("cedula" in fieldValues) {
            if (!fieldValues.cedula.trim()) {
                temp.cedula = "La cédula es obligatoria.";
            } else if (!/^\d+$/.test(fieldValues.cedula.trim())) {
                temp.cedula = "La cédula debe contener solo números.";
            } else {
                temp.cedula = "";
            }
        }

        if ("telefono" in fieldValues) {
            if (!fieldValues.telefono.trim()) {
                temp.telefono = "El teléfono es obligatorio.";
            } else if (!/^\d+$/.test(fieldValues.telefono.trim())) {
                temp.telefono = "El teléfono debe contener solo números.";
            } else {
                temp.telefono = "";
            }
        }

        if ("correo" in fieldValues) {
            if (!fieldValues.correo.trim()) {
                temp.correo = "El correo es obligatorio.";
            } else if (
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValues.correo.trim())
            ) {
                temp.correo = "El correo no es válido.";
            } else {
                temp.correo = "";
            }
        }

        if ("direccion" in fieldValues)
            temp.direccion = fieldValues.direccion.trim() ? "" : "La dirección es obligatoria.";

        if ("viviendaId" in fieldValues) {
            temp.viviendaId =
                fieldValues.viviendaId === "" ? "La vivienda es obligatoria." : "";
        }

        setErrors({
            ...temp,
        });

        if (fieldValues === formData) {
            return (
                temp.nombre === "" &&
                temp.cedula === "" &&
                temp.telefono === "" &&
                temp.correo === "" &&
                temp.viviendaId === "" &&
                temp.direccion === ""
            );
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        validar({ [name]: value });
    };

    const handleSelectChange = (selected) => {
        setFormData({ ...formData, viviendaId: selected?.value || "" });
        validar({ viviendaId: selected?.value || "" });
    };

    const noHayViviendas = viviendasDisponibles.length === 0;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validar()) {
            setEnviando(true);

            const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
            const nuevoCliente = {
                ...formData,
                id: Date.now(),
                viviendaId: parseInt(formData.viviendaId),
            };

            clientes.push(nuevoCliente);
            localStorage.setItem("clientes", JSON.stringify(clientes));

            const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
            const actualizadas = viviendas.map((v) =>
                v.numeroCasa === parseInt(formData.viviendaId)
                    ? { ...v, clienteId: nuevoCliente.id }
                    : v
            );
            localStorage.setItem("viviendas", JSON.stringify(actualizadas));

            showToast("Cliente registrado exitosamente.", "success");

            setTimeout(() => {
                setEnviando(false);
                navigate("/clientes/listar");
            }, 2000);
        }
        // Ya no mostramos toast de advertencia aquí porque los errores se muestran debajo de cada campo
    };

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#1976d2]">
                    🧍 Crear Cliente
                </h2>

                {noHayViviendas ? (
                    <div className="bg-yellow-100 text-yellow-800 p-4 rounded text-center font-semibold">
                        ⚠️ No hay viviendas disponibles para asignar.
                        <br />
                        Por favor crea nuevas viviendas antes de registrar clientes.
                    </div>
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        noValidate
                    >
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="nombre">
                                Nombre <span className="text-red-600">*</span>
                            </label>
                            <input
                                id="nombre"
                                name="nombre"
                                type="text"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                className={`w-full border p-2 rounded-lg ${errors.nombre ? "border-red-600" : "border-gray-300"
                                    }`}
                                required
                            />
                            {errors.nombre && (
                                <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-semibold mb-1" htmlFor="cedula">
                                Cédula <span className="text-red-600">*</span>
                            </label>
                            <input
                                id="cedula"
                                name="cedula"
                                type="text"
                                value={formData.cedula}
                                onChange={handleInputChange}
                                className={`w-full border p-2 rounded-lg ${errors.cedula ? "border-red-600" : "border-gray-300"
                                    }`}
                                required
                            />
                            {errors.cedula && (
                                <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-semibold mb-1" htmlFor="telefono">
                                Teléfono <span className="text-red-600">*</span>
                            </label>
                            <input
                                id="telefono"
                                name="telefono"
                                type="text"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                className={`w-full border p-2 rounded-lg ${errors.telefono ? "border-red-600" : "border-gray-300"
                                    }`}
                                required
                            />
                            {errors.telefono && (
                                <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-semibold mb-1" htmlFor="correo">
                                Correo <span className="text-red-600">*</span>
                            </label>
                            <input
                                id="correo"
                                name="correo"
                                type="email"
                                value={formData.correo}
                                onChange={handleInputChange}
                                className={`w-full border p-2 rounded-lg ${errors.correo ? "border-red-600" : "border-gray-300"
                                    }`}
                                required
                            />
                            {errors.correo && (
                                <p className="text-red-600 text-sm mt-1">{errors.correo}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1" htmlFor="direccion">
                                Dirección <span className="text-red-600">*</span>
                            </label>
                            <input
                                id="direccion"
                                name="direccion"
                                type="text"
                                value={formData.direccion}
                                onChange={handleInputChange}
                                className={`w-full border p-2 rounded-lg ${errors.direccion ? "border-red-600" : "border-gray-300"
                                    }`}
                                required
                            />
                            {errors.direccion && (
                                <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1">
                                Vivienda a asignar <span className="text-red-600">*</span>
                            </label>
                            <Select
                                options={viviendasDisponibles.map((v) => ({
                                    value: v.numeroCasa,
                                    label: `Manzana ${v.manzana} - Casa ${v.numeroCasa}`,
                                }))}
                                onChange={handleSelectChange}
                                placeholder="Buscar vivienda disponible..."
                                isClearable={false}
                                value={
                                    formData.viviendaId
                                        ? {
                                            value: formData.viviendaId,
                                            label: `Manzana ${viviendasDisponibles.find(
                                                (v) => v.numeroCasa === formData.viviendaId
                                            )?.manzana || ""
                                                } - Casa ${formData.viviendaId}`,
                                        }
                                        : null
                                }
                            />
                            {errors.viviendaId && (
                                <p className="text-red-600 text-sm mt-1">{errors.viviendaId}</p>
                            )}
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className={`px-5 py-2.5 rounded-full transition text-white ${enviando
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-[#1976d2] hover:bg-blue-700"
                                    }`}
                            >
                                {enviando ? "Guardando..." : "Registrar Cliente"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AnimatedPage>
    );
};

export default CrearCliente;
