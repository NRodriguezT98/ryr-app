import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { getViviendas } from '../../../utils/storage';
import { formatCurrency } from '../../../utils/textFormatters';

const Step1_SelectVivienda = ({ formData, dispatch, isEditing, clienteAEditar }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [viviendasDisponibles, setViviendasDisponibles] = useState([]);

    useEffect(() => {
        const cargarViviendas = async () => {
            try {
                const todas = await getViviendas();

                const disponibles = isEditing
                    ? todas.filter(v => v.clienteId === null || v.id === clienteAEditar?.viviendaId)
                    : todas.filter(v => v.clienteId === null);

                setViviendasDisponibles(disponibles);
            } catch (error) {
                toast.error("Error al cargar las viviendas disponibles.");
            } finally {
                setIsLoading(false);
            }
        };
        cargarViviendas();
    }, [isEditing, clienteAEditar]);

    const viviendaOptions = useMemo(() =>
        viviendasDisponibles
            .sort((a, b) => {
                if (a.manzana < b.manzana) return -1;
                if (a.manzana > b.manzana) return 1;
                return a.numeroCasa - b.numeroCasa;
            })
            .map(v => {
                const valorAMostrar = v.valorFinal !== undefined ? v.valorFinal : v.valorTotal;
                return {
                    value: v.id,
                    label: `Mz ${v.manzana} - Casa ${v.numeroCasa} (${formatCurrency(valorAMostrar || 0)})`,
                    // Pasamos el objeto completo de la vivienda en los datos de la opción
                    vivienda: v
                }
            }),
        [viviendasDisponibles]);

    const handleSelectChange = useCallback((selectedOption) => {
        dispatch({
            type: 'UPDATE_VIVIENDA_SELECCIONADA',
            // Si se deselecciona, enviamos un objeto vacío; si no, el objeto completo.
            payload: selectedOption ? selectedOption.vivienda : { id: null, valorTotal: 0 }
        });
    }, [dispatch]);

    if (isLoading) {
        return <div className="text-center p-4 animate-pulse">Cargando viviendas disponibles...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <label className="block font-semibold mb-2 text-gray-700">1. Seleccionar la Vivienda a Asignar</label>

                {isEditing ? (
                    <p className="text-sm text-gray-500 mb-4">
                        Verifica que la vivienda asignada es la correcta o asígnale una nueva de ser necesario.
                    </p>
                ) : (
                    <p className="text-sm text-gray-500 mb-4">
                        Asigna una vivienda disponible al nuevo cliente.
                    </p>
                )}

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
                    <p className="text-green-700">{`Mz ${formData.viviendaSeleccionada.manzana} - Casa ${formData.viviendaSeleccionada.numeroCasa}`}</p>
                </div>
            )}
        </div>
    );
};

export default Step1_SelectVivienda;