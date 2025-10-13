/**
 * Helpers para manejo de evidencias en el proceso del cliente
 */

/**
 * Obtiene el nombre de una evidencia basado en su ID
 */
export const obtenerNombreEvidencia = (evidenciaId, evidencia, pasoConfig) => {
    if (!pasoConfig || !pasoConfig.evidenciasRequeridas) {
        console.warn(`No se encontró configuración para obtener nombre de evidencia: ${evidenciaId}`);
        return evidenciaId;
    }

    const evidenciaConfig = pasoConfig.evidenciasRequeridas.find(ev => ev.id === evidenciaId);

    if (evidenciaConfig) {
        return evidenciaConfig.label;
    }

    return evidenciaId;
};

/**
 * Construye una lista formateada de evidencias
 */
export const construirListaEvidencias = (evidencias, pasoConfig) => {
    if (!evidencias || Object.keys(evidencias).length === 0) {
        return 'Sin evidencias';
    }

    const evidenciaKeys = Object.keys(evidencias);
    const nombresEvidencias = evidenciaKeys
        .map(key => obtenerNombreEvidencia(key, evidencias[key], pasoConfig))
        .filter(nombre => nombre && nombre !== 'undefined');

    if (nombresEvidencias.length === 0) {
        return 'Sin evidencias definidas';
    }

    if (nombresEvidencias.length === 1) {
        return nombresEvidencias[0];
    }

    if (nombresEvidencias.length === 2) {
        return `${nombresEvidencias[0]} y ${nombresEvidencias[1]}`;
    }

    const ultimaEvidencia = nombresEvidencias.pop();
    return `${nombresEvidencias.join(', ')} y ${ultimaEvidencia}`;
};

/**
 * Construye acceso a evidencias para el mensaje de auditoría
 */
export const construirAccesoEvidencias = (evidencias, pasoConfig) => {
    if (!evidencias || Object.keys(evidencias).length === 0) {
        return '';
    }

    const evidenciasConUrl = Object.entries(evidencias).filter(([_, ev]) => ev?.url);

    if (evidenciasConUrl.length === 0) {
        return '';
    }

    const links = evidenciasConUrl.map(([key, ev]) => {
        const nombre = obtenerNombreEvidencia(key, ev, pasoConfig);
        return `[${nombre}](${ev.url})`;
    });

    return `Evidencias: ${links.join(', ')}`;
};
