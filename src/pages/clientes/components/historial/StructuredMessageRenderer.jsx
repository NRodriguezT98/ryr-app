/**
 * StructuredMessageRenderer.jsx
 * 
 * Renderiza mensajes usando datos estructurados (sin parsing).
 * Mucho más rápido y robusto que parsear strings.
 * 
 * FASE 1: Sistema de datos estructurados
 */

import { CompletionMessage } from './messages/CompletionMessage';
import { DateChangeMessage } from './messages/DateChangeMessage';
import { ReopeningMessage } from './messages/ReopeningMessage';

export const StructuredMessageRenderer = ({ structured }) => {
    const { type, step, dates, evidences, metadata, changes } = structured;

    // Helper: Convertir evidencias estructuradas a formato que esperan los componentes
    const formatEvidences = (evidencesList) => {
        if (!evidencesList) return [];
        return evidencesList.map((ev, idx) => ({
            ...ev,
            // Compatibilidad con componentes existentes
            nombre: ev.name,
            displayName: ev.displayName || ev.name,
            url: ev.url
        }));
    };

    // Helper: Para obtener URL de evidencia (directo del structured)
    const getEvidenciaUrl = (nombreEvidencia) => {
        if (!evidences || !evidences.after) return null;
        const found = evidences.after.find(ev =>
            ev.name === nombreEvidencia ||
            ev.displayName === nombreEvidencia
        );
        return found?.url;
    };

    // Helper: Para obtener display name de evidencia
    const getEvidenciaDisplayName = (idx) => {
        if (!evidences || !evidences.after) return `Evidencia ${idx + 1}`;
        const evidence = evidences.after[idx];
        return evidence?.displayName || evidence?.name || `Evidencia ${idx + 1}`;
    };

    // Renderizar según tipo
    switch (type) {
                case 'completacion':
            return (
                <CompletionMessage
                    pasoNombre={step.name}
                    numeroPaso={step.number}
                    totalPasos={step.total}
                    isAutoCompletion={metadata.isAutoComplete || false}
                    fecha={dates.after}
                    evidencias={evidences.after.map(ev => ev.name)} // Lista de nombres para backward compatibility
                    evidenciasConUrl={formatEvidences(evidences.after)}
                    getEvidenciaUrl={getEvidenciaUrl}
                    getEvidenciaDisplayName={getEvidenciaDisplayName}
                />
            );

        case 'cambio_fecha':
            return (
                <DateChangeMessage
                    pasoNombre={step.name}
                    numeroPaso={step.number}
                    totalPasos={step.total}
                    fechaAnterior={dates.before}
                    fechaNueva={dates.after}
                />
            );

        case 'reapertura':
            // Preparar evidencias reemplazadas en formato que espera el componente
            const evidenciasReemplazadas = (metadata.replacedEvidences || []).map(replaced => ({
                antes: replaced.before.name,
                despues: replaced.after.name
            }));

            return (
                <ReopeningMessage
                    pasoNombre={step.name}
                    numeroPaso={step.number}
                    totalPasos={step.total}
                    motivoReapertura={metadata.reopenReason || 'No especificado'}
                    estadoAnterior={{
                        fecha: dates.before,
                        evidencias: evidences.before.length
                    }}
                    estadoFinal={{
                        fecha: dates.after,
                        evidencias: evidences.after.length
                    }}
                    cambioFecha={metadata.flags?.hasDateChange || false}
                    evidenciasReemplazadas={evidenciasReemplazadas}
                    getEvidenciaUrl={(nombre) => {
                        // Buscar en evidencias before o after
                        const found = [...evidences.before, ...evidences.after]
                            .find(ev => ev.name === nombre || ev.displayName === nombre);
                        return found?.url;
                    }}
                />
            );

        default:
            // Tipo desconocido, mostrar info básica
            return (
                <div className="text-gray-800 dark:text-gray-200 text-sm">
                    <p className="font-semibold">{step.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Tipo: {type} | Paso {step.number} de {step.total}
                    </p>
                </div>
            );
    }
};
