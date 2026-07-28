# Deploy Firebase - Motéis Fortaleza (PowerShell)
# Execute no PowerShell como Administrador

Write-Host "🚀 Deploy Firebase - Motéis Fortaleza" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Verificar Firebase CLI
$firebase = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebase) {
    Write-Host "❌ Firebase CLI não encontrado. Instalando..." -ForegroundColor Red
    npm install -g firebase-tools
} else {
    Write-Host "✅ Firebase CLI encontrado: $($firebase.Source)" -ForegroundColor Green
}

# Login
Write-Host "`n🔐 Fazendo login no Firebase..." -ForegroundColor Yellow
firebase login

# Selecionar projeto
Write-Host "`n📦 Selecionando projeto..." -ForegroundColor Yellow
firebase use moteisfortaleza-9dadd

# Deploy
Write-Host "`n🚀 Iniciando deploy..." -ForegroundColor Yellow
firebase deploy --only hosting,firestore:rules,firestore:indexes

Write-Host "`n✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Site: https://moteisfortaleza-9dadd.web.app" -ForegroundColor Cyan
Write-Host "🔧 Admin: https://moteisfortaleza-9dadd.web.app/admin/" -ForegroundColor Cyan
Write-Host "📊 Console: https://console.firebase.google.com/project/moteisfortaleza-9dadd" -ForegroundColor Cyan

pause