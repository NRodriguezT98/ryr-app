import React, { useState, useMemo, useRef } from 'react';
import { CheckCircle, Lock, FileText, Calendar, AlertCircle, RotateCcw, Eye, Trash2, Replace } from 'lucide-react';
import FileUpload from '../../../components/FileUpload';
import toast from 'react-hot-toast';
import { getTodayString, formatDisplayDate } from '../../../utils/textFormatters';

const EvidenciaItem = ({ evidencia, pasoKey, onUpdateEvidencia, clienteId, isPermanentlyLocked }) => {
    const evidenciaData = evidencia.data || {};
    const fileInputRef = useRef(null);

    const handleUploadSuccess = (url) => {
        onUpdateEvidencia(pasoKey, evidencia.id, url);
    };

    const handleRemove = () => {
        onUpdateEvidencia(pasoKey, evidencia.id, null);
    };

    const handleFileChangeForReplace = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        toast.loading('Reemplazando archivo...');
        try {
            const downloadURL = await FileUpload.uploadFile(file, `documentos_proceso/${clienteId}/${pasoKey}-${evidencia.id}-${file.name}`);
            onUpdateEvidencia(pasoKey, evidencia.id, downloadURL);
            toast.dismiss();
            toast.success('¡Archivo reemplazado con éxito!');
        } catch (error) {
            toast.dismiss();
            toast.error("Error al reemplazar el archivo.");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
            <div className="flex items-center gap-2">
                <FileText size={16} className={evidenciaData.url ? "text-green-600" : "text-gray-400"} />
                <span className="text-sm text-gray-700">{evidencia.label}</span>
            </div>
            <div>
                {evidenciaData.url ? (
                    <div className="flex items-center gap-3">
                        <a href={evidenciaData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1"><Eye size={14} /> Ver</a>
                        {!isPermanentlyLocked && (
                            <>
                                <button onClick={() => fileInputRef.current?.click()} className="text-yellow-600 hover:underline text-sm font-semibold flex items-center gap-1"><Replace size={14} /> Reemplazar</button>
                                <button onClick={handleRemove} className="text-red-500 hover:underline text-sm font-semibold flex items-center gap-1"><Trash2 size={14} /> Eliminar</button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChangeForReplace} className="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                            </>
                        )}
                    </div>
                ) : (
                    <FileUpload
                        label="Subir"
                        filePath={(fileName) => `documentos_proceso/${clienteId}/${pasoKey}-${evidencia.id}-${fileName}`}
                        onUploadSuccess={handleUploadSuccess}
                        isCompact={true}
                    />
                )}
            </div>
        </div>
    );
};


const PasoProcesoCard = ({ paso, stepNumber, onUpdateEvidencia, onCompletarPaso, onDateChange, onReabrirPaso, clienteId }) => {
    const { key, label, data, isLocked, puedeCompletarse, evidenciasRequeridas, error, minDate, maxDate, esSiguientePaso, isPermanentlyLocked } = paso;
    const [fechaCompletado, setFechaCompletado] = useState(getTodayString());

    const evidenciasSubidas = useMemo(() => {
        if (!data?.evidencias) return 0;
        return Object.values(data.evidencias).filter(ev => ev.url).length;
    }, [data]);

    const totalEvidencias = evidenciasRequeridas.length;

    const handleConfirmar = () => {
        if (!fechaCompletado) {
            toast.error("Debes seleccionar una fecha.");
            return;
        }
        onCompletarPaso(key, fechaCompletado);
    };

    const cardClasses = `p-5 rounded-xl border-2 transition-all ${error ? 'border-red-500 bg-red-50' :
            data?.completado ? 'border-green-300 bg-green-50' :
                isLocked ? 'border-gray-200 bg-gray-50 opacity-60' :
                    esSiguientePaso ? 'border-blue-500 bg-white shadow-lg' : 'border-blue-200 bg-white'
        }`;

    return (
        <div className={cardClasses}>
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {data?.completado ? (
                        <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                    ) : isLocked ? (
                        <Lock size={24} className="text-gray-400 flex-shrink-0" />
                    ) : (
                        <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0 ${esSiguientePaso ? 'bg-blue-600 animate-pulse' : 'bg-blue-500'}`}>
                            {stepNumber}
                        </div>
                    )}
                    <h3 className={`font-bold text-lg ${data?.completado ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{label}</h3>
                </div>
                {data?.completado && (
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <input
                            type="date"
                            value={data.fecha || ''}
                            onChange={(e) => onDateChange(key, e.target.value)}
                            min={minDate}
                            max={maxDate}
                            disabled={isPermanentlyLocked}
                            className={`text-sm border-b bg-transparent ${error ? 'border-red-500' : 'border-gray-300'} disabled:cursor-not-allowed`}
                        />
                        {!isPermanentlyLocked && (
                            <button onClick={() => onReabrirPaso(key)} className="p-1 text-gray-500 hover:text-blue-600 rounded-full" title="Reabrir este paso">
                                <RotateCcw size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {!data?.completado && !isLocked && (
                <div className="mt-4 pl-9 space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-600">Evidencias Requeridas:</p>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${evidenciasSubidas === totalEvidencias ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {`${evidenciasSubidas} de ${totalEvidencias} subidas`}
                        </span>
                    </div>
                    {evidenciasRequeridas.map(ev => (
                        <EvidenciaItem
                            key={ev.id}
                            evidencia={{ ...ev, data: data?.evidencias?.[ev.id] }}
                            pasoKey={key}
                            onUpdateEvidencia={onUpdateEvidencia}
                            clienteId={clienteId}
                            isPermanentlyLocked={isPermanentlyLocked}
                        />
                    ))}
                    {puedeCompletarse && (
                        <div className="flex items-center justify-end gap-3 pt-3 border-t">
                            <input
                                type="date"
                                value={fechaCompletado}
                                onChange={(e) => setFechaCompletado(e.target.value)}
                                min={minDate}
                                max={maxDate}
                                className="text-sm border p-1.5 rounded-md"
                            />
                            <button onClick={handleConfirmar} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700">
                                Marcar como Completado
                            </button>
                        </div>
                    )}
                </div>
            )}
            {error && (
                <div className="mt-2 pl-9 flex items-center gap-2 text-red-600 text-xs font-semibold">
                    <AlertCircle size={14} />
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default PasoProcesoCard;