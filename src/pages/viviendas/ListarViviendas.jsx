import React, { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import AnimatedPage from "../../components/AnimatedPage";
import EditarVivienda from "./EditarVivienda";
import { useToast } from "../../components/ToastContext";

function formatCOP(valor) {
    if (isNaN(valor)) return valor;
    return Number(valor).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
}

const ListarViviendas = () => {
    const [viviendas, setViviendas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [claveEditando, setClaveEditando] = useState(null);
    const [viviendaEditando, setViviendaEditando] = useState(null);
    const [desmontarEditarModal, setDesmontarEditarModal] = useState(false);

    const [claveAEliminar, setClaveAEliminar] = useState(null);
    const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
    const [animandoFila, setAnimandoFila] = useState(null);

    const { showToast } = useToast();

    useEffect(() => {
        const dataViviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
        const dataClientes = JSON.parse(localStorage.getItem("clientes")) || [];

        const viviendasConCliente = dataViviendas.map((v) => {
            const clienteAsignado = dataClientes.find((c) => c.id === v.clienteId);
            return { ...v, cliente: clienteAsignado || null };
        });

        viviendasConCliente.sort((a, b) => {
            if (a.manzana === b.manzana) {
                return a.numeroCasa - b.numeroCasa;
            }
            return a.manzana.localeCompare(b.manzana);
        });

        setViviendas(viviendasConCliente);
        setClientes(dataClientes);
    }, []);

    const obtenerClave = (v) => `${v.manzana}-${v.numeroCasa}`;

    const abrirModalEditar = (clave) => {
        const vivienda = viviendas.find((v) => obtenerClave(v) === clave);
        setViviendaEditando(vivienda);
        setClaveEditando(clave);
        setDesmontarEditarModal(false);
    };

    const handleGuardarVivienda = (viviendaActualizada) => {
        const dataViviendas = JSON.parse(localStorage.getItem("viviendas")) || [];

        const idx = dataViviendas.findIndex(
            (v) => v.manzana === viviendaActualizada.manzana && v.numeroCasa === viviendaActualizada.numeroCasa
        );
        if (idx !== -1) {
            dataViviendas[idx] = viviendaActualizada;
        }

        dataViviendas.sort((a, b) => {
            if (a.manzana === b.manzana) {
                return a.numeroCasa - b.numeroCasa;
            }
            return a.manzana.localeCompare(b.manzana);
        });

        localStorage.setItem("viviendas", JSON.stringify(dataViviendas));

        const dataClientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const viviendasConCliente = dataViviendas.map((v) => {
            const clienteAsignado = dataClientes.find((c) => c.id === v.clienteId);
            return { ...v, cliente: clienteAsignado || null };
        });

        setViviendas(viviendasConCliente);
        showToast("✅ Se guardaron los cambios", "success");
    };

    const iniciarEliminacion = (clave) => {
        setClaveAEliminar(clave);
        setMostrarConfirmacionEliminar(true);
    };

    const confirmarEliminar = () => {
        setAnimandoFila(claveAEliminar);
        setTimeout(() => {
            const nuevasViviendas = viviendas.filter((v) => obtenerClave(v) !== claveAEliminar);
            setViviendas(nuevasViviendas);
            localStorage.setItem("viviendas", JSON.stringify(nuevasViviendas));
            setMostrarConfirmacionEliminar(false);
            setClaveAEliminar(null);
            showToast("✅ Vivienda eliminada correctamente", "success");
            setTimeout(() => setAnimandoFila(null), 400);
        }, 300);
    };

    const handleCerrarEditar = () => setDesmontarEditarModal(true);
    const handleCierreFinalizado = () => {
        setClaveEditando(null);
        setViviendaEditando(null);
        setDesmontarEditarModal(false);
    };

    return (
        <>
            <AnimatedPage>
                <div className="w-fit mx-auto bg-white p-6 rounded-2xl shadow-2xl mt-10 relative">
                    <h2 className="text-2xl font-bold mb-6 text-[#c62828] text-center font-montserrat">
                        <span className="inline-flex items-center gap-2">
                            <span role="img" aria-label="viviendas">🏠</span>
                            Viviendas Registradas
                        </span>
                    </h2>

                    {viviendas.length === 0 ? (
                        <p className="text-center text-gray-600">No hay viviendas registradas.</p>
                    ) : (
                        <div className="w-fit mx-auto">
                            <table className="table-auto border-collapse shadow-lg rounded-2xl overflow-hidden text-center">
                                <thead className="bg-[#c62828] text-white">
                                    <tr className="uppercase tracking-wide text-xs font-semibold text-center">
                                        <th className="px-5 py-3 whitespace-nowrap rounded-tl-xl text-center">Manzana</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Número</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Cliente asignado</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Matrícula Inm.</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Nomenclatura</th>
                                        <th className="px-5 py-3 whitespace-nowrap text-center">Valor total</th>
                                        <th className="px-5 py-3 whitespace-nowrap rounded-tr-xl text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viviendas.map((v, idx) => {
                                        const clave = obtenerClave(v);
                                        return (
                                            <tr
                                                key={clave}
                                                className={`
                                                    ${animandoFila === clave ? "animate-fade-out" : "animate-fade-in"}
                                                    ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                    hover:bg-yellow-50 transition
                                                `}
                                            >
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 text-base text-center">{v.manzana}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 text-base text-center">{v.numeroCasa}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 text-base text-center">
                                                    {v.cliente
                                                        ? `${v.cliente.nombre}`
                                                        : <span className="inline-block rounded-lg bg-green-50 text-green-700 px-2 py-0.5 text-xs font-semibold">Vivienda disponible para asignación ✅</span>
                                                    }
                                                </td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 text-base text-center">{v.matricula}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 text-base text-center">{v.nomenclatura}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-neutral-800 text-base text-center">{formatCOP(v.valorTotal)}</td>
                                                <td className="px-5 py-3 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => abrirModalEditar(clave)}
                                                        className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300 px-3 py-1.5 text-sm rounded-full transition-all duration-200 hover:shadow-sm"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3z" />
                                                        </svg>
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => iniciarEliminacion(clave)}
                                                        className="inline-flex items-center gap-2 bg-red-100 text-red-800 hover:bg-red-200 border border-red-300 px-3 py-1.5 text-sm rounded-full transition-all duration-200 hover:shadow-sm ml-2"
                                                    >
                                                        <Trash size={16} />
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

            {claveEditando && viviendaEditando && !desmontarEditarModal && (
                <EditarVivienda
                    isOpen={!!claveEditando}
                    onClose={handleCerrarEditar}
                    onCierreFinalizado={handleCierreFinalizado}
                    onGuardar={handleGuardarVivienda}
                    vivienda={viviendaEditando}
                />
            )}

            {mostrarConfirmacionEliminar && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-7 rounded-2xl shadow-2xl max-w-sm w-full">
                        <h3 className="text-xl font-bold text-center mb-2 text-red-600 font-montserrat">¿Eliminar vivienda?</h3>
                        <p className="text-center mb-6 text-gray-700">Esta acción no se puede deshacer.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => {
                                    setMostrarConfirmacionEliminar(false);
                                    setClaveAEliminar(null);
                                }}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-5 py-2 rounded-full transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarEliminar}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-full shadow transition"
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
