# Script para iniciar ambos servidores de la ferretería

Write-Host "🏪 Iniciating Sistema de Ferretería..." -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Blue

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js versión: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instálalo desde nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar si MongoDB está corriendo (opcional)
Write-Host "🔍 Verificando servicios..." -ForegroundColor Yellow

# Cambiar al directorio del proyecto
$projectRoot = Split-Path $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "📁 Directorio del proyecto: $projectRoot" -ForegroundColor Cyan

# Función para verificar si un puerto está en uso
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $false
    } catch {
        return $true
    }
}

# Verificar puertos
$backendPort = 3000
$frontendPort = 3001

if (Test-Port $backendPort) {
    Write-Host "⚠️  Puerto $backendPort ya está en uso. El backend podría no iniciarse." -ForegroundColor Yellow
}

if (Test-Port $frontendPort) {
    Write-Host "⚠️  Puerto $frontendPort ya está en uso. El frontend podría no iniciarse." -ForegroundColor Yellow
}

Write-Host "`n🚀 Iniciando servidores..." -ForegroundColor Green

# Iniciar Backend en nueva ventana
Write-Host "📡 Iniciando Backend (Puerto $backendPort)..."
$backendPath = Join-Path $projectRoot "backend"
if (Test-Path $backendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🔧 BACKEND - FERRETERÍA' -ForegroundColor Green; Write-Host 'Puerto: 3000' -ForegroundColor Cyan; Write-Host 'Para detener: Ctrl+C' -ForegroundColor Yellow; Write-Host ''; npm run dev"
    Write-Host "✅ Backend iniciado en nueva ventana" -ForegroundColor Green
} else {
    Write-Host "❌ No se encontró la carpeta backend" -ForegroundColor Red
    exit 1
}

# Esperar un momento
Start-Sleep -Seconds 3

# Iniciar Frontend en nueva ventana
Write-Host "🎨 Iniciando Frontend (Puerto $frontendPort)..."
$frontendPath = Join-Path $projectRoot "frontend"
if (Test-Path $frontendPath) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '⚛️  FRONTEND - FERRETERÍA' -ForegroundColor Blue; Write-Host 'Puerto: 3001' -ForegroundColor Cyan; Write-Host 'Para detener: Ctrl+C' -ForegroundColor Yellow; Write-Host ''; npm start"
    Write-Host "✅ Frontend iniciado en nueva ventana" -ForegroundColor Green
} else {
    Write-Host "❌ No se encontró la carpeta frontend" -ForegroundColor Red
    exit 1
}

Write-Host "`n" + "=" * 50 -ForegroundColor Blue
Write-Host "🎉 ¡SISTEMA INICIADO EXITOSAMENTE!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Blue

Write-Host "`n📋 INFORMACIÓN DE ACCESO:" -ForegroundColor Yellow
Write-Host "Frontend (Aplicación): http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend (API):         http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n🔐 CREDENCIALES DE PRUEBA:" -ForegroundColor Yellow
Write-Host "Usuario Admin:    admin / admin123" -ForegroundColor White
Write-Host "Usuario Empleado: empleado1 / empleado123" -ForegroundColor White
Write-Host "Usuario Cajero:   cajero1 / cajero123" -ForegroundColor White

Write-Host "`n💡 CONSEJOS:" -ForegroundColor Yellow
Write-Host "• Para poblar la base de datos con datos de ejemplo:" -ForegroundColor White
Write-Host "  cd backend && npm run seed" -ForegroundColor Gray
Write-Host "• Para detener los servidores: Ctrl+C en cada ventana" -ForegroundColor White
Write-Host "• Las ventanas se abrirán automáticamente" -ForegroundColor White

Write-Host "`n⏳ Esperando que los servidores inicien..." -ForegroundColor Yellow
Write-Host "Esto puede tomar unos segundos..." -ForegroundColor Gray

# Esperar un poco más para que inicien los servidores
Start-Sleep -Seconds 8

# Intentar abrir el navegador
Write-Host "`n🌐 Abriendo navegador..." -ForegroundColor Green
try {
    Start-Process "http://localhost:3001"
    Write-Host "✅ Navegador abierto en http://localhost:3001" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No se pudo abrir el navegador automáticamente" -ForegroundColor Yellow
    Write-Host "Por favor, abre manualmente: http://localhost:3001" -ForegroundColor Cyan
}

Write-Host "`n🎯 ¡Todo listo! El sistema está funcionando." -ForegroundColor Green
Write-Host "Presiona cualquier tecla para cerrar esta ventana..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")