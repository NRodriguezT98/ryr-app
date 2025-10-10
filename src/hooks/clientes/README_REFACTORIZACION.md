# 🆕 Hooks Refactorizados - Versión 2

Esta carpeta contiene la versión refactorizada de los hooks del módulo de clientes.

## 📋 Objetivo

Separar responsabilidades del hook monolítico `useClienteForm.jsx` (676 líneas) en hooks especializados más pequeños y testeables.

## 🏗️ Arquitectura

### Hooks Especializados:

1. **`useClienteFormState.js`** - Gestión de estado del formulario
   - Responsabilidad: Estado y reducer
   - ~100 líneas

2. **`useClienteValidation.js`** - Validación de datos
   - Responsabilidad: Validación por pasos
   - ~80 líneas

3. **`useClienteFileUpload.js`** - Manejo de archivos
   - Responsabilidad: Upload de documentos
   - ~120 líneas

4. **`useClienteNavigation.js`** - Navegación entre pasos
   - Responsabilidad: Next/Prev step + validación
   - ~60 líneas

5. **`useClienteSave.js`** - Persistencia de datos
   - Responsabilidad: Save/Update cliente
   - ~150 líneas

6. **`useClienteForm.js`** - Hook orquestador (NUEVO)
   - Responsabilidad: Combinar todos los hooks
   - ~150 líneas
   - ✅ Interfaz idéntica al hook original

### Archivos Auxiliares:

- **`formReducer.js`** - Reducer y estado inicial
- **`formHelpers.js`** - Funciones auxiliares
- **`formConstants.js`** - Constantes

## 🔒 Seguridad

- ✅ **No afecta código existente** - El hook original sigue intacto
- ✅ **Feature flag controlado** - Desactivado por defecto
- ✅ **Interfaz compatible** - Retorna exactamente los mismos campos
- ✅ **Rollback instantáneo** - Cambiar feature flag a `false`

## 🚀 Activación

```javascript
// En consola del navegador (solo desarrollo):
enableFeature('USE_REFACTORED_CLIENTE_HOOKS')

// Luego refrescar la página

// Para desactivar:
disableFeature('USE_REFACTORED_CLIENTE_HOOKS')
```

## 📊 Estado de Migración

- [x] `formReducer.js` - ✅ Completado (195 líneas)
- [x] `useClienteFormState.js` - ✅ Completado (48 líneas)
- [x] `useClienteNavigation.js` - ✅ Completado (106 líneas)
- [x] `useClienteValidation.js` - ✅ Completado (180 líneas)
- [ ] `useClienteFileUpload.js` - ⏳ Pendiente
- [ ] `useClienteSave.js` - ⏳ Pendiente
- [ ] `useClienteForm.js` (orquestador) - ⏳ Pendiente
- [ ] Tests de compatibilidad - ⏳ Pendiente

## 🧪 Testing

Los tests se encuentran en:
```
src/hooks/clientes/__tests__/
├── compatibility.test.js    - Tests de compatibilidad old vs new
├── v2/
│   ├── useClienteFormState.test.js
│   ├── useClienteValidation.test.js
│   └── ...
```

## 📝 Notas

- Todos los hooks mantienen exactamente la misma funcionalidad
- Solo se refactoriza la estructura interna
- El comportamiento externo es idéntico
- Prioridad: Seguridad > Perfección
