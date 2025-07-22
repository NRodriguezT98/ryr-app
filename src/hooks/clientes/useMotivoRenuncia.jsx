import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';

const getTodayString = () => new Date().toISOString().split('T')[0];

export const useMotivoRenuncia = (cliente, onConfirm) => {
    const [motivo, setMotivo] = useState(null);
    const [observacion, setObservacion] = useState('');
    const [fechaRenuncia, setFechaRenuncia] = useState(getTodayString());
    const [penalidadMonto, setPenalidadMonto] = useState('0');
    const [penalidadMotivo, setPenalidadMotivo] = useState('');

    const { totalAbonado, montoPenalidadNum, totalADevolver } = useMemo(() => {
        const ta = cliente?.vivienda?.totalAbonado || 0;
        const mpn = parseInt(String(penalidadMonto).replace(/\D/g, ''), 10) || 0;
        const tad = ta - mpn;
        return { totalAbonado: ta, montoPenalidadNum: mpn, totalADevolver: tad };
    }, [cliente, penalidadMonto]);

    const minDate = useMemo(() =>
        cliente?.fechaCreacion ? cliente.fechaCreacion.split('T')[0] : null
        , [cliente]);

    const handleConfirmar = () => {
        if (!motivo) {
            toast.error("Por favor, selecciona un motivo.");
            return;
        }
        if (motivo.value === 'Otro' && !observacion.trim()) {
            toast.error("Por favor, especifica el motivo en el campo de observación.");
            return;
        }
        if (!fechaRenuncia) {
            toast.error("Por favor, selecciona una fecha de renuncia.");
            return;
        }
        if (montoPenalidadNum > 0 && !penalidadMotivo.trim()) {
            toast.error("Si hay una penalidad, el motivo es obligatorio.");
            return;
        }
        if (totalADevolver < 0) {
            toast.error("La penalidad no puede ser mayor al total abonado por el cliente.");
            return;
        }
        onConfirm(motivo.value, observacion, fechaRenuncia, montoPenalidadNum, penalidadMotivo);
    };

    // Reiniciar el estado cuando el cliente cambia (al abrir el modal)
    useEffect(() => {
        if (cliente) {
            setMotivo(null);
            setObservacion('');
            setFechaRenuncia(getTodayString());
            setPenalidadMonto('0');
            setPenalidadMotivo('');
        }
    }, [cliente]);

    return {
        formData: {
            motivo,
            observacion,
            fechaRenuncia,
            penalidadMonto,
            penalidadMotivo
        },
        calculos: {
            totalAbonado,
            montoPenalidadNum,
            totalADevolver,
            minDate
        },
        handlers: {
            setMotivo,
            setObservacion,
            setFechaRenuncia,
            setPenalidadMonto,
            setPenalidadMotivo,
            handleConfirmar
        }
    };
};