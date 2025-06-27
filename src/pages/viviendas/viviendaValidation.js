export const validateVivienda = (formData, todasLasViviendas, viviendaAEditar = null) => {
    const errors = {};
    const { manzana, numero, matricula, nomenclatura, valor, descuentoMonto, descuentoMotivo } = formData;

    // Validaciones de campos básicos (no cambian)
    if (!manzana) errors.manzana = "La manzana es obligatoria.";
    if (!numero) errors.numero = "El número de casa es obligatorio.";
    if (!matricula?.trim()) errors.matricula = "La matrícula es obligatoria.";
    if (!nomenclatura?.trim()) errors.nomenclatura = "La nomenclatura es obligatoria.";

    // Solo validamos el valor al crear
    if (!viviendaAEditar) {
        if (!valor) errors.valor = "El valor total es obligatorio.";
    }

    // Comprobación de duplicados (no cambia)
    if (todasLasViviendas && manzana && numero) {
        const isDuplicate = todasLasViviendas.some(vivienda => {
            if (vivienda.id === viviendaAEditar?.id) return false;
            return vivienda.manzana === manzana && vivienda.numeroCasa?.toString() === numero.trim();
        });
        if (isDuplicate) errors.numero = "Ya existe una vivienda con esta manzana y número.";
    }

    // --- NUEVA Y CORRECTA VALIDACIÓN DE DESCUENTO ---
    if (viviendaAEditar) {
        const montoDescuentoNuevo = parseInt(String(descuentoMonto).replace(/\D/g, ''), 10) || 0;

        if (montoDescuentoNuevo > 0 && !descuentoMotivo?.trim()) {
            errors.descuentoMotivo = "El motivo es obligatorio si se aplica un descuento.";
        }

        // Calculamos el saldo real pendiente ANTES de cualquier nuevo descuento.
        // Este es el verdadero límite para un descuento.
        const saldoPendienteReal = (viviendaAEditar.valorTotal || 0) - (viviendaAEditar.totalAbonado || 0);

        if (montoDescuentoNuevo > saldoPendienteReal) {
            const saldoFormateado = saldoPendienteReal.toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 });
            errors.descuentoMonto = `El descuento no puede superar el saldo pendiente de ${saldoFormateado}`;
        }
    }

    return errors;
};