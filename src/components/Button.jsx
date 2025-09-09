// src/components/forms/Button.jsx
import React from 'react';

const Button = ({
    variant = 'primary',
    isLoading = false,
    loadingText = 'Guardando...',
    className = '',
    children,
    disabled,
    ...rest
}) => {
    const isDisabled = isLoading || disabled;

    const baseClasses = `
    w-full flex justify-center items-center px-4 py-2 border border-transparent 
    rounded-lg shadow-sm text-sm font-medium 
    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
    transition-all duration-200 ease-in-out
    transform active:scale-95
    `;

    const variantClasses = {
        primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400',
        secondary: 'text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-gray-400 disabled:bg-gray-100 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500',
        danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
        success: 'text-white bg-green-500 hover:bg-green-600 focus:ring-green-500 disabled:bg-green-400'
    };

    return (
        <>
            <button
                {...rest}
                disabled={isDisabled}
                className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? 'cursor-not-allowed opacity-70' : ''} ${className}`}
            >

                {
                    isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {loadingText}
                        </>
                    ) : (
                        children
                    )
                }
            </button >
        </>
    );
};

export default Button;