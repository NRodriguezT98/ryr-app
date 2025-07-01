// Ruta: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// 1. IMPORTAMOS el componente Toaster de la nueva librería
import { Toaster } from 'react-hot-toast';
// --- IMPORTAMOS NUESTRO NUEVO PROVEEDOR ---
import { DataProvider } from './context/DataContext';
// Tus componentes de página
import Layout from './layout/Layout';
import DashboardPage from './pages/DashboardPage';
import CrearVivienda from './pages/viviendas/CrearVivienda';
import ListarViviendas from './pages/viviendas/ListarViviendas';
import EditarVivienda from './pages/viviendas/EditarVivienda';
import CrearCliente from "./pages/clientes/CrearCliente";
import ListarClientes from './pages/clientes/ListarClientes';
import DetalleCliente from './pages/clientes/DetalleCliente';
import ListarAbonos from './pages/abonos/ListarAbonos';
import CrearAbono from './pages/abonos/CrearAbono';

// ELIMINAMOS la importación de tu ToastProvider antiguo
// import { ToastProvider } from './components/ToastContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 2. AÑADIMOS el componente Toaster aquí. Se encarga de mostrar todas las notificaciones. */}
      {/* Lo configuramos para que aparezca arriba a la derecha y dure 4 segundos. */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Ya no necesitamos envolver todo en <ToastProvider> */}
      <DataProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="/viviendas" element={<CrearVivienda />} />
            <Route path="viviendas/listar" element={<ListarViviendas />} />
            <Route path="viviendas/editar/:id" element={<EditarVivienda />} />
            <Route path="/clientes/crear" element={<CrearCliente />} />
            <Route path="/clientes/listar" element={<ListarClientes />} />
            <Route path="/clientes/detalle/:clienteId" element={<DetalleCliente />} />
            <Route path="/abonos" element={<ListarAbonos />} />
            <Route path="/abonos/crear" element={<CrearAbono />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);