# ✅ Checklist de Sincronización y Troubleshooting

## 📋 Checklist para Implementar Nuevo Módulo

### Fase 1: Configuración de DataContext

- [ ] **Agregar colección a DataContext**
  ```javascript
  const miColeccion = useCollection('miColeccion', {
      lazy: true,      // ¿Se necesita al inicio?
      realtime: true,  // ✅ Siempre true para sincronización
      cache: true,     // ✅ Siempre true para optimización
  });
  ```

- [ ] **Exportar datos en el value del Context**
  ```javascript
  const value = useMemo(() => ({
      // ... otros datos
      misDatos: miColeccion.data,
      // ...
  }), [miColeccion.data]);
  ```

- [ ] **Agregar función loadCollection (si es lazy)**
  ```javascript
  const loadCollection = useCallback((name) => {
      if (name === 'miColeccion' && !miColeccion.hasLoaded) {
          miColeccion.load();
      }
  }, [miColeccion]);
  ```

---

### Fase 2: Crear Services

- [ ] **Crear operaciones CRUD sin recarga manual**
  ```javascript
  // ✅ CORRECTO
  export const crearItem = async (data) => {
      const ref = await addDoc(collection(db, 'items'), {
          ...data,
          createdAt: serverTimestamp()
      });
      // FIN - No recargar
      return ref.id;
  };
  
  // ❌ INCORRECTO
  export const crearItem = async (data) => {
      const ref = await addDoc(...);
      await recargarDatos(); // ← NO hacer esto
      return ref.id;
  };
  ```

- [ ] **Usar timestamps de Firestore**
  ```javascript
  {
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
  }
  ```

- [ ] **Validar datos antes de escribir**
  ```javascript
  if (!data.campoRequerido) {
      throw new Error('Campo requerido faltante');
  }
  ```

- [ ] **Usar transacciones para operaciones relacionadas**
  ```javascript
  await runTransaction(db, async (transaction) => {
      // Leer todo primero
      const doc1 = await transaction.get(ref1);
      const doc2 = await transaction.get(ref2);
      
      // Validar
      if (!doc1.exists()) throw new Error(...);
      
      // Escribir todo de forma atómica
      transaction.update(ref1, {...});
      transaction.update(ref2, {...});
  });
  ```

- [ ] **Agregar auditoría si aplica**
  ```javascript
  await createAuditLog('ACTION_TYPE', {
      entityId: id,
      changes: {...}
  });
  ```

---

### Fase 3: Crear Custom Hooks

- [ ] **Obtener datos desde useData()**
  ```javascript
  export const useMiModulo = () => {
      const { misDatos, loadingStates } = useData();
      // ...
  };
  ```

- [ ] **Cargar colección si es lazy**
  ```javascript
  const { loadCollection } = useData();
  
  useEffect(() => {
      loadCollection('miColeccion');
  }, []);
  ```

- [ ] **NO duplicar estado de Firestore**
  ```javascript
  // ❌ INCORRECTO
  const [localItems, setLocalItems] = useState([]);
  
  useEffect(() => {
      setLocalItems(items); // Duplicación innecesaria
  }, [items]);
  
  // ✅ CORRECTO
  // Usar directamente items de useData()
  ```

- [ ] **Implementar handlers sin recarga manual**
  ```javascript
  const handleGuardar = async (datos) => {
      setIsSubmitting(true);
      try {
          await serviceGuardar(datos);
          toast.success('Guardado');
          // NO recargar - onSnapshot lo hará
      } catch (error) {
          toast.error(error.message);
      } finally {
          setIsSubmitting(false);
      }
  };
  ```

- [ ] **Memoizar cálculos costosos**
  ```javascript
  const itemsFiltrados = useMemo(() => {
      return items.filter(item => /* filtros */);
  }, [items, filtros]);
  ```

---

### Fase 4: Crear Componentes

- [ ] **Cargar colección en useEffect (si lazy)**
  ```javascript
  useEffect(() => {
      loadCollection('miColeccion');
  }, [loadCollection]);
  ```

- [ ] **Mostrar skeleton solo en carga inicial**
  ```javascript
  if (loadingStates.miColeccion && items.length === 0) {
      return <SkeletonLoader />;
  }
  ```

- [ ] **Mantener datos visibles durante recargas**
  ```javascript
  // ✅ Mostrar datos aunque se esté recargando
  return (
      <div>
          {loadingStates.miColeccion && (
              <div className="subtle-loader">Actualizando...</div>
          )}
          {items.map(item => <Card key={item.id} {...item} />)}
      </div>
  );
  ```

- [ ] **Usar key={item.id} en listas**
  ```javascript
  {items.map(item => (
      <Card key={item.id} item={item} />
  ))}
  ```

- [ ] **Deshabilitar botones durante submit**
  ```javascript
  <button disabled={isSubmitting}>
      {isSubmitting ? 'Guardando...' : 'Guardar'}
  </button>
  ```

---

### Fase 5: Testing

- [ ] **Probar creación de item**
  - Crear item en formulario
  - Verificar que aparece en lista SIN recargar página
  - Verificar que aparece en otra pestaña abierta

- [ ] **Probar edición de item**
  - Editar item existente
  - Verificar que cambios se reflejan inmediatamente
  - Verificar en otra pestaña

- [ ] **Probar eliminación**
  - Eliminar item
  - Verificar que desaparece de lista SIN recargar
  - Verificar en otra pestaña

- [ ] **Probar filtros**
  - Cambiar filtros
  - Verificar que items filtrados cambian correctamente
  - Crear nuevo item que coincide con filtro
  - Verificar que aparece automáticamente

- [ ] **Probar con mala conexión**
  - Throttle network en DevTools
  - Verificar que operaciones eventualmente se sincronizan
  - Verificar feedback al usuario durante delays

---

## 🐛 Troubleshooting Guide

### Problema 1: "Los datos NO se actualizan después de guardar"

**Síntomas:**
- Guardas un cambio y no se refleja en la UI
- Necesitas recargar la página para ver cambios

**Diagnóstico:**
```javascript
// En useCollection.js, agregar logs temporales
useEffect(() => {
    console.log('🔥 [useCollection] Configurando listener para:', collectionName);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        console.log('📥 [useCollection] Datos recibidos:', {
            colección: collectionName,
            cantidad: snapshot.docs.length,
            cambios: snapshot.docChanges().map(c => ({
                tipo: c.type,
                id: c.doc.id
            }))
        });
        setData(snapshot.docs.map(doc => ({...})));
    });
    
    return () => {
        console.log('🧹 [useCollection] Limpiando listener:', collectionName);
        unsubscribe();
    };
}, [collectionName]);
```

**Posibles Causas y Soluciones:**

1. **Listener no está configurado**
   ```javascript
   // Verificar que useCollection tenga realtime: true
   const collection = useCollection('items', {
       realtime: true  // ✅ Debe estar en true
   });
   ```

2. **Listener fue limpiado prematuramente**
   ```javascript
   // Verificar que no hay múltiples useEffect limpiando
   // Revisar que el componente no se desmonta
   ```

3. **Cache bloqueando datos frescos**
   ```javascript
   // Forzar recarga sin cache
   await collection.reload();
   ```

4. **Datos no coinciden con query constraints**
   ```javascript
   // Verificar que los constraints del listener incluyen los datos
   const collection = useCollection('items', {
       constraints: [where('estado', '==', 'activo')]
   });
   // Si guardas con estado: 'inactivo', NO aparecerá
   ```

---

### Problema 2: "Múltiples lecturas en Firestore"

**Síntomas:**
- Factura de Firestore muy alta
- Console muestra muchas lecturas duplicadas

**Diagnóstico:**
```javascript
// Contar lecturas
let readCount = 0;
useEffect(() => {
    const unsubscribe = onSnapshot(q, (snapshot) => {
        readCount += snapshot.docs.length;
        console.log('📊 Total lecturas acumuladas:', readCount);
        setData(...);
    });
    return () => unsubscribe();
}, []);
```

**Posibles Causas y Soluciones:**

1. **No se cancelan listeners anteriores**
   ```javascript
   // ❌ INCORRECTO
   useEffect(() => {
       onSnapshot(q, handler); // Nuevo listener sin limpiar anterior
   }, [dependency]);
   
   // ✅ CORRECTO
   useEffect(() => {
       const unsubscribe = onSnapshot(q, handler);
       return () => unsubscribe(); // Limpia listener anterior
   }, [dependency]);
   ```

2. **useEffect se ejecuta en cada render**
   ```javascript
   // ❌ Falta array de dependencias
   useEffect(() => {
       const unsubscribe = onSnapshot(q, handler);
       return () => unsubscribe();
   }); // ← Falta [], se ejecuta en cada render
   
   // ✅ CORRECTO
   useEffect(() => {
       const unsubscribe = onSnapshot(q, handler);
       return () => unsubscribe();
   }, []); // ← Se ejecuta solo una vez
   ```

3. **Componente se renderiza muchas veces**
   ```javascript
   // Usar React DevTools Profiler
   // Verificar re-renders innecesarios
   // Memoizar con useMemo/useCallback si es necesario
   ```

4. **No usar cache**
   ```javascript
   // Activar cache en useCollection
   const collection = useCollection('items', {
       cache: true  // ✅ Evita recargas innecesarias
   });
   ```

---

### Problema 3: "Datos se sincronizan muy lento"

**Síntomas:**
- Delay > 1 segundo entre guardar y ver cambios
- A veces datos nunca llegan

**Diagnóstico:**
```javascript
// Medir latencia
const handleGuardar = async (datos) => {
    console.time('⏱️ Latencia de sincronización');
    
    const docId = await updateDoc(doc(db, 'items', id), datos);
    
    // Esperar a que listener detecte el cambio
    const checkInterval = setInterval(() => {
        const item = items.find(i => i.id === docId);
        if (item && item.campo === datos.campo) {
            console.timeEnd('⏱️ Latencia de sincronización');
            clearInterval(checkInterval);
        }
    }, 50);
    
    setTimeout(() => clearInterval(checkInterval), 5000);
};
```

**Posibles Causas y Soluciones:**

1. **Conexión de red lenta**
   ```javascript
   // Verificar en Network tab de DevTools
   // Si latencia > 1s, es problema de red/Firestore
   // Considerar:
   // - Optimizar documentos (reducir tamaño)
   // - Usar subcollections en lugar de arrays grandes
   // - Implementar optimistic UI
   ```

2. **persistentLocalCache causa delay**
   ```javascript
   // Tu config actual usa memoryLocalCache ✅
   // Si cambias a persistentLocalCache, puede haber delay
   
   // Mantener memoryLocalCache para sincronización rápida
   const db = initializeFirestore(app, {
       localCache: memoryLocalCache()
   });
   ```

3. **Queries complejas**
   ```javascript
   // Simplificar queries
   // Crear índices compuestos en Firestore
   // Evitar where + orderBy complejos
   ```

---

### Problema 4: "Memory leaks detectados"

**Síntomas:**
- Warning en console: "Can't perform a React state update on unmounted component"
- Memoria crece continuamente

**Diagnóstico:**
```javascript
// Verificar que listeners se limpian
useEffect(() => {
    console.log('🏁 Componente montado');
    
    const unsubscribe = onSnapshot(q, handler);
    
    return () => {
        console.log('🏁 Componente desmontado - limpiando listener');
        unsubscribe();
    };
}, []);
```

**Soluciones:**

1. **Siempre limpiar listeners**
   ```javascript
   // ✅ En useEffect
   useEffect(() => {
       const unsubscribe = onSnapshot(q, handler);
       return () => unsubscribe();
   }, []);
   
   // ✅ En refs
   const unsubscribeRef = useRef(null);
   
   useEffect(() => {
       unsubscribeRef.current = onSnapshot(q, handler);
       
       return () => {
           if (unsubscribeRef.current) {
               unsubscribeRef.current();
           }
       };
   }, []);
   ```

2. **No actualizar state en componentes desmontados**
   ```javascript
   const handleAsync = async () => {
       const isMounted = useRef(true);
       
       try {
           const result = await asyncOperation();
           
           // Solo actualizar si aún está montado
           if (isMounted.current) {
               setData(result);
           }
       } catch (error) {
           if (isMounted.current) {
               setError(error);
           }
       }
       
       useEffect(() => {
           return () => {
               isMounted.current = false;
           };
       }, []);
   };
   ```

---

### Problema 5: "Datos desincronizados entre tabs"

**Síntomas:**
- Cambios en tab A no se reflejan en tab B
- Cada tab muestra datos diferentes

**Diagnóstico:**
```javascript
// Verificar que ambas tabs tienen listeners activos
console.log('🔥 Listener activo:', !!unsubscribeRef.current);
```

**Posibles Causas y Soluciones:**

1. **memoryLocalCache (comportamiento esperado)**
   ```javascript
   // Con memoryLocalCache, cada tab es independiente
   // Pero AMBAS recibirán actualizaciones de Firestore
   
   // Si tab B no se actualiza:
   // - Verificar que listener esté configurado
   // - Verificar que tab B esté en foco (algunos navegadores
   //   pausan listeners en tabs inactivas)
   ```

2. **Tab inactiva pausa listeners**
   ```javascript
   // Algunos navegadores pausan onSnapshot en tabs inactivas
   // Solución: Detectar cuando tab vuelve a estar activa
   
   useEffect(() => {
       const handleVisibilityChange = () => {
           if (!document.hidden) {
               console.log('🔄 Tab activa - verificando sincronización');
               // Opcional: forzar recarga si es crítico
               collection.reload();
           }
       };
       
       document.addEventListener('visibilitychange', handleVisibilityChange);
       
       return () => {
           document.removeEventListener('visibilitychange', handleVisibilityChange);
       };
   }, []);
   ```

---

### Problema 6: "Permission denied en Firestore"

**Síntomas:**
- Error: "Missing or insufficient permissions"
- Datos no se cargan

**Diagnóstico:**
```javascript
// Verificar autenticación
console.log('🔐 Usuario autenticado:', auth.currentUser?.uid);
console.log('🔐 Email:', auth.currentUser?.email);
```

**Soluciones:**

1. **Verificar autenticación antes de queries**
   ```javascript
   // ✅ Ya implementado en tu useCollection
   if (requireAuth && !auth.currentUser) {
       setData([]);
       return;
   }
   ```

2. **Verificar reglas de Firestore**
   ```javascript
   // firestore.rules
   match /items/{itemId} {
       allow read, write: if request.auth != null;
   }
   ```

3. **No mostrar error al usuario si es esperado**
   ```javascript
   // ✅ Ya implementado en tu código
   onSnapshot(q,
       (snapshot) => { /* éxito */ },
       (error) => {
           if (error.code !== 'permission-denied') {
               toast.error(error.message);
           }
       }
   );
   ```

---

### Problema 7: "Filtros no funcionan correctamente"

**Síntomas:**
- Items no aparecen cuando deberían
- Items aparecen cuando no deberían

**Diagnóstico:**
```javascript
// Log de filtros
const itemsFiltrados = useMemo(() => {
    const resultado = items.filter(item => {
        const match = /* condición */;
        console.log('🔍 Filtro:', { item: item.id, match });
        return match;
    });
    console.log('📊 Resultado filtrado:', resultado.length, 'de', items.length);
    return resultado;
}, [items, filtros]);
```

**Soluciones:**

1. **Verificar lógica de filtros**
   ```javascript
   // Usar operadores correctos
   const match = item.nombre.toLowerCase().includes(search.toLowerCase());
   // NO: item.nombre.includes(search) si hay mayúsculas
   ```

2. **Memoizar correctamente**
   ```javascript
   // Incluir TODAS las dependencias
   const itemsFiltrados = useMemo(() => {
       return items.filter(/* ... */);
   }, [items, search, status, project]); // ✅ Todas las deps
   ```

3. **Considerar valores falsy**
   ```javascript
   // ❌ INCORRECTO
   const match = item.cantidad > 0;
   // Si cantidad es 0, no se mostrará
   
   // ✅ CORRECTO
   const match = item.cantidad >= 0;
   ```

---

## 🔍 Herramientas de Debugging

### 1. Firestore Debugger

```javascript
// Agregar a firebase/config.js (solo en desarrollo)
if (import.meta.env.DEV) {
    enableIndexedDbPersistence(db)
        .catch((err) => console.warn('Persistence error:', err));
    
    // Log de todas las operaciones
    const originalOnSnapshot = onSnapshot;
    window.onSnapshot = function(...args) {
        console.log('🔥 onSnapshot llamado:', args[0]);
        return originalOnSnapshot.apply(this, args);
    };
}
```

### 2. React DevTools Profiler

```javascript
// Envolver componentes sospechosos
import { Profiler } from 'react';

const onRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
) => {
    console.log('⚛️ Render:', {
        componente: id,
        fase: phase,
        duracion: actualDuration
    });
};

<Profiler id="ListaClientes" onRender={onRenderCallback}>
    <ListaClientes />
</Profiler>
```

### 3. Network Monitor

```javascript
// Contar requests de Firestore
let firestoreRequests = 0;

const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.name.includes('firestore.googleapis.com')) {
            firestoreRequests++;
            console.log('📡 Firestore request #', firestoreRequests, entry.name);
        }
    }
});

observer.observe({ entryTypes: ['resource'] });
```

---

## 📚 Recursos Adicionales

### Documentación Interna
- `GUIA_SINCRONIZACION_DATOS.md` - Guía completa teórica
- `EJEMPLOS_SINCRONIZACION.md` - Ejemplos prácticos
- `SINCRONIZACION_TIEMPO_REAL_COMPLETO.md` - Migración histórica

### Documentación Externa
- [Firestore Real-time Updates](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [React Hooks Best Practices](https://react.dev/learn/reusing-logic-with-custom-hooks)

---

## 🎓 Resumen de Comandos Útiles

### Verificar Sincronización
```javascript
// En console del navegador
console.log('Listeners activos:', window.listenerCount || 'desconocido');
console.log('Usuario actual:', auth.currentUser?.email);
console.log('Datos en cache:', localStorage.length, 'items');
```

### Forzar Recarga (debugging)
```javascript
// En console del navegador
window.location.reload(true); // Hard reload sin cache
```

### Ver Estado de DataContext
```javascript
// Agregar a window en desarrollo
if (import.meta.env.DEV) {
    window.debugData = () => {
        const { clientes, viviendas, abonos } = useData();
        console.table({
            clientes: clientes.length,
            viviendas: viviendas.length,
            abonos: abonos.length
        });
    };
}
```

---

**Fecha de Creación:** 2025-01-14  
**Estado:** ✅ Guía de Referencia y Debug
