import React from 'react';
import Select from 'react-select';
import { formatCurrency, toTitleCase } from '../../utils/textFormatters';

const ViviendaSelector = ({ label, options, value, onChange, error, isRequired, isDisabled = false, placeholder = "Buscar por Mz, Casa, Proyecto..." }) => {
    const isDarkMode = document.documentElement.classList.contains('dark');

    const customStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
            borderColor: state.isFocused ? '#2563eb' : (error ? '#ef4444' : (isDarkMode ? '#4b5563' : '#d1d5db')),
            '&:hover': { borderColor: '#3b82f6' },
            boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : (error ? '0 0 0 1px #ef4444' : 'none'),
            borderRadius: '0.5rem',
            padding: '0.1rem',
            minHeight: '46px',
        }),
        singleValue: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
        menu: (base) => ({ ...base, backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', zIndex: 20 }),
        option: (base, state) => ({ ...base, backgroundColor: state.isSelected ? '#1d4ed8' : (state.isFocused ? (isDarkMode ? '#3b82f650' : '#dbeafe') : 'transparent'), color: state.isSelected ? 'white' : (isDarkMode ? '#d1d5db' : '#111827') }),
        input: (base) => ({ ...base, color: isDarkMode ? '#d1d5db' : '#111827' }),
        placeholder: (base) => ({ ...base, color: isDarkMode ? '#6b7280' : '#9ca3af' }),
    };

    const formatOptionLabel = ({ label, vivienda, nombreProyecto }) => (
        <div className="flex flex-col">
            <span className="font-bold text-gray-800 dark:text-gray-100">{label}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
                {toTitleCase(nombreProyecto)} - {formatCurrency(vivienda.valorFinal || 0)}
            </span>
        </div>
    );

    // El valor para react-select debe ser el objeto opción completo, no solo el ID
    const selectedOption = options.find(option => option.value === value) || null;

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {label} {isRequired && <span className="text-red-500">*</span>}
                </label>
            )}
            <Select
                options={options}
                value={selectedOption}
                onChange={onChange}
                styles={customStyles}
                formatOptionLabel={formatOptionLabel}
                placeholder={placeholder}
                isDisabled={isDisabled}
                isClearable
                noOptionsMessage={() => 'No se encontraron viviendas'}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default ViviendaSelector;