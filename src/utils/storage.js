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

export const addAbono = (abono) => {
    const abonos = getAbonos();
    abonos.push(abono);
    saveAbonos(abonos);
};

export const updateAbono = (updatedAbono) => {
    let abonos = getAbonos();
    const index = abonos.findIndex(a => a.id === updatedAbono.id);
    if (index !== -1) {
        abonos[index] = updatedAbono;
        saveAbonos(abonos);
        return true; // Indica éxito
    }
    return false; // Indica que no se encontró
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