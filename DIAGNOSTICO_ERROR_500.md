# 🔍 Diagnóstico Error 500 - useClienteFormAdapter

## ❌ **Problema Identificado**

Error 500 al cargar `useClienteFormAdapter.js`

## 🎯 **Causa Raíz**

El problema es la **violación de las Reglas de React Hooks** en el adapter.

### **Reglas de React Hooks:**
1. ✅ Los hooks DEBEN llamarse en el mismo orden en cada render
2. ❌ NO se pueden llamar hooks condicionalmente (dentro de `if`, `try-catch`, etc.)
3. ❌ NO se pueden llamar hooks después de un `return` temprano

### **Código Problemático:**

```javascript
// ❌ INCORRECTO - Llama hooks condicionalmente
export const useClienteFormAdapter = (...args) => {
    const useRefactored = isFeatureEnabled('USE_REFACTORED_CLIENTE_HOOKS');
    
    if (useRefactored) {
        return useClienteFormNew(...args);  // ❌ Hook condicional
    }
    
    return useClienteFormOld(...args);      // ❌ Orden de hooks cambia
};
```

**Por qué falla:**
- Si `useRefactored` es `true` → Solo se llama `useClienteFormNew`
- Si `useRefactored` es `false` → Solo se llama `useClienteFormOld`
- React detecta que el número/orden de hooks cambia entre renders
- Error: "Rendered more hooks than during the previous render"

---

## ✅ **Solución**

Hay **3 opciones** para resolver esto:

### **Opción 1: Sin Adapter (Recomendada) ⭐**

Cambiar directamente la importación en componentes:

```javascript
// src/pages/clientes/CrearCliente.jsx

// Cuando queremos probar código nuevo:
import { useClienteForm } from '../../hooks/clientes/v2/useClienteForm';

// Cuando queremos usar código viejo:
import { useClienteForm } from '../../hooks/clientes/useClienteForm';
```

**Ventajas:**
- ✅ Simple y directo
- ✅ No viola reglas de React
- ✅ Fácil de cambiar
- ✅ Sin overhead

**Desventajas:**
- ❌ Hay que cambiar imports manualmente
- ❌ Hay que hacerlo en 2 archivos (CrearCliente, EditarCliente)

---

### **Opción 2: Adapter con Ambos Hooks (Comparación)**

Llamar SIEMPRE ambos hooks y elegir cuál retornar:

```javascript
export const useClienteFormAdapter = (...args) => {
    // ✅ SIEMPRE llamar ambos hooks (mismo orden)
    const oldResult = useClienteFormOld(...args);
    const newResult = useClienteFormNew(...args);
    
    const useRefactored = isFeatureEnabled('USE_REFACTORED_CLIENTE_HOOKS');
    
    // Solo elegir cuál retornar
    return useRefactored ? newResult : oldResult;
};
```

**Ventajas:**
- ✅ No viola reglas de React
- ✅ Permite comparación en debug
- ✅ Componentes no cambian

**Desventajas:**
- ❌ Performance: Ejecuta AMBOS hooks siempre (doble trabajo)
- ❌ Puede causar side-effects duplicados
- ❌ No es óptimo para producción

---

### **Opción 3: Wrapper Component (Avanzada)**

Crear un componente wrapper que decide qué hook usar:

```javascript
// CrearClienteWrapper.jsx
const CrearClienteWrapper = () => {
    const useRefactored = isFeatureEnabled('USE_REFACTORED_CLIENTE_HOOKS');
    
    if (useRefactored) {
        return <CrearClienteV2 />;
    }
    
    return <CrearClienteV1 />;
};
```

**Ventajas:**
- ✅ No viola reglas de React
- ✅ Solo ejecuta el código necesario
- ✅ Limpio arquitecturalmente

**Desventajas:**
- ❌ Requiere duplicar componentes
- ❌ Más complejo de mantener
- ❌ Overkill para este caso

---

## 🚀 **Recomendación**

**Usar Opción 1: Cambiar imports directamente**

### **Pasos:**

1. **Editar `CrearCliente.jsx`:**
```javascript
// Cambiar de:
import { useClienteFormAdapter as useClienteForm } from '../../hooks/clientes/useClienteFormAdapter.js';

// A (código nuevo):
import { useClienteForm } from '../../hooks/clientes/v2/useClienteForm';

// O (código viejo):
import { useClienteForm } from '../../hooks/clientes/useClienteForm';
```

2. **Editar `EditarCliente.jsx`:**
```javascript
// Lo mismo que arriba
```

3. **Eliminar el adapter:**
```bash
# El adapter ya no es necesario
rm src/hooks/clientes/useClienteFormAdapter.js
```

---

## 📋 **Checklist de Migración**

### **Para probar código nuevo:**
- [ ] Cambiar import en `CrearCliente.jsx` → `v2/useClienteForm`
- [ ] Cambiar import en `EditarCliente.jsx` → `v2/useClienteForm`
- [ ] Refrescar navegador (Ctrl + F5)
- [ ] Probar crear cliente
- [ ] Probar editar cliente
- [ ] Verificar consola (no debe haber errores)

### **Si algo falla:**
- [ ] Revertir imports a `useClienteForm` (sin v2/)
- [ ] Refrescar navegador
- [ ] Reportar el error específico

### **Cuando todo funcione:**
- [ ] Eliminar `useClienteForm.jsx` viejo
- [ ] Renombrar `v2/useClienteForm.js` → `useClienteForm.js`
- [ ] Mover archivos de `v2/` a directorio principal
- [ ] Actualizar imports
- [ ] Commit

---

## 🔧 **Plan de Acción Inmediato**

1. ✅ **HECHO:** Desactivar feature flag (código viejo activo)
2. ⏳ **PENDIENTE:** Decidir qué opción usar
3. ⏳ **PENDIENTE:** Implementar solución elegida
4. ⏳ **PENDIENTE:** Probar extensivamente
5. ⏳ **PENDIENTE:** Commit final

---

## 📝 **Notas Adicionales**

### **Por qué el error 500:**
- Vite/React intenta compilar el archivo
- Detecta violación de reglas de hooks
- Rechaza el módulo
- Retorna HTTP 500 (Internal Server Error)

### **Por qué no lo vimos en testing:**
- Los tests unitarios no usan el adapter
- Cada hook se testea independientemente
- El adapter solo se usa en componentes reales

### **Lección aprendida:**
- Los adapters de hooks son complejos
- Mejor usar imports directos
- O usar patterns como "render props" / "children as function"

---

**Estado actual:** Código viejo activo, app funcionando normalmente ✅
