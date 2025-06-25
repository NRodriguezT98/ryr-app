import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { getViviendas } from '../../../utils/storage';

const Step1_SelectVivienda = ({ formData, dispatch }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [viviendasDisponibles, setViviendasDisponibles] = useState([]);

    useEffect(() => {
        const cargarViviendas = async () => {
            try {
                const todas = await getViviendas();
                const disponibles = todas.filter(v => v.clienteId === null);
                setViviendasDisponibles(disponibles);
            } catch (error) {
                toast.error("Error al cargar las viviendas disponibles.");
            } finally {
                setIsLoading(false);
            }
        };
        cargarViviendas();
    }, []);

    const viviendaOptions = useMemo(() =>
        viviendasDisponibles.map(v => ({
            value: v.id,
            label: `Mz ${v.manzana} - Casa ${v.numeroCasa} (${v.valorTotal.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })})`,
            valorTotal: v.valorTotal
        })),
        [viviendasDisponibles]);

    const handleSelectChange = useCallback((selectedOption) => {
        dispatch({
            type: 'UPDATE_VIVIENDA_SELECCIONADA',
            payload: {
                id: selectedOption ? selectedOption.value : null,
                valorTotal: selectedOption ? selectedOption.valorTotal : 0,
                label: selectedOption ? selectedOption.label : ''
            }
        });
    }, [dispatch]);

    if (isLoading) {
        return <div className="text-center p-4 animate-pulse">Cargando viviendas disponibles...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <label className="block font-semibold mb-2 text-gray-700">1. Seleccionar la Vivienda a Asignar</label>
                <p className="text-sm text-gray-500 mb-4">Este es el primer paso. El valor de la vivienda seleccionada se usará para validar la estructura financiera en los siguientes pasos.</p>
                <Select
                    options={viviendaOptions}
                    onChange={handleSelectChange}
                    isLoading={isLoading}
                    placeholder="Buscar vivienda..."
                    noOptionsMessage={() => "No hay viviendas disponibles."}
                    value={viviendaOptions.find(op => op.value === formData.viviendaSeleccionada.id) || null}
                    isClearable
                />
            </div>

            {formData.viviendaSeleccionada.id && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg animate-fade-in">
                    <h4 className="font-bold text-green-800">Vivienda Seleccionada</h4>
                    <p className="text-green-700">{formData.viviendaSeleccionada.label}</p>
                </div>
            )}
        </div>
    );
};

export default Step1_SelectVivienda;