/**
 * @file migrateToLazyLoading.cjs
 * @description Script para migrar automáticamente al sistema de lazy loading
 * Ejecutar: node src/scripts/migrateToLazyLoading.cjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando migración a Lazy Loading...\n');

// Pasos de migración
const migrationSteps = [
    {
        name: 'Backup del DataContext original',
        action: () => {
            const original = path.join(__dirname, '../context/DataContext.jsx');
            const backup = path.join(__dirname, '../context/DataContext.OLD.jsx');

            if (fs.existsSync(original) && !fs.existsSync(backup)) {
                fs.copyFileSync(original, backup);
                console.log('✅ Backup creado: DataContext.OLD.jsx');
                return true;
            } else if (fs.existsSync(backup)) {
                console.log('⚠️  Backup ya existe, saltando...');
                return true;
            }
            return false;
        }
    },
    {
        name: 'Activar DataContext optimizado',
        action: () => {
            const optimized = path.join(__dirname, '../context/DataContext.OPTIMIZED.jsx');
            const current = path.join(__dirname, '../context/DataContext.jsx');

            if (fs.existsSync(optimized)) {
                const content = fs.readFileSync(optimized, 'utf8');
                fs.writeFileSync(current, content);
                console.log('✅ DataContext.jsx actualizado con versión optimizada');
                return true;
            } else {
                console.log('❌ No se encontró DataContext.OPTIMIZED.jsx');
                return false;
            }
        }
    },
    {
        name: 'Backup del DashboardPage original',
        action: () => {
            const original = path.join(__dirname, '../pages/DashboardPage.jsx');
            const backup = path.join(__dirname, '../pages/DashboardPage.OLD.jsx');

            if (fs.existsSync(original) && !fs.existsSync(backup)) {
                fs.copyFileSync(original, backup);
                console.log('✅ Backup creado: DashboardPage.OLD.jsx');
                return true;
            } else if (fs.existsSync(backup)) {
                console.log('⚠️  Backup ya existe, saltando...');
                return true;
            }
            return false;
        }
    },
    {
        name: 'Activar DashboardPage optimizado',
        action: () => {
            const optimized = path.join(__dirname, '../pages/DashboardPage.OPTIMIZED.jsx');
            const current = path.join(__dirname, '../pages/DashboardPage.jsx');

            if (fs.existsSync(optimized)) {
                const content = fs.readFileSync(optimized, 'utf8');
                fs.writeFileSync(current, content);
                console.log('✅ DashboardPage.jsx actualizado con versión optimizada');
                return true;
            } else {
                console.log('❌ No se encontró DashboardPage.OPTIMIZED.jsx');
                return false;
            }
        }
    }
];

// Ejecutar migración
let success = true;
migrationSteps.forEach((step, index) => {
    console.log(`\n${index + 1}. ${step.name}...`);
    const result = step.action();
    if (!result) {
        success = false;
    }
});

// Resultado final
console.log('\n' + '='.repeat(50));
if (success) {
    console.log('✅ Migración completada exitosamente!\n');
    console.log('Próximos pasos:');
    console.log('1. npm run dev - Probar la aplicación');
    console.log('2. Verificar que el dashboard carga correctamente');
    console.log('3. Navegar a diferentes páginas para probar lazy loading');
    console.log('4. Si todo funciona, eliminar archivos .OLD.jsx y .OPTIMIZED.jsx');
    console.log('\nPara revertir:');
    console.log('1. Restaurar DataContext.OLD.jsx → DataContext.jsx');
    console.log('2. Restaurar DashboardPage.OLD.jsx → DashboardPage.jsx');
} else {
    console.log('❌ Migración incompleta. Revisar errores arriba.');
}
console.log('='.repeat(50) + '\n');
