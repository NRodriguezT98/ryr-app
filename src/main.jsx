import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Layout from './layout/Layout';
import Home from './pages/Home';
import CrearVivienda from './pages/viviendas/CrearVivienda';
import ListarViviendas from './pages/viviendas/ListarViviendas';
import EditarVivienda from './pages/viviendas/EditarVivienda';
import CrearCliente from "./pages/clientes/CrearCliente";
import ListarClientes from './pages/clientes/ListarClientes';
import { ToastProvider } from './components/ToastContext';  // IMPORTA EL PROVEEDOR

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>  {/* ENVUELVE TU APP CON EL PROVIDER */}
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="viviendas" element={<CrearVivienda />} />
            <Route path="viviendas/listar" element={<ListarViviendas />} />
            <Route path="viviendas/editar/:id" element={<EditarVivienda />} />
            <Route path="/clientes/crear" element={<CrearCliente />} />
            <Route path="/clientes/listar" element={<ListarClientes />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
