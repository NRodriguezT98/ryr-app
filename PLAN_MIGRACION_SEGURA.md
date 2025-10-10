# 🛡️ Plan de Migración Segura - Módulo Clientes

## 🎯 **OBJETIVO**
Refactorizar el módulo de clientes **sin romper funcionalidad existente**, mediante migración incremental y pruebas constantes.

---

## 📋 **ESTRATEGIA: Coexistencia y Migración Gradual**

### **Reglas de Oro:**
1. ✅ El código viejo **SIGUE FUNCIONANDO** mientras migramos
2. ✅ Código nuevo en carpetas separadas (`/v2` o `/refactored`)
3. ✅ Feature flag para activar/desactivar nuevo código
4. ✅ Tests automáticos antes de cada cambio
5. ✅ Rollback instantáneo si algo falla
6. ✅ Migración en pequeños pasos testeables

---

## 🚀 **FASE 1: Preparación (Sin Tocar Nada)**

### **Paso 1.1: Crear estructura paralela**

```
src/
├── hooks/
│   └── clientes/
│       ├── useClienteForm.jsx          ← ORIGINAL (no tocar)
│       └── v2/                          ← NUEVO (código refactorizado)
│           ├── useClienteFormState.js
│           ├── useClienteValidation.js
│           ├── useClienteFileUpload.js
│           ├── useClienteNavigation.js
│           ├── useClienteSave.js
│           └── useClienteForm.js        ← Nueva versión
│
├── pages/clientes/
│   ├── CrearCliente.jsx                ← ORIGINAL (funcionando)
│   ├── wizard/
│   │   ├── Step3_Financial.jsx         ← ORIGINAL (funcionando)
│   │   └── v2/                          ← VERSIONES NUEVAS
│   │       └── Step3_Financial.jsx
│   └── v2/                              ← Versiones refactorizadas
│       └── CrearCliente.jsx
│
└── config/
    └── featureFlags.js                  ← Control de features
```

### **Paso 1.2: Sistema de Feature Flags**

```javascript
// ✅ src/config/featureFlags.js
export const FEATURE_FLAGS = {
    // Feature flag para activar hooks refactorizados
    USE_REFACTORED_CLIENTE_HOOKS: false,  // Empieza desactivado
    
    // Feature flag para nuevo Step3
    USE_REFACTORED_STEP3: false,
    
    // Debug mode para comparar resultados
    DEBUG_COMPARE_OLD_NEW: true,
};

// Hook para usar feature flags
export const useFeatureFlag = (flagName) => {
    return FEATURE_FLAGS[flagName] || false;
};
```

### **Paso 1.3: Wrapper de Compatibilidad**

```javascript
// ✅ src/hooks/clientes/useClienteFormAdapter.js
// Este adapter permite cambiar entre versión vieja y nueva
import { useFeatureFlag } from '@/config/featureFlags';
import { useClienteForm as useClienteFormOld } from './useClienteForm';
import { useClienteForm as useClienteFormNew } from './v2/useClienteForm';

export const useClienteFormAdapter = (...args) => {
    const useRefactored = useFeatureFlag('USE_REFACTORED_CLIENTE_HOOKS');
    
    if (useRefactored) {
        console.log('🆕 Usando hooks refactorizados');
        return useClienteFormNew(...args);
    }
    
    console.log('📦 Usando hooks originales');
    return useClienteFormOld(...args);
};
```

---

## 🔨 **FASE 2: Crear Hooks Nuevos (Sin Afectar Nada)**

### **Paso 2.1: Extraer hook de estado**

```javascript
// ✅ src/hooks/clientes/v2/useClienteFormState.js
// NUEVO - No afecta código existente
import { useReducer, useState } from 'react';
import { formReducer, blankInitialState } from './formReducer';

export const useClienteFormState = (initialData = blankInitialState) => {
    const [formData, dispatch] = useReducer(formReducer, initialData);
    const [errors, setErrors] = useState({});
    
    return { 
        formData, 
        dispatch, 
        errors, 
        setErrors 
    };
};
```

### **Paso 2.2: Crear reducer separado**

```javascript
// ✅ src/hooks/clientes/v2/formReducer.js
// Movemos el reducer aquí, pero mantenemos compatibilidad 100%
export const blankInitialState = {
    viviendaSeleccionada: null,
    datosCliente: {
        nombres: '',
        apellidos: '',
        cedula: '',
        // ... exactamente igual que antes
    },
    financiero: {
        // ... exactamente igual que antes
    },
    documentos: {
        // ... exactamente igual que antes
    }
};

export const formReducer = (state, action) => {
    switch (action.type) {
        case 'INITIALIZE_FORM':
            return action.payload;
            
        case 'UPDATE_VIVIENDA_SELECCIONADA':
            return {
                ...state,
                viviendaSeleccionada: action.payload
            };
            
        case 'UPDATE_DATOS_CLIENTE':
            return {
                ...state,
                datosCliente: {
                    ...state.datosCliente,
                    [action.payload.field]: action.payload.value
                }
            };
            
        case 'UPDATE_FINANCIAL_FIELD':
            const { section, field, value } = action.payload;
            return {
                ...state,
                financiero: {
                    ...state.financiero,
                    [section]: {
                        ...state.financiero[section],
                        [field]: value
                    }
                }
            };
            
        // ... resto de actions IDÉNTICAS
        
        default:
            return state;
    }
};
```

### **Paso 2.3: Hook de validación**

```javascript
// ✅ src/hooks/clientes/v2/useClienteValidation.js
import { useCallback } from 'react';
import { 
    validateVivienda, 
    validateCliente, 
    validateFinancialStep 
} from '@/utils/validation'; // Usamos las existentes

export const useClienteValidation = (formData, step, modo) => {
    const validateCurrentStep = useCallback(() => {
        switch(step) {
            case 1:
                return validateVivienda(formData.viviendaSeleccionada);
            case 2:
                return validateCliente(formData.datosCliente);
            case 3:
                return validateFinancialStep(formData);
            default:
                return {};
        }
    }, [formData, step, modo]);
    
    return { validateCurrentStep };
};
```

### **Paso 2.4: Hook de navegación**

```javascript
// ✅ src/hooks/clientes/v2/useClienteNavigation.js
import { useState, useCallback } from 'react';

export const useClienteNavigation = (validateCurrentStep, setErrors) => {
    const [step, setStep] = useState(1);
    
    const handleNextStep = useCallback(async () => {
        const stepErrors = await validateCurrentStep();
        
        if (Object.keys(stepErrors).length === 0) {
            setStep(s => Math.min(s + 1, 3));
            setErrors({});
            return true;
        } else {
            setErrors(stepErrors);
            return false;
        }
    }, [validateCurrentStep, setErrors]);
    
    const handlePrevStep = useCallback(() => {
        setStep(s => Math.max(s - 1, 1));
        setErrors({});
    }, [setErrors]);
    
    return { 
        step, 
        setStep,
        handleNextStep, 
        handlePrevStep 
    };
};
```

### **Paso 2.5: Hook orquestador (Nueva versión)**

```javascript
// ✅ src/hooks/clientes/v2/useClienteForm.js
// NUEVA versión refactorizada
import { useClienteFormState } from './useClienteFormState';
import { useClienteValidation } from './useClienteValidation';
import { useClienteNavigation } from './useClienteNavigation';
import { useClienteFileUpload } from './useClienteFileUpload';
import { useClienteSave } from './useClienteSave';
// ... más hooks

export const useClienteForm = (isEditing, clienteAEditar, onSaveSuccess, modo) => {
    // Combina todos los hooks especializados
    const { formData, dispatch, errors, setErrors } = useClienteFormState();
    const { validateCurrentStep } = useClienteValidation(formData, step, modo);
    const { step, handleNextStep, handlePrevStep } = useClienteNavigation(
        validateCurrentStep, 
        setErrors
    );
    
    // ... más hooks
    
    // IMPORTANTE: Retorna EXACTAMENTE la misma interfaz que el hook viejo
    return {
        step,
        formData,
        errors,
        isSubmitting,
        // ... MISMOS campos que la versión original
        
        handlers: {
            handleInputChange,
            handleFinancialFieldChange,
            handleNextStep,
            handlePrevStep,
            handleSave,
            // ... MISMOS handlers
        }
    };
};
```

---

## ✅ **FASE 3: Testing Comparativo**

### **Paso 3.1: Test de compatibilidad**

```javascript
// ✅ src/hooks/clientes/__tests__/compatibility.test.js
import { renderHook } from '@testing-library/react';
import { useClienteForm as useOld } from '../useClienteForm';
import { useClienteForm as useNew } from '../v2/useClienteForm';

describe('Compatibilidad entre versión vieja y nueva', () => {
    test('Ambos hooks retornan la misma estructura', () => {
        const { result: oldResult } = renderHook(() => useOld(false));
        const { result: newResult } = renderHook(() => useNew(false));
        
        // Verificar que tienen las mismas keys
        expect(Object.keys(oldResult.current)).toEqual(
            Object.keys(newResult.current)
        );
        
        // Verificar estructura de formData
        expect(oldResult.current.formData).toHaveProperty('viviendaSeleccionada');
        expect(newResult.current.formData).toHaveProperty('viviendaSeleccionada');
    });
    
    test('handleNextStep funciona igual en ambas versiones', async () => {
        // ... test comparativo
    });
});
```

### **Paso 3.2: Test visual manual**

```javascript
// ✅ src/pages/clientes/TestComparison.jsx
// Página de prueba que muestra ambas versiones lado a lado
import { useClienteForm as useOld } from '@/hooks/clientes/useClienteForm';
import { useClienteForm as useNew } from '@/hooks/clientes/v2/useClienteForm';

export const TestComparison = () => {
    const oldHook = useOld(false);
    const newHook = useNew(false);
    
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="border-4 border-red-500 p-4">
                <h2>❌ VERSIÓN VIEJA</h2>
                <pre>{JSON.stringify(oldHook.formData, null, 2)}</pre>
            </div>
            
            <div className="border-4 border-green-500 p-4">
                <h2>✅ VERSIÓN NUEVA</h2>
                <pre>{JSON.stringify(newHook.formData, null, 2)}</pre>
            </div>
        </div>
    );
};
```

---

## 🔄 **FASE 4: Activación Gradual**

### **Paso 4.1: Activar solo en desarrollo**

```javascript
// ✅ src/config/featureFlags.js
export const FEATURE_FLAGS = {
    // Activamos solo si estamos en desarrollo
    USE_REFACTORED_CLIENTE_HOOKS: import.meta.env.DEV,
};
```

### **Paso 4.2: Activar para usuario específico**

```javascript
// ✅ src/config/featureFlags.js
export const FEATURE_FLAGS = {
    USE_REFACTORED_CLIENTE_HOOKS: 
        import.meta.env.DEV || 
        localStorage.getItem('enableNewHooks') === 'true',
};

// En consola del navegador para activar:
// localStorage.setItem('enableNewHooks', 'true')
// Luego refrescar
```

### **Paso 4.3: Rollout gradual (10% → 50% → 100%)**

```javascript
// ✅ src/config/featureFlags.js
const userHashCode = (userId) => {
    // Genera número consistente del 0-100 basado en userId
    return userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100;
};

export const isFeatureEnabled = (flagName, userId) => {
    const rolloutPercentage = {
        'USE_REFACTORED_CLIENTE_HOOKS': 10, // Empieza con 10%
    };
    
    const percentage = rolloutPercentage[flagName] || 0;
    const hash = userHashCode(userId);
    
    return hash < percentage;
};
```

---

## 🚨 **FASE 5: Monitoreo y Rollback**

### **Paso 5.1: Logging comparativo**

```javascript
// ✅ src/hooks/clientes/useClienteFormAdapter.js
export const useClienteFormAdapter = (...args) => {
    const useRefactored = useFeatureFlag('USE_REFACTORED_CLIENTE_HOOKS');
    const debugMode = useFeatureFlag('DEBUG_COMPARE_OLD_NEW');
    
    const oldHook = useClienteFormOld(...args);
    const newHook = useClienteFormNew(...args);
    
    if (debugMode) {
        // Comparar resultados
        console.log('🔍 Comparación:', {
            old: oldHook.formData,
            new: newHook.formData,
            equal: JSON.stringify(oldHook.formData) === JSON.stringify(newHook.formData)
        });
    }
    
    return useRefactored ? newHook : oldHook;
};
```

### **Paso 5.2: Error boundary con fallback**

```javascript
// ✅ src/components/ErrorBoundary.jsx (mejorado)
class ErrorBoundary extends React.Component {
    componentDidCatch(error, errorInfo) {
        // Si el error viene del código nuevo, volver al viejo
        if (error.message.includes('useClienteForm')) {
            console.error('❌ Error en hooks nuevos, activando fallback');
            localStorage.setItem('forceOldHooks', 'true');
            window.location.reload();
        }
    }
}
```

### **Paso 5.3: Rollback instantáneo**

```javascript
// ✅ src/config/featureFlags.js
export const FEATURE_FLAGS = {
    USE_REFACTORED_CLIENTE_HOOKS: 
        localStorage.getItem('forceOldHooks') !== 'true' && // Escape hatch
        (import.meta.env.DEV || isFeatureEnabled('REFACTORED_HOOKS', currentUser.id)),
};
```

---

## 📊 **CHECKLIST DE MIGRACIÓN**

### **Antes de cada cambio:**
- [ ] ✅ Código viejo sigue funcionando
- [ ] ✅ Tests pasan (old y new)
- [ ] ✅ Feature flag configurado
- [ ] ✅ Rollback plan listo

### **Durante la migración:**
- [ ] ✅ Crear código nuevo en carpeta separada
- [ ] ✅ Tests de compatibilidad
- [ ] ✅ Activar solo en dev primero
- [ ] ✅ Probar manualmente
- [ ] ✅ Logging comparativo

### **Después de migrar:**
- [ ] ✅ Monitorear errores
- [ ] ✅ Comparar performance
- [ ] ✅ Feedback de usuarios
- [ ] ✅ Si todo OK → aumentar rollout

---

## 🎯 **PLAN DE EJECUCIÓN (4 semanas)**

### **Semana 1: Preparación (0% riesgo)**
- Crear estructura `/v2`
- Implementar feature flags
- Setup de testing
- **No tocar código existente**

### **Semana 2: Migrar hooks (5% riesgo)**
- Crear hooks nuevos en `/v2`
- Tests de compatibilidad
- Activar solo en dev
- Probar exhaustivamente

### **Semana 3: Migrar componentes (10% riesgo)**
- Crear Step3 nuevo en `/v2`
- Tests visuales
- Activar para 10% usuarios
- Monitorear

### **Semana 4: Rollout completo (15% riesgo)**
- Aumentar a 50% usuarios
- Si todo OK → 100%
- Documentar
- **Mantener código viejo 2 semanas más por seguridad**

---

## ✅ **GARANTÍAS DE SEGURIDAD**

1. ✅ **Código viejo intacto** - No se modifica hasta estar 100% seguros
2. ✅ **Rollback en 1 minuto** - Feature flag → false
3. ✅ **Tests automáticos** - Detectan incompatibilidades
4. ✅ **Monitoring** - Detecta errores en producción
5. ✅ **Rollout gradual** - No afectamos a todos los usuarios a la vez

---

## 🎬 **EJEMPLO PRÁCTICO: Primer Cambio**

### **Cambio más seguro para empezar:**
Extraer `useClienteFormState` (solo estado, sin lógica).

```javascript
// 1. Crear archivo nuevo
// src/hooks/clientes/v2/useClienteFormState.js
export const useClienteFormState = (initialData) => {
    const [formData, dispatch] = useReducer(formReducer, initialData);
    const [errors, setErrors] = useState({});
    return { formData, dispatch, errors, setErrors };
};

// 2. Test
test('useClienteFormState funciona', () => {
    const { result } = renderHook(() => useClienteFormState());
    expect(result.current.formData).toBeDefined();
});

// 3. No activar aún (feature flag en false)

// 4. Probar manualmente en consola:
// localStorage.setItem('enableNewHooks', 'true')

// 5. Si falla: localStorage.removeItem('enableNewHooks')
```

---

## 🤝 **CONCLUSIÓN**

Con esta estrategia:
- ✅ **Riesgo mínimo** (código viejo sigue funcionando)
- ✅ **Rollback instantáneo** (cambiar feature flag)
- ✅ **Testing exhaustivo** (antes de cada cambio)
- ✅ **Migración gradual** (no afectamos a todos)
- ✅ **Código limpio al final** (eliminamos viejo después)

**¿Quieres que empecemos con el Paso 1: Feature Flags y estructura `/v2`?**
