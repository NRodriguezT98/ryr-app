import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Toaster
        position="top-right" // Mantenemos la posición a la derecha
        containerStyle={{
          top: 80, // <-- AÑADIMOS ESTA LÍNEA para bajar el contenedor
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
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />

              <Route path="/viviendas/crear" element={<CrearVivienda />} />
              <Route path="/viviendas/listar" element={<ListarViviendas />} />
              <Route path="/viviendas/detalle/:viviendaId" element={<DetalleVivienda />} />
              <Route path="/viviendas/editar/:viviendaId" element={<EditarVivienda />} />

              <Route path="/clientes" element={<ListarClientes />} />
              <Route path="/clientes/crear" element={<CrearCliente />} />
              <Route path="/clientes/listar" element={<ListarClientes />} />
              <Route path="/clientes/detalle/:clienteId" element={<DetalleCliente />} />

              <Route path="/abonos" element={<CrearAbono />} />
              <Route path="/abonos/listar" element={<ListarAbonos />} />
              <Route path="/abonos/gestionar/:clienteId" element={<GestionarAbonos />} />

              <Route path="/renuncias" element={<ListarRenuncias />} />
              <Route path="/renuncias/detalle/:renunciaId" element={<DetalleRenuncia />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);