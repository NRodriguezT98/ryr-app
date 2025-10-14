/**
 * 💾 Hook: useClienteSave
 * 
 * Responsabilidad: Lógica de persistencia de datos del cliente
 * - Modo 'crear': Crear cliente nuevo y asignar vivienda
 * - Modo 'editar': Actualizar cliente existente
 * - Modo 'reactivar': Reactivar cliente renunciado con nuevo proceso
 * - Manejo de proceso (PROCESO_CONFIG)
 * - Auditoría y notificaciones
 * - Navegación post-guardado
 * 
 * Extraído de: useClienteForm.jsx (líneas 383-600+ executeSave)
 * Complejidad: ALTA - Lógica de negocio crítica
 * Testing: Integration tests
 * Riesgo: 25% - Función más compleja del módulo
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModernToast } from '../useModernToast.jsx';
import { addClienteAndAssignVivienda, updateCliente } from '../../services/clientes';
import { createNotification } from '../../services/notificationService.js';
import { PROCESO_CONFIG } from '../../utils/procesoConfig.js';
import { formatCurrency, toTitleCase, getTodayString } from '../../utils/textFormatters.js';

/**
 * Hook para gestionar el guardado del cliente
 * 
 * @param {string} modo - Modo de operación: 'crear' | 'editar' | 'reactivar'
 * @param {boolean} isEditing - Si está en modo edición
 * @param {Object} clienteAEditar - Cliente a editar (null si es nuevo)
 * @param {string} viviendaOriginalId - ID de vivienda original (para edición)
 * @param {Function} onSaveSuccess - Callback de éxito
 * @param {Array} proyectos - Lista de proyectos (para auditoría)
 * @param {Array} viviendas - Lista de viviendas (para auditoría)
 * @returns {Object} { saveCliente, isSubmitting }
 * 
 * @example
 * const { saveCliente, isSubmitting } = useClienteSave(
 *   modo,
 *   isEditing,
 *   clienteAEditar,
 *   viviendaOriginalId,
 *   onSaveSuccess,
 *   proyectos,
 *   viviendas
 * );
 * 
 * // Guardar cliente
 * await saveCliente(formData, cambios);
 */
export const useClienteSave = (
    modo,
    isEditing,
    clienteAEditar,
    viviendaOriginalId,
    onSaveSuccess,
    proyectos = [],
    viviendas = []
) => {
    const navigate = useNavigate();
    const toast = useModernToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    /**
     * Crear proceso vacío basado en configuración financiera
     */
    const createEmptyProcess = useCallback((financiero, documentos, fechaIngreso) => {
        const nuevoProceso = {};

        // Crear pasos según la configuración
        PROCESO_CONFIG.forEach(paso => {
            if (paso.aplicaA(financiero)) {
                const evidencias = {};
                paso.evidenciasRequeridas.forEach(ev => {
                    evidencias[ev.id] = { url: null, estado: 'pendiente' };
                });
                nuevoProceso[paso.key] = {
                    completado: false,
                    fecha: null,
                    evidencias
                };
            }
        });

        // Si hay promesa enviada, marcar paso como completado
        if (documentos.promesaEnviadaUrl && documentos.promesaEnviadaCorreoUrl) {
            nuevoProceso.promesaEnviada = {
                completado: true,
                fecha: fechaIngreso,
                evidencias: {
                    promesaEnviadaDoc: {
                        url: documentos.promesaEnviadaUrl,
                        estado: 'subido',
                        fechaSubida: fechaIngreso
                    },
                    promesaEnviadaCorreo: {
                        url: documentos.promesaEnviadaCorreoUrl,
                        estado: 'subido',
                        fechaSubida: fechaIngreso
                    }
                }
            };
        }

        return nuevoProceso;
    }, []);

    /**
     * Guardar cliente en modo 'crear'
     */
    const saveClienteCrear = useCallback(async (formData) => {
        if (!formData.viviendaSeleccionada?.id) {
            toast.error("Error: No hay una vivienda seleccionada.");
            return false;
        }

        const { datosCliente, financiero, documentos, viviendaSeleccionada } = formData;

        // Crear proceso nuevo
        const nuevoProceso = createEmptyProcess(
            financiero,
            documentos,
            datosCliente.fechaIngreso
        );

        const clienteParaGuardar = {
            datosCliente,
            financiero,
            proceso: nuevoProceso,
            viviendaId: viviendaSeleccionada.id,
            fechaInicioProceso: datosCliente.fechaIngreso
        };

        // Preparar datos de auditoría
        const proyectoAsignado = proyectos.find(p => p.id === viviendaSeleccionada.proyectoId);
        const nombreProyecto = proyectoAsignado ? proyectoAsignado.nombre : 'N/A';
        const nombreVivienda = `Mz ${viviendaSeleccionada.manzana} - Casa ${viviendaSeleccionada.numeroCasa}`;
        const nombreCompleto = `${datosCliente.nombres} ${datosCliente.apellidos}`;

        const auditMessage = `Creó al cliente ${toTitleCase(nombreCompleto)} (C.C. ${datosCliente.cedula}), asignándole la vivienda ${nombreVivienda} del proyecto "${nombreProyecto}"`;

        // Construir fuentes de pago para auditoría
        const fuentesDePago = [];
        if (financiero.aplicaCuotaInicial) {
            fuentesDePago.push({
                nombre: 'Cuota Inicial',
                monto: financiero.cuotaInicial.monto
            });
        }
        if (financiero.aplicaCredito) {
            fuentesDePago.push({
                nombre: 'Crédito Hipotecario',
                monto: financiero.credito.monto
            });
        }
        if (financiero.aplicaSubsidioVivienda) {
            fuentesDePago.push({
                nombre: 'Subsidio Mi Casa Ya',
                monto: financiero.subsidioVivienda.monto
            });
        }
        if (financiero.aplicaSubsidioCaja) {
            fuentesDePago.push({
                nombre: `Subsidio Caja (${financiero.subsidioCaja.caja})`,
                monto: financiero.subsidioCaja.monto
            });
        }

        const auditDetails = {
            action: 'CREATE_CLIENT',
            clienteId: datosCliente.cedula,
            clienteNombre: toTitleCase(nombreCompleto),
            snapshotCliente: {
                viviendaAsignada: `${nombreVivienda} del Proyecto ${nombreProyecto}`,
                valorVivienda: viviendaSeleccionada.valorTotal,
                nombreCompleto: toTitleCase(nombreCompleto),
                cedula: datosCliente.cedula,
                telefono: datosCliente.telefono,
                correo: datosCliente.correo,
                direccion: datosCliente.direccion,
                fechaIngreso: datosCliente.fechaIngreso,
                cedulaAdjuntada: datosCliente.urlCedula ? 'Sí' : 'No',
                promesaAdjuntada: documentos.promesaEnviadaUrl ? 'Sí' : 'No',
                correoAdjuntado: documentos.promesaEnviadaCorreoUrl ? 'Sí' : 'No',
                fuentesDePago: fuentesDePago,
                usaValorEscrituraDiferente: financiero.usaValorEscrituraDiferente,
                valorEscritura: financiero.valorEscritura
            }
        };

        await addClienteAndAssignVivienda(clienteParaGuardar, auditMessage, auditDetails);

        // 🔥 Mostrar éxito inmediatamente (Optimistic)
        toast.success("¡Cliente y proceso iniciados con éxito!", {
            title: "¡Cliente Creado!"
        });

        const clienteNombre = `${datosCliente.nombres} ${datosCliente.apellidos}`.trim();
        await createNotification(
            'cliente',
            `Nuevo cliente registrado: ${clienteNombre}`,
            `/clientes/detalle/${datosCliente.cedula}`
        );

        // ✅ NO recargar aquí - se hará en handleGuardado de ListarClientes
        // Esto evita doble recarga y garantiza que el modal se cierre DESPUÉS de la recarga

        return true;
    }, [proyectos, createEmptyProcess, toast]);

    /**
     * Guardar cliente en modo 'editar'
     */
    const saveClienteEditar = useCallback(async (formData, cambios, initialData, isFechaIngresoLocked) => {
        console.log('📝 [saveClienteEditar] Ejecutando edición...');
        console.log('  - cambios recibidos:', cambios);
        console.log('  - cambios.length:', cambios?.length);
        console.log('  - clienteAEditar:', clienteAEditar);

        const clienteParaActualizar = {
            datosCliente: formData.datosCliente,
            financiero: formData.financiero,
            proceso: formData.proceso,
            viviendaId: formData.viviendaSeleccionada?.id || null,
            status: formData.status
        };

        const fechaOriginal = initialData?.datosCliente?.fechaIngreso;
        const fechaNueva = formData.datosCliente.fechaIngreso;

        // Validar cambio de fecha si está bloqueada
        if (fechaOriginal !== fechaNueva) {
            if (isFechaIngresoLocked) {
                toast.error(
                    "La fecha de inicio no se puede modificar porque el cliente ya tiene abonos o ha avanzado en el proceso."
                );
                return false;
            }

            // Si la fecha cambió y es permitido, sincronizar con proceso
            if (clienteParaActualizar.proceso?.promesaEnviada) {
                clienteParaActualizar.proceso.promesaEnviada.fecha = fechaNueva;
            }

            clienteParaActualizar.fechaInicioProceso = fechaNueva;
        }

        console.log('🎯 [saveClienteEditar] Antes de llamar updateCliente');
        console.log('  - clienteId:', clienteAEditar.id);
        console.log('  - clienteParaActualizar:', clienteParaActualizar);
        console.log('  - viviendaOriginalId:', viviendaOriginalId);
        console.log('  - auditDetails.cambios:', cambios);

        await updateCliente(clienteAEditar.id, clienteParaActualizar, viviendaOriginalId, {
            action: 'UPDATE_CLIENT',
            cambios: cambios || []
        });

        console.log('🎉 [saveClienteEditar] updateCliente completado exitosamente');

        // 🔥 Mostrar éxito inmediatamente (Optimistic)
        toast.success("¡Cliente actualizado con éxito!", {
            title: "¡Actualización Exitosa!"
        });

        await createNotification(
            'cliente',
            `Se actualizaron los datos de ${toTitleCase(clienteAEditar.datosCliente.nombres)}.`,
            `/clientes/detalle/${clienteAEditar.id}`
        );

        // ✅ NO recargar aquí - se hará en handleGuardado de ListarClientes

        return true;
    }, [clienteAEditar, viviendaOriginalId, toast]);

    /**
     * Guardar cliente en modo 'reactivar'
     */
    const saveClienteReactivar = useCallback(async (formData) => {
        if (!formData.viviendaSeleccionada?.id) {
            toast.error("Error: Debes seleccionar una vivienda para reactivar al cliente.");
            return false;
        }

        // Crear nuevo proceso vacío
        const nuevoProceso = createEmptyProcess(
            formData.financiero,
            formData.documentos,
            getTodayString()
        );

        const clienteParaActualizar = {
            datosCliente: formData.datosCliente,
            financiero: formData.financiero,
            proceso: nuevoProceso,
            viviendaId: formData.viviendaSeleccionada.id,
            status: 'activo',
            fechaInicioProceso: formData.datosCliente.fechaIngreso,
            fechaCreacion: clienteAEditar.fechaCreacion
        };

        const nuevaVivienda = viviendas.find(v => v.id === clienteParaActualizar.viviendaId);
        const nombreNuevaVivienda = nuevaVivienda
            ? `Mz ${nuevaVivienda.manzana} - Casa ${nuevaVivienda.numeroCasa}`
            : 'Vivienda no encontrada';

        await updateCliente(clienteAEditar.id, clienteParaActualizar, viviendaOriginalId, {
            action: 'RESTART_CLIENT_PROCESS',
            snapshotCompleto: clienteParaActualizar,
            nombreNuevaVivienda: nombreNuevaVivienda
        });

        // 🔥 Mostrar éxito inmediatamente (Optimistic)
        toast.success("¡Cliente reactivado con un nuevo proceso!", {
            title: "¡Cliente Reactivado!"
        });

        const clienteNombre = toTitleCase(
            `${clienteParaActualizar.datosCliente.nombres} ${clienteParaActualizar.datosCliente.apellidos}`
        );
        await createNotification(
            'cliente',
            `El cliente ${clienteNombre} fue reactivado.`,
            `/clientes/detalle/${clienteAEditar.id}`
        );

        // ✅ NO recargar aquí - se hará en handleGuardado de ListarClientes

        return true;
    }, [clienteAEditar, viviendaOriginalId, viviendas, createEmptyProcess, toast]);

    /**
     * Función principal de guardado
     * Decide qué función ejecutar según el modo
     */
    const saveCliente = useCallback(async (formData, cambiosDetectados = [], initialData = null, isFechaIngresoLocked = false) => {
        console.log('🚀 [saveCliente] Iniciando guardado...');
        console.log('  - modo:', modo);
        console.log('  - isEditing:', isEditing);
        console.log('  - cambiosDetectados:', cambiosDetectados);
        console.log('  - cambiosDetectados.length:', cambiosDetectados?.length);

        setIsSubmitting(true);

        try {
            let success = false;

            if (modo === 'reactivar') {
                console.log('  → Llamando a saveClienteReactivar');
                success = await saveClienteReactivar(formData);
            } else if (isEditing) {
                console.log('  → Llamando a saveClienteEditar');
                success = await saveClienteEditar(formData, cambiosDetectados, initialData, isFechaIngresoLocked);
            } else {
                console.log('  → Llamando a saveClienteCrear');
                success = await saveClienteCrear(formData);
            }

            if (success) {
                // ✅ FIX: La sincronización en tiempo real ahora funciona usando serverTimestamp()
                if (onSaveSuccess) {
                    onSaveSuccess();
                } else {
                    navigate('/clientes/listar');
                }
            }

            return success;
        } catch (error) {
            console.error("❌ [saveCliente] Error capturado:", error);
            console.error("  - error.message:", error.message);
            console.error("  - error.stack:", error.stack);
            toast.error("Hubo un error al guardar los datos.", {
                title: "Error de Guardado"
            });
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [
        modo,
        isEditing,
        saveClienteCrear,
        saveClienteEditar,
        saveClienteReactivar,
        onSaveSuccess,
        navigate,
        toast
    ]);

    return {
        saveCliente,
        isSubmitting,
        setIsSubmitting
    };
};

export default useClienteSave;
