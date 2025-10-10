# 🎯 Console Logs - Verificación Código v2

## ✅ **Cómo Verificar que Estás Usando el Código Nuevo**

He agregado **console logs con colores** en los hooks v2 para que veas claramente qué código se está ejecutando.

---

## 📺 **Logs Esperados en Consola**

### **1. Al Abrir "Crear Cliente" o "Editar Cliente"**

Deberías ver esto en la consola (F12):

```
🆕 useClienteForm v2 (REFACTORIZADO) inicializado
  { isEditing: false, modo: 'editar', clienteId: undefined }

  📦 Inicializando useClienteFormState (v2)
  ✅ Inicializando useClienteValidation (v2)
  🧭 Inicializando useClienteNavigation (v2)
  📁 Inicializando useClienteFileUpload (v2)
  💾 Inicializando useClienteSave (v2)
```

**Color:** 
- 🆕 Hook principal: **Verde brillante** (fondo verde)
- 📦/✅/🧭/📁/💾 Sub-hooks: **Negro** (sin fondo)

---

### **2. Al Hacer Click en "Siguiente" (Navegación)**

```
🧭 Navegación v2: handleNextStep
  Paso actual: 1
```

**Color:** **Púrpura** (fondo morado)

---

### **3. Al Subir un Archivo (Cédula, Cartas)**

```
📁 Upload v2: handleClientFileChange
  urlCedula
```

**Color:** **Naranja** (fondo naranja)

---

### **4. Al Hacer Click en "Guardar"**

```
💾 handleSave (v2) ejecutado

💾 Save v2: saveCliente
  { modo: 'crear', isEditing: false }
```

**Color:** 
- 💾 handleSave: **Azul** (fondo azul)
- 💾 saveCliente: **Rojo** (fondo rojo)

---

## 🔍 **Comparación: Código Viejo vs Nuevo**

### **Si Estás Usando Código VIEJO (original):**
```
(Sin logs especiales en consola)
```
❌ **NO verás** los logs coloridos  
❌ **NO verás** el mensaje "🆕 useClienteForm v2"

### **Si Estás Usando Código NUEVO (v2):**
```
🆕 useClienteForm v2 (REFACTORIZADO) inicializado
  📦 Inicializando useClienteFormState (v2)
  ✅ Inicializando useClienteValidation (v2)
  ...
```
✅ **SÍ verás** todos los logs coloridos  
✅ **SÍ verás** el mensaje "v2" en cada acción

---

## 📋 **Prueba Completa con Logs**

### **Paso 1: Abrir Crear Cliente**
**Esperado en consola:**
```
🆕 useClienteForm v2 (REFACTORIZADO) inicializado
  📦 Inicializando useClienteFormState (v2)
  ✅ Inicializando useClienteValidation (v2)
  🧭 Inicializando useClienteNavigation (v2)
  📁 Inicializando useClienteFileUpload (v2)
  💾 Inicializando useClienteSave (v2)
```

### **Paso 2: Seleccionar Vivienda y Click "Siguiente"**
**Esperado en consola:**
```
🧭 Navegación v2: handleNextStep
  Paso actual: 1
```

### **Paso 3: Llenar Datos y Subir Cédula**
**Esperado en consola:**
```
📁 Upload v2: handleClientFileChange
  urlCedula
```

### **Paso 4: Click "Siguiente" de nuevo**
**Esperado en consola:**
```
🧭 Navegación v2: handleNextStep
  Paso actual: 2
```

### **Paso 5: Configurar Financiero y Click "Guardar"**
**Esperado en consola:**
```
💾 handleSave (v2) ejecutado

💾 Save v2: saveCliente
  { modo: 'crear', isEditing: false }
```

---

## 🎨 **Colores de los Logs**

| Emoji | Hook | Color Fondo | Significado |
|-------|------|-------------|-------------|
| 🆕 | useClienteForm | Verde (#10b981) | Hook principal inicializado |
| 🧭 | useClienteNavigation | Púrpura (#8b5cf6) | Navegación entre pasos |
| 📁 | useClienteFileUpload | Naranja (#f59e0b) | Subida de archivos |
| 💾 | handleSave | Azul (#3b82f6) | Preparando guardado |
| 💾 | saveCliente | Rojo (#ef4444) | Ejecutando guardado |

---

## ✅ **Checklist de Verificación**

- [ ] ¿Ves el mensaje "🆕 useClienteForm v2 (REFACTORIZADO)"?
- [ ] ¿Ves los 5 sub-hooks inicializándose (📦 ✅ 🧭 📁 💾)?
- [ ] ¿Los logs tienen colores (verde, púrpura, naranja, azul, rojo)?
- [ ] ¿Al navegar aparece "🧭 Navegación v2"?
- [ ] ¿Al subir archivo aparece "📁 Upload v2"?
- [ ] ¿Al guardar aparece "💾 Save v2"?

### **Si marcaste TODO ✅:**
🎉 **¡Estás usando el código refactorizado v2!**

### **Si NO ves los logs:**
❌ Aún estás usando el código viejo
- Verifica que los imports sean de `v2/useClienteForm`
- Refresca con Ctrl + F5

---

## 🚨 **Logs de Error (Si Algo Falla)**

Si ves errores en rojo en consola, copia TODO el mensaje y repórtalo.

**Ejemplo de error:**
```
❌ Error en hooks refactorizados: [detalle del error]
```

---

## 📸 **Screenshot de Consola Esperada**

Cuando abras "Crear Cliente", tu consola debe verse así:

```
┌─────────────────────────────────────────────────────┐
│ 🆕 useClienteForm v2 (REFACTORIZADO) inicializado  │ ← Verde
│   { isEditing: false, modo: 'editar' }             │
│                                                     │
│   📦 Inicializando useClienteFormState (v2)        │
│   ✅ Inicializando useClienteValidation (v2)       │
│   🧭 Inicializando useClienteNavigation (v2)       │
│   📁 Inicializando useClienteFileUpload (v2)       │
│   💾 Inicializando useClienteSave (v2)             │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 **Siguiente Paso**

1. **Abre la app** (http://localhost:5174)
2. **Abre consola** (F12)
3. **Ve a "Crear Cliente"**
4. **Busca el log verde** "🆕 useClienteForm v2"

**Si lo ves:** ✅ Perfecto, estás usando código v2  
**Si NO lo ves:** ❌ Avísame y revisamos

---

**¿Listo para verificar?** 🚀  
Abre la app y busca el log verde en consola.
