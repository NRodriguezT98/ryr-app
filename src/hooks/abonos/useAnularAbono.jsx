import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { anularAbono } from '../../services/abonoService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { toTitleCase } from '../../utils/textFormatters'; // Importa la utilidad para formatear texto

export const useAnularAbono = (onActionCompleta) => {
    const { userData } = useAuth();
    const { clientes, viviendas, proyectos, recargarDatos } = useData();

    const [abonoAAnular, setAbonoAAnular] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const iniciarAnulacion = (abono) => {
        // 1. Busca los objetos de datos completos
        const cliente = clientes.find(c => c.id === abono.clienteId);
        const vivienda = viviendas.find(v => v.id === abono.viviendaId);
        const proyecto = vivienda ? proyectos.find(p => p.id === vivienda.proyectoId) : null;

        // ✨ LA SOLUCIÓN: Se crean las cadenas de texto exactas que el Modal necesita
        const clienteInfo = cliente ? toTitleCase(`${cliente.datosCliente.nombres} ${cliente.datosCliente.apellidos}`) : 'No disponible';
        const viviendaInfo = vivienda ? `Mz ${vivienda.manzana} - Casa ${vivienda.numeroCasa}` : 'No disponible';
        const proyectoNombre = proyecto?.nombre || 'No disponible';

        // 2. Se empaqueta todo en el estado: los objetos originales Y las cadenas pre-formateadas
        setAbonoAAnular({
            ...abono,
            cliente,
            vivienda,
            proyecto,
            clienteInfo,
            viviendaInfo,
            proyectoNombre
        });
    };

    const cerrarAnulacion = () => {
        setAbonoAAnular(null);
    };

    const confirmarAnulacion = async (motivo) => {
        if (!abonoAAnular) return;

        setIsSubmitting(true);
        const userName = userData ? toTitleCase(`${userData.nombres} ${userData.apellidos}`) : 'Sistema';

        try {
            toast.loading('Anulando abono...');
            await anularAbono(abonoAAnular, userName, motivo);

            toast.dismiss();
            toast.success('Abono anulado y saldos recalculados correctamente');

            recargarDatos();
            if (onActionCompleta) onActionCompleta();
            cerrarAnulacion();
        } catch (error) {
            toast.dismiss();
            console.error("Error al anular el abono:", error);
            toast.error(`Error al anular el abono: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isAnularModalOpen: !!abonoAAnular,
        abonoParaAnular: abonoAAnular,
        isAnulando: isSubmitting,
        iniciarAnulacion,
        cerrarAnulacion,
        confirmarAnulacion,
    };
};