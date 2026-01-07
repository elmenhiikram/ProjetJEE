import re
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from collections import defaultdict
from functools import lru_cache

from sqlalchemy.orm import Session
from sqlalchemy import text
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import redis

from . import models
from .config import settings
from .llm_service import LLMSearchService  # Import du nouveau service

class IntelligentSearchService:
    def __init__(self, db: Session):
        self.db = db
        self.model = None
        self.redis_client = None
        self.llm_service = LLMSearchService()  # Service LLM
        self._init_services()
        
        self.search_history = defaultdict(list)
    
    def _init_services(self):
        """Initialise les services"""
        try:
            # Charger le modèle sémantique (optionnel)
            self.model = SentenceTransformer(settings.SEARCH_MODEL)
            print(f"Modèle {settings.SEARCH_MODEL} chargé")
        except Exception as e:
            print(f"Modèle sémantique non disponible: {e}")
            self.model = None
        
        # Initialiser Redis (optionnel)
        try:
            self.redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                decode_responses=True
            )
            self.redis_client.ping()
            print("Redis connecté")
        except Exception as e:
            print(f"Redis non disponible: {e}")
            self.redis_client = None
    
    def search_by_llm(self, query: str, user_id: Optional[int] = None) -> Dict:
        """
        Recherche intelligente utilisant LLM pour comprendre la requête
        """
        # Sauvegarder l'historique
        if user_id:
            self._save_to_history(user_id, query)
        
        # Analyser la requête avec LLM
        analysis = self.llm_service.analyze_query(query)
        
        try:
            # Exécuter la requête SQL générée
            result = self.db.execute(text(analysis["sql_query"]))
            rows = result.fetchall()
            
            # Convertir en liste de dictionnaires
            results = []
            for row in rows:
                row_dict = dict(row._mapping)
                results.append(row_dict)
            
            # Générer des suggestions
            suggestions = self._generate_suggestions(query, user_id)
            
            return {
                "query": query,
                "intent": analysis["intent"],
                "sql_generated": analysis["sql_query"],
                "filters": analysis["filters"],
                "results": results,
                "total": len(results),
                "suggestions": suggestions
            }
            
        except Exception as e:
            print(f"Erreur exécution SQL: {e}")
            # Fallback: recherche simple
            return self._fallback_search(query, user_id)
    
    def _fallback_search(self, query: str, user_id: Optional[int]) -> Dict:
        """Recherche de fallback sans LLM"""
        try:
            # Recherche textuelle simple
            sql = """
            SELECT p.*, c.name_categorie 
            FROM produit p 
            LEFT JOIN categorie c ON p.id_categorie = c.id_categorie
            WHERE p.name LIKE :query OR p.description LIKE :query
            LIMIT 50
            """
            
            result = self.db.execute(text(sql), {"query": f"%{query}%"})
            rows = result.fetchall()
            results = [dict(row._mapping) for row in rows]
            
            return {
                "query": query,
                "intent": f"Recherche textuelle: {query}",
                "sql_generated": sql,
                "filters": {},
                "results": results,
                "total": len(results),
                "suggestions": []
            }
        except Exception as e:
            print(f"Erreur fallback: {e}")
            return {
                "query": query,
                "intent": "Erreur de recherche",
                "sql_generated": "",
                "filters": {},
                "results": [],
                "total": 0,
                "suggestions": []
            }
    
    def semantic_search(self, query: str, user_id: Optional[int] = None, limit: int = 50) -> Dict:
        """
        Recherche sémantique combinant LLM et embeddings
        """
        # D'abord utiliser LLM pour comprendre
        llm_result = self.search_by_llm(query, user_id)
        
        # Si peu de résultats, essayer la recherche sémantique
        if len(llm_result["results"]) < 5 and self.model:
            try:
                # Charger tous les produits pour recherche sémantique
                products_df = self._get_all_products_data()
                if not products_df.empty:
                    # Recherche sémantique
                    query_embedding = self.model.encode([query])
                    product_embeddings = self._generate_product_embeddings(products_df)
                    
                    if len(product_embeddings) > 0:
                        similarities = cosine_similarity(query_embedding, product_embeddings)[0]
                        products_df['similarity'] = similarities
                        products_df = products_df.sort_values('similarity', ascending=False)
                        
                        # Ajouter les résultats sémantiques
                        semantic_results = products_df.head(limit - len(llm_result["results"])).to_dict('records')
                        
                        # Combiner les résultats (dédupliquer par ID)
                        combined_results = llm_result["results"].copy()
                        existing_ids = {r['id_produit'] for r in combined_results}
                        
                        for result in semantic_results:
                            if result['id_produit'] not in existing_ids:
                                combined_results.append(result)
                                existing_ids.add(result['id_produit'])
                        
                        llm_result["results"] = combined_results
                        llm_result["total"] = len(combined_results)
                        llm_result["search_method"] = "hybrid"  # Méthode hybride
            except Exception as e:
                print(f"Erreur recherche sémantique: {e}")
        
        return llm_result
    
    # Méthodes auxiliaires (garder celles existantes)
    def _get_all_products_data(self) -> pd.DataFrame:
        """Récupère tous les produits"""
        try:
            query = """
            SELECT 
                p.id_produit,
                p.name,
                p.description,
                p.prix,
                p.quantite,
                p.rating,
                p.reviews_count,
                p.product_rank,
                p.photo_url,
                c.id_categorie,
                c.name_categorie
            FROM produit p
            LEFT JOIN categorie c ON p.id_categorie = c.id_categorie
            WHERE p.quantite > 0
            """
            
            result = self.db.execute(text(query))
            rows = result.fetchall()
            
            df = pd.DataFrame(
                rows,
                columns=['id_produit', 'name', 'description', 'prix', 'quantite', 
                        'rating', 'reviews_count', 'product_rank', 'photo_url',
                        'id_categorie', 'name_categorie']
            )
            
            df['search_text'] = df.apply(
                lambda row: f"{row['name']} {row['description']} {row['name_categorie']} "
                           f"prix:{row['prix']:.2f} rating:{row['rating']:.1f} "
                           f"avis:{row['reviews_count']}",
                axis=1
            )
            
            return df
            
        except Exception as e:
            print(f"Erreur récupération produits: {e}")
            return pd.DataFrame()
    
    def _generate_product_embeddings(self, df: pd.DataFrame) -> np.ndarray:
        """Génère les embeddings (optionnel)"""
        if self.model is None or df.empty:
            return np.array([])
        
        texts = df['search_text'].tolist()
        return self.model.encode(texts, show_progress_bar=False)
    
    def _save_to_history(self, user_id: int, query: str):
        """Sauvegarde l'historique"""
        try:
            timestamp = datetime.now().isoformat()
            
            if user_id in self.search_history:
                self.search_history[user_id] = [
                    {"query": query, "timestamp": timestamp, "count": 1}
                ] + self.search_history[user_id][:19]
            else:
                self.search_history[user_id] = [
                    {"query": query, "timestamp": timestamp, "count": 1}
                ]
        except Exception as e:
            print(f"Erreur sauvegarde historique: {e}")
    
    def _generate_suggestions(self, query: str, user_id: Optional[int]) -> List[str]:
        """Génère des suggestions"""
        suggestions = []
        
        if user_id and user_id in self.search_history:
            history = self.search_history[user_id]
            for item in history[:5]:
                if item['query'].lower().startswith(query.lower()):
                    suggestions.append(item['query'])
        
        # Suggestions basées sur les résultats populaires
        try:
            df = self._get_all_products_data()
            if not df.empty:
                popular = df.nlargest(3, 'reviews_count')
                for _, product in popular.iterrows():
                    if query.lower() in product['name'].lower():
                        suggestions.append(f"{product['name']} - {product['prix']:.2f} dhs")
        except Exception as e:
            print(f"Erreur suggestions produits: {e}")
        
        # Suggestions générales
        general_suggestions = [
            "Produits électroniques sous 50$",
            "Livres avec +1000 avis",
            "Meilleur rapport qualité-prix",
            "Produits en stock",
            "Nouveautés"
        ]
        
        for suggestion in general_suggestions:
            if any(word in suggestion.lower() for word in query.lower().split()[:2]):
                suggestions.append(suggestion)
        
        return list(dict.fromkeys(suggestions))[:8]
    
    def get_search_history(self, user_id: int) -> List[Dict]:
        """Récupère l'historique"""
        return self.search_history.get(user_id, [])