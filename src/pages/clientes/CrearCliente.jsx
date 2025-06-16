import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import AnimatedPage from "../../components/AnimatedPage";
import { normalizarViviendas } from "../../utils/storage";

const CrearCliente = () => {
    const [formData, setFormData] = useState({
        nombre: "",
        cedula: "",
        telefono: "",
        correo: "",
        direccion: "",
        viviendaId: "",
    });

    const [viviendasDisponibles, setViviendasDisponibles] = useState([]);
    const [mensajeExito, setMensajeExito] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        normalizarViviendas();
        const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
        const disponibles = viviendas.filter((v) => v.clienteId === null);
        setViviendasDisponibles(disponibles);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
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

        setMensajeExito(true);
        setTimeout(() => {
            setMensajeExito(false);
            setEnviando(false);
            navigate("/clientes/listar");
        }, 2000);
    };

    const noHayViviendas = viviendasDisponibles.length === 0;

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#1976d2]">
                    🧍 Crear Cliente
                </h2>

                {mensajeExito && (
                    <div className="mb-4 text-green-600 font-medium text-center">
                        ✅ Cliente registrado exitosamente.
                    </div>
                )}

                {noHayViviendas ? (
                    <div className="bg-yellow-100 text-yellow-800 p-4 rounded text-center font-semibold">
                        ⚠️ No hay viviendas disponibles para asignar.<br />
                        Por favor crea nuevas viviendas antes de registrar clientes.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-semibold mb-1">Nombre</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full border border-gray-300 p-2 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Cédula</label>
                            <input
                                type="text"
                                value={formData.cedula}
                                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                className="w-full border border-gray-300 p-2 rounded-lg"
                                required
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Teléfono</label>
                            <input
                                type="text"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                className="w-full border border-gray-300 p-2 rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block font-semibold mb-1">Correo</label>
                            <input
                                type="email"
                                value={formData.correo}
                                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                className="w-full border border-gray-300 p-2 rounded-lg"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1">Dirección</label>
                            <input
                                type="text"
                                value={formData.direccion}
                                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                className="w-full border border-gray-300 p-2 rounded-lg"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1">Vivienda a asignar</label>
                            <Select
                                options={viviendasDisponibles.map((v) => ({
                                    value: v.numeroCasa,
                                    label: `Manzana ${v.manzana} - Casa ${v.numeroCasa}`,
                                }))}
                                onChange={(selected) =>
                                    setFormData({ ...formData, viviendaId: selected?.value || "" })
                                }
                                placeholder="Buscar vivienda disponible..."
                                isClearable
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={enviando}
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
