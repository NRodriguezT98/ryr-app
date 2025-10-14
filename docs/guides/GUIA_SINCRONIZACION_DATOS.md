# 🔄 Guía Completa de Sincronización de Datos en Tiempo Real

## 📋 Resumen Ejecutivo

Esta guía documenta las **mejores prácticas** para mantener tu aplicación completamente sincronizada usando **Firestore en tiempo real** sin necesidad de sincronización manual.

### ✅ Tu Sistema Actual (Ya Implementado)
Tu aplicación **YA ESTÁ** implementando las mejores prácticas:
- ✅ Listeners en tiempo real (`onSnapshot`)
- ✅ Sin sincronización manual
- ✅ Cache inteligente con `memoryLocalCache`
- ✅ Lazy loading optimizado
- ✅ Listeners limpios al desmontar

---

## 🏗️ Arquitectura de Sincronización

### Capas de Sincronización

```
┌─────────────────────────────────────────────────────┐
│              CAPA DE PRESENTACIÓN (UI)              │
│        Components reciben datos actualizados        │
└───────────────────┬─────────────────────────────────┘
                    │ Re-render automático
┌───────────────────▼─────────────────────────────────┐
│           CAPA DE ESTADO (React Context)            │
│  DataContext: Distribuye datos a toda la app       │
└───────────────────┬─────────────────────────────────┘
                    │ setState con nuevos datos
┌───────────────────▼─────────────────────────────────┐
│        CAPA DE SUSCRIPCIÓN (useCollection)          │
│   onSnapshot: Escucha cambios en tiempo real       │
└───────────────────┬─────────────────────────────────┘
                    │ Eventos de cambio
┌───────────────────▼─────────────────────────────────┐
│          FIRESTORE (Base de Datos Cloud)            │
│    Fuente de verdad única y consistente            │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Principios Fundamentales

### 1. **Single Source of Truth**
Firestore es la **única fuente de verdad**. No intentar mantener estados duplicados.

```javascript
// ✅ CORRECTO - Confiar en Firestore
const handler = async () => {
    await updateDoc(doc(db, 'clientes', id), data);
    toast.success('Guardado');
    // Los listeners actualizarán automáticamente
};

// ❌ INCORRECTO - Duplicar estado
const handler = async () => {
    await updateDoc(doc(db, 'clientes', id), data);
    setClientes(prev => [...prev]); // ← NO hacer esto
    toast.success('Guardado');
};
```

### 2. **Listeners en Tiempo Real**
Usar `onSnapshot` para escuchar cambios automáticamente.

```javascript
// ✅ Tu implementación actual en useCollection.js
useEffect(() => {
    const unsubscribe = onSnapshot(
        query(collection(db, collectionName)),
        (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setData(items); // React re-renderiza automáticamente
        }
    );
    
    return () => unsubscribe(); // Limpieza crítica
}, [collectionName]);
```

### 3. **No Sincronización Manual**
Eliminar llamadas a funciones de recarga después de mutaciones.

```javascript
// ❌ INCORRECTO - Sistema antiguo
const handler = async () => {
    await saveToFirestore();
    await afterMutation(); // ← Innecesario y problemático
    toast.success('Guardado');
};

// ✅ CORRECTO - Sistema actual
const handler = async () => {
    await saveToFirestore();
    toast.success('Guardado');
    // onSnapshot detectará el cambio automáticamente
};
```

---

## 🛠️ Implementación por Módulo

### 📊 DataContext - Hub Central

**Archivo**: `src/context/DataContext.jsx`

```javascript
// YA IMPLEMENTADO - Ejemplo de tu código actual
export const DataProvider = ({ children }) => {
    const { currentUser } = useAuth();

    // Colecciones con listeners automáticos
    const clientesCollection = useCollection('clientes', {
        lazy: true,      // Carga bajo demanda
        realtime: true,  // Listener automático
        cache: true,     // Cache inteligente
    });

    // Auto-enriquecimiento optimizado
    const clientesEnriquecidos = useMemo(() => {
        const viviendasMap = new Map(viviendas.map(v => [v.id, v]));
        return clientes.map(c => ({
            ...c,
            vivienda: viviendasMap.get(c.viviendaId)
        }));
    }, [clientes, viviendas]);

    return (
        <DataContext.Provider value={{
            clientes: clientesEnriquecidos,
            // ... otros datos
        }}>
            {children}
        </DataContext.Provider>
    );
};
```

**✅ Qué hace bien:**
- Listeners automáticos en tiempo real
- Lazy loading para optimización
- Enriquecimiento eficiente con Map (O(1))
- Cache para reducir lecturas

---

### 🎣 useCollection - Hook de Sincronización

**Archivo**: `src/hooks/useCollection.js`

```javascript
// YA IMPLEMENTADO - Patrón correcto
export const useCollection = (collectionName, options = {}) => {
    const [data, setData] = useState([]);
    const unsubscribeRef = useRef(null);

    const load = useCallback(() => {
        // Verificar autenticación
        if (requireAuth && !auth.currentUser) {
            setData([]);
            return;
        }

        // Cancelar listener anterior (crítico)
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
        }

        // Configurar listener en tiempo real
        const q = query(collection(db, collectionName));
        unsubscribeRef.current = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setData([...items]); // Nuevo array = re-render
            },
            (error) => {
                if (error.code !== 'permission-denied') {
                    console.error('Error:', error);
                }
            }
        );
    }, [collectionName]);

    // Limpieza al desmontar
    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, []);

    return { data, load };
};
```

**✅ Puntos críticos:**
1. **Cancelar listeners anteriores** antes de crear nuevos
2. **Limpiar en unmount** para evitar memory leaks
3. **Crear nuevo array** con `[...items]` para forzar re-render
4. **Manejar errores** sin spam al usuario

---

### 💾 Services - Capa de Escritura

**Patrón para todos los servicios:**

```javascript
// ✅ PATRÓN CORRECTO - Escribir y confiar
export const crearCliente = async (datosCliente) => {
    try {
        // 1. Escribir a Firestore
        const docRef = await addDoc(
            collection(db, 'clientes'),
            {
                ...datosCliente,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }
        );

        // 2. Registrar auditoría (si aplica)
        await createClientAuditLog('CREATE', docRef.id, ...);

        // 3. FIN - Los listeners se encargan del resto
        return docRef.id;

    } catch (error) {
        console.error('Error al crear cliente:', error);
        throw error;
    }
};
```

**✅ Qué NO hacer:**
```javascript
// ❌ NO recargar manualmente
export const crearCliente = async (datosCliente) => {
    await addDoc(collection(db, 'clientes'), datosCliente);
    await recargarClientes(); // ← NO hacer esto
};

// ❌ NO retornar datos para actualizar estado
export const crearCliente = async (datosCliente) => {
    const doc = await addDoc(...);
    return { id: doc.id, ...datosCliente }; // ← Innecesario
};
```

---

### 🎣 Custom Hooks - Lógica de Componentes

**Patrón para hooks de componentes:**

```javascript
// ✅ CORRECTO - Tu patrón actual
export const useListarClientes = () => {
    const { clientes } = useData(); // Datos sincronizados automáticamente
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEliminar = async (clienteId) => {
        setIsSubmitting(true);
        try {
            await deleteDoc(doc(db, 'clientes', clienteId));
            toast.success('Cliente eliminado');
            // FIN - Firestore sincronizará automáticamente
        } catch (error) {
            toast.error('Error al eliminar');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        clientes, // Siempre actualizado
        isSubmitting,
        handleEliminar
    };
};
```

**⚠️ Casos especiales:**

```javascript
// Para cerrar modales después de guardado
const handleGuardar = async (datos) => {
    await saveToFirestore(datos);
    toast.success('Guardado');
    onClose(); // ✅ OK cerrar modal
    // Los datos se actualizarán automáticamente en segundo plano
};

// Para navegación después de creación
const handleCrear = async (datos) => {
    const id = await createInFirestore(datos);
    toast.success('Creado');
    navigate(`/detalle/${id}`); // ✅ OK navegar
    // La página de destino recibirá datos actualizados
};
```

---

## 🔥 Configuración de Firebase

### Firebase Config Optimizado

**Archivo**: `src/firebase/config.js`

```javascript
// ✅ Tu configuración actual (óptima)
const db = initializeFirestore(app, {
    localCache: memoryLocalCache(), // Sin persistencia offline
});
```

**¿Por qué `memoryLocalCache`?**
- ✅ Sincronización instantánea después de transacciones
- ✅ No hay conflictos entre cache e listeners
- ✅ Datos siempre frescos
- ❌ Trade-off: Sin soporte offline (aceptable para apps admin)

**Alternativa** (si necesitas offline):
```javascript
import { persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
```
⚠️ Requiere más manejo de sincronización.

---

## 🚀 Patrones de Mutación

### 1. **Crear Documentos**

```javascript
// ✅ Patrón estándar
export const crearEntidad = async (datos) => {
    const docRef = await addDoc(collection(db, 'entidades'), {
        ...datos,
        createdAt: serverTimestamp(),
        estado: 'activo'
    });
    
    return docRef.id;
};
```

### 2. **Actualizar Documentos**

```javascript
// ✅ Actualización simple
export const actualizarEntidad = async (id, cambios) => {
    await updateDoc(doc(db, 'entidades', id), {
        ...cambios,
        updatedAt: serverTimestamp()
    });
};

// ✅ Actualización con validación
export const actualizarEntidad = async (id, cambios) => {
    const docRef = doc(db, 'entidades', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
        throw new Error('Entidad no encontrada');
    }
    
    await updateDoc(docRef, {
        ...cambios,
        updatedAt: serverTimestamp()
    });
};
```

### 3. **Transacciones Atómicas**

```javascript
// ✅ Para operaciones relacionadas
export const transferirEntidad = async (entidadId, nuevoProyectoId) => {
    await runTransaction(db, async (transaction) => {
        // Leer
        const entidadRef = doc(db, 'entidades', entidadId);
        const entidadSnap = await transaction.get(entidadRef);
        
        if (!entidadSnap.exists()) {
            throw new Error('Entidad no existe');
        }
        
        const antiguoProyectoId = entidadSnap.data().proyectoId;
        
        // Escribir todo de forma atómica
        transaction.update(entidadRef, {
            proyectoId: nuevoProyectoId,
            updatedAt: serverTimestamp()
        });
        
        // Actualizar contadores
        transaction.update(doc(db, 'proyectos', antiguoProyectoId), {
            count: increment(-1)
        });
        
        transaction.update(doc(db, 'proyectos', nuevoProyectoId), {
            count: increment(1)
        });
    });
};
```

### 4. **Batch Operations**

```javascript
// ✅ Para múltiples operaciones independientes
export const eliminarMultiples = async (ids) => {
    const batch = writeBatch(db);
    
    ids.forEach(id => {
        batch.delete(doc(db, 'entidades', id));
    });
    
    await batch.commit();
};
```

---

## 🎨 Patrones de UI

### 1. **Loading States**

```javascript
export const ListaEntidades = () => {
    const { clientes, loadingStates } = useData();
    
    // Mostrar skeleton solo en carga inicial
    if (loadingStates.clientes && clientes.length === 0) {
        return <SkeletonLoader />;
    }
    
    // Si hay datos, mostrarlos aunque se esté recargando
    return (
        <div>
            {loadingStates.clientes && (
                <div className="loading-overlay">Actualizando...</div>
            )}
            {clientes.map(cliente => (
                <ClienteCard key={cliente.id} cliente={cliente} />
            ))}
        </div>
    );
};
```

### 2. **Optimistic UI** (Opcional)

```javascript
// Para acciones donde la UX es crítica
export const useToggleFavorito = () => {
    const [localFavoritos, setLocalFavoritos] = useState(new Set());
    
    const toggle = async (id, esFavorito) => {
        // Actualizar UI inmediatamente (optimistic)
        setLocalFavoritos(prev => {
            const next = new Set(prev);
            esFavorito ? next.add(id) : next.delete(id);
            return next;
        });
        
        // Escribir a Firestore en segundo plano
        try {
            await updateDoc(doc(db, 'clientes', id), {
                favorito: esFavorito
            });
        } catch (error) {
            // Revertir si falla
            setLocalFavoritos(prev => {
                const next = new Set(prev);
                esFavorito ? next.delete(id) : next.add(id);
                return next;
            });
            toast.error('Error al actualizar');
        }
    };
    
    return { localFavoritos, toggle };
};
```

### 3. **Confirmación de Guardado**

```javascript
// ✅ Feedback visual sin esperar sincronización
const handleGuardar = async (datos) => {
    try {
        setIsSubmitting(true);
        await saveToFirestore(datos);
        
        toast.success('Guardado exitosamente');
        onClose();
        
        // Los datos se actualizarán en 100-300ms automáticamente
    } catch (error) {
        toast.error('Error al guardar');
    } finally {
        setIsSubmitting(false);
    }
};
```

---

## ⚡ Optimizaciones Avanzadas

### 1. **Lazy Loading de Colecciones**

```javascript
// ✅ Tu implementación actual
const DataProvider = ({ children }) => {
    // Colecciones lazy (no se cargan hasta que se necesiten)
    const clientesCollection = useCollection('clientes', {
        lazy: true,  // No cargar hasta que se llame a .load()
        realtime: true,
        cache: true
    });
    
    // Función para cargar bajo demanda
    const loadCollection = useCallback((name) => {
        if (name === 'clientes' && !clientesCollection.hasLoaded) {
            clientesCollection.load();
        }
    }, [clientesCollection]);
    
    // ...
};

// En componentes
const ClientesPage = () => {
    const { loadCollection } = useData();
    
    useEffect(() => {
        loadCollection('clientes'); // Carga solo cuando se visita
    }, []);
    
    // ...
};
```

### 2. **Cache Inteligente**

```javascript
// ✅ Implementado en useCollection.js
export const useCollection = (collectionName, options) => {
    const cacheRef = useRef(null);
    
    const load = useCallback(() => {
        // Si hay cache y no es recarga forzada, usar cache
        if (cache && cacheRef.current && hasLoaded) {
            setData(cacheRef.current);
            return;
        }
        
        // Cargar desde Firestore
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({...}));
            setData(items);
            
            // Guardar en cache
            if (cache) {
                cacheRef.current = items;
            }
        });
        
        // ...
    }, []);
    
    // ...
};
```

### 3. **Enriquecimiento Eficiente**

```javascript
// ✅ Usar Map en lugar de find
const clientesEnriquecidos = useMemo(() => {
    // O(n) - Crear Map una vez
    const viviendasMap = new Map(
        viviendas.map(v => [v.id, v])
    );
    
    // O(n) - Buscar con O(1) en cada iteración
    return clientes.map(c => ({
        ...c,
        vivienda: viviendasMap.get(c.viviendaId) // O(1)
    }));
    // Total: O(n) en lugar de O(n²)
}, [clientes, viviendas]);
```

### 4. **Filtros Sin Re-cálculo**

```javascript
// ✅ Memoizar filtros costosos
const clientesFiltrados = useMemo(() => {
    return clientes.filter(c => {
        // Filtros complejos aquí
        return matchesSearch(c, searchTerm) &&
               matchesStatus(c, statusFilter) &&
               matchesProject(c, projectFilter);
    });
}, [clientes, searchTerm, statusFilter, projectFilter]);
```

---

## 🔍 Debugging y Monitoreo

### 1. **Logs de Sincronización**

```javascript
// En useCollection.js - para debugging
useEffect(() => {
    const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
            console.log(`📊 [${collectionName}] Actualizado:`, {
                docs: snapshot.docs.length,
                changes: snapshot.docChanges().map(c => ({
                    type: c.type,
                    id: c.doc.id
                }))
            });
            
            setData(...);
        }
    );
    
    return () => unsubscribe();
}, []);
```

### 2. **Detectar Cambios Específicos**

```javascript
// Útil para debugging de sincronización
useEffect(() => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                console.log('➕ Documento agregado:', change.doc.id);
            }
            if (change.type === 'modified') {
                console.log('✏️ Documento modificado:', change.doc.id);
            }
            if (change.type === 'removed') {
                console.log('🗑️ Documento eliminado:', change.doc.id);
            }
        });
        
        setData(snapshot.docs.map(doc => ({...})));
    });
    
    return () => unsubscribe();
}, []);
```

### 3. **Medir Latencia**

```javascript
// Medir tiempo de sincronización
const handleGuardar = async (datos) => {
    console.time('sync-latency');
    
    await updateDoc(doc(db, 'clientes', id), datos);
    
    // Esperar a que el listener detecte el cambio
    const checkSync = setInterval(() => {
        const cliente = clientes.find(c => c.id === id);
        if (cliente && cliente.nombre === datos.nombre) {
            console.timeEnd('sync-latency');
            clearInterval(checkSync);
        }
    }, 50);
    
    // Timeout de seguridad
    setTimeout(() => clearInterval(checkSync), 3000);
};
```

---

## ⚠️ Problemas Comunes y Soluciones

### Problema 1: "Los datos no se actualizan"

**Causas comunes:**
1. Listener no está configurado
2. Listener fue limpiado prematuramente
3. Cache bloqueando datos frescos

**Solución:**
```javascript
// Verificar que el listener esté activo
useEffect(() => {
    console.log('🔥 Configurando listener para', collectionName);
    
    const unsubscribe = onSnapshot(q, (snap) => {
        console.log('📥 Datos recibidos:', snap.docs.length);
        setData(snap.docs.map(doc => ({...})));
    });
    
    return () => {
        console.log('🧹 Limpiando listener para', collectionName);
        unsubscribe();
    };
}, [collectionName]);
```

### Problema 2: "Múltiples listeners para la misma colección"

**Síntoma:** Firestore reporta más lecturas de lo esperado

**Solución:**
```javascript
// ✅ Cancelar listener anterior
const load = useCallback(() => {
    // CRÍTICO: Limpiar antes de crear nuevo
    if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
    }
    
    // Crear nuevo listener
    unsubscribeRef.current = onSnapshot(q, (snap) => {
        setData(snap.docs.map(doc => ({...})));
    });
}, []);
```

### Problema 3: "Los datos se demoran en aparecer"

**Delay esperado:** 100-300ms (imperceptible)

**Si es mayor:**
1. Verificar conexión de red
2. Revisar tamaño de documentos (optimizar)
3. Considerar optimistic updates

**Optimización:**
```javascript
// Mostrar datos mientras se recarga
const reload = useCallback(() => {
    // NO cambiar isLoading (mantener datos visibles)
    cacheRef.current = null;
    
    // Reconfigurar listener
    // Datos nuevos reemplazarán sin flicker
    load();
}, [load]);
```

### Problema 4: "Memory leaks"

**Causa:** No limpiar listeners al desmontar

**Solución:**
```javascript
// ✅ Siempre limpiar en useEffect
useEffect(() => {
    const unsubscribe = onSnapshot(q, handler);
    
    // CRÍTICO: Retornar función de limpieza
    return () => {
        unsubscribe();
    };
}, []);

// ✅ También en refs
const unsubscribeRef = useRef(null);

useEffect(() => {
    return () => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
        }
    };
}, []);
```

### Problema 5: "Datos desincronizados entre tabs"

**Con `memoryLocalCache`:** Cada tab tiene su propia conexión

**Solución** (si se necesita sincronización entre tabs):
```javascript
// Cambiar a persistentLocalCache
import { persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});
```

---

## ✅ Checklist de Implementación

### Para Nuevos Módulos

- [ ] Agregar colección a `DataContext` con `useCollection`
- [ ] Configurar `lazy: true` si no se necesita en inicio
- [ ] Configurar `realtime: true` para sincronización automática
- [ ] Configurar `cache: true` para optimización
- [ ] NO agregar código de recarga manual
- [ ] Verificar limpieza de listeners en unmount

### Para Nuevas Mutaciones

- [ ] Escribir a Firestore con `addDoc`/`updateDoc`/`deleteDoc`
- [ ] Usar `serverTimestamp()` para timestamps
- [ ] NO recargar datos manualmente después
- [ ] Mostrar toast de confirmación inmediatamente
- [ ] Confiar en que los listeners sincronizarán

### Para Nuevos Componentes

- [ ] Obtener datos desde `useData()` hook
- [ ] NO mantener estado local duplicado
- [ ] Usar `loadCollection()` si es lazy
- [ ] Mostrar loading solo en carga inicial
- [ ] Memoizar cálculos costosos con `useMemo`

---

## 📚 Referencias

### Documentación Oficial
- [Firestore Real-time Updates](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firestore Caching](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

### Documentación Interna
- `SINCRONIZACION_TIEMPO_REAL_COMPLETO.md` - Migración completa
- `docs/guides/ARQUITECTURA_LAZY_LOADING.md` - Sistema de lazy loading
- `docs/guides/SOLUCIONES_PERFORMANCE_OPTIMAS.md` - Optimizaciones

---

## 🎓 Resumen de Buenas Prácticas

### ✅ DO - Hacer

1. **Confiar en Firestore como fuente única de verdad**
2. **Usar `onSnapshot` para sincronización automática**
3. **Limpiar listeners en unmount**
4. **Usar `serverTimestamp()` para timestamps**
5. **Memoizar cálculos costosos**
6. **Usar Map para búsquedas O(1)**
7. **Lazy loading para colecciones grandes**
8. **Cache para reducir lecturas**
9. **Mostrar feedback inmediato al usuario**
10. **Escribir transacciones atómicas cuando se necesiten**

### ❌ DON'T - Evitar

1. **NO recargar manualmente después de mutaciones**
2. **NO duplicar estado entre componentes y Firestore**
3. **NO usar `getDocs()` cuando se necesita tiempo real**
4. **NO olvidar limpiar listeners**
5. **NO hacer queries dentro de loops**
6. **NO usar `find()` en arrays grandes (usar Map)**
7. **NO cargar todas las colecciones al inicio**
8. **NO mostrar skeletons en recargas (mantener datos visibles)**
9. **NO hacer mutaciones sin manejo de errores**
10. **NO olvidar timestamps en documentos**

---

## 🚀 Próximos Pasos

1. **Auditar módulos existentes** contra este checklist
2. **Documentar casos especiales** en tu aplicación
3. **Configurar monitoring** de lecturas de Firestore
4. **Implementar error boundaries** para manejo robusto
5. **Considerar optimistic UI** para acciones críticas

---

**Fecha de Creación:** 2025-01-14  
**Última Actualización:** 2025-01-14  
**Estado:** ✅ Producción - Sistema completamente funcional
