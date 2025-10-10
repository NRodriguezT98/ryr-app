// src/components/forms/CustomSelect.jsx (Nuevo componente)
import React from 'react';
import Select, { components } from 'react-select';
import { Search } from 'lucide-react';

// Definimos el indicador de búsqueda como el default para este componente
const DefaultDropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <Search className="text-gray-400" size={20} />
        </components.DropdownIndicator>
    );
};

const CustomSelect = ({ customStyles, components: customComponents, isDisabled, error, ...props }) => {
    // Estilos modernos mejorados
    const baseStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            borderColor: error ? '#ef4444' : (state.isFocused ? '#3b82f6' : '#e5e7eb'),
            borderWidth: error ? '2px' : '1px',
            boxShadow: state.isFocused ?
                (error ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : '0 0 0 3px rgba(59, 130, 246, 0.1)') :
                'none',
            '&:hover': {
                borderColor: error ? '#ef4444' : '#3b82f6'
            },
            padding: '8px 12px',
            borderRadius: '0.75rem',
            minHeight: '48px',
            cursor: isDisabled ? 'not-allowed' : 'pointer',
            opacity: isDisabled ? 0.6 : 1,
            transition: 'all 0.2s ease-in-out',
        }),
        placeholder: (base) => ({
            ...base,
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
            fontSize: '14px',
            fontWeight: '400',
        }),
        singleValue: (base) => ({
            ...base,
            color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
            fontSize: '14px',
            fontWeight: '500',
        }),
        indicatorSeparator: () => ({ display: 'none' }),
        menu: (base) => ({
            ...base,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
            border: '1px solid ' + (document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'),
            borderRadius: '0.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            zIndex: 9999,
            overflow: 'hidden',
            maxHeight: '300px',
        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),
        menuList: (base) => ({
            ...base,
            padding: '8px',
            maxHeight: '280px',
            overflowY: 'auto',
        }),
        input: (base) => ({
            ...base,
            color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
            fontSize: '14px',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: 'transparent',
            color: 'inherit',
            padding: 0,
            ':active': {
                backgroundColor: 'transparent',
            }
        }),
        loadingIndicator: (base) => ({
            ...base,
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
        }),
        clearIndicator: (base) => ({
            ...base,
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
            '&:hover': {
                color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
            }
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
            '&:hover': {
                color: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
            }
        }),
    };

    // Unimos los componentes por defecto con los que se pasen por props
    const mergedComponents = {
        DropdownIndicator: DefaultDropdownIndicator,
        ...customComponents,
    };

    return (
        <div className="relative">
            <Select
                styles={baseStyles}
                components={mergedComponents}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                {...props}
            />
        </div>
    );
};

export default CustomSelect;