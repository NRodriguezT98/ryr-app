# CONTEXT.md: Manual de Arquitectura y Colaboración para la IA (RyR App)

Este documento es la "única fuente de verdad" para cualquier asistente de IA que trabaje en este proyecto. Es crucial leerlo por completo y adherirse estrictamente a sus reglas antes de escribir o modificar cualquier línea de código.

## 1. Misión (El "Por Qué")

El objetivo de este documento es permitir una colaboración fluida y eficiente, eliminando la pérdida de contexto entre conversaciones. Al seguir estas directrices, la IA actuará como un desarrollador senior con pleno conocimiento del historial, la arquitectura y las reglas de negocio de la aplicación.

---

## 2. Filosofía de Arquitectura (La Regla de Oro Inquebrantable)

La arquitectura de esta aplicación se basa en una estricta **separación de la lógica y las vistas**. No es una sugerencia, es la **única** forma de trabajar en este proyecto.

### El Hook de Lógica (El "Cerebro")
Toda la lógica de negocio, manejo de estado (`useState`, `useMemo`, `useEffect`), validaciones y llamadas a la base de datos para un componente o vista DEBEN estar encapsulados en un **hook personalizado**.

* **Responsabilidades**:
    * Gestionar el estado local (filtros, modales abiertos, etc.).
    * Obtener datos del `DataContext`.
    * Procesar y filtrar los datos para la vista.
    * Contener los `handlers` (ej: `handleSave`, `handleDelete`) que llaman a las funciones de `storage.js`.
* **Ejemplo**: El componente `ListarClientes.jsx` es controlado en su totalidad por el hook `useListarClientes.jsx`.

### El Componente de Vista (El "Esqueleto")
Los componentes de React (archivos `.jsx` en `pages/` y `components/`) deben ser "tontos" (presentacionales).

* **Responsabilidades**:
    * Llamar a su hook de lógica correspondiente.
    * Usar los datos y funciones que el hook le provee para renderizar el JSX.
    * No deben contener lógica de negocio, cálculos complejos ni llamadas directas a `storage`.
* **Ejemplo**: `ListarClientes.jsx` recibe `clientesVisibles` y `handlers` del hook y se limita a mapear la lista y asignar las funciones a los botones.

---

## 3. Lógica de Negocio Crítica (Las Reglas del Juego)

Hemos implementado reglas de negocio muy específicas que deben ser respetadas en todo momento.

### Ciclo de Vida del Cliente (La Fuente de Verdad)
El `status` de un cliente es la única fuente de verdad sobre su estado. El ciclo es el siguiente:
1.  **`activo`**: Cliente en un proceso de compra activo. **Siempre** tiene una `viviendaId` asociada.
2.  **`enProcesoDeRenuncia`**: El cliente ha iniciado una renuncia, pero la devolución está pendiente. Su información está "congelada".
3.  **`renunciado`**: El cliente completó un ciclo de renuncia. No tiene `viviendaId`. Es un prospecto para una nueva venta.
4.  **`inactivo`**: El cliente ha sido archivado administrativamente. Es un registro histórico.

### El Módulo de Proceso
-   **Hitos (`esHito`)**: Ciertos pasos del proceso (`minutaFirmada`, `facturaVenta`, etc.) son "puntos de no retorno". Una vez completados, acciones como "Renunciar" o "Editar Pasos Anteriores" se bloquean permanentemente.
-   **Pasos Automáticos**: Los pasos de "desembolso" se completan automáticamente cuando se registra un abono de la fuente correspondiente.
-   **Bloqueo de Factura**: El paso "Factura de Venta" no se puede completar si la vivienda aún tiene `saldoPendiente > 0`.

### El Módulo de Abonos y Finanzas
-   **Condonación de Saldo**: Es un "abono" especial con `metodoPago: 'Condonación de Saldo'`. Solo se puede aplicar a la `cuotaInicial` y se registra como un pago más a esa fuente.
-   **Cálculo de Devoluciones**: Al procesar una renuncia, el monto a devolver se calcula sumando **únicamente** los abonos que **no son** condonaciones.

### El Módulo de Renuncias
-   **"Cápsula del Tiempo"**: Al renunciar, se crea un registro en la colección `renuncias` que archiva una copia de todos los documentos, el cierre financiero y los datos de la vivienda de ese ciclo. Esto crea un historial inmutable.
-   **Cancelación vs. Reactivación**: `cancelarRenuncia` es para revertir un error (si la vivienda sigue libre). `Iniciar Nuevo Proceso` (reactivar) es para un cliente `renunciado` que quiere empezar una compra nueva.

### Lógica de Borrado
-   **Borrado Físico (`deleteCliente`)**: Solo se permite si un cliente no tiene **ningún historial** (ni vivienda, ni abonos, ni renuncias).
-   **Borrado Lógico (`inactivarCliente`)**: Si un cliente tiene historial, se "archiva" (`status: 'inactivo'`) para preservar la integridad de los registros.

---

## 4. Protocolo de Interacción (Nuestra Forma de Trabajar)

-   **1. Código Completo y Sin Omisiones**: Cuando modifiques un archivo, SIEMPRE proporciona el código completo. NUNCA uses `// ...`.
-   **2. Referencias de Archivo Precisas**: Usa siempre la ruta completa (`src/...`).
-   **3. Explicar Antes de Codificar**: Proporciona un breve análisis del problema y la solución antes del código.
-   **4. Trabajar Sobre el Código Base**: Si la solicitud es para modificar un archivo existente, **espera a que yo te proporcione el código actual**. Tu tarea es usar ESE código como base.

---

## 5. Estructura de Archivos del Proyecto
C:\USERS\N_ROD\DOCUMENTS\PYTHON\RYR-APP\SRC
¦   App.css
¦   index.css
¦   main.jsx
¦   
+---assets
¦       1.png
¦       2.png
¦       Client.png
¦       Home.png
¦       logo1-dark.png
¦       logo1.png
¦       logo2-dark.png
¦       logo2.png
¦       logoRyR.png
¦       pieDePagina.png
¦       react.svg
¦       
+---components
¦   ¦   AnimatedPage.jsx
¦   ¦   Button.jsx
¦   ¦   ErrorBoundary.jsx
¦   ¦   FileUpload.jsx
¦   ¦   HelpTooltip.jsx
¦   ¦   Modal.jsx
¦   ¦   ModalConfirmacion.jsx
¦   ¦   Navbar.jsx
¦   ¦   ThemeSwitcher.jsx
¦   ¦   UndoToast.jsx
¦   ¦   
¦   +---dashboard
¦   ¦       ActivityItem.jsx
¦   ¦       BarChartIngresos.jsx
¦   ¦       DocumentosPendientes.jsx
¦   ¦       GraficoOcupacion.jsx
¦   ¦       RenunciasPendientes.jsx
¦   ¦       StatCard.jsx
¦   ¦       
¦   +---documentos
¦   ¦       DocumentoCard.jsx
¦   ¦       DocumentoRow.jsx
¦   ¦       
¦   +---notifications
¦           NotificationItem.jsx
¦           
+---context
¦       DataContext.jsx
¦       NotificationContext.jsx
¦       ThemeContext.jsx
¦       
+---firebase
¦       config.js
¦       
+---hooks
¦   ¦   useAbonosFilters.jsx
¦   ¦   useDashboardStats.jsx
¦   ¦   useForm.jsx
¦   ¦   useListarRenuncias.jsx
¦   ¦   useTheme.js
¦   ¦   useUndoableDelete.jsx
¦   ¦   
¦   +---abonos
¦   ¦       useAbonoForm.jsx
¦   ¦       useGestionarAbonos.jsx
¦   ¦       
¦   +---clientes
¦   ¦       useClienteCardLogic.jsx
¦   ¦       useClienteFinanciero.jsx
¦   ¦       useClienteForm.jsx
¦   ¦       useDetalleCliente.jsx
¦   ¦       useDocumentacion.jsx
¦   ¦       useListarClientes.jsx
¦   ¦       useMotivoRenuncia.jsx
¦   ¦       useProcesoLogic.jsx
¦   ¦       useSeguimientoLogic.jsx
¦   ¦       
¦   +---renuncias
¦   ¦       useEditarRenuncia.jsx
¦   ¦       useGestionarDevolucion.jsx
¦   ¦       
¦   +---viviendas
¦           useCondonarSaldo.jsx
¦           useCrearVivienda.jsx
¦           useDescuentoModal.jsx
¦           useDetalleVivienda.jsx
¦           useEditarVivienda.jsx
¦           useListarViviendas.jsx
¦           
+---layout
¦       Layout.jsx
¦       ResourcePageLayout.jsx
¦       
+---pages
¦   ¦   DashboardPage.jsx
¦   ¦   
¦   +---abonos
¦   ¦       AbonoCard.jsx
¦   ¦       AbonoCardSkeleton.jsx
¦   ¦       CrearAbono.jsx
¦   ¦       EditarAbono.jsx
¦   ¦       EditarAbonoModal.jsx
¦   ¦       FormularioAbono.jsx
¦   ¦       FuenteDePagoCard.jsx
¦   ¦       GestionarAbonos.jsx
¦   ¦       HistorialAbonos.jsx
¦   ¦       ListarAbonos.jsx
¦   ¦       
¦   +---clientes
¦   ¦   ¦   ClienteCard.jsx
¦   ¦   ¦   ClienteCardSkeleton.jsx
¦   ¦   ¦   CrearCliente.jsx
¦   ¦   ¦   DetalleCliente.jsx
¦   ¦   ¦   EditarCliente.jsx
¦   ¦   ¦   FormularioCliente.jsx
¦   ¦   ¦   ListarClientes.jsx
¦   ¦   ¦   
¦   ¦   +---components
¦   ¦   ¦       ClienteDetailView.jsx
¦   ¦   ¦       ClienteEstadoView.jsx
¦   ¦   ¦       ClienteListItem.jsx
¦   ¦   ¦       ModalEditarFechaProceso.jsx
¦   ¦   ¦       ModalMotivoRenuncia.jsx
¦   ¦   ¦       PasoProcesoCard.jsx
¦   ¦   ¦       SeguimientoCliente.jsx
¦   ¦   ¦       TabDocumentacionCliente.jsx
¦   ¦   ¦       TabInfoGeneralCliente.jsx
¦   ¦   ¦       TabProcesoCliente.jsx
¦   ¦   ¦       
¦   ¦   +---wizard
¦   ¦           Step1_SelectVivienda.jsx
¦   ¦           Step2_ClientInfo.jsx
¦   ¦           Step3_Financial.jsx
¦   ¦           
¦   +---renuncias
¦   ¦   ¦   DetalleRenuncia.jsx
¦   ¦   ¦   ListarRenuncias.jsx
¦   ¦   ¦   
¦   ¦   +---components
¦   ¦           ModalEditarRenuncia.jsx
¦   ¦           ModalGestionarDevolucion.jsx
¦   ¦           RenunciaCard.jsx
¦   ¦           
¦   +---viviendas
¦       ¦   CondonarSaldoModal.jsx
¦       ¦   CrearVivienda.jsx
¦       ¦   DescuentoModal.jsx
¦       ¦   DetalleVivienda.jsx
¦       ¦   EditarVivienda.jsx
¦       ¦   FormularioVivienda.jsx
¦       ¦   ListarViviendas.jsx
¦       ¦   ViviendaCard.jsx
¦       ¦   ViviendaCardSkeleton.jsx
¦       ¦   
¦       +---components
¦       ¦       FinancialBreakdownCard.jsx
¦       ¦       TabFinanciero.jsx
¦       ¦       TabInformacion.jsx
¦       ¦       
¦       +---wizard
¦               Step1_Ubicacion.jsx
¦               Step2_InfoLegal.jsx
¦               Step3_Valor.jsx
¦               
+---schemas
+---scripts
¦       migrarViviendas.js
¦       
+---utils
        documentacionConfig.js
        pdfGenerator.js
        procesoConfig.js
        seguimientoConfig.js
        statusHelper.jsx
        storage.js
        textFormatters.js
        validation.js
        
