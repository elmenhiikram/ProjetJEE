from openai import OpenAI
import re
import json
from typing import Dict, Optional, List
from .config import settings

class OpenAISearchService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        
        # Dictionnaire de synonymes et mots-clés associés
        self.semantic_keywords = {
            # Électronique Audio
            "écouteurs": ["airpods", "écouteur", "earbuds", "earphone", "oreillette", "casque bluetooth", "écouteurs sans fil"],
            "casque": ["headphone", "headset", "casque audio", "casque gaming", "casque sans fil"],
            "enceinte": ["speaker", "haut-parleur", "enceinte bluetooth", "sound system"],
            
            # Électronique Mobile
            "téléphone": ["smartphone", "iphone", "samsung", "mobile", "portable", "cellulaire"],
            "tablette": ["ipad", "tablet", "ardoise numérique"],
            "montre connectée": ["smartwatch", "apple watch", "montre intelligente", "fitness tracker"],
            
            # Informatique
            "ordinateur": ["pc", "laptop", "portable", "macbook", "desktop", "ordinateur portable"],
            "clavier": ["keyboard", "clavier mécanique", "clavier sans fil", "clavier gaming"],
            "souris": ["mouse", "souris gaming", "souris sans fil", "trackpad"],
            "écran": ["moniteur", "display", "écran pc", "screen"],
            
            # Vêtements
            "pantalon": ["jean", "jeans", "pantalon", "chino", "jogging"],
            "chaussure": ["basket", "sneaker", "running", "chaussures de sport", "soulier"],
            "t-shirt": ["tshirt", "tee-shirt", "haut", "polo", "chemise"],
            "veste": ["jacket", "manteau", "blouson", "pull", "sweat"],
            
            # Livres
            "livre": ["book", "roman", "bouquin", "ouvrage", "livre de poche"],
            "manga": ["bande dessinée", "bd", "comic", "manhwa"],
            
            # Sport
            "ballon": ["ball", "ballon de foot", "ballon de basket", "ballon de rugby"],
            "tapis de sport": ["tapis de yoga", "yoga mat", "matelas de gym"],
            "haltère": ["dumbbell", "poids", "haltères", "barre de musculation"],
            
            # Maison
            "aspirateur": ["vacuum", "aspirateur robot", "balai électrique"],
            "cafetière": ["machine à café", "coffee maker", "expresso"],
            "micro-onde": ["microwave", "four micro-onde", "micro onde"],
        }
        
        # Schema complet de la base de données
        self.database_schema = """
═══════════════════════════════════════════════════════════════
SCHÉMA COMPLET DE LA BASE DE DONNÉES E-COMMERCE
═══════════════════════════════════════════════════════════════

🛍️ TABLES PRINCIPALES - PRODUITS & VENTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Table: produit
├── id_produit (int, PK, AUTO_INCREMENT)     : Identifiant unique du produit
├── name (varchar 255)                        : Nom commercial du produit
├── description (text)                        : Description détaillée
├── prix (double)                             : Prix unitaire en DHS (dirhams marocains)
├── quantite (int)                            : Stock disponible (>0 = en stock)
├── rating (double)                           : Note moyenne sur 5.0 (ex: 4.5)
├── reviews_count (int)                       : Nombre total d'avis clients
├── product_rank (int)                        : Rang de popularité (1-100, 100 = très populaire)
├── photo_url (varchar 255)                   : URL de l'image produit
└── id_categorie (int, FK)                    : Référence vers categorie.id_categorie

Table: categorie
├── id_categorie (int, PK, AUTO_INCREMENT)   : Identifiant unique de la catégorie
├── name_categorie (varchar 100)             : Nom (ex: 'Électronique', 'Livres', 'Vêtements')
└── description (text)                        : Description de la catégorie

Table: vente
├── id_client (bigint, PK)                   : Identifiant du client
├── date_vente (date, PK)                    : Date de la vente (format: YYYY-MM-DD)
├── heure_vente (time, PK)                   : Heure de la vente (format: HH:MM:SS)
├── id_produit (int, PK, FK)                 : Produit vendu
└── quantite (int)                            : Quantité vendue dans cette transaction

👥 TABLES UTILISATEURS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Table: personne (table parent pour tous les utilisateurs)
├── id (bigint, PK, AUTO_INCREMENT)
├── nom (varchar 100)
├── prenom (varchar 100)
├── email (varchar 150)
├── numero_tel (varchar 20)
├── address (varchar 200)
├── photo_url (varchar 255)
└── password (varchar 255)

Table: client (hérite de personne)
└── id_client (bigint, PK, FK → personne.id)

Table: employe (hérite de personne)
├── id_employe (bigint, PK, FK → personne.id)
├── salaire (decimal 10,2)
├── etat (enum: 'ACTIF', 'INACTIF', 'RETRAITE', 'SUSPENDU')
├── id_admin (bigint, FK)                    : Superviseur
└── id_role (int, FK)                        : Rôle de l'employé

Table: role
├── id_role (int, PK, AUTO_INCREMENT)
├── name_role (varchar 100)                  : Ex: 'Manager', 'Vendeur', 'Admin'
└── description (text)

💼 TABLES INVESTISSEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Table: investisseur
├── id_investisseur (bigint, PK)
├── nom_entreprise (varchar 200)
├── ice (varchar 200)                        : Identifiant Commun de l'Entreprise
├── email_entreprise (varchar 150)
├── numero_entreprise (varchar 50)
├── adresse_entreprise (varchar 255)
├── domaine_entreprise (varchar 200)         : Secteur d'activité
├── capital_disponible (decimal 15,2)        : Capital en DHS
└── logo_url (varchar 500)

Table: investissement (table de liaison)
├── id_investisseur (bigint, PK, FK)
├── id_produit (int, PK, FK)
├── id_categorie (int, PK, FK)
└── montant_investissement (decimal 10,2)    : Montant investi en DHS

📊 TABLES ANALYTIQUES & KPI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Table: kpi_global
├── id (bigint, PK, AUTO_INCREMENT)
├── mois (int)                               : 1-12
├── annee (int)                              : Ex: 2024
├── chiffre_affaires_total (decimal 18,2)   : CA total en DHS
├── nb_ventes (bigint)                       : Nombre de transactions
├── panier_moyen (decimal 18,2)              : Montant moyen par vente
└── created_at (datetime)

Table: prediction_ventes
├── id (bigint, PK, AUTO_INCREMENT)
├── mois (int)                               : 1-12
├── annee (int)
├── chiffre_affaires_prevu (decimal 18,2)   : Prévision CA en DHS
├── modele (varchar 100)                     : Nom du modèle ML utilisé
└── created_at (datetime)

🔧 TABLES GESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Table: gestion (journal des modifications produits)
├── id_employe (bigint, PK, FK)
├── id_produit (int, PK, FK)
└── effet (enum: 'AJOUT', 'MODIFICATION', 'SUPPRESSION')

💰 CONVERSIONS MONÉTAIRES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tous les montants sont stockés en DHS (Dirhams Marocains).
Conversions approximatives:
• 1 USD ($) = 10 DHS
• 1 EUR (€) = 11 DHS
• 1 MAD = 1 DHS
"""
    
    def expand_query_with_synonyms(self, query: str) -> str:
        """Enrichit la requête avec des synonymes et mots-clés associés"""
        query_lower = query.lower()
        expanded_terms = []
        
        # Chercher des correspondances dans le dictionnaire de synonymes
        for main_term, synonyms in self.semantic_keywords.items():
            if main_term in query_lower:
                expanded_terms.extend(synonyms)
            else:
                # Vérifier si un synonyme est dans la requête
                for synonym in synonyms:
                    if synonym in query_lower:
                        expanded_terms.extend([main_term] + [s for s in synonyms if s != synonym])
                        break
        
        if expanded_terms:
            # Retourner la requête originale + les termes enrichis
            return f"{query} | Termes associés à rechercher: {', '.join(set(expanded_terms))}"
        return query

    def translate_to_sql(self, natural_query: str) -> Dict:
        """Utilise OpenAI pour traduire une requête naturelle en SQL avec recherche sémantique"""
        
        # Enrichir la requête avec des synonymes
        enriched_query = self.expand_query_with_synonyms(natural_query)
        
        system_prompt = f"""Tu es un expert SQL MySQL spécialisé dans l'analyse de bases de données e-commerce.
Ta mission: traduire des requêtes en langage naturel (français/anglais) en SQL MySQL optimisé avec recherche INTELLIGENTE.

{self.database_schema}

═══════════════════════════════════════════════════════════════
🧠 RECHERCHE SÉMANTIQUE INTELLIGENTE (PRIORITÉ ABSOLUE)
═══════════════════════════════════════════════════════════════

⚠️ RÈGLE CRITIQUE: Quand l'utilisateur cherche un produit, utilise des recherches LARGES et FLEXIBLES

🎯 STRATÉGIE DE RECHERCHE:

1. **Recherche par mots-clés multiples avec LIKE**
   • Si l'utilisateur cherche "écouteurs" → cherche AUSSI: airpods, earbuds, oreillette, casque bluetooth
   • Si l'utilisateur cherche "téléphone" → cherche AUSSI: smartphone, iphone, samsung, mobile
   • Si l'utilisateur cherche "ordinateur" → cherche AUSSI: laptop, pc, macbook, portable
   
   FORMAT SQL:
   WHERE (p.name LIKE '%mot1%' OR p.name LIKE '%mot2%' OR p.name LIKE '%mot3%'
          OR p.description LIKE '%mot1%' OR p.description LIKE '%mot2%')

2. **Recherche dans le nom ET la description**
   • TOUJOURS chercher dans les 2 champs: p.name ET p.description
   • Exemple: 
     WHERE (p.name LIKE '%airpods%' OR p.description LIKE '%airpods%' 
            OR p.name LIKE '%écouteurs%' OR p.description LIKE '%écouteurs%')

3. **Utiliser les termes associés fournis**
   • Si la requête contient "| Termes associés à rechercher: ...", UTILISE TOUS CES TERMES
   • Crée une condition OR pour chaque terme
   • Exemple si "écouteurs | Termes associés: airpods, earbuds":
     WHERE (p.name LIKE '%écouteurs%' OR p.name LIKE '%airpods%' OR p.name LIKE '%earbuds%'
            OR p.description LIKE '%écouteurs%' OR p.description LIKE '%airpods%')

4. **Correspondances partielles**
   • Utilise TOUJOURS % avant et après: '%terme%'
   • Jamais de recherche exacte sauf si prix/ID

═══════════════════════════════════════════════════════════════
📋 RÈGLES DE GÉNÉRATION SQL
═══════════════════════════════════════════════════════════════

1. 🔗 JOINTURES OBLIGATOIRES
   ✓ TOUJOURS inclure LEFT JOIN avec categorie pour avoir name_categorie
   ✓ Format standard: 
     SELECT p.*, c.name_categorie 
     FROM produit p 
     LEFT JOIN categorie c ON p.id_categorie = c.id_categorie

2. 🔍 RECHERCHE FLEXIBLE
   • Utilise LIKE '%terme%' pour recherche souple
   • Combine avec OR pour chercher dans name ET description
   • Si plusieurs termes, utilise OR entre eux

3. ⚠️ LIMITE DE RÉSULTATS
   • TOUJOURS terminer par LIMIT 50 (sauf agrégations)

4. 📊 TRI ET CLASSEMENT
   • "meilleur/top/populaire" → ORDER BY p.rating DESC, p.reviews_count DESC
   • "pas cher/économique" → ORDER BY p.prix ASC
   • Recherche par texte → ORDER BY p.rating DESC (pertinence)

5. 💵 GESTION DES PRIX
   • Stockage: DHS uniquement
   • Conversions:
     - "100$" → 1000 DHS (×10)
     - "100€" → 1100 DHS (×11)
   • Comparaisons:
     - "moins de X" → p.prix < X
     - "plus de X" → p.prix > X
     - "environ X" → p.prix BETWEEN (X*0.9) AND (X*1.1)
     - "entre X et Y" → p.prix BETWEEN X AND Y

6. 📦 GESTION DU STOCK
   • "en stock/disponible" → p.quantite > 0
   • "rupture/indisponible" → p.quantite = 0

7. ⭐ NOTES ET AVIS
   • "bien noté" → p.rating >= 4.0
   • "excellent" → p.rating >= 4.5

8. 🏷️ CATÉGORIES
   • Utiliser LIKE '%categorie%' pour flexibilité

═══════════════════════════════════════════════════════════════
📚 EXEMPLES AVEC RECHERCHE INTELLIGENTE
═══════════════════════════════════════════════════════════════

Requête: "écouteurs"
SQL: SELECT p.*, c.name_categorie 
     FROM produit p 
     LEFT JOIN categorie c ON p.id_categorie = c.id_categorie 
     WHERE (p.name LIKE '%écouteurs%' OR p.name LIKE '%airpods%' OR p.name LIKE '%earbuds%' 
            OR p.name LIKE '%oreillette%' OR p.name LIKE '%casque bluetooth%'
            OR p.description LIKE '%écouteurs%' OR p.description LIKE '%airpods%') 
     ORDER BY p.rating DESC 
     LIMIT 50

Requête: "téléphone samsung"
SQL: SELECT p.*, c.name_categorie 
     FROM produit p 
     LEFT JOIN categorie c ON p.id_categorie = c.id_categorie 
     WHERE (p.name LIKE '%samsung%' OR p.description LIKE '%samsung%') 
       AND (p.name LIKE '%téléphone%' OR p.name LIKE '%smartphone%' OR p.name LIKE '%mobile%'
            OR p.description LIKE '%téléphone%' OR p.description LIKE '%smartphone%') 
     ORDER BY p.rating DESC 
     LIMIT 50

Requête: "ordinateur portable pas cher"
SQL: SELECT p.*, c.name_categorie 
     FROM produit p 
     LEFT JOIN categorie c ON p.id_categorie = c.id_categorie 
     WHERE (p.name LIKE '%ordinateur%' OR p.name LIKE '%laptop%' OR p.name LIKE '%portable%' 
            OR p.name LIKE '%pc%' OR p.name LIKE '%macbook%'
            OR p.description LIKE '%ordinateur%' OR p.description LIKE '%laptop%') 
     ORDER BY p.prix ASC 
     LIMIT 50

Requête: "casque gaming bien noté"
SQL: SELECT p.*, c.name_categorie 
     FROM produit p 
     LEFT JOIN categorie c ON p.id_categorie = c.id_categorie 
     WHERE (p.name LIKE '%casque%' OR p.name LIKE '%headset%' OR p.name LIKE '%gaming%'
            OR p.description LIKE '%casque%' OR p.description LIKE '%gaming%') 
       AND p.rating >= 4.0 
     ORDER BY p.rating DESC 
     LIMIT 50

Requête: "meilleurs produits électroniques"
SQL: SELECT p.*, c.name_categorie 
     FROM produit p 
     LEFT JOIN categorie c ON p.id_categorie = c.id_categorie 
     WHERE c.name_categorie LIKE '%électronique%' 
     ORDER BY p.rating DESC, p.reviews_count DESC 
     LIMIT 50

═══════════════════════════════════════════════════════════════
⚡ FORMAT DE RÉPONSE
═══════════════════════════════════════════════════════════════
• Retourne UNIQUEMENT le code SQL
• Pas de commentaires, pas de markdown ```sql
• SQL propre, formaté, prêt à l'exécution
• PRIORITÉ: Recherche large et flexible avec LIKE et OR
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Traduis cette requête en SQL MySQL avec recherche intelligente:\n\n{enriched_query}"}
                ],
                temperature=0.1,
                max_tokens=800
            )
            
            sql_query = response.choices[0].message.content.strip()
            
            # Nettoyage robuste
            sql_query = re.sub(r'```sql\n?', '', sql_query)
            sql_query = re.sub(r'```\n?', '', sql_query)
            sql_query = sql_query.strip()
            
            # Vérification LIMIT
            if "LIMIT" not in sql_query.upper() and "GROUP BY" not in sql_query.upper():
                sql_query += " LIMIT 50"
            
            return {
                "success": True,
                "sql_query": sql_query,
                "original_query": natural_query,
                "enriched_query": enriched_query,
                "model": self.model,
                "tokens_used": response.usage.total_tokens if hasattr(response, 'usage') else None
            }
            
        except Exception as e:
            print(f"❌ OpenAI API Error: {e}")
            return {
                "success": False,
                "error": str(e),
                "fallback_sql": self._generate_fallback_sql(natural_query)
            }
    
    def _generate_fallback_sql(self, query: str) -> str:
        """Génère une requête SQL de secours avec recherche intelligente"""
        query_lower = query.lower()
        
        base_sql = "SELECT p.*, c.name_categorie FROM produit p LEFT JOIN categorie c ON p.id_categorie = c.id_categorie"
        conditions = []
        order_by = ""
        
        # === RECHERCHE SÉMANTIQUE ===
        search_terms = []
        
        # Détecter les termes de recherche et leurs synonymes
        for main_term, synonyms in self.semantic_keywords.items():
            if main_term in query_lower:
                search_terms.extend([main_term] + synonyms[:3])  # Limiter à 3 synonymes
            else:
                for synonym in synonyms:
                    if synonym in query_lower:
                        search_terms.extend([main_term, synonym] + synonyms[:2])
                        break
        
        # Si des termes trouvés, créer condition de recherche large
        if search_terms:
            search_conditions = []
            for term in set(search_terms):  # Éliminer doublons
                search_conditions.append(f"p.name LIKE '%{term}%'")
                search_conditions.append(f"p.description LIKE '%{term}%'")
            conditions.append(f"({' OR '.join(search_conditions)})")
        
        # === CONVERSION DE PRIX ===
        def convert_price(amount_str, currency_context):
            try:
                amount = float(amount_str)
                if "$" in currency_context or "dollar" in currency_context:
                    return amount * 10
                elif "€" in currency_context or "euro" in currency_context:
                    return amount * 11
                return amount
            except:
                return None
        
        # === DÉTECTION PRIX ===
        price_pattern = r'(\d+(?:\.\d+)?)\s*(?:\$|€|dhs?|mad|dollar|euro)s?'
        price_matches = list(re.finditer(price_pattern, query_lower, re.IGNORECASE))
        
        if price_matches:
            if len(price_matches) >= 2 and "entre" in query_lower:
                price1 = convert_price(price_matches[0].group(1), price_matches[0].group(0))
                price2 = convert_price(price_matches[1].group(1), price_matches[1].group(0))
                if price1 and price2:
                    conditions.append(f"p.prix BETWEEN {min(price1, price2)} AND {max(price1, price2)}")
            else:
                price_match = price_matches[0]
                price = convert_price(price_match.group(1), price_match.group(0))
                if price:
                    if "moins" in query_lower or "<" in query_lower:
                        conditions.append(f"p.prix < {price}")
                    elif "plus" in query_lower or ">" in query_lower:
                        conditions.append(f"p.prix > {price}")
                    else:
                        conditions.append(f"p.prix = {price}")
        
        # === CATÉGORIES ===
        categories = {
            "electronique|électronique": "électronique",
            "livre|livres|book": "livre",
            "vetement|vêtement": "vêtement",
            "sport": "sport"
        }
        
        for patterns, cat_name in categories.items():
            if re.search(patterns, query_lower):
                conditions.append(f"c.name_categorie LIKE '%{cat_name}%'")
                break
        
        # === RATING ===
        if "bien noté" in query_lower:
            conditions.append("p.rating >= 4.0")
        elif "excellent" in query_lower:
            conditions.append("p.rating >= 4.5")
        
        # === STOCK ===
        if "en stock" in query_lower or "disponible" in query_lower:
            conditions.append("p.quantite > 0")
        
        # === TRI ===
        if "meilleur" in query_lower or "top" in query_lower:
            order_by = " ORDER BY p.rating DESC, p.reviews_count DESC"
        elif "pas cher" in query_lower:
            order_by = " ORDER BY p.prix ASC"
        else:
            order_by = " ORDER BY p.rating DESC"
        
        # === CONSTRUCTION ===
        if conditions:
            sql = base_sql + " WHERE " + " AND ".join(conditions)
        else:
            sql = base_sql
        
        sql += order_by + " LIMIT 50"
        return sql
    
    def understand_intent(self, query: str) -> Dict:
        """Analyse l'intention de la requête utilisateur"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system", 
                        "content": """Analyse l'intention d'une requête e-commerce.
                        
Catégories d'intention possibles:
- search_products: recherche de produits
- analytics: statistiques/KPI
- sales_analysis: analyse des ventes
- inventory: gestion stock
- users: gestion utilisateurs/clients
- investments: informations investisseurs

Réponds en JSON strict:
{
  "intent": "category",
  "filters": {
    "price_min": number|null,
    "price_max": number|null,
    "category": string|null,
    "min_rating": number|null,
    "in_stock": boolean|null
  },
  "entities": ["entity1", "entity2"],
  "time_period": string|null
}"""
                    },
                    {"role": "user", "content": f"Analyse cette requête: {query}"}
                ],
                temperature=0.1,
                max_tokens=300
            )
            
            content = response.choices[0].message.content.strip()
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            
            if json_match:
                return json.loads(json_match.group())
            else:
                return self._default_intent(query)
                
        except Exception as e:
            print(f"❌ Intent analysis error: {e}")
            return self._default_intent(query)
    
    def _default_intent(self, query: str) -> Dict:
        """Intention par défaut en cas d'erreur"""
        return {
            "intent": "search_products",
            "filters": {},
            "entities": [],
            "query": query
        }