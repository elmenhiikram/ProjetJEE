-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS gestionvente CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE gestionvente;

-- Afficher un message de confirmation
SELECT 'Base de données gestionvente créée avec succès!' AS message;
