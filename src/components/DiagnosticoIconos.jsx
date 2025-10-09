import React from 'react';

// Componente de diagnóstico para probar iconos
const DiagnosticoIconos = () => {
  // Prueba 1: Importar iconos directamente
  let CheckCircle, Calendar, FolderOpen, RotateCcw, Edit;
  
  try {
    const lucideReact = require('lucide-react');
    CheckCircle = lucideReact.CheckCircle;
    Calendar = lucideReact.Calendar;
    FolderOpen = lucideReact.FolderOpen;
    RotateCcw = lucideReact.RotateCcw;
    Edit = lucideReact.Edit;
  } catch (error) {
    console.error('Error importando lucide-react:', error);
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold text-yellow-800 mb-3">🔍 Diagnóstico de Iconos</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Test 1 - Componente CheckCircle:</span>
          {CheckCircle ? <CheckCircle className="w-5 h-5 text-green-600" /> : <span className="text-red-600">❌ No renderizado</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Test 2 - Componente Calendar:</span>
          {Calendar ? <Calendar className="w-5 h-5 text-blue-600" /> : <span className="text-red-600">❌ No renderizado</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Test 3 - Componente FolderOpen:</span>
          {FolderOpen ? <FolderOpen className="w-5 h-5 text-purple-600" /> : <span className="text-red-600">❌ No renderizado</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Test 4 - Componente RotateCcw:</span>
          {RotateCcw ? <RotateCcw className="w-5 h-5 text-red-600" /> : <span className="text-red-600">❌ No renderizado</span>}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Test 5 - Componente Edit:</span>
          {Edit ? <Edit className="w-5 h-5 text-orange-600" /> : <span className="text-red-600">❌ No renderizado</span>}
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-white rounded border">
        <p className="text-sm text-gray-700">
          <strong>Información del navegador:</strong><br/>
          User Agent: {navigator.userAgent}<br/>
          Lucide React disponible: {typeof CheckCircle !== 'undefined' ? '✅ Sí' : '❌ No'}
        </p>
      </div>
    </div>
  );
};

export default DiagnosticoIconos;