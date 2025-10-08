# UniversalFileManager - Guía de Uso

## 📁 Componente Unificado para Gestión de Archivos

Este componente reemplaza **TODOS** los patrones de subida de archivos en la aplicación, proporcionando una interfaz consistente y moderna.

## 🎯 Variantes Disponibles

### 1. Compacto (`variant="compact"`)
**Ideal para:** Tablas, listas, espacios reducidos
```jsx
<UniversalFileManager
    variant="compact"
    label="Subir"
    currentFileUrl={archivo?.url}
    filePath={(fileName) => `ruta/${id}/${fileName}`}
    onUploadSuccess={(url) => handleUpdate(url)}
    onDelete={() => handleDelete()}
/>
```

### 2. Normal (`variant="normal"`) - **Predeterminado**
**Ideal para:** Formularios principales, secciones de documentos
```jsx
<UniversalFileManager
    label="Subir Documento"
    currentFileUrl={documento?.url}
    filePath={(fileName) => `documentos/${clienteId}/${fileName}`}
    onUploadSuccess={(url) => setDocumento(url)}
    onDelete={() => setDocumento(null)}
    required={true}
/>
```

### 3. Tarjeta (`variant="card"`)
**Ideal para:** Galería de documentos, páginas de gestión
```jsx
<UniversalFileManager
    variant="card"
    label="Cédula de Ciudadanía"
    currentFileUrl={cliente?.urlCedula}
    filePath={(fileName) => `clientes/${cedula}/cedula-${fileName}`}
    onUploadSuccess={(url) => updateCliente({ urlCedula: url })}
    onDelete={() => updateCliente({ urlCedula: null })}
    required={true}
    showDownload={true}
    showPreview={true}
/>
```

## 🔧 Props Principales

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'compact' \| 'normal' \| 'card'` | `'normal'` | Variante de visualización |
| `label` | `string` | `"Subir archivo"` | Etiqueta del componente |
| `currentFileUrl` | `string \| null` | `null` | URL del archivo actual |
| `filePath` | `string \| Function` | - | Ruta o función que genera la ruta |
| `onUploadSuccess` | `Function` | - | Callback cuando se sube exitosamente |
| `onDelete` | `Function` | - | Callback cuando se elimina |
| `required` | `boolean` | `false` | Si el archivo es requerido |
| `disabled` | `boolean` | `false` | Deshabilita el componente |
| `readonly` | `boolean` | `false` | Modo solo lectura |
| `showDownload` | `boolean` | `true` | Mostrar botón de descarga |
| `showPreview` | `boolean` | `true` | Mostrar botón de vista previa |
| `acceptedTypes` | `string` | `".pdf,.png,.jpg,.jpeg"` | Tipos de archivo aceptados |
| `maxSizeMB` | `number` | `10` | Tamaño máximo en MB |

## 📋 Casos de Uso Comunes

### ✅ Reemplazar FileUpload básico
**Antes:**
```jsx
<FileUpload
    label="Subir Cédula"
    filePath={(fileName) => `documentos_clientes/${cedula}/cedula-${fileName}`}
    onUploadSuccess={(url) => setUrlCedula(url)}
    isCompact={true}
/>
```

**Después:**
```jsx
<UniversalFileManager
    variant="compact"
    label="Subir Cédula"
    currentFileUrl={urlCedula}
    filePath={(fileName) => `documentos_clientes/${cedula}/cedula-${fileName}`}
    onUploadSuccess={(url) => setUrlCedula(url)}
    onDelete={() => setUrlCedula(null)}
/>
```

### ✅ Reemplazar EnhancedFileDisplayActions
**Antes:**
```jsx
{urlCedula ? (
    <EnhancedFileDisplayActions
        url={urlCedula}
        onReplace={(url) => setUrlCedula(url)}
        onDelete={() => setUrlCedula(null)}
        filePath={(fileName) => `documentos_clientes/${cedula}/cedula-${fileName}`}
        compact={true}
    />
) : (
    <FileUpload ... />
)}
```

**Después:**
```jsx
<UniversalFileManager
    variant="compact"
    label="Cédula"
    currentFileUrl={urlCedula}
    filePath={(fileName) => `documentos_clientes/${cedula}/cedula-${fileName}`}
    onUploadSuccess={(url) => setUrlCedula(url)}
    onDelete={() => setUrlCedula(null)}
/>
```

### ✅ Reemplazar DocumentoCard
**Antes:**
```jsx
<DocumentoCard
    label="Carta de Aprobación"
    isRequired={true}
    currentFileUrl={carta?.url}
    filePath={(fileName) => `cartas/${fileName}`}
    onUploadSuccess={handleUpload}
    onRemove={handleRemove}
/>
```

**Después:**
```jsx
<UniversalFileManager
    variant="card"
    label="Carta de Aprobación"
    currentFileUrl={carta?.url}
    filePath={(fileName) => `cartas/${fileName}`}
    onUploadSuccess={handleUpload}
    onDelete={handleRemove}
    required={true}
/>
```

## 🎨 Estados Visuales

- **🔵 Subiendo:** Barra de progreso + spinner
- **🟢 Éxito:** Checkmark verde por 800ms
- **📁 Con archivo:** Botones Ver/Descargar/Reemplazar/Eliminar
- **📤 Sin archivo:** Área de drag & drop / botón
- **🔒 Solo lectura:** Sin botones de acción
- **❌ Deshabilitado:** Gris, sin interacción

## 🚀 Beneficios de la Unificación

### **Consistencia:**
- ✅ Mismo look & feel en toda la app
- ✅ Mismas animaciones y transiciones
- ✅ Mismos estados visuales

### **Mantenibilidad:**
- ✅ Un solo componente que mantener
- ✅ Bug fixes se aplican globalmente
- ✅ Nuevas features en un solo lugar

### **Experiencia de Usuario:**
- ✅ Comportamiento predecible
- ✅ Progreso visual consistente
- ✅ Feedback claro y uniforme

### **Desarrollo:**
- ✅ API simple y clara
- ✅ TypeScript support futuro
- ✅ Documentación centralizada

## 📖 Migración Paso a Paso

1. **Identificar el patrón actual**
2. **Elegir la variante apropiada**
3. **Mapear las props existentes**
4. **Reemplazar el componente**
5. **Probar funcionalidad**

## 🔄 Plan de Migración

### Fase 1: Componentes Principales
- ✅ Step2_ClientInfo (Cédula)
- ✅ Step3_Financial (Documentos financieros)
- 🔄 DocumentoRow
- 🔄 DocumentoCard
- 🔄 PasoProcesoCard

### Fase 2: Módulos Específicos
- 🔄 EditarAbonoModal
- 🔄 FuenteDePagoCard  
- 🔄 ModalRegistrarDesembolso
- 🔄 ModalGestionarDevolucion
- 🔄 CondonarSaldoModal
- 🔄 Step2_InfoLegal (Viviendas)

### Fase 3: Validación y Testing
- 🔄 Testing de todos los flujos
- 🔄 Validación UX/UI
- 🔄 Performance testing

## 💡 Mejores Prácticas

### ✅ DO - Hacer
```jsx
// Usar variant apropiada para el contexto
<UniversalFileManager variant="compact" ... /> // En tablas
<UniversalFileManager variant="card" ... />    // En galerías
<UniversalFileManager variant="normal" ... />  // En formularios

// Proporcionar labels descriptivas
<UniversalFileManager label="Cédula de Ciudadanía" />
<UniversalFileManager label="Carta Aprobación Crédito" />

// Manejar estados de carga
const [urlCedula, setUrlCedula] = useState(null);
<UniversalFileManager
    currentFileUrl={urlCedula}
    onUploadSuccess={setUrlCedula}
    onDelete={() => setUrlCedula(null)}
/>
```

### ❌ DON'T - No Hacer
```jsx
// No mezclar componentes antiguos y nuevos
<FileUpload /> // ❌ Antiguo
<UniversalFileManager /> // ✅ Nuevo

// No usar labels genéricas
<UniversalFileManager label="Archivo" /> // ❌ Vago
<UniversalFileManager label="Documento de Identidad" /> // ✅ Específico

// No olvidar manejar onDelete
<UniversalFileManager onUploadSuccess={...} /> // ❌ Sin delete
<UniversalFileManager 
    onUploadSuccess={...} 
    onDelete={...} 
/> // ✅ Con delete
```