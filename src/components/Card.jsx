// src/components/Card.jsx (Código Corregido)
import React from 'react';

const Card = ({ children, hoverEffect = true, className = '', ...props }) => {
  // Aquí definimos la apariencia base y estándar de todas las tarjetas
  const baseClasses = `
    bg-white dark:bg-gray-800 
    rounded-2xl 
    shadow-lg 
    border 
    dark:border-gray-700 
    flex 
    flex-col
  `;

  // El efecto de hover es opcional, lo controlamos con una prop
  const hoverClasses = hoverEffect ? 'transition-all duration-300 hover:shadow-xl' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card; // <-- ¡LA LÍNEA QUE FALTABA!