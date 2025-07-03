import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { DataProvider } from './context/DataContext';

import Layout from './layout/Layout';
import DashboardPage from './pages/DashboardPage';
import CrearVivienda from './pages/viviendas/CrearVivienda';
import ListarViviendas from './pages/viviendas/ListarViviendas';
import DetalleVivienda from './pages/viviendas/DetalleVivienda';
import CrearCliente from "./pages/clientes/CrearCliente";
import ListarClientes from './pages/clientes/ListarClientes';
import DetalleCliente from './pages/clientes/DetalleCliente';
import ListarAbonos from './pages/abonos/ListarAbonos';
import CrearAbono from './pages/abonos/CrearAbono';
import ListarRenuncias from './pages/renuncias/ListarRenuncias'; // <-- Importamos la nueva página
import EditarVivienda from './pages/viviendas/EditarVivienda';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
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
      <DataProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />

            <Route path="/viviendas/crear" element={<CrearVivienda />} />
            <Route path="/viviendas/listar" element={<ListarViviendas />} />
            <Route path="/viviendas/detalle/:viviendaId" element={<DetalleVivienda />} />
            <Route path="/viviendas/editar/:viviendaId" element={<EditarVivienda />} />

            <Route path="/clientes/crear" element={<CrearCliente />} />
            <Route path="/clientes/listar" element={<ListarClientes />} />
            <Route path="/clientes/detalle/:clienteId" element={<DetalleCliente />} />

            <Route path="/abonos" element={<CrearAbono />} />
            <Route path="/abonos/listar" element={<ListarAbonos />} />

            <Route path="/renuncias" element={<ListarRenuncias />} />
          </Route>
        </Routes>
      </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);