# Script PowerShell pour démarrer le serveur FastAPI
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " Serveur de Recherche Semantique - FastAPI" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Aller dans le répertoire du script
Set-Location $PSScriptRoot

Write-Host "[INFO] Verification de Python..." -ForegroundColor Yellow
python --version
Write-Host ""

Write-Host "[INFO] Demarrage du serveur..." -ForegroundColor Green
Write-Host "[INFO] URL: http://localhost:8000" -ForegroundColor Green
Write-Host "[INFO] Documentation: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "[INFO] Appuyez sur Ctrl+C pour arreter" -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Lancer le serveur
python run.py

Write-Host ""
Write-Host "Serveur arrete." -ForegroundColor Red
Read-Host "Appuyez sur Entree pour fermer"
