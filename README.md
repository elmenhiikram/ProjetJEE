# Système de Gestion des Ventes

Une application web complète pour la gestion des ventes, développée avec une architecture moderne full-stack incluant un backend Spring Boot, un frontend React, un pipeline ETL Python et un système de recherche sémantique.

## 📋 Table des Matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du Projet](#structure-du-projet)
- [Fonctionnalités](#fonctionnalités)
- [API Documentation](#api-documentation)

## 🎯 Vue d'ensemble

Ce projet est une application de gestion des ventes complète qui permet de :
- Gérer les produits, clients, employés et investisseurs
- Traiter et analyser les données de ventes
- Effectuer des recherches sémantiques intelligentes
- Visualiser les statistiques et tableaux de bord
- Importer et exporter des données via CSV

## 🏗️ Architecture

Le projet est composé de 4 modules principaux :

```
ProjetJEE3/
├── gestionventesbackend/     # Backend Spring Boot (API REST)
├── gestionventesfrontend/    # Frontend React + TypeScript
├── gestionventesdata/        # Pipeline ETL Python
└── Rech_semtq/              # Service de recherche sémantique
```

### Architecture Multi-tiers

1. **Frontend** : Interface utilisateur React avec Vite et TailwindCSS
2. **Backend** : API REST Spring Boot avec Spring Security
3. **ETL** : Pipeline de traitement et nettoyage des données
4. **Recherche** : Service de recherche sémantique avec OpenAI
5. **Base de données** : MySQL pour le stockage persistant

## 🛠️ Technologies

### Backend (gestionventesbackend)
- **Framework** : Spring Boot 3.2.0
- **Java** : Version 21
- **Base de données** : MySQL avec JPA/Hibernate
- **Sécurité** : Spring Security avec authentification
- **Build** : Maven

### Frontend (gestionventesfrontend)
- **Framework** : React 18.3.1
- **Language** : TypeScript
- **Build** : Vite
- **UI** : TailwindCSS + Radix UI
- **Routing** : React Router DOM 6.30.2
- **Charts** : Recharts, Chart.js
- **HTTP** : Axios
- **Export** : jsPDF, html2canvas

### ETL Pipeline (gestionventesdata)
- **Python** : 3.x
- **Data Processing** : Pandas
- **Database** : SQLAlchemy, PyMySQL, Psycopg

### Recherche Sémantique (Rech_semtq)
- **Framework** : FastAPI 0.104.1
- **Server** : Uvicorn
- **Database** : SQLAlchemy, PyMySQL
- **IA** : OpenAI API 1.3.0
- **Embeddings** : all-MiniLM-L6-v2

## 📦 Prérequis

- **Java** : JDK 21 ou supérieur
- **Node.js** : Version 18 ou supérieur
- **Python** : Version 3.8 ou supérieur
- **MySQL** : Version 8.0 ou supérieur (XAMPP recommandé)
- **Maven** : Version 3.6 ou supérieur
- **npm** ou **yarn** : Pour la gestion des packages Node.js

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd ProjetJEE3
```

### 2. Configuration de la Base de Données

1. Démarrez XAMPP ou votre serveur MySQL
2. Créez la base de données :

```sql
CREATE DATABASE gestionvente CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Installation du Backend

```bash
cd gestionventesbackend
mvnw clean install
```

Ou sur Windows :
```bash
mvnw.cmd clean install
```

### 4. Installation du Frontend

```bash
cd gestionventesfrontend
npm install
```

### 5. Installation du Pipeline ETL

```bash
cd gestionventesdata
pip install -r requirements.txt
```

### 6. Installation du Service de Recherche

```bash
cd Rech_semtq
pip install -r requirements.txt
```

## ⚙️ Configuration

### Backend (application.properties)

```properties
# Base de données
spring.datasource.url=jdbc:mysql://localhost:3307/gestionvente
spring.datasource.username=root
spring.datasource.password=

# Serveur
server.port=9090
```

### Service de Recherche (.env)

Créez un fichier `.env` dans le dossier `Rech_semtq/` :

```env
OPENAI_API_KEY=votre_clé_api_openai
OPENAI_MODEL=gpt-3.5-turbo
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=gestionvente
SEARCH_MODEL=all-MiniLM-L6-v2
```

### Frontend (Variables d'environnement)

Le frontend se connecte par défaut au backend sur `http://localhost:9090`

## 🎮 Utilisation

### Démarrer le Backend

```bash
cd gestionventesbackend
mvnw spring-boot:run
```

Le backend sera accessible sur : `http://localhost:9090`

### Démarrer le Frontend

```bash
cd gestionventesfrontend
npm run dev
```

Le frontend sera accessible sur : `http://localhost:5173`

### Démarrer le Service de Recherche

Sur Windows :
```bash
cd Rech_semtq
start_server.bat
```

Sur Linux/Mac :
```bash
cd Rech_semtq
./start_server.sh
```

Ou directement avec Python :
```bash
cd Rech_semtq
python start.py
```

Le service de recherche sera accessible sur : `http://localhost:8000`

### Exécuter le Pipeline ETL

```bash
cd gestionventesdata/etl
python etl_pipeline.py
```

## 📁 Structure du Projet

```
ProjetJEE3/
│
├── gestionventesbackend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/...
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── data_users.sql
│   │   └── test/
│   ├── data/uploads/          # Fichiers CSV uploadés
│   └── pom.xml
│
├── gestionventesfrontend/
│   ├── src/
│   │   ├── api/              # Clients API
│   │   ├── components/       # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   ├── routes/          # Configuration des routes
│   │   ├── contexts/        # Contextes React
│   │   └── utils/           # Utilitaires
│   ├── public/
│   └── package.json
│
├── gestionventesdata/
│   └── etl/
│       ├── etl_pipeline.py   # Pipeline principal
│       ├── cleaning.py       # Nettoyage des données
│       ├── transform.py      # Transformations
│       └── load.py          # Chargement en BDD
│
├── Rech_semtq/
│   ├── app/
│   │   ├── main.py          # Point d'entrée FastAPI
│   │   ├── search_service.py # Service de recherche
│   │   ├── openai_service.py # Intégration OpenAI
│   │   └── config.py        # Configuration
│   ├── start_server.bat     # Script Windows
│   └── start_server.sh      # Script Linux/Mac
│
├── exemple_produits.csv      # Données d'exemple
└── README.md                 # Ce fichier
```

## ✨ Fonctionnalités

### Gestion des Entités
- ✅ **Produits** : CRUD complet, import CSV, gestion du stock
- ✅ **Clients** : Gestion des informations clients
- ✅ **Employés** : Gestion du personnel
- ✅ **Investisseurs** : Suivi des investissements
- ✅ **Catégories** : Organisation des produits
- ✅ **Ventes** : Enregistrement et suivi des ventes

### Fonctionnalités Avancées
- 🔐 **Authentification** : Système de connexion sécurisé
- 📊 **Tableaux de Bord** : Visualisation des statistiques
- 📈 **Graphiques** : Analyses visuelles avec Recharts
- 📄 **Export PDF** : Génération de rapports
- 🔍 **Recherche Sémantique** : Recherche intelligente basée sur l'IA
- 📥 **Import CSV** : Import de données en masse
- 🎨 **Interface Moderne** : UI responsive avec TailwindCSS

### ETL Pipeline
- Nettoyage automatique des données
- Validation et transformation
- Chargement optimisé en base de données
- Support multi-sources (CSV, bases de données)

### Recherche Sémantique
- Recherche en langage naturel
- Indexation vectorielle des produits
- Suggestions intelligentes
- API REST pour intégration

## 📚 API Documentation

### Backend API (Port 9090)

#### Authentification
```
POST /api/auth/login
POST /api/auth/register
```

#### Produits
```
GET    /api/produits
POST   /api/produits
GET    /api/produits/{id}
PUT    /api/produits/{id}
DELETE /api/produits/{id}
POST   /api/produits/upload
```

#### Clients
```
GET    /api/clients
POST   /api/clients
GET    /api/clients/{id}
PUT    /api/clients/{id}
DELETE /api/clients/{id}
```

#### Ventes
```
GET    /api/ventes
POST   /api/ventes
GET    /api/ventes/{id}
```

#### Dashboard
```
GET    /api/dashboard/stats
GET    /api/dashboard/charts
```

### Recherche Sémantique API (Port 8000)

```
GET    /api/search?q=recherche
POST   /api/search/index
GET    /api/health
```

## 🔧 Développement

### Backend

Pour compiler et packager :
```bash
mvnw clean package
```

Pour exécuter les tests :
```bash
mvnw test
```

### Frontend

Pour le mode développement :
```bash
npm run dev
```

Pour la production :
```bash
npm run build
npm run preview
```

### Linting
```bash
npm run lint
```

## 🐛 Dépannage

### Problème de connexion à la base de données
- Vérifiez que MySQL est démarré (XAMPP)
- Vérifiez le port dans `application.properties` (3306 ou 3307)
- Vérifiez les credentials (username/password)

### Erreur CORS
- Vérifiez la configuration CORS dans le backend
- Le backend doit autoriser l'origine du frontend

### Service de recherche ne démarre pas
- Vérifiez que la clé OpenAI est valide dans `.env`
- Vérifiez que le port 8000 est libre
- Installez toutes les dépendances Python

## 📝 Notes

- Par défaut, le backend utilise le port **9090**
- Le frontend en dev utilise le port **5173**
- Le service de recherche utilise le port **8000**
- Les fichiers uploadés sont stockés dans `gestionventesbackend/data/uploads/`
- Les mots de passe sont hashés avec BCrypt
- Un script `generate_bcrypt_hash.py` est disponible pour générer des hashes

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est développé dans un cadre académique.

## 👥 Auteurs

Projet développé pour le cours de Java EE.

---

**Dernière mise à jour** : Février 2026
