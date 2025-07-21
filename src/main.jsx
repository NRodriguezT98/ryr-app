import React from 'react';
import ReactDOM from 'react-dom/client';
// --- INICIO DE CAMBIOS ---
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// --- FIN DE CAMBIOS ---
import './index.css';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';

// Importación de todos tus componentes de página
import Layout from './layout/Layout';
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

// --- INICIO DE LA NUEVA ESTRUCTURA DE RUTAS ---
// Definimos las rutas como un array de objetos
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // El Layout principal envuelve a todas las rutas hijas
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
    ],
  },
]);
// --- FIN DE LA NUEVA ESTRUCTURA DE RUTAS ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
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
        {/* Usamos RouterProvider en lugar de BrowserRouter */}
        <RouterProvider router={router} />
      </NotificationProvider>
    </DataProvider>
  </React.StrictMode>
);