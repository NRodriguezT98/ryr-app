// src/pages/EditarVivienda.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import AnimatedPage from "../../components/AnimatedPage";

const EditarVivienda = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [manzana, setManzana] = useState("");
    const [numeroCasa, setNumeroCasa] = useState("");
    const [matricula, setMatricula] = useState("");
    const [nomenclatura, setNomenclatura] = useState("");
    const [valorTotal, setValorTotal] = useState("");
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("viviendas")) || [];
        const vivienda = data[id];
        if (vivienda) {
            setManzana(vivienda.manzana);
            setNumeroCasa(vivienda.numeroCasa.toString());
            setMatricula(vivienda.matricula);
            setNomenclatura(vivienda.nomenclatura);
            setValorTotal(vivienda.valorTotal.toString());
        }
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setGuardando(true);

        const viviendaActualizada = {
            manzana,
            numeroCasa: parseInt(numeroCasa),
            matricula,
            nomenclatura,
            valorTotal: parseInt(valorTotal),
        };

        const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
        viviendas[id] = viviendaActualizada;
        localStorage.setItem("viviendas", JSON.stringify(viviendas));

        setTimeout(() => {
            navigate("/viviendas/listar");
        }, 2000);
    };

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
                <h2 className="text-2xl font-bold text-[#c62828] text-center mb-6">
                    ✏️ Editar Vivienda
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/3">
                            <label className="block font-semibold mb-1">Manzana</label>
                            <select
                                value={manzana}
                                onChange={(e) => setManzana(e.target.value)}
                                required
                                className="w-full border border-gray-300 p-2 rounded-lg"
                            >
                                <option value="">Selecciona</option>
                                {["A", "B", "C", "D", "E", "F"].map((op) => (
                                    <option key={op} value={op}>{op}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full md:w-1/3">
                            <label className="block font-semibold mb-1">Número de casa</label>
                            <input
                                type="number"
                                value={numeroCasa}
                                onChange={(e) => setNumeroCasa(e.target.value)}
                                required
                                className="w-full border border-gray-300 p-2 rounded-lg"
                            />
                        </div>

                        <div className="w-full md:w-1/3">
                            <label className="block font-semibold mb-1">Matrícula</label>
                            <input
                                type="text"
                                value={matricula}
                                onChange={(e) => setMatricula(e.target.value)}
                                required
                                className="w-full border border-gray-300 p-2 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2">
                            <label className="block font-semibold mb-1">Nomenclatura</label>
                            <input
                                type="text"
                                value={nomenclatura}
                                onChange={(e) => setNomenclatura(e.target.value)}
                                required
                                className="w-full border border-gray-300 p-2 rounded-lg"
                            />
                        </div>

                        <div className="w-full md:w-1/2">
                            <label className="block font-semibold mb-1">Valor total</label>
                            <NumericFormat
                                value={valorTotal}
                                onValueChange={({ value }) => setValorTotal(value)}
                                thousandSeparator="."
                                decimalSeparator=","
                                prefix="$ "
                                allowNegative={false}
                                decimalScale={0}
                                className="w-full border border-gray-300 p-2 rounded-lg"
                                required
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={guardando}
                            className={`px-6 py-2 rounded-lg transition text-white ${guardando
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#c62828] hover:bg-red-700"
                                }`}
                        >
                            {guardando ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </AnimatedPage>
    );
};

export default EditarVivienda;
