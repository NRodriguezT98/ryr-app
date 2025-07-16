import React from 'react';

const Button = ({ children, onClick, icon, variant = 'primary', className = '', ...props }) => {
    const baseClasses = "flex items-center justify-center gap-2 font-semibold px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const combinedClasses = `${baseClasses} ${variants[variant]} ${className}`;

    return (
        <button onClick={onClick} className={combinedClasses} {...props}>
            {icon}
            {children}
        </button>
    );
};

export default Button;