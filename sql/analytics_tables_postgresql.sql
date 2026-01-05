-- Variante PostgreSQL

CREATE TABLE IF NOT EXISTS kpi_global (
    id BIGSERIAL PRIMARY KEY,
    annee INT NOT NULL,
    mois INT NOT NULL,
    chiffre_affaires_total NUMERIC(18,2) NOT NULL,
    nb_ventes BIGINT NOT NULL,
    panier_moyen NUMERIC(18,2),
    created_at TIMESTAMP NULL,
    CONSTRAINT uk_kpi_global UNIQUE (annee, mois)
);

CREATE TABLE IF NOT EXISTS prediction_ventes (
    id BIGSERIAL PRIMARY KEY,
    annee INT NOT NULL,
    mois INT NOT NULL,
    chiffre_affaires_prevu NUMERIC(18,2) NOT NULL,
    modele VARCHAR(100),
    created_at TIMESTAMP NULL,
    CONSTRAINT uk_prediction_ventes UNIQUE (annee, mois)
);

CREATE INDEX IF NOT EXISTS idx_kpi_global_annee_mois ON kpi_global (annee, mois);
CREATE INDEX IF NOT EXISTS idx_prediction_annee_mois ON prediction_ventes (annee, mois);
