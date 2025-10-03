# Script de instalación automática para el Sistema de Ferretería

Write-Host "🏪 Instalador del Sistema de Ferretería" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Blue

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js versión: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado." -ForegroundColor Red
    Write-Host "Por favor, descárgalo desde: https://nodejs.org" -ForegroundColor Yellow
    Write-Host "Se recomienda la versión LTS (Long Term Support)" -ForegroundColor Yellow
    Read-Host "Presiona Enter para continuar después de instalar Node.js"
    exit 1
}

# Verificar si npm está disponible
try {
    $npmVersion = npm --version
    Write-Host "✅ npm versión: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está disponible" -ForegroundColor Red
    exit 1
}

# Obtener directorio del proyecto
$projectRoot = Split-Path $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "📁 Directorio del proyecto: $projectRoot" -ForegroundColor Cyan

Write-Host "`n🔧 Iniciando instalación..." -ForegroundColor Yellow

# Instalar dependencias del Backend
Write-Host "`n📡 Instalando dependencias del Backend..." -ForegroundColor Blue
$backendPath = Join-Path $projectRoot "backend"

if (Test-Path $backendPath) {
    Set-Location $backendPath
    Write-Host "📦 Ejecutando npm install en backend..." -ForegroundColor Cyan
    
    try {
        npm install
        Write-Host "✅ Backend: Dependencias instaladas correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error instalando dependencias del backend" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar"
    }
} else {
    Write-Host "❌ No se encontró la carpeta backend" -ForegroundColor Red
}

# Instalar dependencias del Frontend
Write-Host "`n⚛️  Instalando dependencias del Frontend..." -ForegroundColor Blue
$frontendPath = Join-Path $projectRoot "frontend"

if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    Write-Host "📦 Ejecutando npm install en frontend..." -ForegroundColor Cyan
    
    try {
        npm install
        Write-Host "✅ Frontend: Dependencias instaladas correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error instalando dependencias del frontend" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Read-Host "Presiona Enter para continuar"
    }
} else {
    Write-Host "❌ No se encontró la carpeta frontend" -ForegroundColor Red
}

# Regresar al directorio raíz
Set-Location $projectRoot

Write-Host "`n" + "=" * 50 -ForegroundColor Blue
Write-Host "🎉 ¡INSTALACIÓN COMPLETADA!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Blue

Write-Host "`n📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow

Write-Host "`n1️⃣  CONFIGURAR BASE DE DATOS (Opcional):" -ForegroundColor Cyan
Write-Host "   • MongoDB Local: Se conectará automáticamente" -ForegroundColor White
Write-Host "   • MongoDB Atlas: Edita backend/.env con tu URI" -ForegroundColor White

Write-Host "`n2️⃣  POBLAR CON DATOS DE PRUEBA:" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run seed" -ForegroundColor Gray

Write-Host "`n3️⃣  INICIAR EL SISTEMA:" -ForegroundColor Cyan
Write-Host "   Opción A (Automático): ./start.ps1" -ForegroundColor Gray
Write-Host "   Opción B (Manual):" -ForegroundColor Gray
Write-Host "     Terminal 1: cd backend && npm run dev" -ForegroundColor Gray
Write-Host "     Terminal 2: cd frontend && npm start" -ForegroundColor Gray

Write-Host "`n🔐 CREDENCIALES DE PRUEBA:" -ForegroundColor Yellow
Write-Host "Usuario Admin:    admin / admin123" -ForegroundColor White
Write-Host "Usuario Empleado: empleado1 / empleado123" -ForegroundColor White
Write-Host "Usuario Cajero:   cajero1 / cajero123" -ForegroundColor White

Write-Host "`n🌐 URLS DEL SISTEMA:" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n💡 CONSEJOS ÚTILES:" -ForegroundColor Yellow
Write-Host "• Mantén MongoDB corriendo para usar la base de datos local" -ForegroundColor White
Write-Host "• El sistema funciona sin MongoDB (usará memoria temporal)" -ForegroundColor White
Write-Host "• Revisa el archivo README.md para más información" -ForegroundColor White
Write-Host "• Los puertos 3000 y 3001 deben estar libres" -ForegroundColor White

Write-Host "`n🚀 ¿Quieres iniciar el sistema ahora? (s/n): " -ForegroundColor Green -NoNewline
$response = Read-Host

if ($response -eq "s" -or $response -eq "S" -or $response -eq "si" -or $response -eq "sí") {
    Write-Host "`n🎯 Iniciando sistema..." -ForegroundColor Green
    & .\start.ps1
} else {
    Write-Host "`n✅ Instalación completada. Para iniciar más tarde, ejecuta:" -ForegroundColor Green
    Write-Host "./start.ps1" -ForegroundColor Cyan
    Write-Host "`nPresiona cualquier tecla para salir..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}