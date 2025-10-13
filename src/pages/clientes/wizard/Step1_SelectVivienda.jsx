import React, { useCallback, useMemo } from 'react';
import Select, { components } from 'react-select';
import AnimatedPage from '../../../components/AnimatedPage';
import { Home, Search, MapPin, Lock } from 'lucide-react';
import { formatCurrency } from '../../../utils/textFormatters';
import CustomSelect from '../../../components/forms/CustomSelect';

const CustomViviendaOption = (props) => {
    const { innerProps, label, data, isSelected, isFocused } = props;
    return (
        <div
            {...innerProps}
            className={`
                p-4 cursor-pointer transition-all duration-200 ease-in-out rounded-lg mx-2 my-1
                ${isFocused ? 'bg-blue-50 dark:bg-blue-900/30 shadow-sm' : ''}
                ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500' : ''}
                hover:bg-blue-50 dark:hover:bg-blue-900/30
            `}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {data.nombreProyecto && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <MapPin size={12} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                {data.nombreProyecto}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                            <Home size={16} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-base">{label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Matrícula: {data.vivienda.matricula}
                            </p>
                        </div>
                    </div>

                    {data.vivienda.valorTotal && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(data.vivienda.valorTotal)}
                            </span>
                        </div>
                    )}
                </div>

                {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 ml-3">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};


const Step1_SelectVivienda = ({ formData, dispatch, errors, setErrors, options, isLocked, proyectos, isLoadingViviendas = false }) => {

    const handleSelectChange = useCallback((selectedOption) => {
        // 🔥 NUEVO: Limpiar error de vivienda cuando el usuario selecciona una
        if (setErrors) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors.vivienda;
                return newErrors;
            });
        }

        dispatch({
            type: 'UPDATE_VIVIENDA_SELECCIONADA',
            payload: selectedOption ? selectedOption.vivienda : null
        });
    }, [dispatch, setErrors]);

    const currentValue = options.find(op => op.value === formData.viviendaSeleccionada?.id) || null;
    const filterOption = (option, inputValue) => {
        const term = inputValue.toLowerCase().replace(/\s/g, '');
        if (!term) return true;

        const labelMatch = option.label.toLowerCase().includes(term);
        const matriculaMatch = option.data.vivienda.matricula.toLowerCase().includes(term);
        // Buscamos en la nueva clave de búsqueda combinada
        const ubicacionMatch = option.data.ubicacionSearchKey.includes(term);

        return labelMatch || matriculaMatch || ubicacionMatch;
    };

    const proyectoAsignado = useMemo(() => {
        if (!formData.viviendaSeleccionada || !proyectos) return null;
        return proyectos.find(p => p.id === formData.viviendaSeleccionada.proyectoId);
    }, [formData.viviendaSeleccionada, proyectos]);

    // 🔥 NUEVO: Mensaje de estado de carga
    const placeholderText = isLoadingViviendas
        ? "⏳ Cargando viviendas disponibles..."
        : options.length === 0
            ? "⚠️ No hay viviendas disponibles"
            : "🔍 Buscar por Manzana y Casa...";

    return (
        <AnimatedPage>
            <div className="bg-white dark:bg-gray-800/50 p-4 md:p-6 rounded-xl">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">Selecciona la Vivienda</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Busca y asigna una propiedad disponible al nuevo cliente.
                    </p>
                </div>

                {/* 🔥 NUEVO: Alerta de carga */}
                {isLoadingViviendas && (
                    <div className="mt-4 flex items-center gap-3 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 animate-pulse">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                            <p className="font-semibold">Cargando viviendas disponibles...</p>
                            <p className="text-xs mt-1">Por favor espera mientras obtenemos las propiedades disponibles del sistema.</p>
                        </div>
                    </div>
                )}

                <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Seleccionar Vivienda <span className="text-red-500">*</span>
                    </label>

                    <CustomSelect
                        options={options}
                        onChange={handleSelectChange}
                        placeholder={placeholderText}
                        noOptionsMessage={() => isLoadingViviendas ? "Cargando..." : "No hay viviendas disponibles."}
                        value={currentValue}
                        isClearable
                        components={{ Option: CustomViviendaOption }}
                        isDisabled={isLocked || isLoadingViviendas}
                        filterOption={filterOption}
                        loadingMessage={() => "Cargando viviendas..."}
                        menuPlacement="auto"
                        maxMenuHeight={280}
                        menuShouldScrollIntoView={false}
                        isLoading={isLoadingViviendas}
                    />

                    {/* 🔥 NUEVO: Mensaje de error de validación */}
                    {errors?.vivienda && (
                        <div className="mt-2 flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{errors.vivienda}</span>
                        </div>
                    )}

                    {/* Mensaje de ayuda cuando el campo está bloqueado */}
                    {isLocked && (
                        <div className="mt-3 flex items-start gap-3 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
                            <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Lock size={14} />
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Vivienda Bloqueada</p>
                                <p className="text-xs leading-relaxed">
                                    La vivienda no se puede modificar porque el cliente ya tiene abonos registrados.
                                    Si necesita asignar una nueva vivienda, comuníquese con un administrador para
                                    que haga uso de "Transferir Vivienda", función únicamente disponible para usuarios
                                    con rol de administrador.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {formData.viviendaSeleccionada && (
                    <div className="mt-6 animate-fade-in">
                        {/* Header con estado de confirmación */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                                    <Home className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Vivienda Seleccionada</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Propiedad asignada al cliente</p>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        {/* Tarjeta principal con información */}
                        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                            {/* Barra superior con gradiente */}
                            <div className="h-2 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>

                            <div className="p-4 md:p-6">
                                {/* Información del proyecto */}
                                {proyectoAsignado && (
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Proyecto</span>
                                        </div>
                                        <p className="font-semibold text-blue-900 dark:text-blue-100">{proyectoAsignado.nombre}</p>
                                    </div>
                                )}

                                {/* Grid de información principal */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Ubicación */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ubicación</p>
                                                <p className="font-bold text-gray-900 dark:text-gray-100">
                                                    Mz {formData.viviendaSeleccionada.manzana} - Casa {formData.viviendaSeleccionada.numeroCasa}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Matrícula */}
                                        <div className="ml-10 pl-2 border-l-2 border-gray-200 dark:border-gray-600">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Matrícula</p>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{formData.viviendaSeleccionada.matricula}</p>
                                        </div>
                                    </div>

                                    {/* Valor */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Valor Total</p>
                                                <p className="font-bold text-xl text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(formData.viviendaSeleccionada.valorTotal || formData.viviendaSeleccionada.valorFinal)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información adicional en badges */}
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-wrap gap-2">
                                        {formData.viviendaSeleccionada.tipoVivienda && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                                {formData.viviendaSeleccionada.tipoVivienda}
                                            </span>
                                        )}
                                        {formData.viviendaSeleccionada.areaConstruida && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                                                {formData.viviendaSeleccionada.areaConstruida} m²
                                            </span>
                                        )}
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                                            ✓ Disponible
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default Step1_SelectVivienda;