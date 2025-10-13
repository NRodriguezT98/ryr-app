# Historial - Módulo de Auditoría Refactorizado

## 📋 Descripción

Módulo completamente refactorizado del sistema de historial de auditoría. Diseñado con arquitectura modular, separación de responsabilidades y componentes reutilizables.

## 📁 Estructura del Módulo

```
historial/
├── index.js                          # Exports centralizados
├── HistorialIcons.jsx                # Iconos SVG (104 líneas)
├── HistoryItem.jsx                   # Item individual del historial (120 líneas)
├── ParsedMessage.jsx                 # Componente orquestador de mensajes (100 líneas)
├── useClientHistory.js               # Hook de data fetching (90 líneas)
│
├── messages/                         # Componentes especializados de mensajes
│   ├── CompletionMessage.jsx         # Mensaje de paso completado (79 líneas)
│   ├── DateChangeMessage.jsx         # Mensaje de cambio de fecha (50 líneas)
│   ├── ReopeningMessage.jsx          # Mensaje de reapertura (173 líneas)
│   └── ClientCreatedMessage.jsx      # Mensaje de cliente creado (186 líneas)
│
└── utils/                            # Funciones de utilidad
    ├── actionHelpers.js              # Helpers de acciones (159 líneas)
    └── messageParser.js              # Parsing de mensajes (178 líneas)
```

## 🎯 Características

### Antes (1185 líneas monolíticas)
- ❌ Todo en un solo archivo
- ❌ Lógica mezclada con UI
- ❌ Difícil de testear
- ❌ Difícil de mantener
- ❌ No reutilizable

### Después (Modular)
- ✅ Archivos pequeños y focalizados (< 200 líneas cada uno)
- ✅ Separación clara de responsabilidades
- ✅ Componentes testeables
- ✅ Fácil de mantener y extender
- ✅ Componentes reutilizables

## 🔧 Componentes Principales

### NewTabHistorial.jsx (Principal)
**Responsabilidad:** Orquestación y renderizado del contenedor  
**Tamaño:** ~100 líneas  
**Dependencias:** HistoryItem, useClientHistory, Icons

```jsx
import { HistoryItem } from './historial/HistoryItem';
import { useClientHistory } from './historial/useClientHistory';
```

### HistoryItem.jsx
**Responsabilidad:** Renderizar un item individual del historial  
**Tamaño:** ~120 líneas  
**Props:** `{ log, index }`

### ParsedMessage.jsx
**Responsabilidad:** Orquestar el renderizado de mensajes según tipo  
**Tamaño:** ~100 líneas  
**Lógica:** Detecta tipo y delega a componente especializado

### useClientHistory.js
**Responsabilidad:** Lógica de fetching y estado del historial  
**Tamaño:** ~90 líneas  
**Returns:** `{ logs, loading, error, refetch }`

## 📦 Componentes de Mensajes

### CompletionMessage.jsx
Renderiza mensajes de pasos completados con:
- Badge de paso (X/Y)
- Indicador de completación automática
- Lista de evidencias adjuntadas con links

### DateChangeMessage.jsx
Renderiza mensajes de cambios de fecha con:
- Fecha anterior (tachada)
- Fecha nueva (destacada)

### ReopeningMessage.jsx
Renderiza mensajes de reapertura con:
- Motivo de reapertura
- Cambios de fecha
- Evidencias reemplazadas (antes → después)
- Links a ambas evidencias

### ClientCreatedMessage.jsx
Renderiza mensajes de cliente creado con:
- Datos del cliente
- Vivienda asignada
- Información financiera
- Fuentes de financiamiento

## 🛠 Utilidades

### actionHelpers.js
Funciones para determinar propiedades de acciones:
- `detectActionType(log)` - Detecta tipo de acción
- `getActionIcon(log)` - Retorna icono apropiado
- `getActionTheme(log)` - Retorna tema de colores
- `getActionLabel(log)` - Retorna etiqueta de acción

### messageParser.js
Funciones para parsear mensajes:
- `extractStepNumber(message)` - Extrae número de paso (X/Y)
- `extractBasicInfo(message)` - Extrae info básica
- `parseReopeningInfo(lines)` - Parsea info de reapertura
- `parseClientCreatedInfo(lines)` - Parsea info de cliente
- `detectMessageType(message)` - Detecta tipo de mensaje

## 💡 Uso

### Básico
```jsx
import NewTabHistorial from './components/NewTabHistorial';

<NewTabHistorial cliente={cliente} />
```

### Usar componentes individuales
```jsx
import { HistoryItem, useClientHistory } from './components/historial';

const MyCustomHistory = ({ clienteId }) => {
  const { logs } = useClientHistory(clienteId);
  
  return logs.map(log => (
    <HistoryItem key={log.id} log={log} />
  ));
};
```

### Usar parsers
```jsx
import { extractStepNumber, detectMessageType } from './components/historial/utils/messageParser';

const message = log.message;
const { numeroPaso, totalPasos } = extractStepNumber(message);
const { isCompletion, isReopening } = detectMessageType(message);
```

## 🧪 Testing

Cada componente es fácilmente testeable por separado:

```javascript
// Testear parser
import { extractStepNumber } from './utils/messageParser';

test('extrae número de paso correctamente', () => {
  const message = "PASO COMPLETADO (5/20)";
  const result = extractStepNumber(message);
  expect(result.numeroPaso).toBe(5);
  expect(result.totalPasos).toBe(20);
});

// Testear componente
import { CompletionMessage } from './messages/CompletionMessage';

test('renderiza mensaje de completación', () => {
  const props = { pasoNombre: "Test", numeroPaso: 1, totalPasos: 5 };
  const { getByText } = render(<CompletionMessage {...props} />);
  expect(getByText('1/5')).toBeInTheDocument();
});
```

## 🚀 Extender el Sistema

### Agregar nuevo tipo de mensaje

1. Crear componente en `messages/`:
```jsx
// messages/NewMessageType.jsx
export const NewMessageType = ({ data }) => {
  return <div>{/* Renderizado */}</div>;
};
```

2. Agregar detector en `messageParser.js`:
```javascript
export const detectMessageType = (message) => {
  return {
    // ...existentes
    isNewType: message.includes('NEW_TYPE_MARKER')
  };
};
```

3. Agregar caso en `ParsedMessage.jsx`:
```jsx
if (messageType.isNewType) {
  return <NewMessageType {...props} />;
}
```

## 📊 Métricas

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Archivo principal | 1185 líneas | 100 líneas | **-91%** |
| Archivos totales | 1 | 12 | Modular |
| Líneas por archivo | 1185 | < 200 | Mantenible |
| Componentes reutilizables | 0 | 8 | Escalable |
| Testabilidad | Baja | Alta | ✅ |

## 🔄 Migración

El archivo original se respaldó en:
```
NewTabHistorial.jsx.backup
```

Si necesitas revertir:
```bash
Copy-Item NewTabHistorial.jsx.backup NewTabHistorial.jsx -Force
```

## 📝 Notas

- Todos los componentes usan TailwindCSS para estilos
- Soporte completo para modo oscuro (`dark:`)
- Iconos SVG embebidos para garantizar renderizado
- Compatibilidad con ambos sistemas de auditoría (nuevo y legacy)
