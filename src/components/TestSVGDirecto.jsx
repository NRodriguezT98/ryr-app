import React from 'react';

// Test específico para SVG/Iconos
const TestSVGDirecto = () => {
    return (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-bold text-red-800 mb-3">🚨 Test SVG Directo</h3>

            <div className="space-y-3">
                {/* Test 1: SVG directo */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">SVG Manual:</span>
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>✅ Check manual</span>
                </div>

                {/* Test 2: Verificar importaciones */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Lucide disponible:</span>
                    <span>{typeof window !== 'undefined' && window.React ? '✅ React OK' : '❌ No React'}</span>
                </div>

                {/* Test 3: Console.log */}
                <div className="bg-white p-2 rounded">
                    <p className="text-xs text-gray-600 font-mono">
                        Revisar consola del navegador para más información de debug
                    </p>
                </div>
            </div>

            {/* Script inline para debug */}
            <script>
                {`
          console.log('🔍 DEBUG - window object:', window);
          console.log('🔍 DEBUG - React:', typeof React);
          console.log('🔍 DEBUG - Document:', document);
        `}
            </script>
        </div>
    );
};

// Debug en el render
console.log('🔍 TestSVGDirecto - Componente cargado');
console.log('🔍 TestSVGDirecto - React version:', React?.version);

export default TestSVGDirecto;