import React, { useCallback } from 'react';
import Select, { components } from 'react-select';
import AnimatedPage from '../../../components/AnimatedPage';
import { Home, Search } from 'lucide-react';
import { formatCurrency } from '../../../utils/textFormatters';

const CustomOption = (props) => {
    const { innerProps, label, data } = props;
    return (
        <div {...innerProps} className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer border-b last:border-b-0 dark:border-gray-700">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{`Matrícula: ${data.vivienda.matricula}`}</p>
        </div>
    );
};

const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <Search className="text-gray-400" size={20} />
        </components.DropdownIndicator>
    );
};

const Step1_SelectVivienda = ({ formData, dispatch, options, isLocked }) => {

    const handleSelectChange = useCallback((selectedOption) => {
        dispatch({
            type: 'UPDATE_VIVIENDA_SELECCIONADA',
            payload: selectedOption ? selectedOption.vivienda : null
        });
    }, [dispatch]);

    const currentValue = options.find(op => op.value === formData.viviendaSeleccionada?.id) || null;

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: 'var(--color-bg-form)',
            borderColor: state.isFocused ? '#3b82f6' : '#4b5563',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#3b82f6'
            },
            padding: '4px',
            borderRadius: '0.75rem',
        }),
        placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
        }),
        singleValue: (base) => ({ ...base, color: 'var(--color-text-form)' }),
        indicatorSeparator: () => ({ display: 'none' }),
        menu: (base) => ({ ...base, backgroundColor: 'var(--color-bg-form)' }),
        input: (base) => ({ ...base, color: 'var(--color-text-form)' }),
    };

    return (
        <AnimatedPage>
            <style>{`
                :root {
                  --color-bg-form: ${document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff'};
                  --color-text-form: ${document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937'};
                }
            `}</style>
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">Selecciona la Vivienda</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
                        isDisabled={isLocked} // <-- Aplicamos el bloqueo aquí
                    />
                </div>

                {formData.viviendaSeleccionada && (
                    <div className="mt-6 bg-green-50 dark:bg-green-900/50 border-2 border-dashed border-green-200 dark:border-green-700 p-4 rounded-xl animate-fade-in">
                        <h4 className="font-bold text-green-800 dark:text-green-300">Propiedad Asignada</h4>
                        <div className='mt-2 space-y-1 text-green-700 dark:text-green-400 text-sm'>
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