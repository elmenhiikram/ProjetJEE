import sys
import os

# Ajouter le chemin du projet au PYTHONPATH
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Importer et lancer uvicorn
import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Démarrage du serveur de Recherche Sémantique")
    print("=" * 60)
    print("📍 URL: http://localhost:8000")
    print("📚 Documentation: http://localhost:8000/docs")
    print("✅ Health: http://localhost:8000/health")
    print("=" * 60)
    print()
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
