# 📍 Guía Visual: Cómo Ver el Campo `structured`

## 🎯 3 Formas de Verificar que Funciona

---

## 🔥 MÉTODO 1: Firebase Console (Más Fácil)

### Paso a Paso:

**1. Abre Firebase Console**
```
https://console.firebase.google.com
```

**2. Selecciona tu proyecto**
- Busca el proyecto de tu app
- Click en el nombre

**3. Ve a Firestore Database**
- Menu lateral izquierdo
- Click en "Firestore Database"

**4. Busca la colección `audits`**
- En la lista de colecciones
- Click en `audits`

**5. Encuentra el log MÁS RECIENTE**
- Ordena por `timestamp` (descendente)
- El primero de la lista es el más nuevo

**6. Expande el documento**
- Click en el ID del documento
- Verás todos los campos

**7. Busca el campo `structured`**

### ✅ SI LO VES:

```json
audits/xyz123
  ├── actionType: "CLIENTES.COMPLETE_PROCESS_STEP"
  ├── timestamp: Timestamp(October 11, 2025 at 10:44:56 PM)
  ├── user: Map {nombre: "Nicolas Rodriguez", ...}
  ├── message: "Paso \"Promesa de Compraventa Firmada\" completado..."
  │
  └── structured: Map ← ⭐ ESTE CAMPO ES NUEVO
      ├── version: "1.0"
      ├── type: "completacion"
      │
      ├── step: Map
      │   ├── key: "promesaEnviada"
      │   ├── name: "Promesa de Compraventa Firmada"
      │   ├── number: 2
      │   ├── total: 16
      │   └── config: Map {...}
      │
      ├── dates: Map
      │   ├── before: null
      │   └── after: "11 de octubre, 2025"
      │
      ├── evidences: Map
      │   ├── before: Array []
      │   └── after: Array [...]
      │
      └── metadata: Map
          ├── flags: Map {...}
          ├── isFirstCompletion: true
          └── isAutoComplete: false
```

**🎉 ¡FUNCIONA!** El campo `structured` está ahí.

---

### ❌ SI NO LO VES:

**Posibles razones:**

1. **Log demasiado antiguo**
   - `structured` solo existe en logs NUEVOS
   - Logs creados ANTES de la actualización no lo tienen
   - **Solución:** Completa un paso AHORA y verifica de nuevo

2. **Viendo el documento equivocado**
   - Asegúrate de ver el MÁS RECIENTE (timestamp más nuevo)
   - **Solución:** Ordena por timestamp descendente

3. **El código no se ejecutó**
   - La app debe estar corriendo
   - **Solución:** Reinicia el servidor de desarrollo

---

## 🔧 MÉTODO 2: Browser Console (Debugging)

### Paso a Paso:

**1. Abre tu app en el navegador**

**2. Abre Console**
- F12 (Windows/Linux)
- Cmd+Option+I (Mac)
- Click derecho → Inspeccionar → Console

**3. Ve a la página de un cliente**

**4. Click en la pestaña "Historial"**

**5. Mira la Console**

### ✅ SI FUNCIONA, verás:

```javascript
✅ Usando datos estructurados (sin parsing) xyz123-abc456
📊 Structured data: {
  version: "1.0",
  type: "completacion",
  step: {
    key: "promesaEnviada",
    name: "Promesa de Compraventa Firmada",
    number: 2,
    total: 16,
    config: { label: "1. Promesa Enviada", ... }
  },
  dates: {
    before: null,
    after: "11 de octubre, 2025"
  },
  evidences: {
    before: [],
    after: [
      {
        id: "promesaCompraVenta",
        name: "Promesa de Compra Venta",
        displayName: "Promesa.pdf",
        url: "https://firebasestorage.googleapis.com/...",
        type: "archivo"
      }
    ]
  },
  metadata: {
    flags: {
      hasDateChange: false,
      hasEvidenceChange: true,
      isReopening: false
    },
    isFirstCompletion: true,
    isAutoComplete: false
  }
}
```

**🎉 Perfecto!** Los datos estructurados están cargándose.

---

### ⚠️ SI VES ESTO:

```javascript
⚠️ Usando parsing legacy (log antiguo sin structured) xyz123-abc456
```

**Significa:**
- Ese log es ANTIGUO (creado antes de la actualización)
- No tiene `structured`
- Está usando el parser legacy (está bien!)

**Para verificar que funciona:**
1. Completa un paso NUEVO
2. Verifica que el nuevo log sí diga "✅ Usando datos estructurados"

---

## 🎨 MÉTODO 3: React DevTools (Para Devs)

### Paso a Paso:

**1. Instala React DevTools** (si no lo tienes)
- Chrome: https://chrome.google.com/webstore → "React Developer Tools"
- Firefox: https://addons.mozilla.org → "React Developer Tools"

**2. Abre tu app**

**3. Abre DevTools (F12)**

**4. Click en tab "Components"** (nuevo tab que aparece con React DevTools)

**5. Ve a Historial del cliente**

**6. En el árbol de componentes, busca:**
```
<NewTabHistorial>
  └── <HistoryItem>
      └── <ParsedMessage>  ← Click aquí
          └── <StructuredMessageRenderer>  ← O aquí
```

**7. En el panel derecho (Props), expande:**

### ✅ SI FUNCIONA:

```
ParsedMessage
  Props ▼
    log ▼
      id: "xyz123-abc456"
      message: "Paso \"Promesa\"..."
      timestamp: Timestamp {...}
      user: Object {...}
      structured ▼  ← ⭐ AQUÍ ESTÁ
        version: "1.0"
        type: "completacion"
        step ▼
          key: "promesaEnviada"
          name: "Promesa de Compraventa Firmada"
          number: 2
          total: 16
        dates ▼
          before: null
          after: "11 de octubre, 2025"
        evidences ▼
          before: Array(0) []
          after: Array(1) [...]
        metadata ▼
          flags: Object {...}
          isFirstCompletion: true
```

**🎉 Excelente!** Puedes explorar toda la estructura.

---

## 🔍 VERIFICACIÓN RÁPIDA

### ¿Qué hacer ahora?

**1. Completa un paso del proceso**
   - Ve a un cliente
   - Completa cualquier paso (ej: "Promesa Enviada")

**2. Ve a Firebase Console**
   - Colección `audits`
   - Documento más reciente
   - Busca campo `structured`

**3. Si lo ves → ✅ ¡Funciona!**

**4. Si NO lo ves:**
   - Verifica que estás viendo el log MÁS RECIENTE
   - Asegúrate de que completaste el paso DESPUÉS de la actualización
   - Revisa console del navegador por errores

---

## 🚨 Troubleshooting

### "No veo el campo structured en ningún lado"

**Checklist:**

- [ ] ¿Completaste un paso DESPUÉS de actualizar el código?
- [ ] ¿El servidor de desarrollo está corriendo?
- [ ] ¿Hay errores en la console del navegador?
- [ ] ¿Estás viendo el log MÁS RECIENTE en Firestore?

**Si todo está bien y aún no lo ves:**
1. Abre la Console del navegador
2. Busca errores rojos
3. Copia el error completo
4. Compártelo para ayudarte a resolver

---

### "Veo 'Usando parsing legacy' en console"

**Esto es NORMAL para logs antiguos.**

Los logs creados ANTES de la actualización no tienen `structured`.

**Para verificar que la actualización funciona:**
1. Completa un paso NUEVO
2. El nuevo log SÍ debería mostrar "✅ Usando datos estructurados"

---

### "Veo errores en console"

**Posibles errores y soluciones:**

**Error: "validateStructuredData is not a function"**
→ Verifica que structuredDataBuilder.js se guardó correctamente

**Error: "Cannot read property 'structured' of undefined"**
→ El log no tiene el formato esperado, revisa auditoriaSistemaUnificado.js

**Error: "buildStructuredData is not a function"**
→ Falta el import en auditoriaSistemaUnificado.js

---

## ✅ Confirmación Final

**Para saber 100% que funciona:**

1. **Completa un paso** en la app
2. **Abre Firebase Console** → `audits` → Log más reciente
3. **Deberías ver:**
   - ✅ Campo `message` (como siempre)
   - ✅ Campo `structured` (NUEVO) ← ⭐
4. **En console del navegador:**
   - ✅ "Usando datos estructurados (sin parsing)"
   - ✅ Objeto structured completo con type, step, dates, evidences

**Si ves todo esto → ¡FASE 1 COMPLETADA CON ÉXITO! 🎉**

---

## 📸 Ejemplo Visual Real

Así se ve en Firebase Console:

```
audits
  └── gCX8vZtLm2RYrwK9Pq3s
      │
      ├── 📄 message
      │   "╔═══════════════════════════════════════════
      │    ║ 📅 PASO COMPLETADO
      │    ║ \"Promesa de Compraventa Firmada\"
      │    ║ (Paso 2/16)
      │    ║..."
      │
      ├── 📦 structured  ← ⭐ NUEVO CAMPO
      │   │
      │   ├── version: "1.0"
      │   ├── type: "completacion"
      │   │
      │   ├── step
      │   │   ├── key: "promesaEnviada"
      │   │   ├── name: "Promesa de Compraventa Firmada"
      │   │   ├── number: 2
      │   │   └── total: 16
      │   │
      │   ├── dates
      │   │   ├── before: null
      │   │   └── after: "11 de octubre, 2025"
      │   │
      │   ├── evidences
      │   │   ├── before: []
      │   │   └── after: [Array con 1 evidencia]
      │   │
      │   └── metadata
      │       ├── flags: {hasDateChange: false, ...}
      │       └── isFirstCompletion: true
      │
      ├── ⏰ timestamp: October 11, 2025 at 10:44:56 PM
      ├── 👤 user: {nombre: "Nicolas Rodriguez", ...}
      └── 🎯 actionType: "CLIENTES.COMPLETE_PROCESS_STEP"
```

**Si tu Firestore se ve así → ¡TODO PERFECTO!** ✅
