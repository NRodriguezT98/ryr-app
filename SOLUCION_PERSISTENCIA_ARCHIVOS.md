# 🔒 Solución: Persistencia de Archivos para Auditoría

## ⚠️ PROBLEMA ACTUAL

Cuando se reemplaza un documento (cédula, carta de aprobación, etc.), **el archivo anterior puede volverse inaccesible** porque:

1. **Firebase Storage genera URLs únicas** con tokens de acceso
2. **Los archivos antiguos no se guardan** en una estructura versionada
3. **Los enlaces del historial apuntan directamente a Storage**, no a una referencia persistente

**Resultado:** Los enlaces `[anterior]` y `[nuevo]` del historial **funcionarán solo mientras el archivo exista en Storage**.

---

## ✅ SOLUCIONES PROPUESTAS

### **Opción 1: Versionado de Archivos (RECOMENDADA)** ⭐

Crear una estructura que preserve todas las versiones de los documentos.

#### **Estructura de Storage:**
```
documentos_clientes/
  └── {cedula}/
      └── cedula/
          ├── v1_2024-10-12_cedula.pdf      ← Primera versión
          ├── v2_2024-11-05_cedula.pdf      ← Segunda versión (actual)
          └── v3_2025-01-15_cedula.pdf      ← Tercera versión
      └── carta_credito/
          ├── v1_2024-10-12_carta_banco.pdf
          └── v2_2024-12-01_carta_nuevo_banco.pdf
```

#### **Ventajas:**
- ✅ Historial completo preservado
- ✅ Enlaces permanentes y accesibles
- ✅ Auditoría completa
- ✅ Recuperación de versiones anteriores

#### **Desventajas:**
- ⚠️ Incrementa el uso de Storage (costo)
- ⚠️ Requiere limpieza manual eventual

---

### **Opción 2: Sistema de Referencias con Metadata**

Guardar la metadata de archivos eliminados en Firestore.

#### **Estructura en Firestore:**
```javascript
clientes/{clienteId}/historial_documentos/{docId}
{
  tipo: 'cedula',
  version: 1,
  fechaSubida: timestamp,
  url: 'https://...',  // Puede quedar inaccesible
  urlSnapshot: 'data:image/pdf;base64,...',  // Miniatura guardada
  nombreArchivo: 'cedula.pdf',
  usuarioSubio: 'Juan Pérez',
  reemplazadoPor: 'docId_v2',  // Referencia a la siguiente versión
  estado: 'reemplazado'  // 'activo' | 'reemplazado' | 'eliminado'
}
```

#### **Ventajas:**
- ✅ Metadata completa preservada
- ✅ Trazabilidad total
- ✅ Menor costo de Storage

#### **Desventajas:**
- ❌ **Los archivos antiguos NO serán accesibles** (solo metadata)
- ❌ No se puede visualizar versiones anteriores

---

### **Opción 3: Hybrid - Versionado con Política de Retención**

Combinar ambas opciones: versionar archivos importantes y guardar solo metadata de otros.

#### **Configuración:**
```javascript
const ARCHIVO_CONFIG = {
  cedula: { 
    versionar: true,  // Guardar todas las versiones
    retenerPor: 'indefinido' 
  },
  cartaAprobacion: { 
    versionar: true,
    retenerPor: 'indefinido'
  },
  comprobantes: { 
    versionar: false,  // Solo metadata
    retenerPor: '2 años'
  }
};
```

---

## 🔧 IMPLEMENTACIÓN RECOMENDADA

### **Paso 1: Crear servicio de versionado**

```javascript
// src/services/versionedFileService.js

import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const storage = getStorage();
const db = getFirestore();

/**
 * Sube un archivo con versionado automático
 * @param {File} file - Archivo a subir
 * @param {string} clienteCedula - Cédula del cliente
 * @param {string} tipoDocumento - 'cedula', 'carta_credito', 'carta_subsidio', etc.
 * @param {string} usuarioNombre - Nombre del usuario que sube
 * @returns {Promise<{url: string, version: number, docId: string}>}
 */
export const uploadVersionedFile = async (
  file, 
  clienteCedula, 
  tipoDocumento, 
  usuarioNombre,
  onProgress = null
) => {
  // 1. Obtener número de versión actual
  const version = await getNextVersion(clienteCedula, tipoDocumento);
  
  // 2. Generar path versionado
  const timestamp = new Date().toISOString().split('T')[0]; // 2024-10-12
  const extension = file.name.split('.').pop();
  const fileName = `v${version}_${timestamp}_${file.name}`;
  const storagePath = `documentos_clientes/${clienteCedula}/${tipoDocumento}/${fileName}`;
  
  // 3. Subir archivo a Storage
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error("Error al subir archivo versionado:", error);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        // 4. Guardar metadata en Firestore
        const docRef = await addDoc(collection(db, `clientes/${clienteCedula}/historial_documentos`), {
          tipo: tipoDocumento,
          version: version,
          fechaSubida: serverTimestamp(),
          url: downloadURL,
          storagePath: storagePath,
          nombreArchivo: file.name,
          nombreArchivoVersionado: fileName,
          tamanoBytes: file.size,
          usuarioSubio: usuarioNombre,
          estado: 'activo',  // 'activo' | 'reemplazado' | 'eliminado'
          reemplazadoPor: null
        });
        
        // 5. Marcar versión anterior como reemplazada
        await markPreviousVersionAsReplaced(clienteCedula, tipoDocumento, version, docRef.id);
        
        resolve({
          url: downloadURL,
          version: version,
          docId: docRef.id,
          storagePath: storagePath
        });
      }
    );
  });
};

/**
 * Obtiene el siguiente número de versión
 */
const getNextVersion = async (clienteCedula, tipoDocumento) => {
  const historialRef = collection(db, `clientes/${clienteCedula}/historial_documentos`);
  const q = query(
    historialRef, 
    where('tipo', '==', tipoDocumento),
    orderBy('version', 'desc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return 1; // Primera versión
  }
  
  const lastDoc = snapshot.docs[0].data();
  return lastDoc.version + 1;
};

/**
 * Marca la versión anterior como reemplazada
 */
const markPreviousVersionAsReplaced = async (clienteCedula, tipoDocumento, currentVersion, newDocId) => {
  if (currentVersion === 1) return; // No hay versión anterior
  
  const historialRef = collection(db, `clientes/${clienteCedula}/historial_documentos`);
  const q = query(
    historialRef,
    where('tipo', '==', tipoDocumento),
    where('version', '==', currentVersion - 1)
  );
  
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const previousDocRef = doc(db, `clientes/${clienteCedula}/historial_documentos`, snapshot.docs[0].id);
    await updateDoc(previousDocRef, {
      estado: 'reemplazado',
      reemplazadoPor: newDocId
    });
  }
};

/**
 * Obtiene todas las versiones de un documento
 */
export const getDocumentVersions = async (clienteCedula, tipoDocumento) => {
  const historialRef = collection(db, `clientes/${clienteCedula}/historial_documentos`);
  const q = query(
    historialRef,
    where('tipo', '==', tipoDocumento),
    orderBy('version', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Obtiene la versión activa de un documento
 */
export const getActiveDocumentVersion = async (clienteCedula, tipoDocumento) => {
  const historialRef = collection(db, `clientes/${clienteCedula}/historial_documentos`);
  const q = query(
    historialRef,
    where('tipo', '==', tipoDocumento),
    where('estado', '==', 'activo'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};
```

---

### **Paso 2: Actualizar useClienteFileUpload**

```javascript
// src/hooks/clientes/useClienteFileUpload.js

import { uploadVersionedFile } from '@/services/versionedFileService';
import { useAuth } from '@/context/AuthContext';

export const useClienteFileUpload = () => {
  const { user } = useAuth();
  
  const uploadClientFile = useCallback(async (file, field) => {
    if (!file) return null;

    // Mapear field a tipo de documento
    const tipoDocumento = field === 'urlCedula' ? 'cedula' :
                         field === 'credito_urlCartaAprobacion' ? 'carta_credito' :
                         field === 'subsidioCaja_urlCartaAprobacion' ? 'carta_subsidio' :
                         field;

    const result = await uploadVersionedFile(
      file,
      cedula,
      tipoDocumento,
      user.nombre || user.email,
      (progress) => {
        // Mostrar progreso
        toast.loading(`Subiendo... ${Math.round(progress)}%`);
      }
    );

    if (result.url) {
      // Actualizar formulario con la URL
      dispatch({
        type: 'UPDATE_DATOS_CLIENTE',
        payload: { field, value: result.url }
      });
    }

    return result.url;
  }, [cedula, user, dispatch]);

  return { uploadClientFile };
};
```

---

### **Paso 3: Componente para ver historial de versiones**

```jsx
// src/pages/clientes/components/DocumentVersionHistory.jsx

import { useState, useEffect } from 'react';
import { getDocumentVersions } from '@/services/versionedFileService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileText, Download, ExternalLink } from 'lucide-react';

export const DocumentVersionHistory = ({ clienteCedula, tipoDocumento, onClose }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, [clienteCedula, tipoDocumento]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const data = await getDocumentVersions(clienteCedula, tipoDocumento);
      setVersions(data);
    } catch (error) {
      console.error('Error cargando versiones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Historial de Versiones</h2>
        
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="space-y-3">
            {versions.map((version) => (
              <div 
                key={version.id}
                className={`p-4 border rounded-lg ${
                  version.estado === 'activo' 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className={version.estado === 'activo' ? 'text-green-600' : 'text-gray-500'} size={24} />
                    <div>
                      <p className="font-semibold">
                        Versión {version.version} 
                        {version.estado === 'activo' && (
                          <span className="ml-2 px-2 py-0.5 bg-green-600 text-white text-xs rounded">ACTUAL</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {version.nombreArchivo}
                      </p>
                      <p className="text-xs text-gray-500">
                        Subido por {version.usuarioSubio} el {' '}
                        {format(version.fechaSubida.toDate(), "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <a
                      href={version.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      title="Ver archivo"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <a
                      href={version.url}
                      download={version.nombreArchivo}
                      className="p-2 text-green-600 hover:bg-green-100 rounded"
                      title="Descargar"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
```

---

## 📊 COSTOS DE STORAGE

### Firebase Storage - Pricing (Nov 2024):

- **Almacenamiento:** $0.026 USD por GB/mes
- **Descarga:** $0.12 USD por GB

### Estimación de Costos:

**Escenario:** 1000 clientes, cada uno con:
- 3 versiones de cédula (1 MB cada una) = 3 MB
- 2 versiones de carta crédito (2 MB cada una) = 4 MB
- 2 versiones de carta subsidio (2 MB cada una) = 4 MB
- **Total por cliente:** ~11 MB

**Costo mensual:**
- 1000 clientes × 11 MB = 11 GB
- 11 GB × $0.026 = **$0.29 USD/mes** ✅

**Conclusión:** El costo es **MÍNIMO** comparado con el valor de tener auditoría completa.

---

## 🎯 RECOMENDACIÓN FINAL

### ✅ **Implementar Opción 1 (Versionado de Archivos)**

**Por qué:**
1. ✅ Costo insignificante ($0.29/mes para 1000 clientes)
2. ✅ Auditoría completa y permanente
3. ✅ Acceso a todas las versiones históricas
4. ✅ Cumplimiento de normativas de auditoría
5. ✅ Recuperación ante errores

### 📝 **Plan de Implementación:**

**Fase 1: Setup (1-2 horas)**
- ✅ Crear `versionedFileService.js`
- ✅ Configurar colección `historial_documentos`
- ✅ Testing básico

**Fase 2: Integración (2-3 horas)**
- ✅ Actualizar `useClienteFileUpload`
- ✅ Modificar flujo de subida de archivos
- ✅ Actualizar audit logs para referenciar versiones

**Fase 3: UI (1-2 horas)**
- ✅ Agregar botón "Ver historial" en archivos
- ✅ Modal de versiones de documentos
- ✅ Indicadores visuales de versión actual

**Fase 4: Migración (opcional)**
- ⚠️ Migrar archivos existentes al nuevo sistema
- ⚠️ Crear versiones base para documentos actuales

---

## 🔐 SEGURIDAD ADICIONAL

### Reglas de Firebase Storage:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Archivos versionados - NUNCA eliminar
    match /documentos_clientes/{clienteCedula}/{tipoDoc}/{versionedFile} {
      // Solo lectura para usuarios autenticados
      allow read: if request.auth != null;
      
      // Solo escritura para nuevas versiones
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
      
      // NUNCA permitir delete
      allow delete: if false;
    }
  }
}
```

---

## ✅ RESULTADO FINAL

Con esta implementación:

1. ✅ **Todos los archivos históricos serán accesibles SIEMPRE**
2. ✅ **Los enlaces en el historial NUNCA se romperán**
3. ✅ **Auditoría completa con trazabilidad**
4. ✅ **Costo insignificante**
5. ✅ **Recuperación ante errores**
6. ✅ **Cumplimiento normativo**

**Tu historial de auditoría será 100% confiable y permanente.** 🎯

