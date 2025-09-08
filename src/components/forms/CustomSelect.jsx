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

const CustomSelect = ({ customStyles, components: customComponents, ...props }) => {
    // Aquí vivimos nuestros estilos base para toda la aplicación
    const baseStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff',
            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
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
        singleValue: (base) => ({ ...base, color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937' }),
        indicatorSeparator: () => ({ display: 'none' }),
        menu: (base) => ({ ...base, backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#ffffff', zIndex: 9999 }),
        input: (base) => ({ ...base, color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937' }),
        option: (base, state) => ({
            ...base,
            // Eliminamos los estilos de hover y focus de react-select para usar los nuestros en el componente CustomOption
            backgroundColor: state.isFocused ? 'transparent' : 'transparent',
            color: 'inherit'
        })
    };

    // Unimos los componentes por defecto con los que se pasen por props
    const mergedComponents = {
        DropdownIndicator: DefaultDropdownIndicator,
        ...customComponents,
    };

    return (
        <Select
            styles={baseStyles}
            components={mergedComponents}
            {...props}
        />
    );
};

export default CustomSelect;