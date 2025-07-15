import React, { useCallback, useMemo } from 'react';
import Select, { components } from 'react-select';
import toast from 'react-hot-toast';
import AnimatedPage from '../../../components/AnimatedPage';
import { Home, Search } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { formatCurrency } from '../../../utils/textFormatters';

// Componente personalizado para las opciones del dropdown
const CustomOption = (props) => {
    const { innerProps, label, data } = props;
    return (
        <div {...innerProps} className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0">
            <p className="font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">{`Matrícula: ${data.vivienda.matricula}`}</p>
        </div>
    );
};

// Componente personalizado para el ícono de búsqueda
const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <Search className="text-gray-400" size={20} />
        </components.DropdownIndicator>
    );
};

const Step1_SelectVivienda = ({ formData, dispatch, options }) => {

    const handleSelectChange = useCallback((selectedOption) => {
        dispatch({
            type: 'UPDATE_VIVIENDA_SELECCIONADA',
            payload: selectedOption ? selectedOption.vivienda : null
        });
    }, [dispatch]);

    const currentValue = options.find(op => op.value === formData.viviendaSeleccionada?.id) || null;

    // Estilos personalizados para el Select
    const selectStyles = {
        control: (base) => ({
            ...base,
            border: '2px solid #e5e7eb', // Borde gris claro
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#3b82f6' // Borde azul al pasar el cursor
            },
            padding: '4px',
            borderRadius: '0.75rem', // 12px
        }),
        placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
        }),
        indicatorSeparator: () => ({ display: 'none' }), // Oculta el separador
    };

    return (
        <AnimatedPage>
            <div className="bg-white p-6 rounded-xl">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                        <Home className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-gray-900">Selecciona la Vivienda</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Busca y asigna una propiedad disponible al nuevo cliente.
                    </p>
                </div>

                <div className="mt-8">
                    <Select
                        options={options}
                        onChange={handleSelectChange}
                        placeholder="Buscar por Manzana y Casa..."
                        noOptionsMessage={() => "No hay viviendas disponibles."}
                        value={currentValue}
                        isClearable
                        styles={selectStyles}
                        components={{ Option: CustomOption, DropdownIndicator }}
                    />
                </div>

                {formData.viviendaSeleccionada && (
                    <div className="mt-6 bg-green-50 border-2 border-dashed border-green-200 p-4 rounded-xl animate-fade-in">
                        <h4 className="font-bold text-green-800">Propiedad Asignada</h4>
                        <div className='mt-2 space-y-1 text-green-700 text-sm'>
                            <p><strong>Ubicación:</strong>{` Mz ${formData.viviendaSeleccionada.manzana} - Casa ${formData.viviendaSeleccionada.numeroCasa}`}</p>
                            <p><strong>Valor:</strong>{` ${formatCurrency(formData.viviendaSeleccionada.valorTotal)}`}</p>
                        </div>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default Step1_SelectVivienda;