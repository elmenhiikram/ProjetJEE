#!/bin/bash
cd "$(dirname "$0")"
echo "============================================================"
echo " Démarrage du serveur de Recherche Sémantique"
echo "============================================================"
echo ""
echo "[INFO] Activation de l'environnement virtuel..."
source venv/Scripts/activate
echo "[INFO] Lancement du serveur FastAPI sur http://localhost:8000"
echo "[INFO] Documentation: http://localhost:8000/docs"
echo "============================================================"
echo ""
python run.py
