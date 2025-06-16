export const normalizarViviendas = () => {
    const viviendas = JSON.parse(localStorage.getItem("viviendas")) || [];

    const actualizadas = viviendas.map((v) =>
        v.clienteId === undefined ? { ...v, clienteId: null } : v
    );

    localStorage.setItem("viviendas", JSON.stringify(actualizadas));
};
