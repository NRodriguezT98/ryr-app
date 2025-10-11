# 🐛 Fix: Viviendas Desaparecidas + Warning de Firestore

**Fecha:** 10 de Octubre de 2025  
**Tipo:** Bug Fix Crítico + Actualización de API

---

## 🔍 Problema Reportado

### **1. Vivienda Desaparecida**
- Usuario reportó que vivienda existente desapareció de la lista
- Ocurrió después de refactorizaciones de optimización
- Vista correctamente antes de los cambios

### **2. Warning en Consola**
```javascript
[Firestore]: enableIndexedDbPersistence() will be deprecated in the future, 
you can use `FirestoreSettings.cache` instead.
```

---

## 🐛 Root Cause Analysis

### **Bug #1: Campo `descuentoMonto` Faltante**

**Problema:**
```javascript
// ❌ addVivienda NO inicializaba descuentoMonto
const nuevaVivienda = {
    ...viviendaData,
    status: 'disponible',
    totalAbonado: 0,
    saldoPendiente: valorTotalFinal,
    valorFinal: valorTotalFinal,
    // descuentoMonto: 0,  <-- FALTABA
};
```

**Impacto:**
- Viviendas creadas HOY no tienen campo `descuentoMonto`
- Código asumía que el campo siempre existe
- Filtros podían fallar con `undefined`

**Dónde fallaba:**
```javascript
// useViviendaCardData.jsx
const tieneDescuento = vivienda.descuentoMonto > 0; 
// Si descuentoMonto === undefined → undefined > 0 = false ✅ (no crashea)

// Pero en filtros:
resultado = resultado.filter(v => v.saldoPendiente > 0);
// Si saldoPendiente === undefined → undefined > 0 = false ❌ (vivienda filtrada)
```

---

### **Bug #2: Falta de Programación Defensiva**

**Problema:**
```javascript
// ❌ Código NO defensivo
const esEsquinera = vivienda.recargoEsquinera > 0;
const tieneDescuento = vivienda.descuentoMonto > 0;
resultado.filter(v => v.saldoPendiente > 0);
```

**Casos Edge:**
- Viviendas creadas ANTES de que existiera `descuentoMonto`
- Viviendas migradas de versión anterior
- Campos opcionales no inicializados

**Impacto:**
- Viviendas con campos `undefined` podían ser filtradas incorrectamente
- Cálculos podían dar resultados inesperados
- Inconsistencia en datos mostrados

---

### **Deprecation Warning: enableIndexedDbPersistence()**

**Problema:**
```javascript
// ❌ API antigua (deprecada)
const db = getFirestore(app);
enableIndexedDbPersistence(db).catch(...);
```

**Por qué está deprecada:**
- Firebase v9+ introduce API modular
- Mejor soporte multi-tab
- Configuración más clara y explícita

---

## ✅ Soluciones Implementadas

### **Fix #1: Inicializar `descuentoMonto` en Nuevas Viviendas**

**Archivo:** `src/services/viviendaService.js`

```javascript
// ✅ DESPUÉS
export const addVivienda = async (viviendaData) => {
    const valorTotalFinal = viviendaData.valorTotal;
    const nuevaVivienda = {
        ...viviendaData,
        status: 'disponible',
        // ... otros campos ...
        totalAbonado: 0,
        saldoPendiente: valorTotalFinal,
        valorFinal: valorTotalFinal,
        descuentoMonto: 0, // 🔥 FIX: Inicializar campo para consistencia
    };
    const docRef = await addDoc(collection(db, "viviendas"), nuevaVivienda);
    return docRef;
};
```

**Impacto:**
- ✅ Todas las viviendas NUEVAS tendrán campo `descuentoMonto`
- ✅ Consistencia en estructura de datos
- ✅ Previene bugs futuros

---

### **Fix #2: Programación Defensiva en `useViviendaCardData`**

**Archivo:** `src/hooks/viviendas/useViviendaCardData.jsx`

```javascript
// ✅ DESPUÉS: Código defensivo con nullish coalescing
const totalAbonado = vivienda.totalAbonado ?? 0;
const valorFinal = vivienda.valorFinal ?? vivienda.valorTotal ?? 0;
const saldoPendiente = vivienda.saldoPendiente ?? valorFinal;

const esEsquinera = (vivienda.recargoEsquinera ?? 0) > 0;
const tieneDescuento = (vivienda.descuentoMonto ?? 0) > 0;
```

**¿Por qué `??` en lugar de `||`?**
```javascript
// || retorna el primer valor "truthy"
0 || 5 = 5 ❌ (cero es falsy)

// ?? retorna el primer valor "no nullish"
0 ?? 5 = 0 ✅ (cero es un valor válido)
```

**Beneficios:**
- ✅ Maneja campos `undefined` de viviendas antiguas
- ✅ Maneja campos `null` de migración
- ✅ Respeta valores 0 (no los reemplaza por defecto)
- ✅ Fallback a `valorTotal` si `valorFinal` no existe

---

### **Fix #3: Programación Defensiva en Filtros**

**Archivo:** `src/utils/viviendaFilters.js`

```javascript
// ✅ DESPUÉS: Filtros defensivos
if (statusFilter === 'asignadas') {
    // 🔥 DEFENSIVO: saldoPendiente puede no existir en viviendas antiguas
    resultado = resultado.filter(v => 
        v.clienteId && (v.saldoPendiente ?? v.valorFinal ?? 0) > 0
    );
} else if (statusFilter === 'pagadas') {
    // 🔥 DEFENSIVO: saldoPendiente puede no existir en viviendas antiguas
    resultado = resultado.filter(v => 
        v.clienteId && (v.saldoPendiente ?? v.valorFinal ?? 0) <= 0
    );
}
```

**Lógica del Fallback:**
1. Intenta usar `saldoPendiente` (valor actualizado)
2. Si no existe, usa `valorFinal` (valor inicial)
3. Si tampoco existe, usa `0` (seguro)

**Impacto:**
- ✅ Viviendas antiguas sin `saldoPendiente` se muestran correctamente
- ✅ Filtros funcionan con cualquier versión de datos
- ✅ Migración suave sin romper funcionalidad

---

### **Fix #4: API Moderna de Firestore Persistence**

**Archivo:** `src/firebase/config.js`

**ANTES (API deprecada):**
```javascript
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const db = getFirestore(app);

enableIndexedDbPersistence(db)
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Firestore persistence solo activa en 1 pestaña');
        } else if (err.code === 'unimplemented') {
            console.warn('Firestore persistence no soportada en este navegador');
        }
    });
```

**DESPUÉS (API moderna):**
```javascript
import { getFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const db = getFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
```

**Mejoras:**
- ✅ **Sin deprecation warning**
- ✅ **Soporte multi-tab nativo** (sincronización automática)
- ✅ **Configuración más clara** (declarativa vs imperativa)
- ✅ **Sin try-catch necesario** (manejo de errores interno)

**Diferencias clave:**

| Característica | API Antigua | API Moderna |
|---------------|-------------|-------------|
| **Inicialización** | Después de crear DB | Durante creación de DB |
| **Multi-tab** | Solo 1 pestaña | Sincronización automática |
| **Manejo errores** | Manual con catch | Automático |
| **Deprecación** | ⚠️ Será removido | ✅ Estable |

---

## 📊 Validación

### **Checklist de Fixes:**

✅ **1. Campo `descuentoMonto` inicializado**
- Nuevas viviendas lo tendrán por defecto
- Valor: `0` (sin descuento)

✅ **2. Código defensivo con `??`**
- useViviendaCardData maneja campos undefined
- Filtros manejan campos undefined
- Fallbacks lógicos y seguros

✅ **3. API moderna de Firestore**
- Sin warnings en consola
- Soporte multi-tab mejorado
- Código más limpio

✅ **4. Sin errores de compilación**
- Todos los archivos validados
- Build exitoso

---

## 🎯 Resultado Esperado

### **Para Viviendas Nuevas (creadas después del fix):**
```javascript
{
    manzana: "A",
    numeroCasa: 1,
    valorTotal: 50000000,
    valorFinal: 50000000,
    saldoPendiente: 50000000,
    descuentoMonto: 0, // ✅ Ahora se inicializa
    totalAbonado: 0,
    // ... otros campos
}
```

### **Para Viviendas Antiguas (sin descuentoMonto):**
```javascript
// Firestore
{
    manzana: "B",
    numeroCasa: 2,
    valorTotal: 60000000,
    // descuentoMonto: undefined ❌
    // saldoPendiente: undefined ❌ (puede faltar)
}

// En código (después del fix)
const tieneDescuento = (vivienda.descuentoMonto ?? 0) > 0; // false ✅
const saldoPendiente = vivienda.saldoPendiente ?? vivienda.valorFinal ?? 0; // 60000000 ✅
```

---

## 🔄 Acciones Futuras (Opcional)

Si quieres **migrar viviendas antiguas** para añadir campos faltantes:

```javascript
// Script de migración (OPCIONAL)
const migrarViviendasAntiguas = async () => {
    const viviendas = await getDocs(collection(db, "viviendas"));
    
    const batch = writeBatch(db);
    viviendas.forEach(doc => {
        const data = doc.data();
        if (data.descuentoMonto === undefined) {
            batch.update(doc.ref, { 
                descuentoMonto: 0,
                // Otros campos opcionales
            });
        }
    });
    
    await batch.commit();
};
```

**¿Necesario?** NO - El código ahora es defensivo y funciona sin migración.

---

## 📝 Lecciones Aprendidas

### **1. Siempre programa defensivamente**
```javascript
// ❌ MAL: Asume que campo existe
const valor = objeto.campo > 0;

// ✅ BIEN: Defensivo con fallback
const valor = (objeto.campo ?? 0) > 0;
```

### **2. Inicializa TODOS los campos en creación**
```javascript
// ❌ MAL: Campos opcionales sin inicializar
const nuevo = { nombre, edad };

// ✅ BIEN: Todos los campos con valores por defecto
const nuevo = { nombre, edad, activo: true, descuento: 0 };
```

### **3. Usa API moderna de librerías**
- Lee changelog de Firebase/React/etc
- Actualiza cuando hay deprecations
- API moderna suele ser mejor

### **4. Validación en multiple layers**
- Service layer (inicialización)
- Hook layer (cálculos defensivos)
- Filter/Utils layer (filtrado seguro)

---

**Conclusión:** Bugs críticos corregidos. App ahora maneja viviendas antiguas y nuevas correctamente, sin warnings, con código defensivo y robusto.
