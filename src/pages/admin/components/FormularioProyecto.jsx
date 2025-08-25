// src/pages/admin/components/FormularioProyecto.jsx

import React from 'react';
import { Loader } from 'lucide-react';

// 1. Cambiamos 'handleSubmit' por 'onSaveClick' para que sea más claro
const FormularioProyecto = ({ formData, handleInputChange, onSaveClick, errors, isSubmitting, isEditing = false }) => {

    // Esta función previene el envío accidental con la tecla Enter
    const handleFormSubmit = (e) => {
        e.preventDefault();
        onSaveClick();
    };

    return (
        <form onSubmit={handleFormSubmit} noValidate>
            <div className="mb-6">
                <label htmlFor="nombre" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Proyecto <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                    required
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div className="mt-8 flex justify-end">
                {/* --- INICIO DE LA CORRECCIÓN --- */}
                {/* 2. Cambiamos el tipo a "button" y usamos onClick */}
                <button
                    type="button"
                    onClick={onSaveClick}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-400"
                >
                    {isSubmitting && <Loader size={20} className="animate-spin mr-2" />}
                    {isSubmitting ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Proyecto')}
                </button>
                {/* --- FIN DE LA CORRECCIÓN --- */}
            </div>
        </form>
    );
};

export default FormularioProyecto;