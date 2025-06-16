// src/pages/CrearVivienda.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import AnimatedPage from "../../components/AnimatedPage";

const CrearVivienda = () => {
    const [formData, setFormData] = useState({
        manzana: "",
        numero: "",
        matricula: "",
        nomenclatura: "",
        valor: "",
    });

    const [mensajeExito, setMensajeExito] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setEnviando(true);

        const nuevasViviendas = JSON.parse(localStorage.getItem("viviendas")) || [];
        nuevasViviendas.push({
            manzana: formData.manzana,
            numeroCasa: parseInt(formData.numero),
            matricula: formData.matricula,
            nomenclatura: formData.nomenclatura,
            valorTotal: parseInt(formData.valor),
            clienteId: null
        });

        localStorage.setItem("viviendas", JSON.stringify(nuevasViviendas));
        setFormData({
            manzana: "",
            numero: "",
            matricula: "",
            nomenclatura: "",
            valor: "",
        });

        setMensajeExito(true);

        setTimeout(() => {
            setMensajeExito(false);
            setEnviando(false);
            navigate("/viviendas/listar");
        }, 2000);
    };

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 text-center text-[#c62828]">
                    🏠 Crear Nueva Vivienda
                </h2>

                {mensajeExito && (
                    <div className="mb-4 text-green-600 font-medium text-center">
                        ✅ Vivienda registrada exitosamente.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1">Manzana</label>
                        <select
                            value={formData.manzana}
                            onChange={(e) => setFormData({ ...formData, manzana: e.target.value })}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                            required
                        >
                            <option value="">Selecciona</option>
                            {["A", "B", "C", "D", "E", "F"].map((op) => (
                                <option key={op} value={op}>{op}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Número de casa</label>
                        <input
                            type="number"
                            value={formData.numero}
                            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Matrícula inmobiliaria</label>
                        <input
                            type="text"
                            value={formData.matricula}
                            onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                            required
                        />
                    </div>

                    <div>
                        <label className="block font-semibold mb-1">Nomenclatura</label>
                        <input
                            type="text"
                            value={formData.nomenclatura}
                            onChange={(e) => setFormData({ ...formData, nomenclatura: e.target.value })}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block font-semibold mb-1">Valor total</label>
                        <NumericFormat
                            value={formData.valor}
                            onValueChange={({ value }) => setFormData({ ...formData, valor: value })}
                            thousandSeparator="."
                            decimalSeparator=","
                            prefix="$ "
                            allowNegative={false}
                            decimalScale={0}
                            className="w-full border border-gray-300 p-2 rounded-lg"
                            required
                        />
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
