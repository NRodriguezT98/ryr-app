# ✅ Checklist de Verificación - Fase 1

## 🎯 Objetivo
Verificar que la Fase 1 está completa y que la app sigue funcionando correctamente sin romper nada.

---

## ✅ Verificaciones Técnicas

### **1. Servidor de Desarrollo**
- [x] ✅ Servidor iniciado exitosamente
- [x] ✅ URL: http://localhost:5174
- [ ] ⏳ Abrir en navegador y verificar carga

### **2. Errores de Compilación**
```bash
# Verificar que no hay errores TypeScript/ESLint
npm run build
```
- [ ] ⏳ Build exitoso sin errores
- [ ] ⏳ Warnings aceptables (si los hay)

### **3. Archivos Nuevos - Sin Errores de Importación**
Verificar que estos archivos no tienen errores de sintaxis:
- [ ] ⏳ `src/config/featureFlags.js`
- [ ] ⏳ `src/hooks/clientes/useClienteFormAdapter.js`
- [ ] ⏳ `src/hooks/clientes/v2/formReducer.js`
- [ ] ⏳ `src/hooks/clientes/v2/useClienteFormState.js`

---

## 🧪 Verificaciones Funcionales

### **4. Navegación General**
Abrir: http://localhost:5174

- [ ] ⏳ Página principal carga sin errores
- [ ] ⏳ No hay errores en consola (F12)
- [ ] ⏳ Menú de navegación funciona
- [ ] ⏳ Dashboard carga correctamente

### **5. Módulo de Clientes - Listar**
Ir a: "Clientes" → "Listar Clientes"

- [ ] ⏳ Página carga correctamente
- [ ] ⏳ Lista de clientes se muestra
- [ ] ⏳ No hay errores en consola
- [ ] ⏳ Botones funcionan (ver, editar, eliminar)

### **6. Crear Cliente - Paso 1 (Vivienda)**
Ir a: "Clientes" → "Crear Cliente"

- [ ] ⏳ Página carga correctamente
- [ ] ⏳ Select de viviendas funciona
- [ ] ⏳ Puede seleccionar una vivienda
- [ ] ⏳ Botón "Siguiente" funciona
- [ ] ⏳ No hay errores en consola

**🔍 En consola (F12) debe aparecer:**
```
📦 Usando hooks originales (v1)
```

### **7. Crear Cliente - Paso 2 (Datos Cliente)**
Después de seleccionar vivienda:

- [ ] ⏳ Formulario se muestra correctamente
- [ ] ⏳ Campos de texto funcionan (nombres, apellidos, etc.)
- [ ] ⏳ Validaciones funcionan (errores si campo vacío)
- [ ] ⏳ Campo de fecha funciona
- [ ] ⏳ Subida de archivos funciona
- [ ] ⏳ Botón "Siguiente" funciona
- [ ] ⏳ Botón "Anterior" funciona
- [ ] ⏳ No hay errores en consola

### **8. Crear Cliente - Paso 3 (Financiero)**
Después del paso 2:

- [ ] ⏳ Formulario financiero se muestra
- [ ] ⏳ Toggles/Checkboxes funcionan
- [ ] ⏳ Campos numéricos funcionan
- [ ] ⏳ Subida de documentos funciona
- [ ] ⏳ Cálculos de totales funcionan
- [ ] ⏳ Validaciones funcionan
- [ ] ⏳ Botón "Guardar" funciona
- [ ] ⏳ Cliente se crea exitosamente
- [ ] ⏳ No hay errores en consola

### **9. Editar Cliente**
Seleccionar un cliente existente y editarlo:

- [ ] ⏳ Modal de edición abre correctamente
- [ ] ⏳ Datos pre-cargados correctamente
- [ ] ⏳ Puede navegar entre pasos
- [ ] ⏳ Puede modificar campos
- [ ] ⏳ Guardado funciona correctamente
- [ ] ⏳ No hay errores en consola

---

## 🧪 Verificación de Feature Flags

### **10. Probar Feature Flags en Consola**
Abrir consola del navegador (F12) y ejecutar:

```javascript
// 1. Verificar que existen las funciones
console.log(typeof enableFeature); // debe ser "function"
console.log(typeof disableFeature); // debe ser "function"
console.log(typeof activateEscapeHatch); // debe ser "function"

// 2. Ver estado de flags
console.table(window.FEATURE_FLAGS);
// Todos deben estar en FALSE

// 3. Intentar activar (no hará nada aún porque v2 no existe)
enableFeature('USE_REFACTORED_CLIENTE_HOOKS');
// Debe aparecer: "✅ Feature USE_REFACTORED_CLIENTE_HOOKS activado. Refresca la página."

// 4. Refrescar página
location.reload();

// 5. Verificar mensaje en consola
// Debe aparecer: "⚠️ Versión nueva aún no implementada, usando versión original"
// Y también: "📦 Usando hooks originales (v1)"
```

**Resultados Esperados:**
- [x] ✅ Funciones globales disponibles
- [ ] ⏳ Feature flags visibles
- [ ] ⏳ Activación manual funciona
- [ ] ⏳ Mensaje de fallback correcto
- [ ] ⏳ App sigue funcionando normal

### **11. Desactivar Feature Flag**
```javascript
// Desactivar el flag de prueba
disableFeature('USE_REFACTORED_CLIENTE_HOOKS');
location.reload();

// Verificar que vuelve a comportamiento normal
```

---

## 📊 Verificación de Tests

### **12. Ejecutar Tests Unitarios**
```bash
npm run test src/hooks/clientes/__tests__/v2/formReducer.test.js
```

**Esperado:**
- [ ] ⏳ 18 tests pasan exitosamente
- [ ] ⏳ 0 tests fallan
- [ ] ⏳ Cobertura del reducer 100%

---

## 🔍 Verificación de Errores Comunes

### **13. Verificar Imports**
Buscar errores de importación:
- [ ] ⏳ No hay errores "Cannot find module"
- [ ] ⏳ No hay errores "is not defined"
- [ ] ⏳ No hay warnings críticos

### **14. Verificar Consola del Navegador**
Durante toda la prueba:
- [ ] ⏳ No hay errores rojos en consola
- [ ] ⏳ No hay warnings críticos
- [ ] ⏳ Solo logs informativos permitidos

---

## 🎯 Resultados de Verificación

### **✅ Todo Funciona Correctamente:**
```
✅ Servidor corriendo: http://localhost:5174
✅ App carga sin errores
✅ Crear cliente funciona igual que antes
✅ Editar cliente funciona igual que antes
✅ Feature flags funcionan correctamente
✅ Tests pasan (18/18)
✅ No hay errores en consola
✅ Código nuevo NO afecta funcionalidad existente
```

### **Conclusión:**
- ✅ **Fase 1 completada exitosamente**
- ✅ **Código original intacto**
- ✅ **Cero riesgo confirmado**
- ✅ **Listo para Fase 2A**

---

## 🚀 Próximos Pasos (Una vez verificado)

### **Opción 1: Continuar con Fase 2A - Navegación**
Crear `useClienteNavigation.js`:
- handleNextStep
- handlePrevStep
- Validación por paso

### **Opción 2: Commit de Fase 1**
```bash
git add .
git commit -m "feat(clientes): Fase 1 - Extraer formReducer y useClienteFormState

- Crear estructura v2/ para código refactorizado
- Implementar feature flags system con rollback instantáneo
- Extraer reducer a formReducer.js (195 líneas)
- Crear useClienteFormState.js (48 líneas)
- Agregar 18 tests unitarios con 100% cobertura
- Código original intacto, cero riesgo
- Adapter pattern para migración segura"
```

---

## 📝 Notas de Verificación

### Errores Encontrados (si los hay):
```
(Anotar aquí cualquier error encontrado durante la verificación)
```

### Observaciones:
```
(Anotar aquí cualquier observación relevante)
```

---

## ✅ Firma de Aprobación

**Verificado por:** _______________  
**Fecha:** 2025-10-10  
**Estado:** ⏳ En verificación

**Resultado:**
- [ ] ✅ APROBADO - Todo funciona, continuar con Fase 2A
- [ ] ⚠️ ADVERTENCIAS - Funciona pero hay warnings menores
- [ ] ❌ RECHAZADO - Hay errores, necesita corrección

---

**🎯 Próxima Acción:**
Una vez completado este checklist, reportar resultados y decidir si:
1. Continuar con Fase 2A (si todo OK)
2. Hacer commit de Fase 1 (si todo OK)
3. Corregir problemas (si hay errores)
