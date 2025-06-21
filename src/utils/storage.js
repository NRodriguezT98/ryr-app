// Ruta: src/utils/storage.js

export const getViviendas = () => {
    return JSON.parse(localStorage.getItem("viviendas")) || [];
};

export const saveViviendas = (viviendas) => {
    localStorage.setItem("viviendas", JSON.stringify(viviendas));
};

export const getClientes = () => {
    return JSON.parse(localStorage.getItem("clientes")) || [];
};

export const saveClientes = (clientes) => {
    localStorage.setItem("clientes", JSON.stringify(clientes));
};

export const getAbonos = () => {
    return JSON.parse(localStorage.getItem("abonos")) || [];
};

export const saveAbonos = (abonos) => {
    localStorage.setItem("abonos", JSON.stringify(abonos));
};

// ... (justo después de tus otras funciones de save/get de viviendas)

export const addVivienda = (vivienda) => {
    // Esta función encapsula toda la lógica de localStorage para añadir una vivienda.
    const viviendas = getViviendas(); // Reutilizamos getViviendas
    viviendas.push(vivienda);
    saveViviendas(viviendas); // Reutilizamos saveViviendas
};

export const updateVivienda = (id, datosActualizados) => {
    const viviendas = getViviendas();
    const viviendaIndex = viviendas.findIndex(v => v.id === id);
    if (viviendaIndex > -1) {
        viviendas[viviendaIndex] = { ...viviendas[viviendaIndex], ...datosActualizados };
        saveViviendas(viviendas);
        return true;
    }
    return false;
};

export const deleteVivienda = (viviendaId) => {
    let viviendas = getViviendas();
    let clientes = getClientes();

    // Comprobar si algún cliente está asignado a esta vivienda
    const clienteAsignado = clientes.find(c => c.viviendaId === viviendaId);

    // Si hay un cliente, desvincularlo
    if (clienteAsignado) {
        const clientesActualizados = clientes.map(c =>
            c.id === clienteAsignado.id ? { ...c, viviendaId: null } : c
        );
        saveClientes(clientesActualizados);
    }

    // Filtrar y guardar la nueva lista de viviendas
    const viviendasActualizadas = viviendas.filter(v => v.id !== viviendaId);
    saveViviendas(viviendasActualizadas);

    return true; // Indicar que la operación fue exitosa
};

export const addAbono = (abono) => {
    const abonos = getAbonos();
    abonos.push(abono);
    saveAbonos(abonos);
};

// ... (tus otras funciones: getAbonos, addAbono, deleteAbono)

export const updateAbono = (id, datosActualizados) => {
    const abonos = getAbonos();
    const abonoIndex = abonos.findIndex(abono => abono.id === id);

    if (abonoIndex > -1) {
        // La lógica de actualización está perfecta.
        abonos[abonoIndex] = { ...abonos[abonoIndex], ...datosActualizados };

        // --- CORRECCIÓN AQUÍ ---
        // Reutilizamos la función saveAbonos para asegurar consistencia.
        saveAbonos(abonos);

        return true;
    }
    return false;
};

export const deleteAbono = (abonoId) => {
    let abonos = getAbonos();
    const filteredAbonos = abonos.filter(a => a.id !== abonoId);
    if (filteredAbonos.length < abonos.length) { // Si se eliminó al menos uno
        saveAbonos(filteredAbonos);
        return true; // Indica éxito
    }
    return false; // Indica que no se encontró o eliminó
};