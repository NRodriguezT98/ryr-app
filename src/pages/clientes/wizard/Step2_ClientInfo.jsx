import React, { useCallback } from 'react';

// 1. Recibimos 'errors' como una nueva prop
const Step2_ClientInfo = ({ formData, dispatch, errors }) => {

    const handleChange = useCallback((e) => {
        dispatch({
            type: 'UPDATE_FIELD',
            payload: {
                section: 'datosCliente',
                field: e.target.name,
                value: e.target.value
            }
        });
    }, [dispatch]);

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-gray-800">2. Información del Cliente</h3>
                <p className="text-sm text-gray-500 mt-1">Ingresa los datos personales del nuevo propietario.</p>
            </div>

            {/* 2. El JSX ahora usa el objeto 'errors' para mostrar los mensajes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div>
                    <label className="block font-semibold mb-1" htmlFor="nombres">Nombre(s) <span className="text-red-600">*</span></label>
                    <input type="text" id="nombres" name="nombres" className={`w-full border p-2 rounded-lg ${errors.nombres ? 'border-red-500' : 'border-gray-300'}`} value={formData.datosCliente.nombres} onChange={handleChange} />
                    {errors.nombres && <p className="text-red-600 text-sm mt-1">{errors.nombres}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="apellidos">Apellido(s) <span className="text-red-600">*</span></label>
                    <input type="text" id="apellidos" name="apellidos" className={`w-full border p-2 rounded-lg ${errors.apellidos ? 'border-red-500' : 'border-gray-300'}`} value={formData.datosCliente.apellidos} onChange={handleChange} />
                    {errors.apellidos && <p className="text-red-600 text-sm mt-1">{errors.apellidos}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="cedula">Cédula <span className="text-red-600">*</span></label>
                    <input type="text" id="cedula" name="cedula" className={`w-full border p-2 rounded-lg ${errors.cedula ? 'border-red-500' : 'border-gray-300'}`} value={formData.datosCliente.cedula} onChange={handleChange} />
                    {errors.cedula && <p className="text-red-600 text-sm mt-1">{errors.cedula}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="telefono">Teléfono <span className="text-red-600">*</span></label>
                    <input type="text" id="telefono" name="telefono" className={`w-full border p-2 rounded-lg ${errors.telefono ? 'border-red-500' : 'border-gray-300'}`} value={formData.datosCliente.telefono} onChange={handleChange} />
                    {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="correo">Correo Electrónico <span className="text-red-600">*</span></label>
                    <input type="email" id="correo" name="correo" className={`w-full border p-2 rounded-lg ${errors.correo ? 'border-red-500' : 'border-gray-300'}`} value={formData.datosCliente.correo} onChange={handleChange} />
                    {errors.correo && <p className="text-red-600 text-sm mt-1">{errors.correo}</p>}
                </div>
                <div>
                    <label className="block font-semibold mb-1" htmlFor="direccion">Dirección <span className="text-red-600">*</span></label>
                    <input type="text" id="direccion" name="direccion" className={`w-full border p-2 rounded-lg ${errors.direccion ? 'border-red-500' : 'border-gray-300'}`} value={formData.datosCliente.direccion} onChange={handleChange} />
                    {errors.direccion && <p className="text-red-600 text-sm mt-1">{errors.direccion}</p>}
                </div>
            </div>
        </div>
    );
};

export default Step2_ClientInfo;