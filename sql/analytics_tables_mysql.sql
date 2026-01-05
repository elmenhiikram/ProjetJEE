-- Variante MySQL 8 (si ton SGBD ne supporte pas GENERATED ALWAYS AS IDENTITY)

CREATE TABLE IF NOT EXISTS kpi_global (
    id BIGINT NOT NULL AUTO_INCREMENT,
    annee INT NOT NULL,
    mois INT NOT NULL,
    chiffre_affaires_total DECIMAL(18,2) NOT NULL,
    nb_ventes BIGINT NOT NULL,
    panier_moyen DECIMAL(18,2),
    created_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_kpi_global (annee, mois)
);

CREATE TABLE IF NOT EXISTS prediction_ventes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    annee INT NOT NULL,
    mois INT NOT NULL,
    chiffre_affaires_prevu DECIMAL(18,2) NOT NULL,
    modele VARCHAR(100),
    created_at TIMESTAMP NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_prediction_ventes (annee, mois)
);

CREATE INDEX idx_kpi_global_annee_mois ON kpi_global (annee, mois);
CREATE INDEX idx_prediction_annee_mois ON prediction_ventes (annee, mois);
