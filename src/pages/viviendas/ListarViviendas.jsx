import React, { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";
import { Pencil, Trash } from "lucide-react";
import AnimatedPage from "../../components/AnimatedPage";

const ListarViviendas = () => {
    const [viviendas, setViviendas] = useState([]);
    const [claveEditando, setClaveEditando] = useState(null);
    const [formData, setFormData] = useState({
        manzana: "",
        numero: "",
        matricula: "",
        nomenclatura: "",
        valor: "",
    });

    const [mensajeExito, setMensajeExito] = useState(false);
    const [mensajeEliminado, setMensajeEliminado] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
    const [cerrandoModal, setCerrandoModal] = useState(false);
    const [claveAEliminar, setClaveAEliminar] = useState(null);
    const [animandoFila, setAnimandoFila] = useState(null);

    // 🔄 Cargar viviendas ordenadas
    useEffect(() => {
        const data = localStorage.getItem("viviendas");
        if (data) {
            const viviendasOrdenadas = JSON.parse(data).sort((a, b) => {
                const manzanaOrden = a.manzana.localeCompare(b.manzana);
                return manzanaOrden !== 0 ? manzanaOrden : a.numeroCasa - b.numeroCasa;
            });
            setViviendas(viviendasOrdenadas);
        }
    }, []);

    // 🔍 Generar clave única
    const obtenerClave = (v) => `${v.manzana}-${v.numeroCasa}`;

    const abrirModalEditar = (clave) => {
        setClaveEditando(clave);
        const vivienda = viviendas.find((v) => obtenerClave(v) === clave);
        if (vivienda) {
            setFormData({
                manzana: vivienda.manzana,
                numero: vivienda.numeroCasa?.toString() || "",
                matricula: vivienda.matricula,
                nomenclatura: vivienda.nomenclatura,
                valor: vivienda.valorTotal?.toString() || "",
            });
        }
    };

    const guardarCambios = () => setMostrarConfirmacion(true);

    const confirmarGuardar = () => {
        const nuevas = viviendas.map((v) =>
            obtenerClave(v) === claveEditando
                ? {
                    manzana: formData.manzana,
                    numeroCasa: parseInt(formData.numero),
                    matricula: formData.matricula,
                    nomenclatura: formData.nomenclatura,
                    valorTotal: parseInt(formData.valor),
                }
                : v
        );

        // Ordenar por manzana (alfabéticamente) y número de casa (ascendente)
        const ordenadas = nuevas.sort((a, b) => {
            const cmp = a.manzana.localeCompare(b.manzana);
            return cmp !== 0 ? cmp : a.numeroCasa - b.numeroCasa;
        });

        setViviendas(ordenadas);
        localStorage.setItem("viviendas", JSON.stringify(ordenadas));

        setCerrandoModal(true);
        setTimeout(() => {
            setClaveEditando(null);
            setCerrandoModal(false);
        }, 200);

        setMostrarConfirmacion(false);
        setMensajeExito(true);
        setTimeout(() => setMensajeExito(false), 3000);
    };


    const iniciarEliminacion = (clave) => {
        setClaveAEliminar(clave);
        setMostrarConfirmacionEliminar(true);
    };

    const confirmarEliminar = () => {
        setAnimandoFila(claveAEliminar);
        setTimeout(() => {
            const nuevas = viviendas.filter((v) => obtenerClave(v) !== claveAEliminar);
            setViviendas(nuevas);
            localStorage.setItem("viviendas", JSON.stringify(nuevas));
            setMostrarConfirmacionEliminar(false);
            setMensajeEliminado(true);
            setClaveAEliminar(null);
            setTimeout(() => setMensajeEliminado(false), 3000);
        }, 300);
    };

    return (
        <>
            <AnimatedPage>
                <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md mt-10 relative">
                    <h2 className="text-2xl font-bold mb-4 text-[#c62828] text-center">
                        🏠 Viviendas Registradas
                    </h2>

                    {(mensajeExito || mensajeEliminado) && (
                        <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300">
                            ✅ {mensajeExito ? "Se guardaron los cambios" : "Vivienda eliminada correctamente"}
                        </div>
                    )}

                    {viviendas.length === 0 ? (
                        <p className="text-center text-gray-600">No hay viviendas registradas.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table-auto w-full border text-sm text-center">
                                <thead className="bg-[#c62828] text-white">
                                    <tr>
                                        <th className="px-4 py-2">Manzana</th>
                                        <th className="px-4 py-2">Número</th>
                                        <th className="px-4 py-2">Matrícula</th>
                                        <th className="px-4 py-2">Nomenclatura</th>
                                        <th className="px-4 py-2">Valor</th>
                                        <th className="px-4 py-2">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viviendas.map((v) => {
                                        const clave = obtenerClave(v);
                                        return (
                                            <tr key={clave} className={`border-b ${animandoFila === clave ? "animate-fade-out" : "animate-fade-in"}`}>
                                                <td className="px-4 py-2">{v.manzana}</td>
                                                <td className="px-4 py-2">{v.numeroCasa}</td>
                                                <td className="px-4 py-2">{v.matricula}</td>
                                                <td className="px-4 py-2">{v.nomenclatura}</td>
                                                <td className="px-4 py-2">
                                                    {v.valorTotal?.toLocaleString("es-CO", {
                                                        style: "currency",
                                                        currency: "COP",
                                                        minimumFractionDigits: 0,
                                                    })}
                                                </td>
                                                <td className="px-4 py-2 space-x-2">
                                                    <button
                                                        onClick={() => abrirModalEditar(clave)}
                                                        className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-400 shadow-sm font-semibold px-4 py-1.5 rounded-full transition"
                                                    >
                                                        <Pencil size={16} strokeWidth={2} />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => iniciarEliminacion(clave)}
                                                        className="inline-flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-400 shadow-sm font-semibold px-4 py-1.5 rounded-full transition"
                                                    >
                                                        <Trash size={16} strokeWidth={2} />
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </AnimatedPage>

            {/* MODAL EDITAR */}
            {claveEditando && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 mx-4 ${cerrandoModal ? "animate-fade-out" : "animate-fade-in"}`}>
                        <h2 className="text-3xl font-bold text-[#c62828] text-center mb-8">✏️ Editar Vivienda</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-1">Manzana</label>
                                <select
                                    value={formData.manzana}
                                    onChange={(e) => setFormData({ ...formData, manzana: e.target.value })}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828]"
                                >
                                    <option value="">Selecciona</option>
                                    {["A", "B", "C", "D", "E", "F"].map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Número</label>
                                <input
                                    type="number"
                                    value={formData.numero}
                                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828]"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Matrícula</label>
                                <input
                                    type="text"
                                    value={formData.matricula}
                                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828]"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Nomenclatura</label>
                                <input
                                    type="text"
                                    value={formData.nomenclatura}
                                    onChange={(e) => setFormData({ ...formData, nomenclatura: e.target.value })}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828]"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-1">Valor</label>
                                <NumericFormat
                                    value={formData.valor}
                                    onValueChange={({ value }) => setFormData({ ...formData, valor: value })}
                                    thousandSeparator="."
                                    decimalSeparator=","
                                    prefix="$ "
                                    allowNegative={false}
                                    decimalScale={0}
                                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-[#c62828]"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-8 space-x-4">
                            <button
                                onClick={() => setClaveEditando(null)}
                                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-5 py-2.5 rounded-full transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardarCambios}
                                className="bg-[#28a745] hover:bg-green-700 text-white px-5 py-2.5 rounded-full transition"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CONFIRMAR CAMBIOS */}
            {mostrarConfirmacion && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-center mb-4">Confirmar cambios</h3>
                        <p className="text-center mb-6">¿Deseas guardar los cambios de esta vivienda?</p>
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

            {/* MODAL CONFIRMAR ELIMINACIÓN */}
            {mostrarConfirmacionEliminar && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-center mb-4 text-red-600">¿Eliminar vivienda?</h3>
                        <p className="text-center mb-6 text-gray-700">Esta acción no se puede deshacer.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setMostrarConfirmacionEliminar(false);
                                    setClaveAEliminar(null);
                                }}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminar}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ListarViviendas;
