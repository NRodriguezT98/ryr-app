// src/components/forms/InputField.jsx (Versión mejorada)
import React from 'react';

const InputField = ({ label, name, type = 'text', error, ...props }) => {
    return (
        <div>
            <label className="block font-semibold mb-1 flex items-center dark:text-gray-200" htmlFor={name}>
                {label}
            </label>
            <div data-tooltip-id="app-tooltip" data-tooltip-content={props.disabled ? props['data-tooltip-content'] : ''}>
                <input
                    id={name}
                    name={name}
                    type={type}
                    {...props} // Aquí pasamos value, onChange, disabled, max, etc.
                    className={`w-full border p-2 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-200 disabled:dark:bg-gray-600 disabled:cursor-not-allowed ${error ? 'border-red-500' : 'border-gray-300'}`}
                />
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
};

export default InputField;