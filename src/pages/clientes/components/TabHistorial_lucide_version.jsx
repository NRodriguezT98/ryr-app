import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  User,
  RefreshCw,
  Edit,
  RotateCcw,
  Upload,
  Download,
  Eye,
  FolderOpen,
  Plus,
  Minus,
  FileCheck,
  FileX,
  ExternalLink,
  UserPlus,
  UserX,
  Archive,
  ArchiveRestore,
  MessageSquareText,
  GitCommit,
  DollarSign,
  Unlock,
  Loader
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../../context/AuthContext';
import { useHistorialCliente } from '../../../hooks/clientes/useHistorialCliente';
import { updateNotaHistorial } from '../../../services/clienteService';
import { hasFileChanges } from '../../../utils/fileAuditHelper';
import AnimatedPage from '../../../components/AnimatedPage';
import FormularioNuevaNota from './FormularioNuevaNota';
import ModalEditarNota from './ModalEditarNota';
import ModalConfirmacion from '../../../components/ModalConfirmacion';
import ModalAuditoriaArchivos from '../../../components/ModalAuditoriaArchivos';
import IconTest from '../../../components/IconTest';
import DiagnosticoIconos from '../../../components/DiagnosticoIconos';
import TestSVGDirecto from '../../../components/TestSVGDirecto';
import TestImportEspecifico from '../../../components/TestImportEspecifico';
import TabHistorialSVG from './TabHistorialSVG';
import toast from 'react-hot-toast';

// Helper para obtener iconos según la acción
const getActionIcon = (action) => {
  const iconProps = { size: 16, className: "text-white" };
  
  switch (action) {
    case 'ADD_NOTE':
      return <MessageSquareText {...iconProps} />;
    case 'CREATE_CLIENT':
      return <UserPlus {...iconProps} />;
    case 'UPDATE_CLIENT':
      return <Edit {...iconProps} />;
    case 'EDIT_NOTE':
      return <Edit {...iconProps} />;
    case 'UPDATE_PROCESO':
      return <GitCommit {...iconProps} />;
    case 'COMPLETE_PROCESS_STEP':
      return <CheckCircle {...iconProps} />;
    case 'RECOMPLETE_PROCESS_STEP':
      return <RefreshCw {...iconProps} />;
    case 'REOPEN_PROCESS_STEP':
      return <RefreshCw {...iconProps} />;
    case 'REOPEN_PROCESS_STEP_COMPLETE':
      return <RotateCcw {...iconProps} />;
    case 'MODIFY_COMPLETED_STEP':
      return <Edit {...iconProps} />;
    case 'CHANGE_COMPLETION_DATE':
      return <Calendar {...iconProps} />;
    case 'CHANGE_STEP_EVIDENCE':
      return <FolderOpen {...iconProps} />;
    case 'REGISTER_ABONO':
      return <DollarSign {...iconProps} />;
    case 'REGISTER_DISBURSEMENT':
      return <DollarSign {...iconProps} />;
    case 'REGISTER_CREDIT_DISBURSEMENT':
      return <DollarSign {...iconProps} />;
    case 'VOID_ABONO':
      return <UserX {...iconProps} />;
    case 'REVERT_VOID_ABONO':
      return <RefreshCw {...iconProps} />;
    case 'CLIENT_RENOUNCE':
      return <UserX {...iconProps} />;
    case 'RESTART_CLIENT_PROCESS':
      return <RefreshCw {...iconProps} />;
    case 'ARCHIVE_CLIENT':
      return <Archive {...iconProps} />;
    case 'RESTORE_CLIENT':
      return <ArchiveRestore {...iconProps} />;
    case 'ANULAR_CIERRE_PROCESO':
      return <Unlock {...iconProps} />;
    default:
      return <FileText {...iconProps} />;
  }
};

// Helper para obtener color de fondo del icono
const getActionColor = (action) => {
  switch (action) {
    case 'ADD_NOTE':
      return 'bg-blue-500';
    case 'CREATE_CLIENT':
      return 'bg-green-500';
    case 'UPDATE_CLIENT':
      return 'bg-amber-500';
    case 'EDIT_NOTE':
      return 'bg-amber-500';
    case 'UPDATE_PROCESO':
      return 'bg-indigo-500';
    case 'COMPLETE_PROCESS_STEP':
      return 'bg-emerald-500';
    case 'RECOMPLETE_PROCESS_STEP':
      return 'bg-teal-500';
    case 'REOPEN_PROCESS_STEP':
      return 'bg-orange-500';
    case 'REOPEN_PROCESS_STEP_COMPLETE':
      return 'bg-red-500';
    case 'MODIFY_COMPLETED_STEP':
      return 'bg-indigo-500';
    case 'CHANGE_COMPLETION_DATE':
      return 'bg-blue-600';
    case 'CHANGE_STEP_EVIDENCE':
      return 'bg-purple-500';
    case 'REGISTER_ABONO':
      return 'bg-green-600';
    case 'REGISTER_DISBURSEMENT':
      return 'bg-green-600';
    case 'REGISTER_CREDIT_DISBURSEMENT':
      return 'bg-green-600';
    case 'VOID_ABONO':
      return 'bg-red-500';
    case 'REVERT_VOID_ABONO':
      return 'bg-orange-500';
    case 'CLIENT_RENOUNCE':
      return 'bg-red-600';
    case 'RESTART_CLIENT_PROCESS':
      return 'bg-purple-500';
    case 'ARCHIVE_CLIENT':
      return 'bg-gray-500';
    case 'RESTORE_CLIENT':
      return 'bg-teal-500';
    case 'ANULAR_CIERRE_PROCESO':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-400';
  }
};

// Helper para obtener etiqueta de la acción
const getActionLabel = (action) => {
  switch (action) {
    case 'COMPLETE_PROCESS_STEP':
      return 'Paso completado por';
    case 'RECOMPLETE_PROCESS_STEP':
      return 'Paso re-completado por';
    case 'REOPEN_PROCESS_STEP':
      return 'Paso reabierto por';
    case 'REOPEN_PROCESS_STEP_COMPLETE':
      return 'Reapertura integral por';
    case 'MODIFY_COMPLETED_STEP':
      return 'Paso modificado por';
    case 'CHANGE_COMPLETION_DATE':
      return 'Fecha modificada por';
    case 'CHANGE_STEP_EVIDENCE':
      return 'Evidencias modificadas por';
    case 'UPDATE_PROCESO':
      return 'Proceso actualizado por';
    case 'UPDATE_CLIENT':
      return 'Cliente actualizado por';
    case 'CREATE_CLIENT':
      return 'Cliente creado por';
    case 'ADD_NOTE':
      return 'Nota añadida por';
    default:
      return 'Acción realizada por';
  }
};

// Helper para obtener badge de la acción
const getActionBadge = (action) => {
  switch (action) {
    case 'COMPLETE_PROCESS_STEP':
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
          <CheckCircle size={10} className="mr-1" />
          Paso completado
        </span>
      );
    case 'RECOMPLETE_PROCESS_STEP':
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
          <RefreshCw size={10} className="mr-1" />
          Re-completado
        </span>
      );
    case 'REOPEN_PROCESS_STEP':
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200">
          <RefreshCw size={10} className="mr-1" />
          Reapertura
        </span>
      );
    case 'REOPEN_PROCESS_STEP_COMPLETE':
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
          <RotateCcw size={10} className="mr-1" />
          Reapertura completa
        </span>
      );
    case 'MODIFY_COMPLETED_STEP':
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
          <Edit size={10} className="mr-1" />
          Modificación
        </span>
      );
    case 'CHANGE_COMPLETION_DATE':
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
          <Calendar size={10} className="mr-1" />
          Cambio de fecha
        </span>
      );
    case 'CHANGE_STEP_EVIDENCE':
      return (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
          <FolderOpen size={10} className="mr-1" />
          Evidencias
        </span>
      );
    default:
      return null;
  }
};

// Helper para obtener styling del contenido
const getContentStyling = (action) => {
  switch (action) {
    case 'COMPLETE_PROCESS_STEP':
      return 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300';
    case 'RECOMPLETE_PROCESS_STEP':
      return 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700 dark:text-teal-300';
    case 'REOPEN_PROCESS_STEP':
      return 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300';
    case 'REOPEN_PROCESS_STEP_COMPLETE':
      return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
    case 'MODIFY_COMPLETED_STEP':
      return 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-300';
    case 'CHANGE_COMPLETION_DATE':
      return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300';
    case 'CHANGE_STEP_EVIDENCE':
      return 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-300';
    default:
      return 'text-gray-500 border-gray-200 bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300';
  }
};

// Helper para obtener styling del mensaje
const getMessageStyling = (action) => {
  const processStepActions = [
    'COMPLETE_PROCESS_STEP',
    'RECOMPLETE_PROCESS_STEP', 
    'REOPEN_PROCESS_STEP',
    'REOPEN_PROCESS_STEP_COMPLETE',
    'MODIFY_COMPLETED_STEP',
    'CHANGE_COMPLETION_DATE',
    'CHANGE_STEP_EVIDENCE'
  ];
  
  return processStepActions.includes(action) ? 'font-medium leading-relaxed' : 'italic';
};

// Componente para botones de acceso a evidencias
const EvidenceAccessButton = ({ archivo, tipo, className = "" }) => {
  if (!archivo || !archivo.url) return null;

  const handleClick = () => {
    window.open(archivo.url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors ${className}`}
      title={`Abrir ${archivo.nombre || 'archivo'}`}
    >
      <ExternalLink className="w-3 h-3" />
      {tipo === 'anterior' ? 'Ver anterior' : 'Ver nuevo'}
    </button>
  );
};

// Componente para renderizar mensaje con iconos mejorados
const RenderMessageWithIcons = ({ log }) => {
  const { displayMessage, details } = log;
  
  // Test ultra simple - solo mostrar un icono directo
  console.log('🔍 RenderMessageWithIcons - action:', details?.action);
  console.log('🔍 RenderMessageWithIcons - CheckCircle component:', CheckCircle);
  
  return (
    <div className="space-y-2">
      {/* Test directo de iconos */}
      <div className="bg-blue-100 p-2 rounded border mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono">DEBUG:</span>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <Calendar className="w-4 h-4 text-blue-600" />
          <FolderOpen className="w-4 h-4 text-purple-600" />
          <RotateCcw className="w-4 h-4 text-red-600" />
          <Edit className="w-4 h-4 text-orange-600" />
        </div>
      </div>
      
      {/* Mensaje original */}
      <div>
        <span className="whitespace-pre-wrap">{displayMessage}</span>
      </div>
    </div>
  );
};

// Sub-componente para renderizar cada item del historial
const LogItem = ({ log, onEdit, onViewFileAudit, isReadOnly }) => {
  const { userData } = useAuth();
  const isNota = log.details?.action === 'ADD_NOTE';
  const timestamp = log.timestamp?.toDate ? log.timestamp.toDate() : new Date();
  const formattedDate = format(timestamp, "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es });
  const icon = getActionIcon(log.details?.action);

  const puedeEditar = !isReadOnly && isNota && log.userName === `${userData.nombres} ${userData.apellidos}`;
  const tieneArchivos = hasFileChanges(log);
  const cambiosProceso = log.details?.action === 'UPDATE_PROCESO' ? log.details.cambios : [];

  const renderCambiosProceso = () => {
    if (!cambiosProceso || cambiosProceso.length === 0) return null;
    return (
      <div className="mt-2 pt-2 border-t border-dashed dark:border-gray-500 space-y-1">
        {cambiosProceso.map((cambio, index) => (
          <div key={index} className="flex items-center gap-2">
            {cambio.accion === 'completó' ? (
              <CheckCircle size={14} className="text-green-500" />
            ) : cambio.accion === 'reabrió' ? (
              <RefreshCw size={14} className="text-yellow-500" />
            ) : (
              <Edit size={14} className="text-blue-500" />
            )}
            <span className="text-xs">
              {cambio.accion === 'completó' ? 'Se completó:' :
                cambio.accion === 'reabrió' ? 'Se reabrió:' :
                  'Se modificó:'} <span className="font-semibold text-gray-700 dark:text-gray-100">{cambio.paso}</span>
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.li 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10 ms-6"
    >
      <span className={`absolute flex items-center justify-center ${
        log.details?.action === 'COMPLETE_PROCESS_STEP' 
          ? 'w-10 h-10 ring-4 ring-emerald-200 dark:ring-emerald-800' 
          : 'w-8 h-8 ring-4 ring-white dark:ring-gray-800'
        } rounded-full -start-4 ${getActionColor(log.details?.action)}`}>
        {icon}
        {log.details?.action === 'COMPLETE_PROCESS_STEP' && (
          <CheckCircle className="w-3 h-3 text-white absolute -bottom-1 -right-1 bg-emerald-500 rounded-full" />
        )}
      </span>
      
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
        <div className="items-center justify-between mb-3 sm:flex">
          <div className="text-sm font-normal text-gray-500 dark:text-gray-300">
            <span>{getActionLabel(log.details?.action)}</span>{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{log.userName}</span>
            {getActionBadge(log.details?.action)}
            {tieneArchivos && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                <FolderOpen size={10} className="mr-1" />
                Con archivos
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {log.editado && <span className="text-xs text-gray-400 italic">(editado)</span>}
            <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">{formattedDate}</time>
          </div>
        </div>
        
        <div className={`relative p-3 text-sm border rounded-lg ${getContentStyling(log.details?.action)}`}>
          <div className="absolute top-1 right-1 flex gap-1">
            {tieneArchivos && (
              <button
                onClick={() => onViewFileAudit(log)}
                className="p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                title="Ver auditoría de archivos"
              >
                <FolderOpen size={14} className="text-blue-600 dark:text-blue-400" />
              </button>
            )}
            {puedeEditar && (
              <button 
                onClick={() => onEdit(log)} 
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
              >
                <Edit size={14} className="text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          <div className={`pr-8 ${getMessageStyling(log.details?.action)}`}>
            <RenderMessageWithIcons log={log} />
          </div>
          {renderCambiosProceso()}
        </div>
      </div>
    </motion.li>
  );
};

// Componente principal
const TabHistorial = forwardRef(({ cliente, isReadOnly }, ref) => {
  const { userData } = useAuth();
  const userName = `${userData.nombres} ${userData.apellidos}`;
  const { historial, loading, error, fetchHistorial } = useHistorialCliente(cliente?.id);
  
  const [notaAEditar, setNotaAEditar] = useState(null);
  const [confirmacionCambios, setConfirmacionCambios] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [auditoriaArchivos, setAuditoriaArchivos] = useState(null);

  useImperativeHandle(ref, () => ({
    fetchHistorial
  }));

  if (!cliente) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader className="animate-spin text-blue-500 mr-3" size={24} />
        <span className="text-gray-600 dark:text-gray-400">Cargando datos del cliente...</span>
      </div>
    );
  }

  const handleIniciarEdicion = (nota) => {
    setNotaAEditar(nota);
  };

  const handleGuardarEdicion = (nuevoTexto) => {
    const cambios = [{
      campo: "Contenido de la Nota",
      anterior: notaAEditar.message,
      actual: nuevoTexto
    }];
    setConfirmacionCambios({
      cambios,
      nuevoTexto,
      notaOriginal: notaAEditar
    });
    setNotaAEditar(null);
  };

  const handleConfirmarGuardado = async () => {
    if (!confirmacionCambios) return;
    setIsSubmitting(true);
    try {
      const { notaOriginal, nuevoTexto } = confirmacionCambios;
      await updateNotaHistorial(notaOriginal, nuevoTexto, userName);
      toast.success("Nota actualizada con éxito.");
      fetchHistorial();
    } catch (error) {
      console.error("Error al actualizar la nota:", error);
      toast.error("No se pudo actualizar la nota.");
    } finally {
      setIsSubmitting(false);
      setConfirmacionCambios(null);
    }
  };

  const handleVerAuditoriaArchivos = (log) => {
    setAuditoriaArchivos(log);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const puedeAnadirNotas = cliente.status === 'activo' || cliente.status === 'enProcesoDeRenuncia';

  // Usar la versión SVG temporalmente para pruebas
  return <TabHistorialSVG cliente={cliente} isReadOnly={isReadOnly} ref={ref} />;

  return (
    <AnimatedPage>
      {/* Tests de diagnóstico */}
      <TestSVGDirecto />
      <TestImportEspecifico />
      <DiagnosticoIconos />
      <IconTest />
      
      {puedeAnadirNotas && (
        <FormularioNuevaNota clienteId={cliente.id} onNotaAgregada={fetchHistorial} />
      )}

      {historial.length > 0 ? (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:border-gray-600"></div>
          <ol className="relative">
            <AnimatePresence>
              {historial.map(item => (
                <LogItem
                  key={item.id}
                  log={item}
                  onEdit={handleIniciarEdicion}
                  onViewFileAudit={handleVerAuditoriaArchivos}
                  isReadOnly={isReadOnly}
                />
              ))}
            </AnimatePresence>
          </ol>
        </div>
      ) : (
        <div className="text-center py-10">
          <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No hay historial de actividad para este cliente.</p>
        </div>
      )}

      <ModalEditarNota
        isOpen={!!notaAEditar}
        onClose={() => setNotaAEditar(null)}
        onSave={handleGuardarEdicion}
        notaAEditar={notaAEditar}
      />
      
      <ModalConfirmacion
        isOpen={!!confirmacionCambios}
        onClose={() => setConfirmacionCambios(null)}
        onConfirm={handleConfirmarGuardado}
        titulo="Confirmar Cambios en la Nota"
        cambios={confirmacionCambios?.cambios || []}
        isSubmitting={isSubmitting}
        size="xl"
      />
      
      <ModalAuditoriaArchivos
        isOpen={!!auditoriaArchivos}
        onClose={() => setAuditoriaArchivos(null)}
        auditLog={auditoriaArchivos}
      />
    </AnimatedPage>
  );
});

TabHistorial.displayName = 'TabHistorial';

export default TabHistorial;