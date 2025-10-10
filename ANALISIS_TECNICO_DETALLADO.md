# 📊 Análisis Técnico Detallado - useClienteForm.jsx

## 📏 **MÉTRICAS DEL CÓDIGO**

```
Archivo: src/hooks/clientes/useClienteForm.jsx
Líneas totales: 676
Complejidad ciclomática: ALTA
Responsabilidades: 12+
Dependencias externas: 15
```

---

## 🔍 **ANATOMÍA DEL HOOK**

### **1. Imports (15 dependencias)**
```javascript
- useReducer, useState, useCallback, useEffect, useMemo (React)
- useNavigate (React Router)
- useModernToast (Custom hook)
- validateCliente, validateFinancialStep, validateEditarCliente (Utils)
- addClienteAndAssignVivienda, updateCliente (Services)
- getAbonos (Data Service)
- createAuditLog (Audit Service)
- createNotification (Notification Service)
- useData (Context)
- PROCESO_CONFIG (Config)
- formatCurrency, toTitleCase, formatDisplayDate, getTodayString (Utils)
- uploadFile (File Service)
- getRenunciasByCliente (Renuncia Service)
```

### **2. Estado Inicial (blankInitialState - 27 líneas)**
```javascript
✅ Bien estructurado
✅ Fácil de extraer a archivo separado
🎯 Prioridad: ALTA para refactorizar
```

### **3. Reducer (formReducer - 43 líneas)**
```javascript
Actions:
- INITIALIZE_FORM
- UPDATE_VIVIENDA_SELECCIONADA
- UPDATE_DATOS_CLIENTE
- UPDATE_FINANCIAL_FIELD (lógica compleja)
- UPDATE_DOCUMENTO_URL
- TOGGLE_FINANCIAL_OPTION
- SET_ERRORS

✅ Lógica clara
✅ Fácil de extraer
🎯 Prioridad: ALTA para refactorizar (primer paso)
```

### **4. Estado Local (10 useState)**
```javascript
- step: Paso actual del wizard
- formData: Estado del formulario (via reducer)
- isSubmitting: Estado de guardado
- abonosDelCliente: Abonos del cliente
- viviendaOriginalId: ID vivienda original (para edición)
- initialData: Snapshot inicial (para detectar cambios)
- isConfirming: Modal de confirmación
- cambios: Array de cambios detectados
- ultimaRenuncia: Última renuncia (modo reactivar)

⚠️ Muchos estados = complejidad
🎯 Prioridad: MEDIA - algunos pueden consolidarse
```

### **5. Handlers de Input (2 callbacks)**

#### **handleInputChange (25 líneas)**
```javascript
- Responsabilidad: Validar y actualizar campos de texto
- Regex filters: nombres, apellidos, cedula, telefono, correo, direccion
- Dispatch: UPDATE_DATOS_CLIENTE o SET_ERRORS

✅ Bien encapsulado
🎯 Prioridad: BAJA - puede quedar así
```

#### **handleFinancialFieldChange (14 líneas)**
```javascript
- Responsabilidad: Validar y actualizar campos financieros
- Regex filter: 'caso' field
- Dispatch: UPDATE_FINANCIAL_FIELD o SET_ERRORS

✅ Bien encapsulado
🎯 Prioridad: BAJA - puede quedar así
```

### **6. Handlers de Archivos (2 callbacks)**

#### **handleFileReplace (38 líneas)**
```javascript
- Responsabilidad: Subir archivo documento cliente
- Validaciones: Verifica que exista cédula
- Upload: Usa uploadFile service
- Toast notifications: Loading, success, error
- Path: documentos_clientes/${cedula}/${field}-${fileName}

✅ Lógica reutilizable
🎯 Prioridad: ALTA - extraer a hook separado
```

#### **handleFinancialFileReplace (37 líneas)**
```javascript
- Responsabilidad: Subir archivo financiero
- Igual lógica que handleFileReplace pero para financiero
- DUPLICACIÓN DE CÓDIGO

⚠️ 90% código duplicado
🎯 Prioridad: ALTA - unificar con handleFileReplace
```

### **7. Efecto de Inicialización (useEffect - 65 líneas)**
```javascript
Responsabilidades:
1. Cargar vivienda asignada
2. Obtener abonos del cliente
3. Obtener última renuncia (modo reactivar)
4. Inicializar formulario según modo (crear/editar/reactivar)
5. Guardar snapshot inicial

⚠️ Múltiples responsabilidades en un solo effect
🎯 Prioridad: ALTA - separar en múltiples effects
```

### **8. Memos Computados (5 useMemo)**

#### **minDateForReactivation**
```javascript
- Calcula fecha mínima para reactivación
- Depende de ultimaRenuncia?.fechaDevolucion
✅ Lógica simple
```

#### **isViviendaLocked**
```javascript
- Determina si vivienda está bloqueada
- Reglas: modo reactivar = false, edición con abonos = true
✅ Lógica clara
```

#### **viviendasOptions**
```javascript
- Transforma array de viviendas a opciones para Select
- Enriquece con info de proyecto
- Ordenamiento y formato
✅ Bien estructurado
```

#### **hayCambios**
```javascript
- Compara formData con initialData
- Simple comparación JSON.stringify
✅ Simple pero efectivo
```

#### **escrituraFirmada**
```javascript
- Verifica si escritura está firmada
- Usado para locks
✅ Simple
```

### **9. Navegación (2 funciones)**

#### **handleNextStep (21 líneas)**
```javascript
- Validación por paso
- Toast de errores
- Dispatch SET_ERRORS
- Incremento de step

✅ Lógica clara
🎯 Prioridad: MEDIA - extraer validaciones
```

#### **handlePrevStep (1 línea)**
```javascript
- Decremento simple de step
✅ Trivial
```

#### **isFechaIngresoLocked (useMemo - 14 líneas)**
```javascript
- Determina si fecha ingreso está bloqueada
- Lógica: hay abonos O hay pasos completados
✅ Bien estructurado
```

### **10. Función de Guardado Principal (executeSave - 240 líneas!)**

```javascript
⚠️ FUNCIÓN MÁS COMPLEJA DEL ARCHIVO
⚠️ 240 LÍNEAS = 35% del archivo total

Responsabilidades:
1. Modo 'reactivar': Crear nuevo proceso, actualizar cliente, crear notificación
2. Modo 'editar': Validar fecha, sincronizar proceso, updateCliente
3. Modo 'crear': Crear proceso, crear audit log detallado, crear cliente
4. Manejo de errores y toast notifications
5. Navegación al finalizar

🚨 Prioridad: CRÍTICA - necesita dividirse en funciones más pequeñas
```

#### **Desglose de executeSave:**

**Modo Reactivar (80 líneas):**
- Validar vivienda
- Crear nuevo proceso vacío
- Si hay promesa → completar paso promesaEnviada
- Construir clienteParaActualizar
- updateCliente con action: 'RESTART_CLIENT_PROCESS'
- Toast success
- createNotification

**Modo Editar (60 líneas):**
- Construir clienteParaActualizar
- Comparar fechas (inicial vs nueva)
- Validar si fecha está bloqueada
- Sincronizar fecha con proceso.promesaEnviada
- updateCliente con action: 'UPDATE_CLIENT' y cambios
- Toast success
- createNotification

**Modo Crear (100 líneas):**
- Validar vivienda
- Crear proceso vacío
- Si hay promesa → completar paso promesaEnviada
- Construir clienteParaGuardar
- Obtener nombre proyecto
- Construir fuentesDePago array
- Crear auditMessage y auditDetails SUPER detallados
- addClienteAndAssignVivienda con audit
- Toast success
- createNotification

**Común:**
- try/catch
- setIsSubmitting
- navigate o onSaveSuccess
- Error handling

### **11. Detección de Cambios (dentro de handleSave - 150 líneas)**

```javascript
⚠️ SEGUNDA FUNCIÓN MÁS COMPLEJA

Responsabilidades:
1. Comparar initial vs current para CADA campo
2. Formatear valores según tipo (date, currency, boolean, file)
3. Detectar cambios en vivienda
4. Detectar cambios en datos cliente
5. Detectar cambios en financiero (8 campos)
6. Detectar cambios en archivos (3 archivos)
7. Construir array de cambios con formato especial
8. Mostrar modal de confirmación

🚨 Prioridad: CRÍTICA - extraer a función/hook separado
```

### **12. handleSave Principal (70 líneas)**

```javascript
Responsabilidades:
1. Calcular valor total vivienda
2. Calcular total abonado cuota inicial
3. Validar cliente (validateCliente o validateEditarCliente)
4. Validar financiero (validateFinancialStep)
5. Combinar errores
6. Si hay errores → dispatch SET_ERRORS + toast
7. Si es edición → detectar cambios (150 líneas inline)
8. Si hay cambios → mostrar modal confirmación
9. Si no hay cambios → executeSave directo
10. Si no es edición → executeSave directo

⚠️ Mezcla validación, detección de cambios y ejecución
🎯 Prioridad: ALTA - separar lógicas
```

---

## 🎯 **PLAN DE REFACTORIZACIÓN SEGURA**

### **Fase 1: Extraer Estructuras de Datos (0% riesgo)**
✅ Crear: `formReducer.js` con reducer y estado inicial
- Líneas: ~70
- Complejidad: Baja
- Testing: Fácil

### **Fase 2: Extraer Hook de Estado (5% riesgo)**
✅ Crear: `useClienteFormState.js`
- Combina reducer + errors useState
- Líneas: ~30
- Testing: Unit tests

### **Fase 3: Extraer Hook de Archivos (10% riesgo)**
✅ Crear: `useClienteFileUpload.js`
- Unifica handleFileReplace + handleFinancialFileReplace
- Elimina duplicación
- Líneas: ~50
- Testing: Unit tests con mock de uploadFile

### **Fase 4: Extraer Hook de Validación (15% riesgo)**
✅ Crear: `useClienteValidation.js`
- Encapsula validateCliente, validateFinancialStep
- Líneas: ~40
- Testing: Unit tests

### **Fase 5: Extraer Detección de Cambios (20% riesgo)**
✅ Crear: `useClienteChangeDetection.js`
- 150 líneas de lógica de comparación
- Formatters incluidos
- Testing: Unit tests con snapshots

### **Fase 6: Extraer Lógica de Guardado (25% riesgo)**
✅ Crear: `useClienteSave.js`
- Separar executeSave en: saveCrear, saveEditar, saveReactivar
- Líneas: ~250
- Testing: Integration tests

### **Fase 7: Extraer Navegación (10% riesgo)**
✅ Crear: `useClienteNavigation.js`
- handleNextStep, handlePrevStep
- Validación por paso
- Líneas: ~40

### **Fase 8: Hook Orquestador (30% riesgo)**
✅ Refactorizar: `useClienteForm.js` (v2)
- Combina todos los hooks
- Interfaz idéntica a original
- Líneas: ~150 (de 676!)

---

## 🏆 **RESULTADO ESPERADO**

### **Antes:**
```
useClienteForm.jsx: 676 líneas, 12 responsabilidades
```

### **Después:**
```
v2/formReducer.js: 70 líneas
v2/useClienteFormState.js: 30 líneas
v2/useClienteFileUpload.js: 50 líneas
v2/useClienteValidation.js: 40 líneas
v2/useClienteChangeDetection.js: 80 líneas
v2/useClienteSave.js: 250 líneas
v2/useClienteNavigation.js: 40 líneas
v2/useClienteForm.js: 150 líneas (orquestador)
────────────────────────────────
Total: 710 líneas (vs 676)
Pero: 8 archivos pequeños y testeables
```

---

## ✅ **PRIMER PASO - MÁXIMA SEGURIDAD**

Vamos a empezar con **Fase 1: Extraer formReducer.js**

**¿Por qué es el más seguro?**
1. No requiere lógica nueva
2. Copy/paste del código existente
3. No afecta comportamiento
4. Fácil de testear
5. Fácil de revertir

**¿Procedemos?** 🚀
