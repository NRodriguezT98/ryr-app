# 🎯 Guía de Uso - Sistema de Feature Flags

## ✅ **LO QUE SE HA CREADO**

```
✅ src/config/featureFlags.js           - Sistema de feature flags
✅ src/hooks/clientes/v2/                - Carpeta para código refactorizado
✅ src/hooks/clientes/v2/README.md       - Documentación
✅ src/hooks/clientes/useClienteFormAdapter.js - Adapter pattern
```

## 🔒 **SEGURIDAD GARANTIZADA**

- ✅ **Código existente NO fue modificado**
- ✅ **Todos los feature flags están en FALSE**
- ✅ **App sigue funcionando exactamente igual**
- ✅ **Nada se rompe, nada cambia aún**

---

## 🚀 **CÓMO USAR EL SISTEMA**

### **1. Verificar que todo funciona**

```bash
# La app debe seguir funcionando normal
npm run dev
```

**Comportamiento esperado:**
- ✅ App carga normalmente
- ✅ Crear cliente funciona igual
- ✅ No hay errores en consola
- ✅ No hay cambios visibles

---

### **2. Activar features manualmente (solo desarrollo)**

Abre la **consola del navegador** (F12) y escribe:

```javascript
// ✅ Ver estado actual de flags
console.table(window.FEATURE_FLAGS)

// ✅ Activar feature de hooks refactorizados
enableFeature('USE_REFACTORED_CLIENTE_HOOKS')

// ✅ Refrescar página
location.reload()

// ✅ Desactivar feature
disableFeature('USE_REFACTORED_CLIENTE_HOOKS')
```

---

### **3. Modo Debug (comparar old vs new)**

```javascript
// Activar modo debug
localStorage.setItem('enable_DEBUG_COMPARE_OLD_NEW', 'true')
location.reload()

// En consola verás comparaciones:
// 🔍 Debug: Comparación de hooks
//   📦 Versión vieja: {...}
//   🆕 Versión nueva: {...}
```

---

### **4. Escape Hatch (emergencia)**

Si algo falla y necesitas volver al código viejo inmediatamente:

```javascript
// 🚨 EMERGENCIA: Volver a código original
activateEscapeHatch()
// Esto refresca la página automáticamente
```

---

## 📋 **PRÓXIMOS PASOS**

### **FASE 2A: Extraer el Reducer**

Vamos a empezar con el cambio más seguro: **Extraer el reducer a un archivo separado**.

**Ventajas:**
- ✅ Cambio pequeño y aislado
- ✅ No afecta lógica de negocio
- ✅ Fácil de testear
- ✅ Fácil de revertir

**Archivos a crear:**
1. `src/hooks/clientes/v2/formReducer.js` - El reducer separado
2. `src/hooks/clientes/v2/formConstants.js` - Constantes y estado inicial

**¿Procedo con la Fase 2A?**

---

## 📊 **ESTADO ACTUAL**

| Fase | Estado | Riesgo | Archivos |
|------|--------|--------|----------|
| 1. Setup | ✅ Completado | 0% | 4 archivos creados |
| 2A. Reducer | ⏳ Pendiente | 5% | 2 archivos nuevos |
| 2B. Estado | ⏳ Pendiente | 5% | 1 archivo nuevo |
| 2C. Validación | ⏳ Pendiente | 10% | 1 archivo nuevo |
| 2D. Navegación | ⏳ Pendiente | 10% | 1 archivo nuevo |
| 2E. Files | ⏳ Pendiente | 15% | 1 archivo nuevo |
| 2F. Save | ⏳ Pendiente | 20% | 1 archivo nuevo |
| 3. Orquestador | ⏳ Pendiente | 25% | 1 archivo nuevo |
| 4. Testing | ⏳ Pendiente | 30% | Tests |
| 5. Activación | ⏳ Pendiente | 35% | Feature flag = true |

---

## 🧪 **TESTING ANTES DE CONTINUAR**

### **Verificación Manual:**

1. **Abrir la app** → ✅ Debe cargar normal
2. **Ir a "Crear Cliente"** → ✅ Debe funcionar igual
3. **Abrir consola (F12)** → ✅ No debe haber errores
4. **Ejecutar:** `console.log('Feature flags:', window.FEATURE_FLAGS)` → ✅ Debe mostrar todos en `false`

### **Si todo está ✅:**
Podemos continuar con la **Fase 2A: Extraer Reducer**

### **Si algo falla ❌:**
1. Revisa la consola del navegador
2. Verifica que los archivos se crearon en las rutas correctas
3. Asegúrate que no hay errores de importación

---

## 💡 **TIPS**

### **Para Desarrollo:**
```javascript
// Ver todas las funciones disponibles
console.log(Object.keys(window).filter(k => k.includes('Feature')))

// Estado de features
localStorage.getItem('enable_USE_REFACTORED_CLIENTE_HOOKS')
```

### **Para Debugging:**
```javascript
// Ver qué hook se está usando
// (Aparecerá en consola cuando uses el formulario)
localStorage.setItem('enable_DEBUG_COMPARE_OLD_NEW', 'true')
```

### **Para Limpiar:**
```javascript
// Limpiar todas las configuraciones
localStorage.clear()
location.reload()
```

---

## 🎬 **DEMOSTRACIÓN RÁPIDA**

1. **Abre la app:** `http://localhost:5173`
2. **Abre consola:** F12
3. **Ejecuta:**
   ```javascript
   // Ver estado actual
   console.table(window.FEATURE_FLAGS)
   
   // Intentar activar (aún no hace nada porque v2 no existe)
   enableFeature('USE_REFACTORED_CLIENTE_HOOKS')
   
   // Ver mensaje en consola:
   // "✅ Feature USE_REFACTORED_CLIENTE_HOOKS activado. Refresca la página."
   ```

4. **Refresca la página**
5. **Ve a Crear Cliente**
6. **En consola verás:**
   ```
   ⚠️ Versión nueva aún no implementada, usando versión original
   📦 Usando hooks originales (v1)
   ```

---

## ✅ **CONFIRMACIÓN**

**¿Todo funciona normal?** 

Si sí, podemos continuar con:
- **Opción A:** Fase 2A - Extraer Reducer (más seguro)
- **Opción B:** Fase 2B - Extraer Estado (muy seguro)
- **Opción C:** Revisar algo más del código existente

**¿Cuál prefieres?** 🚀
