# 📁 Política de Preservación de Archivos

## 🎯 Objetivo

Garantizar que todos los links de evidencias en el historial de auditoría permanezcan funcionales indefinidamente, manteniendo trazabilidad completa y acceso a versiones históricas de documentos.

---

## 🔒 Regla Principal

### **NO SE ELIMINAN ARCHIVOS ANTIGUOS AL REEMPLAZARLOS**

Cuando un usuario reemplaza una evidencia o documento en el sistema:

✅ **Se sube el nuevo archivo** con un nuevo nombre único (timestamp)
✅ **El archivo anterior permanece en Firebase Storage**
✅ **Los URLs del historial siguen funcionando**
❌ **NO se elimina el archivo anterior de Storage**

---

## 💡 Justificación

### 1. **Integridad del Historial de Auditoría**
Los registros de auditoría guardan URLs directos a las evidencias. Si elimináramos archivos antiguos, estos links dejarían de funcionar, rompiendo la trazabilidad.

**Ejemplo:**
```
Registro del 10 Oct 2025:
"Evidencia reemplazada:"
  ✗ ANTERIOR: Promesa_V1.pdf (URL: https://storage/.../promesa-123.pdf)
  ✓ NUEVA: Promesa_V2.pdf (URL: https://storage/.../promesa-456.pdf)
```

Si eliminamos `promesa-123.pdf`, el link histórico quedaría roto.

### 2. **Cumplimiento Legal y Normativo**
- Auditorías gubernamentales pueden requerir acceso a versiones anteriores
- Disputas legales pueden necesitar evidencia de cambios históricos
- Regulaciones de retención de documentos financieros

### 3. **Respaldo Automático de Versiones**
- Control de versiones sin implementar sistemas complejos
- Recuperación ante errores del usuario
- Comparación entre versiones antiguas y nuevas

---

## 🛠️ Implementación Técnica

### Archivos Modificados

#### 1. `PasoProcesoCard.jsx`
```javascript
const handleFileChangeForReplace = async (event) => {
    // ...
    const downloadURL = await uploadFile(file, filePath);
    
    // ⚠️ NO eliminamos el archivo anterior intencionalmente
    // Los URLs del historial deben permanecer funcionales
    
    onUpdateEvidencia(pasoKey, evidencia.id, downloadURL);
};
```

#### 2. `UniversalFileManager.jsx`
```javascript
const handleFileUpload = async (file, isReplace = false) => {
    // ...
    
    // ⚠️ IMPORTANTE: Cuando es reemplazo, NO eliminamos el archivo anterior
    // Razón: Los links del historial de auditoría deben permanecer funcionales
    
    const downloadURL = await uploadFile(file, finalPath);
};
```

### Estrategia de Nombres de Archivo

Cada archivo se guarda con timestamp único:
```javascript
const timestamp = Date.now();
const filePath = `documentos_proceso/${clienteId}/${evidenciaId}-${timestamp}-${fileName}`;
```

**Ejemplos:**
```
documentos_proceso/123456789/promesa-1728567890123-Promesa_V1.pdf
documentos_proceso/123456789/promesa-1728654290456-Promesa_V2.pdf
documentos_proceso/123456789/promesa-1728740690789-Promesa_V3.pdf
```

---

## 📊 Gestión de Almacenamiento

### Costo vs Beneficio

**Costos:**
- ✅ Mayor uso de Firebase Storage
- ✅ Costo mensual incremental (mínimo para archivos pequeños)

**Beneficios:**
- ✅ Integridad de auditoría garantizada
- ✅ Cumplimiento legal
- ✅ Respaldo automático
- ✅ Confianza del usuario
- ✅ Recuperación ante errores

### Estimación de Espacio

**Escenario típico:**
- Cliente promedio: 20 evidencias
- Tamaño promedio por archivo: 500 KB
- Reemplazos promedio por evidencia: 2 veces

**Uso total por cliente:** ~30 MB (conservador)

**Para 1000 clientes:** ~30 GB

**Costo Firebase Storage (2025):**
- Primeros 5 GB: Gratis
- Después: $0.026 USD/GB/mes
- **30 GB = ~$0.65 USD/mes** ← Insignificante comparado con los beneficios

---

## 🔄 Política de Limpieza (Futuro - Opcional)

Si en el futuro se requiere liberar espacio, se puede implementar:

### Criterios de Eliminación Segura
- ✅ Archivos con más de 5 años de antigüedad
- ✅ Solo si no están referenciados en logs de los últimos 3 años
- ✅ Después de crear backup en almacenamiento de largo plazo
- ✅ Con aprobación de auditoría/legal

### Proceso
1. Exportar metadata de archivos a eliminar
2. Crear backup en almacenamiento frío (AWS Glacier, etc.)
3. Actualizar logs de auditoría con referencia al backup
4. Eliminar de Firebase Storage

**IMPORTANTE:** Esto NO es necesario actualmente. Solo considerar si el costo de storage se vuelve significativo.

---

## ✅ Ventajas de esta Política

### 1. **URLs Permanentes**
```javascript
// Los URLs en el historial SIEMPRE funcionan:
<a href="https://storage.../promesa-123.pdf">Ver evidencia anterior</a>
// ✅ Funciona hoy, mañana y en 5 años
```

### 2. **Auditoría Completa**
Los auditores pueden:
- Ver exactamente qué archivo se subió en cada momento
- Comparar versiones antiguas vs nuevas
- Descargar evidencias históricas para verificación

### 3. **Confianza del Cliente**
Los usuarios saben que:
- Su historial es inmutable
- Las evidencias nunca se pierden
- Pueden recuperar versiones antiguas si es necesario

### 4. **Simplicidad Técnica**
- No hay lógica compleja de eliminación
- No hay riesgo de eliminar archivos equivocados
- No hay necesidad de manejar links rotos

---

## 🚨 Excepciones

### Casos donde SÍ se eliminan archivos:

1. **Cliente completamente eliminado del sistema**
   - Después de período de retención legal
   - Con aprobación explícita

2. **Archivos subidos por error**
   - Inmediatamente después de subida (antes de guardar)
   - Si contienen información sensible equivocada

3. **Cumplimiento de derecho al olvido (GDPR)**
   - Solo bajo solicitud formal
   - Con proceso legal apropiado

---

## 📋 Checklist de Implementación

- [x] Comentarios documentados en `PasoProcesoCard.jsx`
- [x] Comentarios documentados en `UniversalFileManager.jsx`
- [x] Verificación de que NO se llama `deleteFile()` en reemplazos
- [x] Nombres únicos con timestamp en todos los uploads
- [x] Documento de política creado
- [ ] Comunicar política al equipo
- [ ] Agregar a manual de usuario/administración

---

## 📚 Referencias

- [Firebase Storage Pricing](https://firebase.google.com/pricing)
- [Firebase Storage Download URLs](https://firebase.google.com/docs/storage/web/download-files)
- Regulaciones de retención de documentos aplicables
- Políticas de auditoría de la empresa

---

## 📅 Historial de Cambios

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2025-10-11 | 1.0 | Política inicial documentada |

---

## 👥 Contacto

Para preguntas sobre esta política:
- **Equipo Técnico:** Revisar implementación en código
- **Cumplimiento Legal:** Verificar requisitos de retención
- **Finanzas:** Monitorear costos de Storage

---

**🎯 Conclusión:** Esta política garantiza la integridad del sistema de auditoría con un costo insignificante, proporcionando valor legal, técnico y de confianza para los usuarios.
