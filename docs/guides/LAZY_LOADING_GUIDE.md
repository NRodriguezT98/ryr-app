/**
 * @file LAZY_LOADING_GUIDE.md
 * @description Guía de uso del nuevo sistema de lazy loading
 */

# 🚀 Sistema de Lazy Loading - Guía de Uso

## 📋 Arquitectura

### Componentes Principales

1. **`useCollection`** (`src/hooks/useCollection.js`)
   - Hook para manejar colecciones individuales
   - Soporta lazy loading, cache y tiempo real

2. **`DataContext.OPTIMIZED`** (`src/context/DataContext.OPTIMIZED.jsx`)
   - Context optimizado con lazy loading
   - Carga solo proyectos al inicio (eager)
   - Resto de colecciones bajo demanda (lazy)

3. **`withCollections`** (`src/components/withCollections.jsx`)
   - HOC para auto-cargar colecciones
   - Hook alternativo `useLoadCollections`

---

## 🎯 Estrategia de Carga

### Colecciones EAGER (inmediatas)
- ✅ **proyectos** - Pequeña, necesaria para filtros globales

### Colecciones LAZY (bajo demanda)
- ⏳ **viviendas** - Se carga en /viviendas o cuando clientes la necesitan
- ⏳ **clientes** - Se carga en /clientes (auto-carga viviendas)
- ⏳ **abonos** - Se carga en /abonos o dashboard completo
- ⏳ **renuncias** - Se carga en /renuncias

---

## 💡 Cómo Usar

### Opción 1: Hook `useLoadCollections` (Recomendado)

```jsx
import { useLoadCollections } from '../components/withCollections';
import { useData } from '../context/DataContext';

const ListarClientes = () => {
    // Carga automática de clientes y viviendas
    const { isReady } = useLoadCollections(['clientes', 'viviendas']);
    const { clientes, viviendas } = useData();

    if (!isReady) {
        return <LoadingSpinner />;
    }

    // Renderizar cuando los datos están listos
    return <div>...</div>;
};
```

### Opción 2: HOC `withCollections`

```jsx
import { withCollections } from '../components/withCollections';

const ListarClientes = ({ clientes, viviendas }) => {
    // Los datos ya están cargados
    return <div>...</div>;
};

export default withCollections(ListarClientes, ['clientes', 'viviendas']);
```

### Opción 3: Carga Manual

```jsx
import { useEffect } from 'react';
import { useData } from '../context/DataContext';

const MiComponente = () => {
    const { loadCollection, hasLoaded, clientes } = useData();

    useEffect(() => {
        if (!hasLoaded.clientes) {
            loadCollection('clientes');
        }
    }, [loadCollection, hasLoaded.clientes]);

    // ...
};
```

---

## 📊 Ejemplos por Página

### Dashboard
```jsx
const DashboardPage = () => {
    // Carga todas las colecciones para estadísticas completas
    const { isReady } = useLoadCollections(['viviendas', 'clientes', 'abonos', 'renuncias']);
    // ...
};
```

### ListarClientes
```jsx
const ListarClientes = () => {
    // Solo clientes y viviendas (para enriquecimiento)
    const { isReady } = useLoadCollections(['clientes', 'viviendas']);
    // ...
};
```

### ListarViviendas
```jsx
const ListarViviendas = () => {
    // Viviendas, clientes y abonos (para validaciones)
    const { isReady } = useLoadCollections(['viviendas', 'clientes', 'abonos']);
    // ...
};
```

### DetalleCliente
```jsx
const DetalleCliente = () => {
    // Solo lo necesario para este cliente
    const { isReady } = useLoadCollections(['clientes', 'viviendas', 'abonos']);
    // ...
};
```

### ListarAbonos
```jsx
const ListarAbonos = () => {
    // Abonos, clientes y viviendas (para mostrar info completa)
    const { isReady } = useLoadCollections(['abonos', 'clientes', 'viviendas']);
    // ...
};
```

---

## ⚙️ API del DataContext

### Datos (Retrocompatibilidad)
```jsx
const { viviendas, clientes, abonos, renuncias, proyectos } = useData();
```

### Estados de Carga
```jsx
const { 
    isLoading,      // Global loading (solo proyectos)
    loadingStates,  // { viviendas: false, clientes: true, ... }
    hasLoaded       // { viviendas: true, clientes: false, ... }
} = useData();
```

### Funciones de Control
```jsx
const { 
    loadCollection,      // loadCollection('clientes')
    loadAllCollections,  // Carga todas
    reloadCollection,    // reloadCollection('clientes') - ignora cache
    recargarDatos        // Recarga todas (retrocompatibilidad)
} = useData();
```

### Maps O(1)
```jsx
const { maps } = useData();
const cliente = maps.clientes.get(clienteId);
const vivienda = maps.viviendas.get(viviendaId);
```

---

## 📈 Mejoras de Performance

### Antes (DataContext original)
```
Login → Carga 5 colecciones (3-5s)
└─ viviendas (1000+ docs)
└─ clientes (800+ docs)  
└─ abonos (5000+ docs)
└─ renuncias (100+ docs)
└─ proyectos (10 docs)
Total: ~7MB en memoria
```

### Después (DataContext optimizado)
```
Login → Carga 1 colección (0.2s)
└─ proyectos (10 docs)
Total inicial: ~100KB

Usuario navega a /clientes → Carga clientes + viviendas (0.8s)
Usuario navega a /abonos → Carga abonos (1.2s)
```

### Resultados Esperados
- ✅ **Tiempo inicial:** 3-5s → 0.2s (-95%)
- ✅ **Memoria:** 7MB → 100KB (-98% inicial)
- ✅ **Firestore reads:** 7000 → 10 (-99% inicial)
- ✅ **Time to Interactive:** 5s → 0.5s (-90%)

---

## 🔄 Migración Gradual

### Fase 1: Prueba
1. Renombrar `DataContext.jsx` → `DataContext.OLD.jsx`
2. Renombrar `DataContext.OPTIMIZED.jsx` → `DataContext.jsx`
3. Probar dashboard y páginas principales
4. Verificar que todo funciona igual

### Fase 2: Optimizar Páginas
1. Agregar `useLoadCollections` a cada página
2. Quitar dependencia de `isLoading` global
3. Usar `isReady` local de cada página

### Fase 3: Cleanup
1. Eliminar `DataContext.OLD.jsx` si todo funciona
2. Renombrar `DashboardPage.OPTIMIZED.jsx` → `DashboardPage.jsx`
3. Actualizar todas las páginas con el nuevo patrón

---

## ⚠️ Consideraciones

### ¿Cuándo NO usar lazy loading?
- Proyectos (ya es eager, necesario para filtros)
- Datos pequeños (<100 docs) que se usan en todas partes

### ¿Cuándo SÍ usar lazy loading?
- Colecciones grandes (>500 docs)
- Datos específicos de una página
- Datos que no se usan inmediatamente

### Cache
- El cache se mantiene hasta que el usuario cierre sesión
- Usar `reloadCollection()` para forzar recarga
- `loadCollection()` respeta el cache

---

## 🐛 Troubleshooting

### "Los datos no cargan"
- Verificar que llamaste `loadCollection()` o `useLoadCollections()`
- Revisar `hasLoaded.nombreColeccion` para ver si ya cargó

### "Performance no mejora"
- Verificar que todas las páginas usan lazy loading
- Revisar que no estás cargando todas las colecciones en el inicio
- Usar Chrome DevTools → Performance para profiling

### "Errores de undefined"
- Agregar verificación: `if (!isReady) return <Loader />`
- Usar null-safe operators: `clientes?.length || 0`

---

## 📚 Recursos

- **useCollection.js** - Hook base para colecciones
- **withCollections.jsx** - HOC y hook de utilidad
- **DataContext.OPTIMIZED.jsx** - Context optimizado
- **DashboardPage.OPTIMIZED.jsx** - Ejemplo completo
