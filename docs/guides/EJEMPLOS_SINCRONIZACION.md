# 🎯 Ejemplos Prácticos de Sincronización

## 📋 Introducción

Este documento contiene **ejemplos concretos** de cómo implementar sincronización de datos en diferentes escenarios comunes de tu aplicación.

---

## 🏠 Módulo de Viviendas

### Caso 1: Crear Nueva Vivienda

**Service** (`viviendaService.js`):
```javascript
export const crearVivienda = async (datosVivienda) => {
    try {
        // 1. Escribir a Firestore
        const docRef = await addDoc(collection(db, "viviendas"), {
            ...datosVivienda,
            estado: 'disponible',
            clienteActual: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // 2. Auditoría
        await createAuditLog('CREATE_VIVIENDA', {
            viviendaId: docRef.id,
            datos: datosVivienda
        });

        // 3. FIN - Firestore sincronizará automáticamente
        return docRef.id;

    } catch (error) {
        console.error('Error al crear vivienda:', error);
        throw error;
    }
};
```

**Hook** (`useCrearVivienda.jsx`):
```javascript
export const useCrearVivienda = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleCrear = async (datosVivienda) => {
        setIsSubmitting(true);
        
        try {
            // Crear en Firestore
            const viviendaId = await crearVivienda(datosVivienda);
            
            // Feedback inmediato
            toast.success('Vivienda creada exitosamente');
            
            // Navegar (la página destino recibirá datos actualizados)
            navigate(`/viviendas/${viviendaId}`);
            
            // NO recargar - Los listeners lo hacen automáticamente
            
        } catch (error) {
            toast.error('Error al crear vivienda');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { handleCrear, isSubmitting };
};
```

**Componente** (`CrearVivienda.jsx`):
```javascript
export const CrearVivienda = () => {
    const { handleCrear, isSubmitting } = useCrearVivienda();
    const [formData, setFormData] = useState({});

    const onSubmit = async (e) => {
        e.preventDefault();
        await handleCrear(formData);
        // La lista se actualizará automáticamente vía onSnapshot
    };

    return (
        <form onSubmit={onSubmit}>
            {/* Campos del formulario */}
            <button disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Crear Vivienda'}
            </button>
        </form>
    );
};
```

---

### Caso 2: Editar Vivienda

**Service**:
```javascript
export const actualizarVivienda = async (viviendaId, cambios) => {
    try {
        const viviendaRef = doc(db, "viviendas", viviendaId);
        
        // Validar existencia
        const viviendaSnap = await getDoc(viviendaRef);
        if (!viviendaSnap.exists()) {
            throw new Error("La vivienda no existe");
        }

        // Actualizar
        await updateDoc(viviendaRef, {
            ...cambios,
            updatedAt: serverTimestamp()
        });

        // Auditoría con diferencias
        const anterior = viviendaSnap.data();
        await createAuditLog('UPDATE_VIVIENDA', {
            viviendaId,
            cambios: detectarCambios(anterior, cambios)
        });

        // FIN - Sincronización automática

    } catch (error) {
        console.error('Error al actualizar vivienda:', error);
        throw error;
    }
};
```

**Hook**:
```javascript
export const useEditarVivienda = (viviendaId) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGuardar = async (cambios) => {
        setIsSubmitting(true);
        
        try {
            await actualizarVivienda(viviendaId, cambios);
            toast.success('Cambios guardados');
            // La vivienda se actualizará automáticamente en la lista
            
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { handleGuardar, isSubmitting };
};
```

---

## 👥 Módulo de Clientes

### Caso 3: Asignar Cliente a Vivienda

**Service**:
```javascript
export const asignarVivienda = async (clienteId, viviendaId, datosFinancieros) => {
    // Usar transacción para garantizar atomicidad
    await runTransaction(db, async (transaction) => {
        // Leer estados actuales
        const clienteRef = doc(db, 'clientes', clienteId);
        const viviendaRef = doc(db, 'viviendas', viviendaId);
        
        const clienteSnap = await transaction.get(clienteRef);
        const viviendaSnap = await transaction.get(viviendaRef);

        if (!clienteSnap.exists()) throw new Error('Cliente no existe');
        if (!viviendaSnap.exists()) throw new Error('Vivienda no existe');

        const vivienda = viviendaSnap.data();
        if (vivienda.estado !== 'disponible') {
            throw new Error('Vivienda no disponible');
        }

        // Actualizar ambos documentos atómicamente
        transaction.update(clienteRef, {
            viviendaId: viviendaId,
            estado: 'activo',
            datosFinancieros: {
                ...datosFinancieros,
                fechaAsignacion: serverTimestamp()
            },
            updatedAt: serverTimestamp()
        });

        transaction.update(viviendaRef, {
            estado: 'ocupada',
            clienteActual: clienteId,
            updatedAt: serverTimestamp()
        });

        // Auditoría
        // ... (fuera de transaction si es posible)
    });

    // Los listeners actualizarán tanto clientes como viviendas
};
```

**Hook**:
```javascript
export const useAsignarVivienda = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { clientes, viviendas } = useData(); // Sincronizados automáticamente

    const handleAsignar = async (clienteId, viviendaId, datos) => {
        setIsSubmitting(true);
        
        try {
            await asignarVivienda(clienteId, viviendaId, datos);
            
            toast.success('Vivienda asignada exitosamente');
            
            // NO recargar - La transacción disparará listeners
            // que actualizarán tanto clientes como viviendas
            
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { handleAsignar, isSubmitting, clientes, viviendas };
};
```

---

### Caso 4: Renuncia con Múltiples Actualizaciones

**Service** (`clienteRenuncia.js`):
```javascript
export const procesarRenuncia = async (clienteId, motivoRenuncia, userName) => {
    // Transacción compleja que afecta múltiples colecciones
    await runTransaction(db, async (transaction) => {
        // 1. Leer todo lo necesario
        const clienteRef = doc(db, 'clientes', clienteId);
        const clienteSnap = await transaction.get(clienteRef);
        
        if (!clienteSnap.exists()) {
            throw new Error('Cliente no existe');
        }

        const cliente = clienteSnap.data();
        const viviendaId = cliente.viviendaId;
        const viviendaRef = doc(db, 'viviendas', viviendaId);

        // 2. Consultar abonos del ciclo
        const abonosQuery = query(
            collection(db, 'abonos'),
            where('clienteId', '==', clienteId),
            where('estado', '==', 'activo')
        );
        const abonosSnap = await getDocs(abonosQuery);
        const abonos = abonosSnap.docs.map(d => ({
            id: d.id,
            ...d.data()
        }));

        // 3. Calcular devolución
        const totalAbonado = abonos.reduce((sum, a) => 
            sum + (a.abonoInicial || 0) + (a.abonosAdicionales || 0), 0
        );

        // 4. Crear documento de renuncia
        const renunciaRef = doc(collection(db, 'renuncias'));
        transaction.set(renunciaRef, {
            clienteId,
            viviendaId,
            motivo: motivoRenuncia,
            abonosOriginales: abonos,
            devolucionCalculada: totalAbonado * 0.8, // 20% penalización
            estadoDevolucion: 'pendiente',
            fechaRenuncia: serverTimestamp(),
            procesadoPor: userName
        });

        // 5. Actualizar cliente
        transaction.update(clienteRef, {
            estado: 'en_proceso_renuncia',
            renunciaId: renunciaRef.id,
            updatedAt: serverTimestamp()
        });

        // 6. Liberar vivienda
        transaction.update(viviendaRef, {
            estado: 'disponible',
            clienteActual: null,
            updatedAt: serverTimestamp()
        });

        // 7. Archivar abonos
        abonosSnap.docs.forEach(abonoDoc => {
            transaction.update(abonoDoc.ref, {
                estado: 'archivado_por_renuncia',
                archivedAt: serverTimestamp()
            });
        });
    });

    // Auditoría fuera de la transacción
    await createClientAuditLog('RENUNCIA', clienteId, {
        motivo: motivoRenuncia,
        usuario: userName
    });

    // FIN - Los listeners de clientes, viviendas, abonos y renuncias
    // se actualizarán automáticamente
};
```

**Hook**:
```javascript
export const useProcessarRenuncia = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { userName } = useAuth();

    const handleRenuncia = async (clienteId, motivo) => {
        setIsProcessing(true);
        
        try {
            await procesarRenuncia(clienteId, motivo, userName);
            
            toast.success('Renuncia procesada exitosamente');
            
            // NO recargar - onSnapshot detectará todos los cambios:
            // - Cliente cambia a "en_proceso_renuncia"
            // - Vivienda cambia a "disponible"
            // - Abonos se archivan
            // - Nueva renuncia aparece en /renuncias
            
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return { handleRenuncia, isProcessing };
};
```

---

## 💰 Módulo de Abonos

### Caso 5: Registrar Nuevo Abono

**Service**:
```javascript
export const registrarAbono = async (clienteId, datosAbono) => {
    try {
        // Validar cliente
        const clienteRef = doc(db, 'clientes', clienteId);
        const clienteSnap = await getDoc(clienteRef);
        
        if (!clienteSnap.exists()) {
            throw new Error('Cliente no existe');
        }

        const cliente = clienteSnap.data();
        if (cliente.estado !== 'activo') {
            throw new Error('Cliente no está activo');
        }

        // Crear abono
        const abonoRef = await addDoc(collection(db, 'abonos'), {
            clienteId,
            viviendaId: cliente.viviendaId,
            ...datosAbono,
            estado: 'activo',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Actualizar totales del cliente
        await updateDoc(clienteRef, {
            'datosFinancieros.totalAbonado': increment(datosAbono.monto),
            updatedAt: serverTimestamp()
        });

        // Auditoría
        await createClientAuditLog('REGISTER_ABONO', clienteId, {
            abonoId: abonoRef.id,
            monto: datosAbono.monto
        });

        return abonoRef.id;

    } catch (error) {
        console.error('Error al registrar abono:', error);
        throw error;
    }
};
```

**Hook**:
```javascript
export const useRegistrarAbono = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { abonos } = useData(); // Sincronizados automáticamente

    const handleRegistrar = async (clienteId, datos) => {
        setIsSubmitting(true);
        
        try {
            await registrarAbono(clienteId, datos);
            toast.success('Abono registrado');
            
            // Los listeners actualizarán:
            // - Lista de abonos (nuevo abono aparece)
            // - Datos del cliente (total abonado actualizado)
            // - Dashboard (estadísticas actualizadas)
            
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { handleRegistrar, isSubmitting, abonos };
};
```

---

### Caso 6: Anular Abono (Operación Reversible)

**Service**:
```javascript
export const anularAbono = async (abonoId, motivo, userName) => {
    await runTransaction(db, async (transaction) => {
        // Leer abono
        const abonoRef = doc(db, 'abonos', abonoId);
        const abonoSnap = await transaction.get(abonoRef);
        
        if (!abonoSnap.exists()) {
            throw new Error('Abono no existe');
        }

        const abono = abonoSnap.data();
        
        if (abono.estado !== 'activo') {
            throw new Error('El abono ya fue anulado');
        }

        // Actualizar abono
        transaction.update(abonoRef, {
            estado: 'anulado',
            motivoAnulacion: motivo,
            anuladoPor: userName,
            fechaAnulacion: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        // Revertir totales del cliente
        const clienteRef = doc(db, 'clientes', abono.clienteId);
        transaction.update(clienteRef, {
            'datosFinancieros.totalAbonado': increment(-abono.monto),
            updatedAt: serverTimestamp()
        });
    });

    // Auditoría
    await createClientAuditLog('ANULAR_ABONO', abonoId, {
        motivo,
        usuario: userName
    });

    // Listeners actualizarán abonos y cliente
};
```

---

## 📊 Dashboard con Estadísticas en Tiempo Real

### Caso 7: Dashboard Reactivo

**Hook** (`useDashboardStats.jsx`):
```javascript
export const useDashboardStats = () => {
    const { clientes, viviendas, abonos } = useData();
    
    // Estadísticas calculadas en tiempo real
    const stats = useMemo(() => {
        return {
            // Clientes
            totalClientes: clientes.length,
            clientesActivos: clientes.filter(c => c.estado === 'activo').length,
            clientesEnProceso: clientes.filter(c => c.estado === 'en_proceso').length,
            
            // Viviendas
            totalViviendas: viviendas.length,
            viviendasDisponibles: viviendas.filter(v => v.estado === 'disponible').length,
            viviendasOcupadas: viviendas.filter(v => v.estado === 'ocupada').length,
            
            // Finanzas
            totalAbonado: abonos
                .filter(a => a.estado === 'activo')
                .reduce((sum, a) => sum + a.monto, 0),
            
            // Proyectos (top 3)
            proyectosConMasClientes: calcularTopProyectos(clientes, viviendas)
        };
    }, [clientes, viviendas, abonos]);
    
    // Las estadísticas se recalculan automáticamente cuando
    // cualquier listener detecta cambios en clientes, viviendas o abonos
    
    return stats;
};
```

**Componente** (`Dashboard.jsx`):
```javascript
export const Dashboard = () => {
    const stats = useDashboardStats();
    const { loadAllCollections, loadingStates } = useData();
    
    // Cargar todas las colecciones necesarias
    useEffect(() => {
        loadAllCollections();
    }, []);
    
    // Mostrar skeleton solo en carga inicial
    if (loadingStates.clientes && stats.totalClientes === 0) {
        return <DashboardSkeleton />;
    }
    
    return (
        <div className="dashboard">
            <StatCard
                title="Total Clientes"
                value={stats.totalClientes}
                subtitle={`${stats.clientesActivos} activos`}
            />
            
            <StatCard
                title="Viviendas"
                value={stats.totalViviendas}
                subtitle={`${stats.viviendasDisponibles} disponibles`}
            />
            
            <StatCard
                title="Total Abonado"
                value={formatCurrency(stats.totalAbonado)}
            />
            
            {/* Estas estadísticas se actualizan automáticamente
                cuando se registran nuevos abonos, clientes, etc. */}
        </div>
    );
};
```

---

## 🔄 Sincronización entre Múltiples Usuarios

### Caso 8: Edición Concurrente

**Escenario:** Dos usuarios editando el mismo cliente simultáneamente

```javascript
// Usuario A y Usuario B están en la misma página de edición

// Usuario A guarda cambios
await updateDoc(doc(db, 'clientes', '123'), {
    telefono: '555-1234'
});

// Usuario B guarda cambios 2 segundos después
await updateDoc(doc(db, 'clientes', '123'), {
    email: 'nuevo@email.com'
});

// ✅ Resultado: Ambos listeners reciben el estado final
// Cliente tendrá AMBOS cambios:
// - telefono: '555-1234' (de Usuario A)
// - email: 'nuevo@email.com' (de Usuario B)

// ⚠️ Si ambos editaran el MISMO campo, el último gana
// Para evitarlo, usar transacciones o server-side merge
```

**Solución para campos conflictivos:**
```javascript
export const actualizarClienteSeguro = async (clienteId, cambios) => {
    await runTransaction(db, async (transaction) => {
        const clienteRef = doc(db, 'clientes', clienteId);
        const clienteSnap = await transaction.get(clienteRef);
        
        if (!clienteSnap.exists()) {
            throw new Error('Cliente no existe');
        }
        
        const clienteActual = clienteSnap.data();
        
        // Merge inteligente: solo actualizar si no ha cambiado
        const mergedData = {};
        
        for (const [key, value] of Object.entries(cambios)) {
            // Verificar si el valor base cambió
            if (clienteActual[key] === cambios.valorBase?.[key]) {
                mergedData[key] = value;
            } else {
                // El campo cambió desde que se cargó
                throw new Error(`El campo ${key} fue modificado por otro usuario`);
            }
        }
        
        transaction.update(clienteRef, {
            ...mergedData,
            updatedAt: serverTimestamp()
        });
    });
};
```

---

## 🔍 Búsqueda y Filtros en Tiempo Real

### Caso 9: Lista Filtrada Sincronizada

**Hook**:
```javascript
export const useClientesFiltrados = () => {
    const { clientes } = useData(); // Sincronizados automáticamente
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [projectFilter, setProjectFilter] = useState('todos');

    // Filtros memoizados que se recalculan cuando cambian:
    // - Los datos (vía listeners)
    // - Los filtros (vía setState)
    const clientesFiltrados = useMemo(() => {
        return clientes.filter(cliente => {
            // Búsqueda por texto
            const matchesSearch = !searchTerm || 
                cliente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cliente.numeroDocumento.includes(searchTerm);
            
            // Filtro por estado
            const matchesStatus = statusFilter === 'todos' || 
                cliente.estado === statusFilter;
            
            // Filtro por proyecto
            const matchesProject = projectFilter === 'todos' || 
                cliente.proyectoId === projectFilter;
            
            return matchesSearch && matchesStatus && matchesProject;
        });
    }, [clientes, searchTerm, statusFilter, projectFilter]);

    return {
        clientes: clientesFiltrados,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        projectFilter,
        setProjectFilter
    };
};
```

**Componente**:
```javascript
export const ListaClientes = () => {
    const {
        clientes,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter
    } = useClientesFiltrados();

    return (
        <div>
            <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
            />
            
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="todos">Todos</option>
                <option value="activo">Activos</option>
                <option value="en_proceso">En Proceso</option>
            </select>

            {/* La lista se actualiza automáticamente cuando:
                1. Se cambian los filtros (setState)
                2. Se modifica un cliente (onSnapshot) */}
            
            {clientes.map(cliente => (
                <ClienteCard key={cliente.id} cliente={cliente} />
            ))}
        </div>
    );
};
```

---

## 🎨 UI Patterns

### Caso 10: Modal de Edición con Sincronización

**Hook**:
```javascript
export const useEditarClienteModal = (clienteId) => {
    const { maps } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Obtener cliente desde map (O(1))
    const cliente = maps.clientes.get(clienteId);

    const handleGuardar = async (cambios) => {
        setIsSubmitting(true);
        
        try {
            await updateDoc(doc(db, 'clientes', clienteId), {
                ...cambios,
                updatedAt: serverTimestamp()
            });
            
            toast.success('Cambios guardados');
            
            // NO necesitas cerrar el modal inmediatamente
            // El listener actualizará los datos del cliente
            // y el modal mostrará la info actualizada
            
            // Opcionalmente cerrar después de guardado
            return true; // Indicar éxito para cerrar modal
            
        } catch (error) {
            toast.error(error.message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { cliente, handleGuardar, isSubmitting };
};
```

**Componente**:
```javascript
export const ModalEditarCliente = ({ clienteId, isOpen, onClose }) => {
    const { cliente, handleGuardar, isSubmitting } = useEditarClienteModal(clienteId);
    const [formData, setFormData] = useState({});

    // Sincronizar formData con cliente cuando cambia
    useEffect(() => {
        if (cliente) {
            setFormData({
                nombres: cliente.nombres,
                apellidos: cliente.apellidos,
                telefono: cliente.telefono,
                // ... otros campos
            });
        }
    }, [cliente]); // Se actualiza cuando el listener detecta cambios

    const onSubmit = async (e) => {
        e.preventDefault();
        const success = await handleGuardar(formData);
        if (success) {
            onClose();
        }
    };

    if (!cliente) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={onSubmit}>
                <input
                    value={formData.nombres}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        nombres: e.target.value
                    }))}
                />
                
                {/* Más campos... */}
                
                <button disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
            </form>
        </Modal>
    );
};
```

---

## 🚨 Manejo de Errores

### Caso 11: Operación que Puede Fallar

```javascript
export const useEliminarVivienda = () => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEliminar = async (viviendaId) => {
        setIsDeleting(true);
        
        try {
            // Validación previa
            const viviendaRef = doc(db, 'viviendas', viviendaId);
            const viviendaSnap = await getDoc(viviendaRef);
            
            if (!viviendaSnap.exists()) {
                throw new Error('Vivienda no encontrada');
            }

            const vivienda = viviendaSnap.data();
            
            if (vivienda.estado === 'ocupada') {
                throw new Error('No se puede eliminar una vivienda ocupada');
            }

            // Eliminar
            await deleteDoc(viviendaRef);
            
            toast.success('Vivienda eliminada');
            
            // Listener removerá la vivienda de la lista automáticamente
            
        } catch (error) {
            // Manejo de errores específicos
            if (error.code === 'permission-denied') {
                toast.error('No tienes permisos para eliminar viviendas');
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error('Error al eliminar vivienda');
                console.error(error);
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return { handleEliminar, isDeleting };
};
```

---

## 📱 Optimistic UI (Opcional)

### Caso 12: Toggle Favorito con Optimistic Update

```javascript
export const useToggleFavorito = () => {
    const { clientes } = useData();
    const [optimisticFavoritos, setOptimisticFavoritos] = useState(new Set());

    const toggle = async (clienteId, esFavorito) => {
        // 1. Actualizar UI inmediatamente (optimistic)
        setOptimisticFavoritos(prev => {
            const next = new Set(prev);
            esFavorito ? next.add(clienteId) : next.delete(clienteId);
            return next;
        });

        // 2. Escribir a Firestore en segundo plano
        try {
            await updateDoc(doc(db, 'clientes', clienteId), {
                favorito: esFavorito,
                updatedAt: serverTimestamp()
            });

            // 3. El listener sincronizará el estado real
            // En 100-300ms el estado optimistic convergerá con el real

        } catch (error) {
            // 4. Revertir si falla
            setOptimisticFavoritos(prev => {
                const next = new Set(prev);
                esFavorito ? next.delete(clienteId) : next.add(clienteId);
                return next;
            });

            toast.error('Error al actualizar favorito');
            console.error(error);
        }
    };

    // Combinar estado optimistic con datos reales
    const clientesConFavoritos = useMemo(() => {
        return clientes.map(cliente => ({
            ...cliente,
            favorito: optimisticFavoritos.has(cliente.id) || cliente.favorito
        }));
    }, [clientes, optimisticFavoritos]);

    return { clientes: clientesConFavoritos, toggleFavorito: toggle };
};
```

---

## 🎓 Resumen de Patrones

### ✅ Patrón de Servicio
```javascript
export const mutateData = async (id, data) => {
    try {
        await firebaseOperation();
        await auditLog();
        return result;
    } catch (error) {
        throw error;
    }
    // NO recargar - Los listeners lo hacen
};
```

### ✅ Patrón de Hook
```javascript
export const useMutation = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data } = useData(); // Siempre sincronizado

    const handleMutate = async (params) => {
        setIsSubmitting(true);
        try {
            await service();
            toast.success('Éxito');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { data, handleMutate, isSubmitting };
};
```

### ✅ Patrón de Componente
```javascript
export const Component = () => {
    const { data, handleAction, isLoading } = useHook();

    return (
        <div>
            {data.map(item => (
                <Card key={item.id} item={item} />
            ))}
        </div>
    );
    // Los datos se actualizan automáticamente
};
```

---

**Fecha de Creación:** 2025-01-14  
**Estado:** ✅ Guía de Referencia Rápida
