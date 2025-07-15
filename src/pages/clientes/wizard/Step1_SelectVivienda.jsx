import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { getViviendas } from '../../../utils/storage';
import { formatCurrency } from '../../../utils/textFormatters';

const Step1_SelectVivienda = ({ formData, dispatch }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [viviendasDisponibles, setViviendasDisponibles] = useState([]);

    useEffect(() => {
        const cargarViviendas = async () => {
            try {
                const todas = await getViviendas();
                setViviendasDisponibles(todas.filter(v => v.clienteId === null));
            } catch (error) {
                toast.error("Error al cargar las viviendas disponibles.");
            } finally {
                setIsLoading(false);
            }
        };
        cargarViviendas();
    }, []);

    const viviendaOptions = useMemo(() =>
        viviendasDisponibles
            .sort((a, b) => a.manzana.localeCompare(b.manzana) || a.numeroCasa - b.numeroCasa)
            .map(v => ({
                value: v.id,
                label: `Mz ${v.manzana} - Casa ${v.numeroCasa} (${formatCurrency(v.valorFinal || v.valorTotal || 0)})`,
                vivienda: v
            })),
        [viviendasDisponibles]);

    const handleSelectChange = useCallback((selectedOption) => {
        dispatch({
            type: 'UPDATE_VIVIENDA_SELECCIONADA',
            payload: selectedOption ? selectedOption.vivienda : null
        });
    }, [dispatch]);

    return (
        <div className="space-y-6">
            <div>
                <label className="block font-semibold mb-2 text-gray-700">1. Seleccionar la Vivienda a Asignar</label>
                <p className="text-sm text-gray-500 mb-4">Asigna una vivienda disponible al nuevo cliente.</p>
                <Select
                    options={viviendaOptions}
                    onChange={handleSelectChange}
                    isLoading={isLoading}
                    placeholder="Buscar vivienda..."
                    noOptionsMessage={() => "No hay viviendas disponibles."}
                    value={viviendaOptions.find(op => op.value === formData.viviendaSeleccionada?.id) || null}
                    isClearable
                />
            </div>
            {formData.viviendaSeleccionada && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg animate-fade-in">
                    <h4 className="font-bold text-green-800">Vivienda Seleccionada</h4>
                    <p className="text-green-700">{`Mz ${formData.viviendaSeleccionada.manzana} - Casa ${formData.viviendaSeleccionada.numeroCasa}`}</p>
                </div>
            )}
        </div>
    );
};

export default Step1_SelectVivienda;