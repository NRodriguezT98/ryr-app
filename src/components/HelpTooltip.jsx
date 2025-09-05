import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

/**
 * Muestra un ícono de ayuda (?) que despliega un tooltip con información.
 * @param {object} props
 * @param {string} props.content - El texto que se mostrará en el tooltip.
 * @param {string} props.id - Un ID único para el tooltip, necesario si hay muchos en una página.
 */
const HelpTooltip = ({ content, id }) => {
    if (!content) {
        return null;
    }

    const tooltipId = `tooltip-${id || content.slice(0, 10)}`;

    return (
        <>
            <span data-tooltip-id={tooltipId} data-tooltip-content={content} className="ml-1.5">
                <HelpCircle size={16} className="text-gray-400 hover:text-blue-500 cursor-help" />
            </span>
            {/* Aseguramos que el tooltip se renderice en el body para evitar problemas de apilamiento */}
            <Tooltip
                id={tooltipId}
                place="top"
                style={{
                    backgroundColor: "#334155",
                    color: "#ffffff",
                    borderRadius: '8px',
                    zIndex: 100,
                    maxWidth: '250px',
                    fontSize: '12px',
                    padding: '8px 12px',
                }}
            />
        </>
    );
};

export default HelpTooltip;