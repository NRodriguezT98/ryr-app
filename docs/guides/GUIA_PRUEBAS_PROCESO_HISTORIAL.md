# 🧪 GUÍA DE PRUEBAS - MÓDULO PROCESO + TAB HISTORIAL

## 📋 Objetivo

Probar el módulo de proceso completo con:
- ✅ 3 plantillas refactorizadas
- ✅ Validación de reapertura sin cambios
- ✅ Mensajes espectaculares en Tab Historial

---

## 🚀 Preparación

### 1. Iniciar servidor de desarrollo

```bash
npm run dev
```

Debe mostrar:
```
VITE v6.3.5 ready in 199 ms
➜ Local: http://localhost:5173/
```

### 2. Abrir aplicación

Navegador → http://localhost:5173/

---

## 🧪 PRUEBA 1: Completación Primera Vez

### Objetivo: Verificar mensaje de completación normal

**Pasos:**
1. Ir a **Clientes** → Seleccionar un cliente
2. Click en tab **"Proceso"**
3. Buscar un paso NO completado (ejemplo: "Promesa Enviada")
4. Subir evidencias requeridas (si aplica)
5. Seleccionar fecha de completado
6. Click **"Marcar como Completado"**
7. Click **"Guardar Cambios"**
8. Ir al tab **"Historial"**

**Resultado esperado:**
```
╔════════════════════════════════════════════════════════════════╗
║  🎉  PASO COMPLETADO CON ÉXITO                                ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO DEL PROCESO
   "Promesa Enviada"

📅 FECHA DE COMPLETADO
   11 de octubre de 2025

📋 EVIDENCIAS ADJUNTAS
   Se adjuntaron X evidencias:
   1. [Nombre evidencia 1]
   2. [Nombre evidencia 2]

╔════════════════════════════════════════════════════════════════╗
║  ✅ Este paso ha sido marcado como completado exitosamente   ║
╚════════════════════════════════════════════════════════════════╝
```

**✅ VERIFICAR:**
- [ ] Mensaje aparece en Tab Historial
- [ ] Cajas con bordes (╔═══╗) se ven correctamente
- [ ] Emojis se muestran (🎉 📋 📅)
- [ ] Evidencias listadas numeradas (1. 2. 3.)
- [ ] Fecha formateada correctamente

---

## 🧪 PRUEBA 2: Edición de Fecha (Sin Evidencias)

### Objetivo: Verificar que NO se muestran evidencias en mensaje

**Pasos:**
1. En un paso YA completado, click en ícono **✏️ (Editar Fecha)**
2. Modal se abre
3. Cambiar fecha (ejemplo: 5-oct → 10-oct)
4. Escribir motivo: "Corrección de fecha por solicitud del cliente"
5. Click **"Confirmar"**
6. Click **"Guardar Cambios"**
7. Ir al tab **"Historial"**

**Resultado esperado:**
```
╔════════════════════════════════════════════════════════════════╗
║  📅  FECHA DE COMPLETADO MODIFICADA                           ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO MODIFICADO
   "[Nombre del paso]"

📅 CAMBIO DE FECHA
   Anterior: 4 de octubre de 2025
   Nueva:    10 de octubre de 2025
   
   ⬆️ Adelantado 6 días

╔════════════════════════════════════════════════════════════════╗
║  ✅ Fecha actualizada correctamente                           ║
╚════════════════════════════════════════════════════════════════╝
```

**✅ VERIFICAR:**
- [ ] Mensaje NO menciona evidencias (antes sí, ahora NO)
- [ ] Muestra fecha anterior y nueva
- [ ] Calcula diferencia correctamente (⬆️ Adelantado X días)
- [ ] Flecha correcta (⬆️ adelante, ⬇️ atrás)

---

## 🧪 PRUEBA 3: Reapertura SIN Cambios (DEBE BLOQUEARSE)

### Objetivo: Validar que no permite completar sin cambios

**Pasos:**
1. En un paso completado, click en ícono **🔄 (Reabrir)**
2. Modal de reapertura aparece
3. Escribir motivo: "Revisión de documentación"
4. Click **"Confirmar Reapertura"**
5. El paso se marca como pendiente (🔓)
6. **NO modificar fecha**
7. **NO modificar evidencias**
8. Click **"Marcar como Completado"**

**Resultado esperado:**
```
⚠️ Toast Error (5 segundos):
"No se puede completar un paso reabierto sin realizar cambios. 
 Modifica la fecha o reemplaza evidencias."
```

**✅ VERIFICAR:**
- [ ] Toast de error aparece
- [ ] Color rojo
- [ ] Ícono ⚠️
- [ ] Paso NO se marca como completado
- [ ] Botón "Guardar Cambios" sigue deshabilitado

---

## 🧪 PRUEBA 4: Reapertura CON Cambio de Fecha

### Objetivo: Verificar mensaje de reapertura con cambio

**Pasos:**
1. Con el paso reabierto del PRUEBA 3
2. **Cambiar fecha** (ejemplo: 5-oct → 11-oct)
3. Click **"Marcar como Completado"**
4. Click **"Guardar Cambios"**
5. Ir al tab **"Historial"**

**Resultado esperado:**
```
╔════════════════════════════════════════════════════════════════╗
║  🔄  PASO REABIERTO Y COMPLETADO NUEVAMENTE                   ║
╚════════════════════════════════════════════════════════════════╝

📋 PASO DEL PROCESO
   "[Nombre del paso]"

⚠️  MOTIVO DE REAPERTURA
   Revisión de documentación

📊 ESTADO ANTERIOR (Antes de reapertura)
   📅 Fecha de completado: 5 de octubre de 2025
   📄 Evidencias: X archivo(s)

═══════════════════════════════════════════════════════════════

🔧 CAMBIOS REALIZADOS

   📅 FECHA DE COMPLETADO MODIFICADA:
      Anterior: 5 de octubre de 2025
      Nueva:    11 de octubre de 2025
      
      ⬆️ Adelantado 6 días

═══════════════════════════════════════════════════════════════

📊 ESTADO FINAL
   📅 Fecha de completado: 11 de octubre de 2025
   📄 Total de evidencias: X archivo(s)

📋 EVIDENCIAS FINALES
   1. [Evidencia 1]
   2. [Evidencia 2]

╔════════════════════════════════════════════════════════════════╗
║  ✅ Paso completado nuevamente con historial preservado      ║
╚════════════════════════════════════════════════════════════════╝
```

**✅ VERIFICAR:**
- [ ] Muestra motivo de reapertura
- [ ] Muestra estado anterior
- [ ] Sección "CAMBIOS REALIZADOS" visible
- [ ] Fecha modificada con descripción inteligente
- [ ] Estado final correcto
- [ ] Evidencias finales listadas

---

## 🧪 PRUEBA 5: Reapertura CON Reemplazo de Evidencia

### Objetivo: Verificar término "REEMPLAZADAS" (no "agregadas/eliminadas")

**Pasos:**
1. Completar un paso con 1 evidencia (ejemplo: "Escritura Pública")
2. Reabrir el paso
3. Motivo: "Error en el documento de escritura"
4. **NO cambiar fecha**
5. **Eliminar evidencia antigua**
6. **Subir nueva evidencia** (mismo tipo)
7. Click **"Marcar como Completado"**
8. Click **"Guardar Cambios"**
9. Ir al tab **"Historial"**

**Resultado esperado:**
```
╔════════════════════════════════════════════════════════════════╗
║  🔄  PASO REABIERTO Y COMPLETADO NUEVAMENTE                   ║
╚════════════════════════════════════════════════════════════════╝

⚠️  MOTIVO DE REAPERTURA
   Error en el documento de escritura

═══════════════════════════════════════════════════════════════

🔧 CAMBIOS REALIZADOS

   📄 EVIDENCIAS REEMPLAZADAS:
      1. "[Nombre evidencia antigua]" ➡️  "[Nombre evidencia nueva]"

═══════════════════════════════════════════════════════════════
```

**✅ VERIFICAR:**
- [ ] Dice "REEMPLAZADAS" (NO "agregadas/eliminadas")
- [ ] Muestra formato: "Antigua" ➡️ "Nueva"
- [ ] Flecha ➡️ visible
- [ ] Nombres de evidencias correctos

---

## 🧪 PRUEBA 6: Reapertura CON Ambos Cambios

### Objetivo: Verificar mensaje con fecha + evidencia

**Pasos:**
1. Completar un paso
2. Reabrir
3. Motivo: "Actualización completa del paso"
4. **Cambiar fecha** (ejemplo: 1-oct → 11-oct)
5. **Reemplazar evidencia**
6. Click **"Marcar como Completado"**
7. Click **"Guardar Cambios"**
8. Ir al tab **"Historial"**

**Resultado esperado:**
```
═══════════════════════════════════════════════════════════════

🔧 CAMBIOS REALIZADOS

   📅 FECHA DE COMPLETADO MODIFICADA:
      Anterior: 1 de octubre de 2025
      Nueva:    11 de octubre de 2025
      
      ⬆️ Adelantado 1 semana(s)

   📄 EVIDENCIAS REEMPLAZADAS:
      1. "[Antigua]" ➡️  "[Nueva]"

═══════════════════════════════════════════════════════════════
```

**✅ VERIFICAR:**
- [ ] Ambas secciones visibles (fecha + evidencias)
- [ ] Cálculo de tiempo correcto (días/semanas/meses)
- [ ] Reemplazos listados correctamente

---

## 🧪 PRUEBA 7: Múltiples Cambios en Secuencia

### Objetivo: Verificar orden cronológico en historial

**Pasos:**
1. Completar paso → Ver en historial ✅
2. Editar fecha → Ver en historial ✅
3. Reabrir + cambiar fecha → Ver en historial ✅
4. Editar fecha nuevamente → Ver en historial ✅

**Resultado esperado:**
```
Tab Historial muestra 4 entradas:
- Más reciente: Edición de fecha
- Reapertura con cambio
- Edición de fecha
- Más antigua: Completación inicial
```

**✅ VERIFICAR:**
- [ ] Orden cronológico correcto (más reciente arriba)
- [ ] Cada entrada con mensaje diferente
- [ ] Todas las cajas bien formateadas
- [ ] No hay duplicados

---

## 🧪 PRUEBA 8: Validación Backend (Seguridad)

### Objetivo: Verificar que backend también valida

**Escenario hipotético:**  
Si alguien manipula el frontend y logra enviar una reapertura sin cambios.

**Cómo simular:**
1. Abrir DevTools → Console
2. Manipular `procesoState` directamente (avanzado)
3. Intentar guardar

**Resultado esperado:**
```
Error desde backend:
"No se puede completar el paso 'X' después de reabrirlo 
 sin realizar cambios..."
```

**✅ VERIFICAR:**
- [ ] Backend rechaza la petición
- [ ] Error se muestra al usuario
- [ ] No se guarda en Firestore
- [ ] No se genera auditoría

---

## 📊 Checklist General de Funcionalidad

### Tab Proceso
- [ ] Pasos se muestran correctamente
- [ ] Fechas min/max funcionan
- [ ] Validación de evidencias funciona
- [ ] Botón "Guardar" se habilita/deshabilita correctamente
- [ ] Tooltip de ayuda funciona

### Tab Historial
- [ ] Muestra todos los cambios
- [ ] Orden cronológico correcto
- [ ] Mensajes formateados con cajas
- [ ] Emojis se muestran
- [ ] Iconos correctos por tipo de cambio
- [ ] Sin errores de formato

### Validaciones
- [ ] No permite completar sin evidencias (si son requeridas)
- [ ] No permite fechas futuras
- [ ] No permite fechas antes del paso anterior
- [ ] **NUEVO:** No permite reapertura sin cambios ✨

### Mensajes
- [ ] ✅ COMPLETACIÓN - Mensaje correcto
- [ ] ✅ EDICIÓN FECHA - Sin evidencias en mensaje ✨
- [ ] ✅ REAPERTURA - Usa "REEMPLAZADAS" ✨
- [ ] ✅ Cálculos de tiempo correctos
- [ ] ✅ Flechas direccionales correctas

---

## 🐛 Posibles Errores a Buscar

### 1. Formato roto
**Síntoma:** Cajas (╔═══╗) no se ven
**Causa:** Fuente no soporta caracteres box-drawing
**Solución:** Verificar fuente monospace en CSS

### 2. Emojis no se muestran
**Síntoma:** � o cuadrados
**Causa:** Codificación UTF-8
**Solución:** Verificar charset en HTML

### 3. Validación no bloquea
**Síntoma:** Permite completar sin cambios
**Causa:** Hook no se ejecuta
**Solución:** Verificar dependencias del useCallback

### 4. Error al guardar
**Síntoma:** "Error: No se puede completar..."
**Causa:** Backend detectó inconsistencia
**Solución:** Verificar que frontend valide correctamente

### 5. Mensaje no aparece en historial
**Síntoma:** Historial vacío o sin mensaje
**Causa:** Auditoría no se generó
**Solución:** Verificar console.log en auditService

---

## 📝 Reporte de Pruebas

**Formato sugerido:**

```
FECHA: [Fecha de prueba]
USUARIO: [Tu nombre]
NAVEGADOR: [Chrome/Firefox/Edge]
VERSIÓN: [Versión del navegador]

PRUEBAS REALIZADAS:
✅ PRUEBA 1: Completación - OK
✅ PRUEBA 2: Edición fecha - OK
✅ PRUEBA 3: Validación reapertura - OK
✅ PRUEBA 4: Reapertura con cambio - OK
✅ PRUEBA 5: Reemplazo evidencia - OK
✅ PRUEBA 6: Ambos cambios - OK
✅ PRUEBA 7: Múltiples cambios - OK
✅ PRUEBA 8: Validación backend - OK

PROBLEMAS ENCONTRADOS:
[Lista de problemas, si los hay]

OBSERVACIONES:
[Comentarios adicionales]
```

---

## 🎯 Resultado Esperado

**AL FINALIZAR TODAS LAS PRUEBAS:**

✅ Módulo de Proceso funciona correctamente  
✅ Tab Historial muestra mensajes espectaculares  
✅ Validación de reapertura sin cambios bloquea correctamente  
✅ Mensajes específicos, completos y gráficamente atractivos  
✅ No hay errores en consola  
✅ Build funciona sin warnings críticos  

**LISTO PARA PRODUCCIÓN** 🚀

---

**Última actualización:** 11 de octubre de 2025  
**Versión:** 1.0  
**Estado:** ✅ Listo para probar
