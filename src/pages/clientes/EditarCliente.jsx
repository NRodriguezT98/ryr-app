import { useEffect, useState, useMemo } from "react";
import Select from "react-select";
import { useToast } from "../../components/ToastContext";

const camposMostrar = [
    { key: "nombre", label: "Nombre" },
    { key: "cedula", label: "Cédula" },
    { key: "telefono", label: "Teléfono" },
    { key: "correo", label: "Correo" },
    { key: "direccion", label: "Dirección" },
    { key: "viviendaId", label: "Vivienda asignada" },
];

const EditarCliente = ({
    isOpen,
    onClose,
    onCierreFinalizado,
    onGuardar,
    cliente,
    viviendas,
}) => {
    const [formData, setFormData] = useState({
        nombre: "",
        cedula: "",
        telefono: "",
        correo: "",
        direccion: "",
        viviendaId: "",
    });
    const [cerrandoModal, setCerrandoModal] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const { showToast } = useToast();  // Corrección aquí

    // Opciones de vivienda (solo disponibles o la actual)
    const viviendasDisponibles = useMemo(() => {
        if (!viviendas) return [];
        return viviendas.filter(
            (v) => v.clienteId == null || v.clienteId === cliente?.id
        );
    }, [viviendas, cliente]);

    const opcionesVivienda = viviendasDisponibles.map((v) => ({
        value: String(v.numeroCasa),
        label: `Manzana ${v.manzana} - Casa ${v.numeroCasa}`,
    }));

    const selectedOption =
        opcionesVivienda.find(
            (opt) => String(opt.value) === String(formData.viviendaId)
        ) || null;

    useEffect(() => {
        if (cliente) {
            let viviendaId = "";
            if (
                cliente.vivienda &&
                typeof cliente.vivienda.numeroCasa !== "undefined" &&
                cliente.vivienda.numeroCasa !== null
            ) {
                viviendaId = String(cliente.vivienda.numeroCasa);
            } else if (
                typeof cliente.viviendaId !== "undefined" &&
                cliente.viviendaId !== null &&
                cliente.viviendaId !== ""
            ) {
                viviendaId = String(cliente.viviendaId);
            }
            setFormData({
                nombre: cliente.nombre || "",
                cedula: cliente.cedula || "",
                telefono: cliente.telefono || "",
                correo: cliente.correo || "",
                direccion: cliente.direccion || "",
                viviendaId: viviendaId || "",
            });
        }
    }, [cliente]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((f) => ({ ...f, [name]: value }));
    };

    const handleSelectChange = (selected) => {
        setFormData((f) => ({
            ...f,
            viviendaId: selected?.value ? String(selected.value) : "",
        }));
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
        setMostrarConfirmacion(true);
    };

    const obtenerCambios = () => {
        if (!cliente) return [];
        return camposMostrar
            .map((campo) => {
                if (campo.key === "viviendaId") {
                    let idAnt = "";
                    if (
                        cliente.vivienda &&
                        typeof cliente.vivienda.numeroCasa !== "undefined" &&
                        cliente.vivienda.numeroCasa !== null
                    ) {
                        idAnt = String(cliente.vivienda.numeroCasa);
                    } else if (
                        typeof cliente.viviendaId !== "undefined" &&
                        cliente.viviendaId !== null &&
                        cliente.viviendaId !== ""
                    ) {
                        idAnt = String(cliente.viviendaId);
                    }
                    const idAct = formData.viviendaId ? String(formData.viviendaId) : "";

                    const vivAnt = viviendas?.find((v) => String(v.numeroCasa) === idAnt);
                    const vivAct = viviendas?.find((v) => String(v.numeroCasa) === idAct);

                    const anterior = vivAnt
                        ? `Manzana ${vivAnt.manzana} - Casa ${vivAnt.numeroCasa}`
                        : "No asignada";
                    const actual = vivAct
                        ? `Manzana ${vivAct.manzana} - Casa ${vivAct.numeroCasa}`
                        : "No asignada";

                    if (idAnt !== idAct) {
                        return {
                            campo: campo.label,
                            anterior,
                            actual,
                        };
                    }
                    return null;
                }

                let anterior = cliente[campo.key] ?? "";
                let actual = formData[campo.key] ?? "";

                if (String(anterior) !== String(actual)) {
                    return {
                        campo: campo.label,
                        anterior,
                        actual,
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
                ...cliente,
                ...formData,
                viviendaId: formData.viviendaId ? parseInt(formData.viviendaId) : null,
            });
            showToast("Cambios guardados correctamente.", "success");  // Aquí la notificación toast
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
                    ✏️ Editar Cliente
                </h2>
                <form onSubmit={handleGuardar} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Cédula</label>
                        <input
                            type="text"
                            name="cedula"
                            value={formData.cedula}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Teléfono</label>
                        <input
                            type="text"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">Correo</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block font-semibold mb-1">Dirección</label>
                        <input
                            type="text"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block font-semibold mb-1">Vivienda asignada</label>
                        <Select
                            options={opcionesVivienda}
                            value={selectedOption}
                            onChange={handleSelectChange}
                            placeholder="Buscar vivienda disponible..."
                            isClearable
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-6">
                        <button
                            type="button"
                            onClick={cerrarAnimado}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-full transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="ml-4 px-5 py-2.5 rounded-full text-white bg-[#c62828] hover:bg-red-700 transition"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>

                {/* MODAL CONFIRMAR GUARDADO */}
                {mostrarConfirmacion && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                            <h3 className="text-lg font-semibold text-center mb-4">Confirmar cambios</h3>
                            <div className="text-left mb-5">
                                {cambios.length === 0 ? (
                                    <div className="text-sm text-yellow-600 text-center mb-2">
                                        No hay cambios detectados, pero puedes guardar igualmente si lo deseas.
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
                            <p className="text-center mb-6">¿Deseas guardar los cambios de este cliente?</p>
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

export default EditarCliente;
