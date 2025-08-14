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
import LoginPage from './pages/auth/LoginPage';
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
import ReportesPage from './pages/reportes/ReportesPage'

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
      {
        index: true, // Esta es la página de inicio (Dashboard)
        element: <DashboardPage />,
      },
      {
        path: "/viviendas/crear",
        element: <CrearVivienda />,
      },
      {
        path: "/viviendas/listar",
        element: <ListarViviendas />,
      },
      {
        path: "/viviendas/detalle/:viviendaId",
        element: <DetalleVivienda />,
      },
      {
        path: "/viviendas/editar/:viviendaId",
        element: <EditarVivienda />,
      },
      {
        path: "/clientes",
        element: <ListarClientes />,
      },
      {
        path: "/clientes/crear",
        element: <CrearCliente />,
      },
      {
        path: "/clientes/listar",
        element: <ListarClientes />,
      },
      {
        path: "/clientes/detalle/:clienteId",
        element: <DetalleCliente />,
      },
      {
        path: "/abonos",
        element: <CrearAbono />,
      },
      {
        path: "/abonos/listar",
        element: <ListarAbonos />,
      },
      {
        path: "/abonos/gestionar/:clienteId",
        element: <GestionarAbonos />,
      },
      {
        path: "/renuncias",
        element: <ListarRenuncias />,
      },
      {
        path: "/renuncias/detalle/:renunciaId",
        element: <DetalleRenuncia />,
      },
      {
        path: "/reportes",
        element: <ReportesPage />,
      },
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