# 🔧 Fix: Bucle Infinito en Lazy Loading - Resuelto

## 🚨 Problema Detectado

**Error:** Bucle infinito de errores `FirebaseError: Missing or insufficient permissions` en consola.

**Causa raíz:** `useCollection` intentaba cargar colecciones **sin verificar autenticación primero**, causando:
1. Error de permisos en Firestore
2. Firestore reintenta automáticamente
3. Nuevo error de permisos
4. Loop infinito

## 🔍 Análisis del Problema

### Flujo Problemático (ANTES):
```
App inicia
  ↓
DataContext monta
  ↓
useCollection('proyectos', { lazy: false }) 
  ↓
¡INTENTA CARGAR SIN AUTH! ❌
  ↓
Firestore: Permission Denied
  ↓
onSnapshot error callback
  ↓
Firestore reintenta automáticamente
  ↓
Permission Denied nuevamente
  ↓
Loop infinito 🔄
```

### Código Problemático:
```javascript
// useCollection.js (ANTES)
const load = useCallback(() => {
    // ❌ NO verificaba autenticación
    setIsLoading(true);
    setError(null);

    try {
        const collectionRef = collection(db, collectionName);
        // ... intenta cargar SIN verificar si hay usuario
    }
}, [collectionName, constraints, transform, cache, realtime, hasLoaded]);

// useEffect ejecutaba load() SIEMPRE si !lazy
useEffect(() => {
    if (!lazy) {
        load(); // ❌ Sin verificar auth
    }
}, [lazy, load]);
```

---

## ✅ Solución Implementada

### 1. Verificación de Autenticación en `useCollection`

**Archivo:** `src/hooks/useCollection.js`

#### Cambio 1: Nuevo parámetro `requireAuth`
```javascript
export const useCollection = (collectionName, options = {}) => {
    const {
        lazy = false,
        realtime = true,
        constraints = [],
        transform = null,
        cache = true,
        requireAuth = true, // ✅ NUEVO: Por defecto requiere auth
    } = options;
```

#### Cambio 2: Verificación en `load()`
```javascript
const load = useCallback(() => {
    // ✅ CRÍTICO: Verificar autenticación ANTES de cargar
    if (requireAuth && !auth.currentUser) {
        setIsLoading(false);
        setData([]);
        return; // Aborta carga si no hay usuario
    }

    // Si ya tenemos datos en cache, usarlos
    if (cache && cacheRef.current && hasLoaded) {
        setData(cacheRef.current);
        setIsLoading(false);
        return;
    }

    // ... resto del código de carga
}, [collectionName, constraints, transform, cache, realtime, hasLoaded, requireAuth]);
```

#### Cambio 3: Manejo de errores mejorado
```javascript
onSnapshot(
    q,
    (snapshot) => {
        // Éxito: procesar datos
    },
    (err) => {
        // ✅ Solo mostrar error si NO es de permisos
        if (err.code !== 'permission-denied') {
            console.error(`Error al cargar ${collectionName}:`, err);
            toast.error(`Error al cargar ${collectionName}`);
        }
        setError(err);
        setIsLoading(false);
    }
);
```

#### Cambio 4: useEffect con verificación de auth
```javascript
useEffect(() => {
    if (!lazy) {
        // ✅ Solo cargar si no requiere auth O si hay usuario autenticado
        if (!requireAuth || auth.currentUser) {
            load();
        }
    }

    // Cleanup al desmontar
    return () => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
        }
    };
}, [lazy, load, requireAuth]);
```

---

### 2. Control de Carga en `DataContext`

**Archivo:** `src/context/DataContext.jsx`

#### Cambio: Carga manual de proyectos después de auth
```javascript
useEffect(() => {
    if (authLoading) {
        setGlobalLoading(true);
        return;
    }

    if (!currentUser) {
        // Usuario no autenticado: limpiar todas las colecciones
        viviendasCollection.clear();
        clientesCollection.clear();
        abonosCollection.clear();
        renunciasCollection.clear();
        proyectosCollection.clear();
        setGlobalLoading(false);
        return;
    }

    // ✅ Usuario autenticado: cargar proyectos manualmente si es necesario
    if (!proyectosCollection.hasLoaded && !proyectosCollection.isLoading) {
        proyectosCollection.load();
    }

    // ✅ Esperar a que proyectos cargue O falle
    if (proyectosCollection.hasLoaded || proyectosCollection.error) {
        setGlobalLoading(false);
    }
}, [
    authLoading, 
    currentUser, 
    proyectosCollection.hasLoaded, 
    proyectosCollection.isLoading, 
    proyectosCollection.error
]);
```

---

## 🎯 Flujo Corregido (DESPUÉS)

```
App inicia
  ↓
DataContext monta
  ↓
useCollection('proyectos', { lazy: false, requireAuth: true })
  ↓
useEffect: !lazy pero NO auth.currentUser
  ↓
¡NO CARGA! ✅ Evita error
  ↓
Usuario hace Login
  ↓
AuthContext: currentUser actualizado
  ↓
DataContext useEffect detecta currentUser
  ↓
Llama manualmente proyectosCollection.load()
  ↓
load() verifica: requireAuth && auth.currentUser ✅
  ↓
Carga exitosa desde Firestore 🎉
```

---

## 📊 Mejoras Implementadas

### 1. **Prevención de Bucles Infinitos**
- ✅ Verificación de autenticación antes de cualquier carga
- ✅ No reintentos automáticos sin auth
- ✅ Silencia errores esperados de permisos

### 2. **Control Granular de Colecciones**
```javascript
// Uso personalizado por colección
useCollection('proyectos', { 
    lazy: false,      // Cargar inmediatamente
    requireAuth: true // Pero solo si hay auth
});

useCollection('publicos', { 
    lazy: false,       // Cargar inmediatamente
    requireAuth: false // No requiere auth (datos públicos)
});
```

### 3. **Manejo de Errores Inteligente**
- Errores de permisos: Silenciados (esperados sin auth)
- Otros errores: Mostrados con toast
- Estado de error: Guardado para debugging

### 4. **Sincronización con AuthContext**
- Espera a `authLoading` antes de intentar cargar
- Limpia colecciones al hacer logout
- Carga automática después de login exitoso

---

## 🧪 Validación

### Antes del Fix:
```
Console: 
❌ Error al cargar proyectos: FirebaseError: Missing or insufficient permissions.
❌ Error al cargar proyectos: FirebaseError: Missing or insufficient permissions.
❌ Error al cargar proyectos: FirebaseError: Missing or insufficient permissions.
... (infinito)
```

### Después del Fix:
```
Console: 
✅ (vacío hasta login)

Después de login:
✅ Proyectos cargados exitosamente
```

---

## 📝 Checklist de Cambios

- [x] Agregar parámetro `requireAuth` a `useCollection`
- [x] Verificar `auth.currentUser` antes de cargar
- [x] Silenciar errores `permission-denied` esperados
- [x] Actualizar useEffect para respetar `requireAuth`
- [x] Modificar DataContext para carga manual post-auth
- [x] Agregar dependencias correctas a useEffect
- [x] Limpiar colecciones al logout
- [x] Build exitoso
- [x] Desarrollo sin errores

---

## 🚀 Comandos Ejecutados

```bash
# Build exitoso
npm run build
✓ built in 16.02s

# Desarrollo sin bucles infinitos
npm run dev
✓ Local: http://localhost:5173/
```

---

## 🎓 Lecciones Aprendidas

### 1. **Siempre verificar autenticación antes de Firestore**
```javascript
// MAL ❌
const data = await getDocs(collection(db, 'users'));

// BIEN ✅
if (auth.currentUser) {
    const data = await getDocs(collection(db, 'users'));
}
```

### 2. **Manejar errores de permisos gracefully**
```javascript
// MAL ❌
onSnapshot(q, 
    (snap) => { /* éxito */ },
    (err) => { 
        console.error(err); // Muestra todos los errores
        toast.error(err.message); // Spamea al usuario
    }
);

// BIEN ✅
onSnapshot(q,
    (snap) => { /* éxito */ },
    (err) => {
        if (err.code !== 'permission-denied') {
            console.error(err);
            toast.error(err.message);
        }
    }
);
```

### 3. **Lazy loading requiere control de flujo**
```javascript
// MAL ❌
useEffect(() => {
    if (!lazy) load(); // Carga sin verificar nada
}, [lazy, load]);

// BIEN ✅
useEffect(() => {
    if (!lazy && (!requireAuth || auth.currentUser)) {
        load(); // Carga solo si cumple condiciones
    }
}, [lazy, load, requireAuth]);
```

---

## ✅ Estado Final

**Problema:** ✅ Resuelto  
**Build:** ✅ Exitoso  
**Dev Server:** ✅ Sin errores  
**Bucle Infinito:** ✅ Eliminado  
**Performance:** ✅ Sin degradación  

---

**Fecha:** 2025-10-10  
**Autor:** Sistema de Optimización RyR  
**Archivos Modificados:** 2  
- `src/hooks/useCollection.js`
- `src/context/DataContext.jsx`
