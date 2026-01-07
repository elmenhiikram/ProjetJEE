# Import CSV avec ETL - Gestion des Produits

## 📋 Vue d'ensemble

Cette fonctionnalité permet d'importer des produits en masse via un fichier CSV avec un processus ETL (Extract, Transform, Load) automatique.

## 🎯 Fonctionnalités

### Extract (Extraction)
- Lecture du fichier CSV uploadé
- Validation du format et des en-têtes
- Parsing ligne par ligne

### Transform (Transformation)
- Nettoyage des données (suppression espaces multiples, trim)
- Validation des types de données (prix, stock, etc.)
- Normalisation des noms
- Vérification de l'existence des catégories
- Détection des doublons

### Load (Chargement)
- Insertion des nouveaux produits
- Mise à jour des produits existants (basé sur le nom)
- Gestion des erreurs par ligne
- Rapport détaillé de l'import

## 📝 Format du fichier CSV

### Colonnes obligatoires
- `nom` : Nom du produit (texte, non vide)
- `prix` : Prix du produit (nombre décimal, > 0)
- `stock` : Quantité en stock (entier, >= 0)
- `categorie` : Nom de la catégorie (doit exister dans la base)

### Colonnes optionnelles
- `description` : Description détaillée du produit
- `seuilAlerte` : Seuil d'alerte pour le stock faible
- `image` : URL de l'image du produit

### Exemple de structure
```csv
nom,description,prix,stock,categorie,seuilAlerte,image
Ordinateur Portable,Ordinateur portable 15 pouces,899.99,50,Informatique,10,https://example.com/laptop.jpg
Souris Sans Fil,Souris ergonomique sans fil,29.99,150,Informatique,20,https://example.com/mouse.jpg
```

## 🚀 Utilisation

### Via l'interface web (Dashboard Analyste)

1. Accédez à la section **"Import CSV"** dans le dashboard analyste
2. Téléchargez le modèle CSV si nécessaire
3. Préparez votre fichier CSV avec vos données
4. Glissez-déposez le fichier ou cliquez pour le sélectionner
5. Cliquez sur **"Importer et traiter les données"**
6. Consultez le rapport d'import détaillé

### Via l'API REST

**Endpoint :** `POST /api/produits/import-csv`

**Headers :**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body :**
- `file` : Fichier CSV (multipart/form-data)

**Réponse succès (200) :**
```json
{
  "success": true,
  "message": "Import terminé avec succès",
  "totalRows": 20,
  "insertedRows": 18,
  "updatedRows": 2,
  "errorRows": 0
}
```

**Réponse avec erreurs (200) :**
```json
{
  "success": true,
  "message": "Import terminé avec succès",
  "totalRows": 20,
  "insertedRows": 15,
  "updatedRows": 3,
  "errorRows": 2,
  "errors": [
    {
      "row": 5,
      "error": "Catégorie non trouvée: NonExistante"
    },
    {
      "row": 12,
      "error": "Prix invalide: abc"
    }
  ]
}
```

**Réponse erreur (400) :**
```json
{
  "success": false,
  "error": "Le CSV doit contenir les colonnes: nom, prix, stock, categorie"
}
```

## ⚙️ Traitement ETL détaillé

### 1. Extraction
- Vérification du fichier (non vide, format .csv)
- Lecture des en-têtes
- Validation des colonnes obligatoires
- Parsing ligne par ligne

### 2. Transformation
Pour chaque ligne :
- **Nom** : Nettoyage (suppression espaces multiples, trim)
- **Prix** : Conversion en Double, validation > 0
- **Stock** : Conversion en Integer, validation >= 0
- **Catégorie** : Recherche dans la base (insensible à la casse)
- **Description** : Trim si présente
- **Image** : Trim si présente
- **Seuil d'alerte** : Conversion si présent et valide

### 3. Chargement
- Recherche de produit existant par nom
- Si existe : mise à jour
- Si n'existe pas : création
- Sauvegarde en base de données
- Gestion des erreurs par ligne sans arrêter le processus

## 🔒 Sécurité

- Authentification JWT requise
- Rôle "Analyste" recommandé
- Validation stricte des données
- Gestion des erreurs par ligne
- Transactions isolées par produit

## 📊 Statistiques de l'import

L'import retourne :
- **totalRows** : Nombre total de lignes traitées
- **insertedRows** : Produits créés
- **updatedRows** : Produits mis à jour
- **errorRows** : Lignes en erreur
- **errors** : Détail des erreurs (ligne + message)
- **duration** : Durée du traitement (côté frontend)

## ⚠️ Points d'attention

### Catégories
Les catégories doivent exister dans la base de données avant l'import. Créez-les via la section "Gestion des Catégories" si nécessaire.

### Doublons
Les produits sont identifiés par leur nom (insensible à la casse). Si un produit avec le même nom existe, il sera mis à jour plutôt que créé.

### Encodage
Le fichier CSV doit être encodé en UTF-8 pour gérer correctement les caractères accentués.

### Séparateur
Le séparateur doit être une virgule (,). Pour les champs contenant des virgules, entourez-les de guillemets doubles.

### Taille maximale
La taille maximale du fichier dépend de la configuration du serveur (par défaut 10MB dans Spring Boot).

## 🛠️ Développement

### Backend (Java/Spring Boot)

**Contrôleur :** `ProduitController.java`
```java
@PostMapping("/api/produits/import-csv")
public ResponseEntity<?> importProductsFromCsv(@RequestParam("file") MultipartFile file)
```

**Repository :** `CategorieRepository.java`
```java
Categorie findByNomIgnoreCase(String nom);
```

### Frontend (React/TypeScript)

**Composant :** `ProductCsvImport.tsx`
- Drag & drop de fichiers
- Téléchargement du modèle
- Affichage du rapport d'import
- Gestion des erreurs

**Intégration :** `AnalysteDashboard.tsx`
- Section "Import CSV" dans la sidebar
- Guide d'utilisation
- Instructions détaillées

## 📞 Support

Pour toute question ou problème :
1. Consultez les logs du backend
2. Vérifiez le format de votre fichier CSV
3. Assurez-vous que les catégories existent
4. Vérifiez les données dans les lignes en erreur

## 🔄 Améliorations futures

- [ ] Import asynchrone pour gros fichiers
- [ ] Prévisualisation avant import
- [ ] Support d'autres formats (Excel, JSON)
- [ ] Import incrémental
- [ ] Mapping personnalisé des colonnes
- [ ] Validation avancée avec règles métier
- [ ] Historique des imports
- [ ] Rollback en cas d'erreur critique
