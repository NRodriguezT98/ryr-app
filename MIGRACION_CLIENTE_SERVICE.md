# 📋 Guía de Migración: clienteService.js → Estructura Modular

## ✅ Estado Actual

Se ha completado la refactorización de `clienteService.js` a una **estructura modular**:

```
src/services/clientes/
├── clienteCRUD.js                      ✅ Operaciones CRUD
├── clienteValidators.js                ✅ Validaciones de negocio
├── renunciasService.js                 ✅ Lógica de renuncias
├── historial/
│   └── notasService.js                 ✅ Gestión de notas
├── utils/
│   └── evidenciasHelpers.js            ✅ Helpers de evidencias
├── proceso/
│   ├── procesoService.js               ✅ Gestión de proceso (ya existía)
│   └── auditoriaSistemaUnificado.js    ✅ Auditoría (ya existía)
└── index.js                            ✅ Exportaciones centralizadas
```

---

## 🔄 Mapa de Migración de Funciones

### **✅ CRUD Básico** (`clienteCRUD.js`)
| Función Original | Nueva Ubicación |
|------------------|-----------------|
| `addClienteAndAssignVivienda` | `services/clientes/clienteCRUD.js` |
| `updateCliente` | `services/clientes/clienteCRUD.js` |
| `deleteCliente` | `services/clientes/clienteCRUD.js` |
| `inactivarCliente` | `services/clientes/clienteCRUD.js` |
| `restaurarCliente` | `services/clientes/clienteCRUD.js` |
| `deleteClientePermanently` | `services/clientes/clienteCRUD.js` |

### **✅ Validadores** (`clienteValidators.js`)
| Función Original | Nueva Ubicación |
|------------------|-----------------|
| `validateClientUpdate` | `services/clientes/clienteValidators.js` (NUEVO) |
| `validateFechaIngresoChange` | `services/clientes/clienteValidators.js` (NUEVO) |
| `sincronizarProcesoConFinanciero` | `services/clientes/clienteValidators.js` (NUEVO) |

### **✅ Renuncias** (`renunciasService.js`)
| Función Original | Nueva Ubicación |
|------------------|-----------------|
| `renunciarAVivienda` | `services/clientes/renunciasService.js` |
| `anularCierreProceso` | `services/clientes/renunciasService.js` |

### **✅ Notas** (`historial/notasService.js`)
| Función Original | Nueva Ubicación |
|------------------|-----------------|
| `addNotaToHistorial` | `services/clientes/historial/notasService.js` |
| `updateNotaHistorial` | `services/clientes/historial/notasService.js` |

### **✅ Helpers de Evidencias** (`utils/evidenciasHelpers.js`)
| Función Original | Nueva Ubicación |
|------------------|-----------------|
| `obtenerNombreEvidencia` | `services/clientes/utils/evidenciasHelpers.js` |
| `construirListaEvidencias` | `services/clientes/utils/evidenciasHelpers.js` |
| `construirAccesoEvidencias` | `services/clientes/utils/evidenciasHelpers.js` |

### **⚠️ PENDIENTES** (Aún en `clienteService.js`)
| Función | Acción Requerida |
|---------|------------------|
| `generarMensajeComplecion` | Migrar a `proceso/messageGenerators.js` |
| `generarMensajeReapertura` | Migrar a `proceso/messageGenerators.js` |
| `generarMensajeReCompletado` | Migrar a `proceso/messageGenerators.js` |
| `generarMensajeReaperturaIntegral` | Migrar a `proceso/messageGenerators.js` |
| `generarMensajeModificacionIntegral` | Migrar a `proceso/messageGenerators.js` |
| `generarActividadProceso` | Migrar a `proceso/messageGenerators.js` |
| `getClienteProceso` | Ya existe en `proceso/procesoService.js` - eliminar duplicado |
| `reabrirPasoProceso` | Ya existe en `proceso/procesoService.js` - eliminar duplicado |
| `updateClienteProcesoUnified` | Ya existe en `proceso/procesoService.js` - eliminar duplicado |
| `updateClienteProceso` | **ELIMINAR** (duplicado obsoleto) |

---

## 📝 Cómo Actualizar Imports en Componentes

### **ANTES** (usando el monolito):
```javascript
import {
    updateCliente,
    renunciarAVivienda,
    addNotaToHistorial,
    inactivarCliente
} from '../services/clienteService';
```

### **DESPUÉS** (usando módulos específicos):

#### **Opción 1: Imports específicos** (recomendado para archivos pequeños)
```javascript
import { updateCliente, inactivarCliente } from '../services/clientes/clienteCRUD';
import { renunciarAVivienda } from '../services/clientes/renunciasService';
import { addNotaToHistorial } from '../services/clientes/historial/notasService';
```

#### **Opción 2: Import desde el barrel** (recomendado para archivos grandes)
```javascript
import {
    updateCliente,
    inactivarCliente,
    renunciarAVivienda,
    addNotaToHistorial
} from '../services/clientes';
```

---

## 🎯 Pasos para Completar la Migración

### **Paso 1: Buscar archivos que usen `clienteService.js`**
```bash
# En PowerShell
Get-ChildItem -Recurse -Filter "*.jsx" -Path "src/pages", "src/components", "src/hooks" | Select-String "from.*clienteService"
```

### **Paso 2: Actualizar imports por archivo**

Archivos probables que necesitan actualización:
- `src/pages/clientes/DetalleCliente.jsx`
- `src/pages/clientes/TabCliente.jsx`
- `src/pages/clientes/TabHistorial.jsx`
- `src/pages/clientes/TabProceso.jsx`
- `src/hooks/clientes/useClienteSave.js`
- `src/hooks/clientes/useClienteForm.js`

### **Paso 3: Verificar que todo funciona**
```bash
# Ejecutar la app
npm run dev

# Probar cada funcionalidad:
# - Crear cliente
# - Editar cliente
# - Archivar cliente
# - Restaurar cliente
# - Renunciar vivienda
# - Agregar nota al historial
# - Completar pasos del proceso
```

### **Paso 4: Eliminar funciones duplicadas de `clienteService.js`**

Una vez que todos los imports estén actualizados y probados:

1. Eliminar todas las funciones que ya están en los módulos nuevos
2. Marcar `clienteService.js` como `@deprecated`
3. Eventualmente eliminarlo completamente

---

## ⚠️ Notas Importantes

### **Imports con alias `@`**
Si usas alias de paths en tu proyecto:
```javascript
// Antes
import { updateCliente } from '@/services/clienteService';

// Después
import { updateCliente } from '@/services/clientes';
```

### **Sistema de Auditoría Unificado**
Todas las funciones migradas ahora usan el **sistema nuevo de auditoría**:
- ✅ `createClientAuditLog()` en lugar de `createAuditLog()`
- ✅ Estructura de datos consistente
- ✅ Logs optimizados para TabHistorial y Panel Admin

### **Validaciones Centralizadas**
Las validaciones de negocio ahora están en `clienteValidators.js`:
- ✅ Fácil de testear
- ✅ Reutilizables
- ✅ Un solo lugar para modificar reglas

---

## 📊 Progreso de Migración

| Categoría | Estado | Funciones Migradas |
|-----------|--------|---------------------|
| **CRUD Básico** | ✅ 100% | 6/6 |
| **Validadores** | ✅ 100% | 3/3 |
| **Renuncias** | ✅ 100% | 2/2 |
| **Notas** | ✅ 100% | 2/2 |
| **Helpers Evidencias** | ✅ 100% | 3/3 |
| **Proceso** | ⚠️ 50% | 3/6 (faltan generators) |
| **TOTAL** | **✅ 86%** | **19/22** |

---

## 🚀 Beneficios de la Nueva Estructura

✅ **Mantenibilidad**: Código organizado por responsabilidad  
✅ **Testeable**: Funciones aisladas y puras  
✅ **Escalable**: Fácil agregar nuevas funcionalidades  
✅ **Performance**: Imports específicos (tree-shaking)  
✅ **Auditoría Unificada**: Sistema consistente de logs  
✅ **Documentación**: Cada módulo tiene su propósito claro  

---

## 📞 Próximos Pasos

1. **Migrar generators de mensajes** a `proceso/messageGenerators.js`
2. **Actualizar todos los imports** en componentes/hooks
3. **Verificar funcionamiento** de todas las features
4. **Eliminar `clienteService.js`** completamente
5. **Celebrar** 🎉

---

**Fecha de creación**: Octubre 12, 2025  
**Estado**: En progreso (86% completado)
