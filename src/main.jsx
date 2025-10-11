import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AuditProvider } from './context/AuditContext';

// Importaciones inmediatas (críticas para el inicio)
import Layout from './layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionProtectedRoute from './components/PermissionProtectedRoute';
import LoginPage from './pages/auth/LoginPage';

// Lazy loading de páginas (se cargan solo cuando se necesitan)
const UnauthorizedPage = lazy(() => import('./pages/auth/UnauthorizedPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Viviendas
const CrearVivienda = lazy(() => import('./pages/viviendas/CrearVivienda'));
const ListarViviendas = lazy(() => import('./pages/viviendas/ListarViviendas'));
const DetalleVivienda = lazy(() => import('./pages/viviendas/DetalleVivienda'));
const EditarVivienda = lazy(() => import('./pages/viviendas/EditarVivienda'));

// Clientes
const CrearCliente = lazy(() => import("./pages/clientes/CrearCliente"));
const ListarClientes = lazy(() => import('./pages/clientes/ListarClientes'));
const DetalleCliente = lazy(() => import('./pages/clientes/DetalleCliente'));

// Abonos
const ListarAbonos = lazy(() => import('./pages/abonos/ListarAbonos'));
const CrearAbono = lazy(() => import('./pages/abonos/CrearAbono'));
const GestionarAbonos = lazy(() => import('./pages/abonos/GestionarAbonos'));

// Renuncias
const ListarRenuncias = lazy(() => import('./pages/renuncias/ListarRenuncias'));
const DetalleRenuncia = lazy(() => import('./pages/renuncias/DetalleRenuncia'));

// Reportes
const ReportesPage = lazy(() => import('./pages/reportes/ReportesPage'));

// Admin
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const CrearUsuarioPage = lazy(() => import('./pages/admin/CrearUsuarioPage'));
const GestionRolesPage = lazy(() => import('./pages/admin/GestionRolesPage'));
const CrearProyecto = lazy(() => import('./pages/admin/CrearProyecto'));
const ListarProyectos = lazy(() => import('./pages/admin/ListarProyectos'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));
const AuditMetricsPage = lazy(() => import('./pages/admin/AuditMetricsPage'));

// Historial
const HistorialActividadPage = lazy(() => import('./pages/HistorialActividadPage'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">Cargando...</p>
    </div>
  </div>
);

// Definimos las rutas como un array de objetos
const router = createBrowserRouter([
  {
    path: "/login", // <-- 3. Ruta pública para el login
    element: <LoginPage />,
  },
  {
    path: "/",
    element: ( // <-- 4. Protegemos el Layout principal
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
      { path: "/unauthorized", element: <Suspense fallback={<PageLoader />}><UnauthorizedPage /></Suspense> },

      // Rutas de Viviendas
      { path: "/viviendas/listar", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="viviendas" action="ver"><ListarViviendas /></PermissionProtectedRoute></Suspense> },
      { path: "/viviendas/detalle/:viviendaId", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="viviendas" action="ver"><DetalleVivienda /></PermissionProtectedRoute></Suspense> },
      { path: "/viviendas/crear", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="viviendas" action="crear"><CrearVivienda /></PermissionProtectedRoute></Suspense> },
      { path: "/viviendas/editar/:viviendaId", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="viviendas" action="editar"><EditarVivienda /></PermissionProtectedRoute></Suspense> },

      // Rutas de Clientes
      { path: "/clientes/listar", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="clientes" action="ver"><ListarClientes /></PermissionProtectedRoute></Suspense> },
      { path: "/clientes/detalle/:clienteId", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="clientes" action="ver"><DetalleCliente /></PermissionProtectedRoute></Suspense> },
      { path: "/clientes/crear", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="clientes" action="crear"><CrearCliente /></PermissionProtectedRoute></Suspense> },
      { path: "/clientes", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="clientes" action="ver"><ListarClientes /></PermissionProtectedRoute></Suspense> },

      // Rutas de Abonos
      { path: "/abonos/listar", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="abonos" action="ver"><ListarAbonos /></PermissionProtectedRoute></Suspense> },
      { path: "/abonos/gestionar/:clienteId", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="abonos" action="crear"><GestionarAbonos /></PermissionProtectedRoute></Suspense> },
      { path: "/abonos", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="abonos" action="crear"><CrearAbono /></PermissionProtectedRoute></Suspense> },

      // Rutas de Renuncias
      { path: "/renuncias", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="renuncias" action="ver"><ListarRenuncias /></PermissionProtectedRoute></Suspense> },
      { path: "/renuncias/detalle/:renunciaId", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="renuncias" action="ver"><DetalleRenuncia /></PermissionProtectedRoute></Suspense> },

      // Ruta de Reportes
      { path: "/reportes", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="reportes" action="generar"><ReportesPage /></PermissionProtectedRoute></Suspense> },

      // Historial de Actividad
      { path: "/historial", element: <Suspense fallback={<PageLoader />}><HistorialActividadPage /></Suspense> },

      // Rutas de Administración
      { path: "/admin", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="admin" action="gestionarUsuarios"><AdminPage /></PermissionProtectedRoute></Suspense> },
      { path: "/admin/crear-usuario", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="admin" action="gestionarUsuarios"><CrearUsuarioPage /></PermissionProtectedRoute></Suspense> },
      { path: "/admin/roles", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="admin" action="gestionarRoles"><GestionRolesPage /></PermissionProtectedRoute></Suspense> },
      { path: "/admin/auditoria", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="admin" action="gestionarUsuarios"><AuditLogPage /></PermissionProtectedRoute></Suspense> },
      { path: "/admin/metricas", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="admin" action="gestionarUsuarios"><AuditMetricsPage /></PermissionProtectedRoute></Suspense> },
      { path: "/admin/proyectos", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="admin" action="listarProyectos"><ListarProyectos /></PermissionProtectedRoute></Suspense> },
      { path: "/admin/proyectos/crear", element: <Suspense fallback={<PageLoader />}><PermissionProtectedRoute module="admin" action="crearProyectos"><CrearProyecto /></PermissionProtectedRoute></Suspense> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Toaster
        position="top-right"
        containerStyle={{
          top: 85,
          right: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'transparent',
            boxShadow: 'none',
            padding: 0,
            margin: 0,
          },
        }}
        containerClassName="!top-20 !right-4"
      />
      <AuthProvider>
        <DataProvider>
          <AuditProvider>
            <NotificationProvider>
              <RouterProvider router={router} />
            </NotificationProvider>
          </AuditProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);