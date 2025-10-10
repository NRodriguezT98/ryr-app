import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Lock, AlertCircle, ChevronDown } from 'lucide-react';

const ModernDatePicker = ({
    label,
    name,
    value,
    onChange,
    error,
    isRequired,
    disabled,
    helpText,
    min,
    max,
    placeholder = "Selecciona una fecha",
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef(null);

    // Parse the value to Date object
    const selectedDate = value ? new Date(value + 'T00:00:00') : null;

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Generate calendar days
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const handleDateSelect = (date) => {
        if (disabled) return;

        const dateString = date.toISOString().split('T')[0];

        // Check min/max constraints
        if (min && dateString < min) return;
        if (max && dateString > max) return;

        onChange({
            target: {
                name,
                value: dateString
            }
        });
        setIsOpen(false);
        setIsFocused(false);
    };

    const isDateDisabled = (date) => {
        const dateString = date.toISOString().split('T')[0];
        if (min && dateString < min) return true;
        if (max && dateString > max) return true;
        return false;
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isSameDay = (date1, date2) => {
        return date1 && date2 && date1.toDateString() === date2.toDateString();
    };

    const formatDisplayDate = (date) => {
        if (!date) return '';
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev);
            newMonth.setMonth(prev.getMonth() + direction);
            return newMonth;
        });
    };

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="space-y-2" ref={containerRef}>
            <label
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1"
                htmlFor={name}
            >
                {label}
                {isRequired && <span className="text-red-500">*</span>}
                {disabled && (
                    <Lock size={12} className="text-gray-400 dark:text-gray-500 ml-1" />
                )}
            </label>

            <div className="relative">
                <div
                    className={`
                        w-full h-12 px-4 rounded-xl border-2 transition-all duration-200 ease-in-out cursor-pointer
                        flex items-center justify-between
                        ${!error && !disabled ?
                            `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 
                             hover:border-gray-300 dark:hover:border-gray-600
                             ${(isFocused || isOpen) ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/50' : ''}` : ''}
                        
                        ${error ?
                            `bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700
                             ${(isFocused || isOpen) ? 'border-red-500 ring-4 ring-red-100 dark:ring-red-900/50' : ''}` : ''}
                        
                        ${disabled ?
                            'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60' : ''}
                    `}
                    onClick={() => {
                        if (!disabled) {
                            setIsOpen(!isOpen);
                            setIsFocused(true);
                        }
                    }}
                >
                    <div className="flex items-center gap-3">
                        <Calendar
                            size={18}
                            className={`
                                ${error ? 'text-red-400' :
                                    (isFocused || isOpen) ? 'text-blue-500' :
                                        'text-gray-400 dark:text-gray-500'}
                                transition-colors duration-200
                            `}
                        />
                        <span className={`
                            text-sm font-medium
                            ${selectedDate ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}
                        `}>
                            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
                        </span>
                    </div>

                    {error ? (
                        <AlertCircle size={18} className="text-red-400" />
                    ) : (
                        <ChevronDown
                            size={18}
                            className={`
                                transition-transform duration-200
                                ${isOpen ? 'rotate-180' : ''}
                                ${error ? 'text-red-400' :
                                    (isFocused || isOpen) ? 'text-blue-500' :
                                        'text-gray-400 dark:text-gray-500'}
                            `}
                        />
                    )}
                </div>

                {isOpen && !disabled && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => navigateMonth(-1)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>

                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </h3>

                            <button
                                type="button"
                                onClick={() => navigateMonth(1)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-0 border-b border-gray-200 dark:border-gray-700">
                            {dayNames.map(day => (
                                <div key={day} className="p-2 text-center">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {day}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="px-4 pt-3 pb-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    setCurrentMonth(today);
                                    handleDateSelect(today);
                                }}
                                className="w-full text-xs py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors font-medium"
                            >
                                Ir a Hoy
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-0 p-2">
                            {getDaysInMonth(currentMonth).map((date, index) => {
                                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                                const isSelected = isSameDay(date, selectedDate);
                                const isTodayDate = isToday(date);
                                const isDisabled = isDateDisabled(date);

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleDateSelect(date)}
                                        disabled={isDisabled}
                                        className={`
                                            w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150
                                            flex items-center justify-center
                                            
                                            ${!isCurrentMonth ? 'text-gray-300 dark:text-gray-600' :
                                                isSelected ? 'bg-blue-500 text-white shadow-lg' :
                                                    isTodayDate ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                                        isDisabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' :
                                                            'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                                        `}
                                    >
                                        {date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {helpText && !error && (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {helpText}
                </p>
            )}

            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default ModernDatePicker;