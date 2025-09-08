import React, { useCallback, useMemo } from 'react';
import Select, { components } from 'react-select';
import AnimatedPage from '../../../components/AnimatedPage';
import { Home, Search, MapPin } from 'lucide-react';
import { formatCurrency } from '../../../utils/textFormatters';
import CustomSelect from '../../../components/forms/CustomSelect';

const CustomViviendaOption = (props) => {
    const { innerProps, label, data } = props;
    return (
        <div {...innerProps} className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/50 cursor-pointer border-b last:border-b-0 dark:border-gray-700">
            {data.nombreProyecto && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    <MapPin size={14} />
                    <span>{data.nombreProyecto}</span>
                </div>
            )}
            <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{`Matrícula: ${data.vivienda.matricula}`}</p>
        </div>
    );
};


const Step1_SelectVivienda = ({ formData, dispatch, options, isLocked, proyectos }) => {

    const handleSelectChange = useCallback((selectedOption) => {
        dispatch({
            type: 'UPDATE_VIVIENDA_SELECCIONADA',
            payload: selectedOption ? selectedOption.vivienda : null
        });
    }, [dispatch]);

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

    return (
        <AnimatedPage>
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50">
                        <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100">Selecciona la Vivienda</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Busca y asigna una propiedad disponible al nuevo cliente.
                    </p>
                </div>

                <div className="mt-8">
                    <CustomSelect
                        options={options}
                        onChange={handleSelectChange}
                        placeholder="Buscar por Manzana y Casa..."
                        noOptionsMessage={() => "No hay viviendas disponibles."}
                        value={currentValue}
                        isClearable
                        components={{ Option: CustomViviendaOption }} // Le pasamos nuestro Option personalizado
                        isDisabled={isLocked}
                        filterOption={filterOption}
                    />
                </div>

                {formData.viviendaSeleccionada && (
                    <div className="mt-6 bg-green-50 dark:bg-green-900/50 border-2 border-dashed border-green-200 dark:border-green-700 p-4 rounded-xl animate-fade-in">
                        <h4 className="font-bold text-green-800 dark:text-green-300">Vivienda Asignada</h4>
                        <div className='mt-2 space-y-1 text-green-700 dark:text-green-400 text-sm'>
                            {proyectoAsignado && (
                                <p className="flex items-center gap-1.5">
                                    <strong>Proyecto:</strong>
                                    <span>{proyectoAsignado.nombre}</span>
                                </p>
                            )}
                            <p><strong>Ubicación:</strong>{` Mz ${formData.viviendaSeleccionada.manzana} - Casa ${formData.viviendaSeleccionada.numeroCasa}`}</p>
                            <p><strong>Valor Total:</strong>{` ${formatCurrency(formData.viviendaSeleccionada.valorTotal)}`}</p>
                        </div>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default Step1_SelectVivienda;