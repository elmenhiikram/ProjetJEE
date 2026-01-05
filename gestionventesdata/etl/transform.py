from __future__ import annotations

import pandas as pd


def add_derived_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Transformations analytiques:
    - chiffre_affaires = quantite * prix_unitaire (si les deux existent)
    - annee, mois dérivés de date_vente
    """
    df = df.copy()

    if "quantite" in df.columns and "prix_unitaire" in df.columns:
        df["chiffre_affaires"] = df["quantite"].astype(float) * df["prix_unitaire"].astype(float)

    if "date_vente" in df.columns:
        date_series = pd.to_datetime(df["date_vente"], errors="coerce")
        df["annee"] = date_series.dt.year
        df["mois"] = date_series.dt.month

    return df


def build_kpi_global(df: pd.DataFrame) -> pd.DataFrame:
    """Agrégation mensuelle dans le format de la table kpi_global."""
    required = {"annee", "mois", "chiffre_affaires"}
    if not required.issubset(set(df.columns)):
        return pd.DataFrame(columns=["annee", "mois", "chiffre_affaires_total", "nb_ventes", "panier_moyen", "created_at"])

    g = df.dropna(subset=["annee", "mois"]).groupby(["annee", "mois"], as_index=False)

    out = g.agg(
        chiffre_affaires_total=("chiffre_affaires", "sum"),
        nb_ventes=("chiffre_affaires", "count"),
        panier_moyen=("chiffre_affaires", "mean"),
    )

    out["created_at"] = pd.Timestamp.utcnow().to_pydatetime()
    return out


def build_prediction_ventes(kpi_df: pd.DataFrame) -> pd.DataFrame:
    """Prévision simple (baseline) : moyenne mobile sur les 3 derniers mois.

    Produit une prévision pour le mois suivant le dernier mois connu.
    """
    if kpi_df.empty:
        return pd.DataFrame(columns=["annee", "mois", "chiffre_affaires_prevu", "modele", "created_at"])

    tmp = kpi_df.copy()
    tmp = tmp.sort_values(["annee", "mois"]).reset_index(drop=True)

    series = tmp["chiffre_affaires_total"].astype(float)
    pred_value = series.tail(3).mean() if len(series) >= 1 else 0.0

    last_year = int(tmp.iloc[-1]["annee"])
    last_month = int(tmp.iloc[-1]["mois"])

    next_year = last_year + 1 if last_month == 12 else last_year
    next_month = 1 if last_month == 12 else last_month + 1

    out = pd.DataFrame(
        [
            {
                "annee": next_year,
                "mois": next_month,
                "chiffre_affaires_prevu": float(pred_value),
                "modele": "moving_average_3m",
                "created_at": pd.Timestamp.utcnow().to_pydatetime(),
            }
        ]
    )
    return out
