import { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getTodayString, parseDateAsUTC } from '../../utils/textFormatters';
import { useData } from '../../context/DataContext';

export const useMotivoRenuncia = (cliente, onConfirm) => {
    const { abonos } = useData();
    const [motivo, setMotivo] = useState(null);
    const [observacion, setObservacion] = useState('');
    const [fechaRenuncia, setFechaRenuncia] = useState(getTodayString());
    const [penalidadMonto, setPenalidadMonto] = useState('0');
    const [penalidadMotivo, setPenalidadMotivo] = useState('');
    const [aplicaPenalidad, setAplicaPenalidad] = useState(false);

    // --- INICIO DE LA MODIFICACIÓN ---
    const [errors, setErrors] = useState({});
    // --- FIN DE LA MODIFICACIÓN ---

    const { totalAbonado, montoPenalidadNum, totalADevolver } = useMemo(() => {
        const ta = cliente?.vivienda?.totalAbonado || 0;
        const mpn = parseInt(String(penalidadMonto).replace(/\D/g, ''), 10) || 0;
        const tad = ta - mpn;
        return { totalAbonado: ta, montoPenalidadNum: mpn, totalADevolver: tad };
    }, [cliente, penalidadMonto]);

    const minDate = useMemo(() => {
        if (!cliente) return null;
        let fechaMasReciente = cliente.fechaInicioProceso || cliente.datosCliente.fechaIngreso;
        if (cliente.proceso) {
            Object.values(cliente.proceso).forEach(paso => {
                if (paso.completado && paso.fecha) {
                    if (parseDateAsUTC(paso.fecha) > parseDateAsUTC(fechaMasReciente)) {
                        fechaMasReciente = paso.fecha;
                    }
                }
            });
        }
        const abonosDelCliente = abonos
            .filter(a => a.clienteId === cliente.id && a.viviendaId === cliente.viviendaId)
            .sort((a, b) => parseDateAsUTC(b.fechaPago) - parseDateAsUTC(a.fechaPago));
        if (abonosDelCliente.length > 0) {
            const fechaUltimoAbono = abonosDelCliente[0].fechaPago;
            if (parseDateAsUTC(fechaUltimoAbono) > parseDateAsUTC(fechaMasReciente)) {
                fechaMasReciente = fechaUltimoAbono;
            }
        }
        return fechaMasReciente;
    }, [cliente, abonos]);

    const handleConfirmar = () => {
        const newErrors = {};
        if (!motivo) newErrors.motivo = "Por favor, selecciona un motivo.";
        if (motivo?.value === 'Otro' && !observacion.trim()) newErrors.observacion = "Por favor, especifica el motivo.";
        if (!fechaRenuncia) newErrors.fechaRenuncia = "Por favor, selecciona una fecha de renuncia.";

        if (aplicaPenalidad) {
            if (montoPenalidadNum <= 0) newErrors.penalidadMonto = "El monto debe ser mayor a cero.";
            if (!penalidadMotivo.trim()) newErrors.penalidadMotivo = "El motivo de la penalidad es obligatorio.";
        }
        if (totalADevolver < 0) newErrors.penalidadMonto = "La penalidad no puede superar el total abonado.";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        onConfirm(motivo.value, observacion, fechaRenuncia, montoPenalidadNum, penalidadMotivo);
    };

    useEffect(() => {
        if (cliente) {
            setMotivo(null);
            setObservacion('');
            setFechaRenuncia(getTodayString());
            setPenalidadMonto('0');
            setPenalidadMotivo('');
            setAplicaPenalidad(false);
            setErrors({});
        }
    }, [cliente]);

    useEffect(() => {
        if (!aplicaPenalidad) {
            setPenalidadMonto('0');
            setPenalidadMotivo('');
        }
    }, [aplicaPenalidad]);

    return {
        formData: {
            motivo, observacion, fechaRenuncia, penalidadMonto, penalidadMotivo, aplicaPenalidad
        },
        errors,
        calculos: {
            totalAbonado, montoPenalidadNum, totalADevolver, minDate
        },
        handlers: {
            setMotivo, setObservacion, setFechaRenuncia, setPenalidadMonto, setPenalidadMotivo, setAplicaPenalidad, handleConfirmar
        }
    };
};