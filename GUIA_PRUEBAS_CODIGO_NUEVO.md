# 🧪 Guía de Pruebas - Código Refactorizado

## ✅ **CÓDIGO NUEVO ACTIVADO**

**Estado actual:**
- ✅ Feature flag `USE_REFACTORED_CLIENTE_HOOKS` = `true`
- ✅ Debug mode activado
- ✅ Adapter configurado en componentes
- ✅ App usará código refactorizado

---

## 🌐 **PASOS PARA PROBAR**

### **1. Abrir la aplicación**

URL: http://localhost:5174 (o el puerto que esté corriendo)

**Esperado:**
- App carga normalmente
- No hay errores en consola

---

### **2. Abrir Consola del Navegador (F12)**

**Mensajes esperados:**
```javascript
🆕 Usando hooks refactorizados (v2)
🔍 Debug: Comparación de hooks
  📦 Versión vieja: {...}
  🆕 Versión nueva: {...}
```

**Si ves estos mensajes: ✅ PERFECTO - Código nuevo está activo**

**Si ves este mensaje: ❌ PROBLEMA**
```
📦 Usando hooks originales (v1)
```
Significa que el feature flag no se activó correctamente.

---

### **3. Ir a "Crear Cliente"**

**Paso 1: Seleccionar Vivienda**
- [ ] ✅ Select de viviendas se muestra correctamente
- [ ] ✅ Puedes buscar/filtrar viviendas
- [ ] ✅ Seleccionar una vivienda funciona
- [ ] ✅ Botón "Siguiente" funciona
- [ ] ✅ Validación: Si no seleccionas vivienda, muestra error

**En consola debe aparecer:**
```
🆕 Usando hooks refactorizados (v2)
```

---

**Paso 2: Datos del Cliente**
- [ ] ✅ Todos los campos se muestran
- [ ] ✅ Puedes escribir en los campos (nombres, apellidos, etc.)
- [ ] ✅ Validaciones funcionan:
  - Nombres: solo letras
  - Cédula: solo números
  - Teléfono: solo números
  - Correo: formato email
- [ ] ✅ Fecha de ingreso funciona
- [ ] ✅ Subir archivo de cédula funciona
  - Click en "Subir archivo"
  - Seleccionar PDF
  - Toast: "Subiendo archivo..."
  - Toast: "¡Archivo actualizado con éxito!"
- [ ] ✅ Botón "Siguiente" funciona con campos completos
- [ ] ✅ Botón "Anterior" funciona
- [ ] ✅ Si hay errores, muestra mensajes de error

---

**Paso 3: Configuración Financiera**
- [ ] ✅ Checkboxes/Toggles funcionan:
  - Cuota Inicial
  - Crédito Hipotecario
  - Subsidio Mi Casa Ya
  - Subsidio Caja
- [ ] ✅ Campos numéricos funcionan (montos)
- [ ] ✅ Campos de texto funcionan (banco, caja, caso)
- [ ] ✅ Subir archivos funciona:
  - Carta aprobación crédito
  - Carta aprobación subsidio
- [ ] ✅ Cálculo de totales funciona
- [ ] ✅ Validación de balance funciona
- [ ] ✅ Botón "Guardar" funciona
- [ ] ✅ Cliente se guarda exitosamente
- [ ] ✅ Toast: "¡Cliente y proceso iniciados con éxito!"
- [ ] ✅ Redirige a lista de clientes
- [ ] ✅ Cliente aparece en la lista

---

### **4. Probar "Editar Cliente"**

- [ ] ✅ Click en un cliente existente
- [ ] ✅ Modal de edición abre
- [ ] ✅ Datos pre-cargados correctamente
- [ ] ✅ Puedes navegar entre pasos (Anterior/Siguiente)
- [ ] ✅ Puedes modificar campos
- [ ] ✅ Campos bloqueados se muestran correctamente:
  - Cédula (siempre bloqueada)
  - Vivienda (bloqueada si hay abonos)
  - Fecha ingreso (bloqueada si hay abonos o pasos completados)
- [ ] ✅ Guardar cambios funciona
- [ ] ✅ Toast: "¡Cliente actualizado con éxito!"
- [ ] ✅ Modal se cierra
- [ ] ✅ Cambios se reflejan en la lista

---

### **5. Probar Modo "Reactivar" (si hay clientes renunciados)**

- [ ] ✅ Abrir cliente con status "renunciado"
- [ ] ✅ Opción "Reactivar" aparece
- [ ] ✅ Click en "Reactivar"
- [ ] ✅ Modal abre en modo reactivar
- [ ] ✅ Fecha de ingreso es hoy (editable)
- [ ] ✅ Puede seleccionar nueva vivienda
- [ ] ✅ Guardar funciona
- [ ] ✅ Toast: "¡Cliente reactivado con un nuevo proceso!"
- [ ] ✅ Cliente cambia de status a "activo"

---

## 🔍 **VALIDACIONES CRÍTICAS**

### **A. Validación de Navegación**
```javascript
// Paso 1 → 2: Debe validar vivienda seleccionada
// Paso 2 → 3: Debe validar datos cliente
// Paso 3: Validación al guardar (balance financiero)
```

### **B. Validación de Archivos**
```javascript
// Debe verificar que cédula exista antes de subir
// Toast de carga debe aparecer
// Toast de éxito debe aparecer
// URL debe guardarse en formData
```

### **C. Validación de Guardado**
```javascript
// Modo crear: Debe crear cliente y proceso nuevo
// Modo editar: Debe actualizar solo campos modificados
// Modo reactivar: Debe crear proceso nuevo con status activo
```

---

## 🐛 **ERRORES POSIBLES Y SOLUCIONES**

### **Error 1: "Cannot find module"**
```
❌ Error: Cannot find module '@/config/featureFlags'

✅ Solución:
Verificar que vite.config.js tenga el alias configurado:
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

### **Error 2: "validateCliente is not a function"**
```
❌ Error en validación

✅ Solución:
Verificar imports en useClienteValidation.js
```

### **Error 3: "dispatch is not a function"**
```
❌ Error en handlers

✅ Solución:
Verificar que dispatch se pasa correctamente desde useClienteFormState
```

### **Error 4: App no usa código nuevo**
```
Consola muestra: "📦 Usando hooks originales"

✅ Solución:
1. Verificar featureFlags.js tiene USE_REFACTORED_CLIENTE_HOOKS = true
2. Refrescar navegador (Ctrl + F5)
3. Limpiar caché del navegador
```

---

## 🚨 **SI ALGO FALLA - ROLLBACK INMEDIATO**

### **Opción 1: Consola del navegador**
```javascript
activateEscapeHatch()
// Esto refresca la página y fuerza código viejo
```

### **Opción 2: Desactivar feature flag**
En `src/config/featureFlags.js`:
```javascript
USE_REFACTORED_CLIENTE_HOOKS: false
```
Guardar y refrescar navegador.

### **Opción 3: Git reset (última opción)**
```bash
git reset --hard HEAD
```

---

## ✅ **CHECKLIST DE PRUEBAS**

### **Funcionalidad Básica:**
- [ ] App carga sin errores
- [ ] Crear cliente funciona
- [ ] Editar cliente funciona
- [ ] Navegación entre pasos funciona
- [ ] Validaciones funcionan
- [ ] Subida de archivos funciona
- [ ] Guardado funciona

### **Modo Debug:**
- [ ] Mensajes en consola son correctos
- [ ] No hay errores en consola
- [ ] Comparación old/new se muestra (si debug activado)

### **Casos Edge:**
- [ ] Crear cliente sin vivienda → Error
- [ ] Avanzar paso 2 sin datos → Error
- [ ] Guardar sin balance financiero → Error
- [ ] Subir archivo sin cédula → Error

### **Performance:**
- [ ] App responde rápido (no más lenta que antes)
- [ ] No hay lag al escribir
- [ ] No hay lag al navegar pasos

---

## 📊 **COMPARACIÓN OLD vs NEW**

Si tienes debug mode activado, en consola verás:

```javascript
🔍 Debug: Comparación de hooks
📦 Versión vieja: {
  step: 1,
  formData: {...},
  handlers: {...}
}
🆕 Versión nueva: {
  step: 1,
  formData: {...},
  handlers: {...}
}
```

**Verificar que ambos objetos sean idénticos en estructura**

---

## 🎯 **RESULTADO ESPERADO**

### **✅ TODO FUNCIONA IGUAL QUE ANTES**
- Ningún cambio visible para el usuario
- Misma funcionalidad
- Mismo comportamiento
- Mismas validaciones
- Solo la estructura interna es diferente

### **✅ CÓDIGO NUEVO ACTIVO**
- Mensajes en consola confirman v2
- No hay errores
- Performance igual o mejor

---

## 📝 **REPORTE DE PRUEBAS**

Después de probar, completa esto:

### **Funcionalidades Probadas:**
```
✅ Crear cliente: [PASÓ / FALLÓ]
✅ Editar cliente: [PASÓ / FALLÓ]
✅ Navegación: [PASÓ / FALLÓ]
✅ Validaciones: [PASÓ / FALLÓ]
✅ Archivos: [PASÓ / FALLÓ]
✅ Guardado: [PASÓ / FALLÓ]
```

### **Errores Encontrados:**
```
(Listar aquí cualquier error)
```

### **Observaciones:**
```
(Cualquier comportamiento extraño o diferencia notada)
```

### **Decisión Final:**
```
[ ] ✅ TODO FUNCIONA - Listo para commit
[ ] ⚠️ FUNCIONA CON OBSERVACIONES - Revisar [detalle]
[ ] ❌ HAY ERRORES - Necesita corrección
```

---

## 🚀 **PRÓXIMOS PASOS**

### **Si TODO funciona:**
1. ✅ Desactivar debug mode (opcional)
2. ✅ Hacer commit
3. ✅ Documentar cambios
4. ✅ Celebrar 🎉

### **Si hay problemas menores:**
1. 🔧 Documentar el problema
2. 🔧 Corregir
3. 🔧 Re-probar
4. ✅ Commit

### **Si hay problemas graves:**
1. 🚨 Rollback inmediato
2. 🔍 Analizar el problema
3. 🛠️ Corregir en código
4. 🧪 Probar de nuevo

---

**¿Listo para empezar las pruebas?** 🧪

Abre http://localhost:5174 y verifica paso a paso cada funcionalidad.

Repórtame:
1. ¿Ves el mensaje "🆕 Usando hooks refactorizados (v2)" en consola?
2. ¿Puedes crear un cliente sin problemas?
3. ¿Hay algún error en consola?
