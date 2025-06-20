import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import AnimatedPage from "../../components/AnimatedPage";
import { useToast } from "../../components/ToastContext";
import { useForm } from "../../hooks/useForm.jsx";
import { getViviendas, saveViviendas, getClientes, saveClientes } from "../../utils/storage";
import { validateCliente } from "./clienteValidation.js";

const initialState = {
    nombre: "",
    cedula: "",
    telefono: "",
    correo: "",
    direccion: "",
    viviendaId: "",
};

const inputFilters = {
    nombre: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/ },
    cedula: { regex: /^[0-9]*$/ },
    telefono: { regex: /^[0-9]*$/ },
};

const CrearCliente = () => {
    const [viviendasDisponibles, setViviendasDisponibles] = useState([]);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const viviendas = getViviendas();
        const disponibles = viviendas.filter((v) => v.clienteId === null);
        setViviendasDisponibles(disponibles);
    }, []);

    // Lógica de validación para CrearCliente (AHORA FUNCIÓN DIRECTA)
    // Se pasa `false` para `isEditing` ya que es un formulario de creación.
    const validateForm = (formData) => { // Removido useCallback
        return validateCliente(formData, false);
    };

    // Lógica que se ejecuta cuando el formulario es válido y se envía (useCallback para estabilidad)
    const onSubmitLogic = useCallback((formData) => {
        const clientes = getClientes();
        const nuevoCliente = {
            ...formData,
            id: Date.now(),
        };
        clientes.push(nuevoCliente);
        saveClientes(clientes);

        const viviendas = getViviendas();
        const viviendaAsignada = viviendas.find(v => v.id === nuevoCliente.viviendaId);
        if (viviendaAsignada) {
            viviendaAsignada.clienteId = nuevoCliente.id;
            saveViviendas(viviendas);
        }

        showToast("✅ Cliente registrado exitosamente.", "success");
        setTimeout(() => navigate("/clientes/listar"), 1500);
    }, [navigate, showToast]);

    // Usamos nuestro hook!
    const {
        formData,
        errors,
        enviando,
        handleInputChange,
        handleSubmit,
        setFormData,
        resetForm
    } = useForm(initialState, validateForm, onSubmitLogic, { // Pasamos la función 'validateForm' (directa)
        inputFilters,
    });

    const selectOptions = useMemo(() => {
        return viviendasDisponibles.map((v) => ({
            value: v.id,
            label: `Manzana ${v.manzana} - Casa ${v.numeroCasa}`,
        }));
    }, [viviendasDisponibles]);

    const handleSelectChange = (selectedOption) => {
        setFormData(prev => ({
            ...prev,
            viviendaId: selectedOption ? selectedOption.value : ""
        }));
    };

    const noHayViviendas = viviendasDisponibles.length === 0;

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
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" noValidate>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="nombre">Nombre <span className="text-red-600">*</span></label>
                            <input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.nombre ? "border-red-600" : "border-gray-300"}`} />
                            {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="cedula">Cédula <span className="text-red-600">*</span></label>
                            <input id="cedula" name="cedula" type="text" value={formData.cedula} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.cedula ? "border-red-600" : "border-gray-300"}`} />
                            {errors.cedula && <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="telefono">Teléfono <span className="text-red-600">*</span></label>
                            <input id="telefono" name="telefono" type="text" value={formData.telefono} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.telefono ? "border-red-600" : "border-gray-300"}`} />
                            {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1" htmlFor="correo">Correo <span className="text-red-600">*</span></label>
                            <input id="correo" name="correo" type="email" value={formData.correo} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.correo ? "border-red-600" : "border-gray-300"}`} />
                            {errors.correo && <p className="text-red-600 text-sm mt-1">{errors.correo}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1" htmlFor="direccion">Dirección <span className="text-red-600">*</span></label>
                            <input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleInputChange} className={`w-full border p-2 rounded-lg ${errors.direccion ? "border-red-600" : "border-gray-300"}`} />
                            {errors.direccion && <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block font-semibold mb-1">Vivienda a asignar <span className="text-red-600">*</span></label>
                            <Select
                                options={selectOptions}
                                onChange={handleSelectChange}
                                placeholder="Buscar vivienda disponible..."
                                isClearable
                                value={selectOptions.find(op => op.value === formData.viviendaId) || null}
                            />
                            {errors.viviendaId && <p className="text-red-600 text-sm mt-1">{errors.viviendaId}</p>}
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="submit" disabled={enviando} className={`px-5 py-2.5 rounded-full transition text-white ${enviando ? "bg-gray-400 cursor-not-allowed" : "bg-[#1976d2] hover:bg-blue-700"}`}>
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