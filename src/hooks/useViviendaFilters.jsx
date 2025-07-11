import { useState, useMemo } from 'react';

export const useViviendaFilters = (viviendasIniciales, initialStatusFilter = 'todas') => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
    const [sortConfig, setSortConfig] = useState({ key: 'manzana', direction: 'ascending' });

    const viviendasFiltradasYOrdenadas = useMemo(() => {
        let itemsProcesados = [...viviendasIniciales];

        if (statusFilter === 'disponibles') {
            itemsProcesados = itemsProcesados.filter(v => !v.clienteId);
        } else if (statusFilter === 'ocupadas') {
            itemsProcesados = itemsProcesados.filter(v => !!v.clienteId);
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            itemsProcesados = itemsProcesados.filter(v =>
                v.manzana.toLowerCase().includes(lowerCaseSearchTerm) ||
                v.numeroCasa.toString().includes(lowerCaseSearchTerm) ||
                v.matricula.toLowerCase().includes(lowerCaseSearchTerm) ||
                (v.clienteNombre || '').toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        itemsProcesados.sort((a, b) => {
            const key = sortConfig.key;
            if (!key) return 0;

            const direction = sortConfig.direction === 'ascending' ? 1 : -1;
            let valA = a[key];
            let valB = b[key];

            if (key === 'cliente') {
                valA = a.clienteNombre || 'ZZZ';
                valB = b.clienteNombre || 'ZZZ';
            }

            if (valA < valB) return -1 * direction;
            if (valA > valB) return 1 * direction;

            if (key === 'manzana') {
                if (a.numeroCasa < b.numeroCasa) return -1 * direction;
                if (a.numeroCasa > b.numeroCasa) return 1 * direction;
            }
            return 0;
        });

        return itemsProcesados;
    }, [viviendasIniciales, searchTerm, statusFilter, sortConfig]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return {
        viviendasFiltradasYOrdenadas,
        searchTerm,
        setSearchTerm,
        statusFilter, // Devolvemos el estado para que el componente sepa cuál está activo
        setStatusFilter, // Devolvemos el setter para los botones
        sortConfig,
        handleSort
    };
};