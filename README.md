# 🏠 RyR App - Sistema de Gestión de Clientes y Viviendas

Sistema web para gestión de clientes, viviendas, proceso de documentación y seguimiento de renuncias.

## 🚀 Tecnologías

- **Frontend:** React + Vite
- **Backend:** Firebase (Firestore, Authentication, Storage)
- **Estilos:** TailwindCSS
- **Gestión de Estado:** Context API

## 📦 Instalación

```bash
npm install
```

## 🔥 Desarrollo

```bash
npm run dev
```

El servidor de desarrollo estará disponible en `http://localhost:5173/`

## 🏗️ Build

```bash
npm run build
```

## 📚 Documentación

Toda la documentación técnica del proyecto está organizada en la carpeta [`/docs`](./docs/):

- **📅 Sesiones:** Resúmenes de desarrollo y refactorizaciones
- **⚡ Optimizaciones:** Documentación de mejoras de rendimiento
- **🔧 Refactoring:** Cambios estructurales y de arquitectura
- **🧹 Cleanup:** Limpiezas de código
- **📖 Guías:** Manuales de uso y pruebas

Ver el [índice completo de documentación](./docs/README.md).

## 🏛️ Arquitectura

Este proyecto sigue una **arquitectura de separación estricta entre lógica y vistas**:

- **Hooks personalizados** (`/hooks`): Contienen toda la lógica de negocio
- **Componentes** (`/components`, `/pages`): Solo presentación (componentes "tontos")
- **Servicios** (`/services`): Comunicación con Firebase
- **Context** (`/context`): Estado global de la aplicación

## 📂 Estructura del Proyecto

```
ryr-app/
├── docs/              # Documentación técnica
├── public/            # Archivos estáticos
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── context/       # Contextos de React
│   ├── hooks/         # Hooks personalizados (lógica)
│   ├── pages/         # Páginas/vistas
│   ├── services/      # Servicios de Firebase
│   └── utils/         # Utilidades
└── README.md          # Este archivo
```

## 👥 Módulos Principales

- **Clientes:** Gestión de clientes y expedientes
- **Viviendas:** Administración de propiedades
- **Proceso:** Seguimiento de documentación por paso
- **Renuncias:** Gestión de renuncias de clientes
- **Abonos:** Registro de pagos
- **Historial:** Auditoría completa de actividades

---

**Última actualización:** 11 de octubre de 2025
