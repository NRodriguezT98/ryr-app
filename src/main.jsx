import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

// Importación de todos tus componentes de página
import Layout from './layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionProtectedRoute from './components/PermissionProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import UnauthorizedPage from './pages/auth/UnauthorizedPage';
import DashboardPage from './pages/DashboardPage';
import CrearVivienda from './pages/viviendas/CrearVivienda';
import ListarViviendas from './pages/viviendas/ListarViviendas';
import DetalleVivienda from './pages/viviendas/DetalleVivienda';
import EditarVivienda from './pages/viviendas/EditarVivienda';
import CrearCliente from "./pages/clientes/CrearCliente";
import ListarClientes from './pages/clientes/ListarClientes';
import DetalleCliente from './pages/clientes/DetalleCliente';
import ListarAbonos from './pages/abonos/ListarAbonos';
import CrearAbono from './pages/abonos/CrearAbono';
import GestionarAbonos from './pages/abonos/GestionarAbonos';
import ListarRenuncias from './pages/renuncias/ListarRenuncias';
import DetalleRenuncia from './pages/renuncias/DetalleRenuncia';
import ReportesPage from './pages/reportes/ReportesPage';
import AdminPage from './pages/admin/AdminPage';
import CrearUsuarioPage from './pages/admin/CrearUsuarioPage';
import GestionRolesPage from './pages/admin/GestionRolesPage';
import CrearProyecto from './pages/admin/CrearProyecto'
import ListarProyectos from './pages/admin/ListarProyectos';
import AuditLogPage from './pages/admin/AuditLogPage';

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
      { index: true, element: <DashboardPage /> },
      { path: "/unauthorized", element: <UnauthorizedPage /> },

      // Rutas de Viviendas
      { path: "/viviendas/listar", element: <PermissionProtectedRoute module="viviendas" action="ver"><ListarViviendas /></PermissionProtectedRoute> },
      { path: "/viviendas/detalle/:viviendaId", element: <PermissionProtectedRoute module="viviendas" action="ver"><DetalleVivienda /></PermissionProtectedRoute> },
      { path: "/viviendas/crear", element: <PermissionProtectedRoute module="viviendas" action="crear"><CrearVivienda /></PermissionProtectedRoute> },
      { path: "/viviendas/editar/:viviendaId", element: <PermissionProtectedRoute module="viviendas" action="editar"><EditarVivienda /> </PermissionProtectedRoute>, },

      // Rutas de Clientes
      { path: "/clientes/listar", element: <PermissionProtectedRoute module="clientes" action="ver"><ListarClientes /></PermissionProtectedRoute> },
      { path: "/clientes/detalle/:clienteId", element: <PermissionProtectedRoute module="clientes" action="ver"><DetalleCliente /></PermissionProtectedRoute> },
      { path: "/clientes/crear", element: <PermissionProtectedRoute module="clientes" action="crear"><CrearCliente /></PermissionProtectedRoute> },
      { path: "/clientes", element: <PermissionProtectedRoute module="clientes" action="ver"><ListarClientes /></PermissionProtectedRoute> },

      // Rutas de Abonos
      { path: "/abonos/listar", element: <PermissionProtectedRoute module="abonos" action="ver"><ListarAbonos /></PermissionProtectedRoute> },
      { path: "/abonos/gestionar/:clienteId", element: <PermissionProtectedRoute module="abonos" action="crear"><GestionarAbonos /></PermissionProtectedRoute> }, // Gestionar implica poder crear abonos
      { path: "/abonos", element: <PermissionProtectedRoute module="abonos" action="crear"><CrearAbono /></PermissionProtectedRoute> },

      // Rutas de Renuncias
      { path: "/renuncias", element: <PermissionProtectedRoute module="renuncias" action="ver"><ListarRenuncias /></PermissionProtectedRoute> },
      { path: "/renuncias/detalle/:renunciaId", element: <PermissionProtectedRoute module="renuncias" action="ver"><DetalleRenuncia /></PermissionProtectedRoute> },

      // Ruta de Reportes
      { path: "/reportes", element: <PermissionProtectedRoute module="reportes" action="generar"><ReportesPage /></PermissionProtectedRoute> },

      // Rutas de Administración
      { path: "/admin", element: <PermissionProtectedRoute module="admin" action="gestionarUsuarios"><AdminPage /></PermissionProtectedRoute> },
      { path: "/admin/crear-usuario", element: <PermissionProtectedRoute module="admin" action="gestionarUsuarios"><CrearUsuarioPage /></PermissionProtectedRoute> },
      { path: "/admin/roles", element: <PermissionProtectedRoute module="admin" action="gestionarRoles"><GestionRolesPage /></PermissionProtectedRoute> },
      { path: "/admin/auditoria", element: <PermissionProtectedRoute module="admin" action="gestionarUsuarios"><AuditLogPage /></PermissionProtectedRoute> },
      { path: "/admin/proyectos", element: <PermissionProtectedRoute module="admin" action="listarProyectos"><ListarProyectos /></PermissionProtectedRoute> },
      { path: "/admin/proyectos/crear", element: <PermissionProtectedRoute module="admin" action="crearProyectos"><CrearProyecto /></PermissionProtectedRoute> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <Toaster
        position="top-right"
        containerStyle={{
          top: 80,
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <DataProvider>
        <NotificationProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </NotificationProvider>
      </DataProvider>
    </ThemeProvider>
  </React.StrictMode>
);