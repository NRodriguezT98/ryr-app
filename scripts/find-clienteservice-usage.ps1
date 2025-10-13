# Script para encontrar archivos que usan clienteService.js

Write-Host "🔍 Buscando archivos que importan desde clienteService.js..." -ForegroundColor Cyan
Write-Host ""

$searchPaths = @("src/pages", "src/components", "src/hooks")
$results = @()

foreach ($path in $searchPaths) {
    if (Test-Path $path) {
        Write-Host "📂 Buscando en $path..." -ForegroundColor Yellow
        
        $files = Get-ChildItem -Path $path -Recurse -Include "*.jsx", "*.js" -ErrorAction SilentlyContinue |
        Select-String -Pattern "clienteService" -List
        
        foreach ($file in $files) {
            $relativePath = $file.Path -replace [regex]::Escape((Get-Location).Path + "\"), ""
            
            $results += [PSCustomObject]@{
                File = $relativePath
                Line = $file.LineNumber
            }
        }
    }
}

if ($results.Count -eq 0) {
    Write-Host "✅ No se encontraron archivos usando clienteService.js" -ForegroundColor Green
}
else {
    Write-Host ""
    Write-Host "📊 RESULTADOS: $($results.Count) archivo(s) encontrado(s)" -ForegroundColor Cyan
    Write-Host ""
    
    $results | Format-Table -AutoSize
    
    Write-Host ""
    Write-Host "📝 Ver guía de migración en: MIGRACION_CLIENTE_SERVICE.md" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Escaneo completado" -ForegroundColor Green
