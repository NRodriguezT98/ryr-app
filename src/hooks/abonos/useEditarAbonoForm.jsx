// En: src/hooks/abonos/useEditarAbonoForm.jsx

import { useMemo } from 'react';
import { useForm } from '../useForm';
import { useData } from '../../context/DataContext';
import { validateEditarAbono } from '../../utils/validation';
import { updateAbono } from '../../services/abonoService';
import toast from 'react-hot-toast';

export const useEditarAbonoForm = (abonoAEditar, onSave, onClose) => {
    const { clientes, abonos } = useData();

    // 1. CÁLCULO DE LÍMITES FINANCIEROS (La lógica que sacamos del modal)
    const limitesFinancieros = useMemo(() => {
        if (!abonoAEditar) return { montoPactadoFuente: 0, montoMaximoPermitido: 0 };

        const cliente = clientes.find(c => c.id === abonoAEditar.clienteId);
        if (!cliente?.financiero || !abonoAEditar.fuente) {
            return { montoPactadoFuente: 0, montoMaximoPermitido: 0 };
        }

        const { financiero } = cliente;
        const { fuente } = abonoAEditar;

        let montoPactado = 0;
        if (fuente === 'cuotaInicial' && financiero.aplicaCuotaInicial) montoPactado = financiero.cuotaInicial.monto;
        else if (fuente === 'credito' && financiero.aplicaCredito) montoPactado = financiero.credito.monto;
        else if (fuente === 'subsidioVivienda' && financiero.aplicaSubsidioVivienda) montoPactado = financiero.subsidioVivienda.monto;
        else if (fuente === 'subsidioCaja' && financiero.aplicaSubsidioCaja) montoPactado = financiero.subsidioCaja.monto;

        const totalAbonadoParaFuente = abonos
            .filter(a => a.clienteId === abonoAEditar.clienteId && a.fuente === fuente && a.estadoProceso === 'activo')
            .reduce((sum, a) => sum + (a.monto || 0), 0);

        const totalDeOtrosAbonos = totalAbonadoParaFuente - (abonoAEditar.monto || 0);
        const maximoPermitido = montoPactado - totalDeOtrosAbonos;

        return {
            montoPactadoFuente: montoPactado,
            montoMaximoPermitido: maximoPermitido,
        };
    }, [abonoAEditar, clientes, abonos]);


    // 2. CONFIGURACIÓN DEL FORMULARIO
    const form = useForm({
        initialState: {
            monto: abonoAEditar?.monto || '',
            fechaPago: abonoAEditar?.fechaPago || '',
            observacion: abonoAEditar?.observacion || '',
            urlComprobante: abonoAEditar?.urlComprobante || null,
            metodoPago: abonoAEditar?.metodoPago || ''
        },
        validate: (data) => validateEditarAbono(
            data,
            limitesFinancieros.montoMaximoPermitido,
            limitesFinancieros.montoPactadoFuente
        ),
        onSubmit: async (formData) => {
            const montoNumerico = parseInt(String(formData.monto).replace(/\D/g, '')) || 0;
            const datosParaGuardar = {
                monto: montoNumerico,
                fechaPago: formData.fechaPago,
                observacion: formData.observacion.trim(),
                urlComprobante: formData.urlComprobante,
                metodoPago: formData.metodoPago
            };

            try {
                await updateAbono(abonoAEditar.id, datosParaGuardar, abonoAEditar);
                toast.success('Abono actualizado correctamente.');
                onSave(); // Llama a la función onSave pasada como prop
            } catch (error) {
                toast.error(error.message || 'Error al actualizar el abono.');
            }
        }
    });

    return {
        ...form,
        limitesFinancieros // Opcional: si quieres mostrar los límites en la UI
    };
};