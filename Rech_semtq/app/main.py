from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List
import time

from .database import get_db
from .openai_service import OpenAISearchService
from .config import settings

app = FastAPI(
    title="Intelligent Search API with OpenAI",
    description="Recherche intelligente utilisant GPT pour comprendre le langage naturel",
    version="3.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialiser le service OpenAI
openai_service = OpenAISearchService()

@app.get("/")
def read_root():
    return {
        "message": "Intelligent Search API powered by OpenAI",
        "version": "3.0.0",
        "model": settings.OPENAI_MODEL,
        "endpoints": {
            "search": "/search?q=query (recherche intelligente)",
            "search_debug": "/search/debug?q=query (avec détails)",
            "test_openai": "/openai/test",
            "examples": "/search/examples",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "openai_configured": bool(settings.OPENAI_API_KEY)
    }

@app.get("/openai/test")
def test_openai():
    """Teste la connexion à OpenAI"""
    test_query = "produits avec un prix de 100$"
    
    try:
        # Test de traduction
        translation = openai_service.translate_to_sql(test_query)
        
        # Test de compréhension
        intent = openai_service.understand_intent(test_query)
        
        return {
            "openai_ready": True,
            "test_query": test_query,
            "translation": translation,
            "intent_analysis": intent,
            "model": settings.OPENAI_MODEL
        }
        
    except Exception as e:
        return {
            "openai_ready": False,
            "error": str(e),
            "test_query": test_query
        }

@app.get("/search")
async def intelligent_search(
    q: str = Query(..., description="Requête en langage naturel"),
    user_id: Optional[int] = Query(None, description="ID utilisateur pour historique"),
    debug: bool = Query(False, description="Afficher les détails de débogage"),
    db: Session = Depends(get_db)
):
    """
    Recherche intelligente avec OpenAI GPT
    Exemples:
    - produits avec un prix de 100$
    - livres à moins de 50 euros
    - électronique bien noté
    - meilleurs produits
    - produits entre 100 et 200 dhs
    """
    
    start_time = time.time()
    
    # 1. Traduire avec OpenAI
    translation_result = openai_service.translate_to_sql(q)
    
    # 2. Analyser l'intention (optionnel)
    intent_analysis = openai_service.understand_intent(q) if debug else None
    
    # 3. Exécuter la requête SQL
    try:
        if translation_result["success"]:
            sql_query = translation_result["sql_query"]
            translation_method = "openai_gpt"
        else:
            sql_query = translation_result["fallback_sql"]
            translation_method = "fallback"
            print(f"⚠️ Fallback utilisé pour: {q}")
        
        # Exécuter la requête
        result = db.execute(text(sql_query))
        rows = result.fetchall()
        
        # Convertir les résultats
        results = []
        for row in rows:
            row_dict = dict(row._mapping)
            # Formater les données
            if 'prix' in row_dict:
                row_dict['prix'] = float(row_dict['prix']) if row_dict['prix'] is not None else 0
            if 'rating' in row_dict:
                row_dict['rating'] = float(row_dict['rating']) if row_dict['rating'] is not None else 0
            results.append(row_dict)
        
        # Temps d'exécution
        execution_time = time.time() - start_time
        
        # Générer des suggestions
        suggestions = _generate_suggestions(q, results)
        
        # Réponse
        response = {
            "query": q,
            "results": results,
            "total": len(results),
            "execution_time_ms": round(execution_time * 1000, 2),
            "translation_method": translation_method,
            "suggestions": suggestions,
            "success": True
        }
        
        # Ajouter les détails de débogage si demandé
        if debug:
            response.update({
                "sql_generated": sql_query,
                "openai_translation": translation_result,
                "intent_analysis": intent_analysis,
                "translation_success": translation_result["success"]
            })
        
        return response
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Erreur SQL: {error_msg}")
        print(f"❌ Requête SQL: {sql_query}")
        
        # Fallback: recherche simple
        try:
            fallback_sql = """
            SELECT p.*, c.name_categorie 
            FROM produit p 
            LEFT JOIN categorie c ON p.id_categorie = c.id_categorie
            WHERE p.name LIKE :query OR p.description LIKE :query
            LIMIT 20
            """
            
            result = db.execute(text(fallback_sql), {"query": f"%{q}%"})
            rows = result.fetchall()
            fallback_results = [dict(row._mapping) for row in rows]
            
            return {
                "query": q,
                "results": fallback_results,
                "total": len(fallback_results),
                "execution_time_ms": round((time.time() - start_time) * 1000, 2),
                "translation_method": "error_fallback",
                "error": error_msg,
                "sql_attempted": sql_query,
                "suggestions": [],
                "success": False
            }
            
        except Exception as e2:
            raise HTTPException(
                status_code=500,
                detail={
                    "query": q,
                    "error": f"Erreur principale: {error_msg}, Erreur fallback: {str(e2)}",
                    "sql_attempted": sql_query
                }
            )

@app.get("/search/debug")
async def search_debug(
    q: str = Query(..., description="Requête à déboguer"),
    db: Session = Depends(get_db)
):
    """Version débogage avec tous les détails"""
    return await intelligent_search(q=q, debug=True, db=db)

@app.get("/search/examples")
def search_examples():
    """Exemples de requêtes supportées"""
    return {
        "examples": [
            {
                "query": "produits avec un prix de 100$",
                "description": "Produits exactement à 1000 DHS (100$ × 10)"
            },
            {
                "query": "livres à moins de 50 euros", 
                "description": "Livres à moins de 550 DHS (50€ × 11)"
            },
            {
                "query": "électronique bien noté",
                "description": "Produits électroniques avec note ≥ 4.0"
            },
            {
                "query": "meilleurs produits",
                "description": "Produits triés par note et popularité"
            },
            {
                "query": "produits entre 100 et 200 dhs",
                "description": "Produits dans cette plage de prix"
            },
            {
                "query": "smartphone en stock",
                "description": "Smartphones disponibles (quantité > 0)"
            },
            {
                "query": "produits avec plus de 1000 avis",
                "description": "Produits populaires avec nombreux avis"
            },
            {
                "query": "vêtements pas chers",
                "description": "Vêtements triés par prix croissant"
            },
            {
                "query": "nouveautés électroniques",
                "description": "Nouveaux produits électroniques"
            },
            {
                "query": "casque audio 5 étoiles",
                "description": "Casques audio parfaitement notés"
            }
        ],
        "supported_features": [
            "Prix exacts et plages",
            "Conversion automatique $/€ → DHS", 
            "Filtrage par catégorie",
            "Filtrage par note/avis",
            "Détection de stock",
            "Tri intelligent",
            "Recherche sémantique"
        ]
    }

def _generate_suggestions(query: str, results: List[dict]) -> List[str]:
    """Génère des suggestions basées sur les résultats"""
    suggestions = []
    query_lower = query.lower()
    
    # Basé sur les catégories trouvées
    categories = {}
    for r in results:
        cat = r.get('name_categorie')
        if cat:
            categories[cat] = categories.get(cat, 0) + 1
    
    if categories:
        for cat, count in list(categories.items())[:2]:
            suggestions.append(f"Plus de {cat}")
    
    # Basé sur le prix moyen
    if results:
        prices = [r.get('prix', 0) for r in results if r.get('prix')]
        if prices:
            avg_price = sum(prices) / len(prices)
            if avg_price > 0:
                suggestions.append(f"Autour de {int(avg_price)} DHS")
    
    # Suggestions contextuelles
    if "prix" in query_lower:
        suggestions.append("Trier par prix croissant")
        suggestions.append("Trier par prix décroissant")
    
    if "note" in query_lower or "rating" in query_lower:
        suggestions.append("Produits 5 étoiles")
        suggestions.append("Produits avec avis")
    
    if "livre" in query_lower:
        suggestions.append("Livres à moins de 100 DHS")
        suggestions.append("Meilleurs livres")
    
    if "electronique" in query_lower:
        suggestions.append("Électronique en promotion")
        suggestions.append("Nouveautés électroniques")
    
    return suggestions[:5]  # Limiter à 5 suggestions

@app.get("/search/history")
def search_history(
    user_id: int = Query(..., description="ID utilisateur"),
    limit: int = Query(10, description="Nombre d'entrées")
):
    """Récupère l'historique des recherches (simulé)"""
    # Pour l'instant, retourne un historique simulé
    # Dans une vraie implémentation, stocker en base
    return {
        "user_id": user_id,
        "history": [
            {"query": "produits électroniques", "timestamp": "2024-01-15T10:30:00", "results_count": 15},
            {"query": "livres moins de 50", "timestamp": "2024-01-14T14:20:00", "results_count": 8},
            {"query": "meilleur rapport qualité prix", "timestamp": "2024-01-13T09:15:00", "results_count": 12}
        ][:limit]
    }

@app.get("/search/popular")
async def search_popular(
    limit: int = Query(5, description="Nombre de produits populaires"),
    db: Session = Depends(get_db)
):
    """Récupère les produits les plus populaires"""
    try:
        sql = text("""
            SELECT p.*, c.name_categorie 
            FROM produit p 
            LEFT JOIN categorie c ON p.id_categorie = c.id_categorie 
            ORDER BY p.rating DESC, p.reviews_count DESC 
            LIMIT :limit
        """)
        result = db.execute(sql, {"limit": limit})
        rows = result.fetchall()
        
        products = []
        for row in rows:
            products.append(dict(row._mapping))
        
        return {
            "success": True,
            "products": products,
            "total": len(products)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "products": []
        }

@app.get("/search/suggestions")
async def search_suggestions(
    q: str = Query(..., description="Requête partielle"),
    user_id: Optional[int] = Query(None, description="ID utilisateur"),
    limit: int = Query(5, description="Nombre de suggestions"),
    db: Session = Depends(get_db)
):
    """Génère des suggestions de recherche basées sur la requête partielle"""
    try:
        # Rechercher des produits correspondants
        sql = text("""
            SELECT DISTINCT p.name, c.name_categorie 
            FROM produit p 
            LEFT JOIN categorie c ON p.id_categorie = c.id_categorie 
            WHERE p.name LIKE :query OR p.description LIKE :query
            LIMIT :limit
        """)
        result = db.execute(sql, {"query": f"%{q}%", "limit": limit})
        rows = result.fetchall()
        
        suggestions = []
        for row in rows:
            suggestions.append({
                "text": row.name,
                "category": row.name_categorie
            })
        
        # Ajouter des suggestions contextuelles
        query_lower = q.lower()
        contextual = []
        if "prix" in query_lower or "$" in q or "€" in q:
            contextual.extend(["produits moins chers", "meilleur rapport qualité-prix"])
        if "livre" in query_lower:
            contextual.extend(["livres populaires", "nouveaux livres"])
        if "électronique" in query_lower or "electronique" in query_lower:
            contextual.extend(["électronique en promotion", "nouveautés high-tech"])
        
        return {
            "success": True,
            "query": q,
            "suggestions": suggestions,
            "contextual": contextual[:3]
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "suggestions": []
        }

@app.get("/search/intelligent")
async def search_intelligent(
    q: str = Query(..., description="Requête en langage naturel"),
    user_id: Optional[int] = Query(None, description="ID utilisateur"),
    limit: int = Query(50, description="Limite de résultats"),
    db: Session = Depends(get_db)
):
    """Alias pour la recherche intelligente principale"""
    return await intelligent_search(q=q, user_id=user_id, debug=False, db=db)

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🤖 Intelligent Search API avec OpenAI")
    print(f"📊 Modèle: {settings.OPENAI_MODEL}")
    print(f"🔑 OpenAI configuré: {'✅' if settings.OPENAI_API_KEY else '❌'}")
    print("🌐 Serveur: http://localhost:8000")
    print("📚 Documentation: http://localhost:8000/docs")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)