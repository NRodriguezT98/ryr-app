/**
 * Utilidades para parsear mensajes de auditoría
 */

/**
 * Extrae el número de paso del mensaje
 */
export const extractStepNumber = (message) => {
    const pasoMatch = message.match(/\((\d+)\/(\d+)\)/);
    if (pasoMatch) {
        return {
            numeroPaso: parseInt(pasoMatch[1]),
            totalPasos: parseInt(pasoMatch[2])
        };
    }
    return { numeroPaso: null, totalPasos: null };
};

/**
 * Extrae información básica del mensaje
 */
export const extractBasicInfo = (message) => {
    const lines = message.split('\n').filter(line => line.trim() && !line.includes('═') && !line.includes('║'));

    let pasoNombre = '';
    let fecha = '';
    let evidencias = [];
    let fechaAnterior = '';
    let fechaNueva = '';
    let motivoReapertura = '';

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            pasoNombre = trimmed.replace(/"/g, '');
        } else if (trimmed.match(/^\d+\s+de\s+\w+,?\s+(de\s+)?\d{4}$/i)) {
            if (!fecha) fecha = trimmed;
        } else if (trimmed.startsWith('Anterior:')) {
            fechaAnterior = trimmed.replace('Anterior:', '').trim();
        } else if (trimmed.startsWith('Nueva:')) {
            fechaNueva = trimmed.replace('Nueva:', '').trim();
        } else if (trimmed.match(/^\d+\./)) {
            evidencias.push(trimmed);
        } else if (trimmed.startsWith('Motivo:')) {
            motivoReapertura = trimmed.replace('Motivo:', '').replace(/"/g, '').trim();
        }
    });

    return {
        pasoNombre,
        fecha,
        evidencias,
        fechaAnterior,
        fechaNueva,
        motivoReapertura,
        lines
    };
};

/**
 * Parsea información de reapertura
 */
export const parseReopeningInfo = (lines) => {
    let estadoAnterior = { fecha: '', evidencias: 0 };
    let estadoFinal = { fecha: '', evidencias: 0 };
    let evidenciasReemplazadas = [];
    let cambioFecha = false;
    let motivoReapertura = '';

    let currentSection = '';

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        // Detectar secciones
        if (trimmed.includes('ESTADO ANTERIOR')) currentSection = 'anterior';
        else if (trimmed.includes('CAMBIOS REALIZADOS')) currentSection = 'cambios';
        else if (trimmed.includes('ESTADO FINAL')) currentSection = 'final';
        else if (trimmed.includes('EVIDENCIAS FINALES')) currentSection = 'evidencias_finales';

        // Extraer motivo
        if (trimmed.startsWith('⚠️') || trimmed.includes('MOTIVO DE REAPERTURA')) {
            const nextLine = lines[idx + 1];
            if (nextLine && !nextLine.includes('═') && !nextLine.includes('ESTADO') && !nextLine.includes('📋')) {
                motivoReapertura = nextLine.trim();
            }
        }

        // Estado anterior
        if (currentSection === 'anterior') {
            if (trimmed.startsWith('📅 Fecha')) {
                estadoAnterior.fecha = trimmed.split(':')[1]?.trim() || '';
            } else if (trimmed.startsWith('📄 Evidencias:')) {
                const match = trimmed.match(/(\d+) archivo/);
                estadoAnterior.evidencias = match ? parseInt(match[1]) : 0;
            }
        }

        // Cambios realizados
        if (currentSection === 'cambios') {
            // Detectar cambio de fecha
            if (trimmed.includes('FECHA') && trimmed.includes('MODIFICADA')) {
                cambioFecha = true;
            }
            // Extraer fechas del cambio (Anterior: ... / Nueva: ...)
            if (trimmed.startsWith('Anterior:')) {
                estadoAnterior.fecha = trimmed.split(':')[1]?.trim() || estadoAnterior.fecha;
            }
            if (trimmed.startsWith('Nueva:')) {
                estadoFinal.fecha = trimmed.split(':')[1]?.trim() || estadoFinal.fecha;
            }

            // Evidencias reemplazadas
            if (trimmed.includes('EVIDENCIAS REEMPLAZADAS') || trimmed.includes('➡️')) {
                const match = trimmed.match(/"([^"]+)"\s*➡️\s*"([^"]+)"/);
                if (match) {
                    evidenciasReemplazadas.push({ antes: match[1], despues: match[2] });
                } else if (trimmed.match(/^\d+\./)) {
                    // Formato: 1. "nombre anterior" ➡️ "nombre nuevo"
                    const cleanedLine = trimmed.replace(/^\d+\.\s*/, '');
                    const parts = cleanedLine.match(/"([^"]+)"\s*➡️\s*"([^"]+)"/);
                    if (parts) {
                        evidenciasReemplazadas.push({ antes: parts[1], despues: parts[2] });
                    }
                }
            }
        }

        // Estado final (solo si no se extrajo en cambios)
        if (currentSection === 'final') {
            if (trimmed.startsWith('📅 Fecha') && !estadoFinal.fecha) {
                estadoFinal.fecha = trimmed.split(':')[1]?.trim() || '';
            } else if (trimmed.startsWith('📄 Total')) {
                const match = trimmed.match(/(\d+) archivo/);
                estadoFinal.evidencias = match ? parseInt(match[1]) : 0;
            }
        }
    });

    return {
        estadoAnterior,
        estadoFinal,
        evidenciasReemplazadas,
        cambioFecha,
        motivoReapertura
    };
};

/**
 * Parsea información de cliente creado
 */
export const parseClientCreatedInfo = (lines) => {
    const extractValue = (label) => {
        const line = lines.find(l => l.trim().startsWith(label));
        return line ? line.split(':').slice(1).join(':').trim() : '';
    };

    let valorVivienda = '';
    const fuentesFinanciamiento = [];
    let totalFuentes = '';
    let capturingSources = false;
    let inFinancialSection = false;

    lines.forEach((line) => {
        const trimmed = line.trim();

        if (trimmed.includes('INFORMACIÓN FINANCIERA')) {
            inFinancialSection = true;
            return;
        }

        if (inFinancialSection && (trimmed.startsWith('╔') || trimmed.startsWith('✅'))) {
            inFinancialSection = false;
            capturingSources = false;
            return;
        }

        if (inFinancialSection) {
            if (trimmed.includes('Valor de la Vivienda:')) {
                valorVivienda = trimmed.split(':').slice(1).join(':').trim();
            }

            if (trimmed.includes('Fuentes de Financiamiento:')) {
                capturingSources = true;
                return;
            }

            if (trimmed.includes('Total Fuentes:')) {
                totalFuentes = trimmed.split(':').slice(1).join(':').trim();
                capturingSources = false;
                return;
            }

            if (capturingSources && !trimmed.startsWith('──────')) {
                const lineaSinEmoji = trimmed.replace(/^[💳💵🏛🏢💰]\s*/, '').trim();
                if (lineaSinEmoji && !lineaSinEmoji.includes('Fuentes de Financiamiento') && lineaSinEmoji.includes(':')) {
                    fuentesFinanciamiento.push(lineaSinEmoji);
                }
            }
        }
    });

    return {
        nombre: extractValue('Nombre'),
        identificacion: extractValue('Identificación'),
        telefono: extractValue('Teléfono'),
        email: extractValue('Email'),
        proyecto: extractValue('Proyecto'),
        manzana: extractValue('Manzana'),
        casa: extractValue('Casa'),
        fechaIngreso: extractValue('📅 FECHA DE INGRESO') || lines.find(l => l.match(/^\d+ de \w+/))?.trim(),
        valorVivienda,
        fuentesFinanciamiento,
        totalFuentes
    };
};

/**
 * Detecta el tipo de mensaje
 */
export const detectMessageType = (message) => {
    // ⚠️ IMPORTANTE: El orden importa
    const isReopening = message.includes('PASO REABIERTO') || message.includes('REAPERTURA');
    const isCompletion = message.includes('PASO COMPLETADO') && !isReopening;
    const isAutoCompletion = message.includes('PASO COMPLETADO AUTOMÁTICAMENTE');
    const isDateChange = message.includes('FECHA DE COMPLETADO MODIFICADA') && !isReopening;
    const isClientCreated = message.includes('NUEVO CLIENTE REGISTRADO');

    return {
        isReopening,
        isCompletion,
        isAutoCompletion,
        isDateChange,
        isClientCreated
    };
};
