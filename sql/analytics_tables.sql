-- Tables analytiques (MySQL / PostgreSQL)
-- Remarque: adapte les types si nécessaire.

-- ----------------------------------------------------
-- KPI GLOBAL (agrégations mensuelles)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS kpi_global (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    annee INT NOT NULL,
    mois INT NOT NULL,
    chiffre_affaires_total DECIMAL(18,2) NOT NULL,
    nb_ventes BIGINT NOT NULL,
    panier_moyen DECIMAL(18,2),
    created_at TIMESTAMP NULL,
    CONSTRAINT uk_kpi_global UNIQUE (annee, mois)
);

-- ----------------------------------------------------
-- PREDICTION VENTES (prévisions mensuelles)
-- ----------------------------------------------------
CREATE TABLE IF NOT EXISTS prediction_ventes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    annee INT NOT NULL,
    mois INT NOT NULL,
    chiffre_affaires_prevu DECIMAL(18,2) NOT NULL,
    modele VARCHAR(100),
    created_at TIMESTAMP NULL,
    CONSTRAINT uk_prediction_ventes UNIQUE (annee, mois)
);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_kpi_global_annee_mois ON kpi_global (annee, mois);
CREATE INDEX IF NOT EXISTS idx_prediction_annee_mois ON prediction_ventes (annee, mois);
