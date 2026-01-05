from __future__ import annotations

import pandas as pd


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = (
        df.columns.astype(str)
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
        .str.replace("-", "_", regex=False)
    )
    return df


def clean_sales_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Nettoyage générique:
    - normalise les noms de colonnes
    - supprime doublons
    - gère valeurs manquantes de base
    - cast types (date/heure/quantité/prix si présents)

    Le pipeline est tolerant: il nettoie ce qu'il trouve.
    """
    df = normalize_columns(df)

    # Supprimer lignes entièrement vides
    df = df.dropna(how="all")

    # Doublons exacts
    df = df.drop_duplicates()

    # Harmoniser colonnes attendues (synonymes)
    rename_map = {
        "idclient": "id_client",
        "client_id": "id_client",
        "idproduit": "id_produit",
        "produit_id": "id_produit",
        "date": "date_vente",
        "datevente": "date_vente",
        "heure": "heure_vente",
        "heurevente": "heure_vente",
        "qty": "quantite",
        "quantity": "quantite",
        "prix": "prix_unitaire",
        "prixunitaire": "prix_unitaire",
        "price": "prix_unitaire",
        "categorie": "categorie_nom",
        "category": "categorie_nom",
        "nom_categorie": "categorie_nom",
        "produit": "produit_nom",
        "nom_produit": "produit_nom",
        "name": "produit_nom",
    }

    for src, dst in rename_map.items():
        if src in df.columns and dst not in df.columns:
            df = df.rename(columns={src: dst})

    # Types
    if "date_vente" in df.columns:
        df["date_vente"] = pd.to_datetime(df["date_vente"], errors="coerce").dt.date

    if "heure_vente" in df.columns:
        # Accepte HH:MM:SS ou HH:MM
        df["heure_vente"] = pd.to_datetime(df["heure_vente"], errors="coerce").dt.time

    if "quantite" in df.columns:
        df["quantite"] = pd.to_numeric(df["quantite"], errors="coerce").fillna(0).astype(int)

    if "prix_unitaire" in df.columns:
        df["prix_unitaire"] = pd.to_numeric(df["prix_unitaire"], errors="coerce").fillna(0.0)

    # Valeurs manquantes sur IDs: si indispensables, on les garde en NaN et on filtrera plus tard.
    return df
