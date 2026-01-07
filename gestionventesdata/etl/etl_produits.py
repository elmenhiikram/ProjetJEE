from __future__ import annotations

import argparse
import os
import sys

import pandas as pd
from sqlalchemy import create_engine, text


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="ETL pipeline pour l'import de produits (CSV -> DB)")
    p.add_argument("--input", required=True, help="Chemin du fichier CSV")
    return p.parse_args()


def clean_products_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """Nettoie et valide le DataFrame des produits"""
    # Supprimer les lignes vides
    df = df.dropna(subset=['nom'])
    
    # Nettoyer les colonnes numériques
    if 'prix' in df.columns:
        df['prix'] = pd.to_numeric(df['prix'], errors='coerce').fillna(0)
    
    if 'stock' in df.columns:
        df['stock'] = pd.to_numeric(df['stock'], errors='coerce').fillna(0)
    
    if 'seuilAlerte' in df.columns:
        df['seuilAlerte'] = pd.to_numeric(df['seuilAlerte'], errors='coerce').fillna(5)
    
    # Nettoyer les espaces
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].str.strip() if df[col].dtype == 'object' else df[col]
    
    return df


def upsert_categories(df: pd.DataFrame, database_url: str) -> int:
    """Insère ou met à jour les catégories"""
    if 'categorie' not in df.columns:
        return 0
    
    engine = create_engine(database_url)
    categories = df['categorie'].dropna().unique()
    
    inserted = 0
    with engine.connect() as conn:
        for cat_name in categories:
            # Vérifier si la catégorie existe
            result = conn.execute(
                text("SELECT id FROM categorie WHERE nom = :nom"),
                {"nom": cat_name}
            )
            if not result.fetchone():
                # Insérer la nouvelle catégorie
                conn.execute(
                    text("INSERT INTO categorie (nom, description) VALUES (:nom, :desc)"),
                    {"nom": cat_name, "desc": f"Catégorie {cat_name}"}
                )
                inserted += 1
        conn.commit()
    
    return inserted


def insert_products(df: pd.DataFrame, database_url: str) -> int:
    """Insère les produits dans la base de données"""
    engine = create_engine(database_url)
    inserted = 0
    
    with engine.connect() as conn:
        # Récupérer les catégories existantes
        cat_result = conn.execute(text("SELECT id, nom FROM categorie"))
        categories = {row[1]: row[0] for row in cat_result}
        
        for _, row in df.iterrows():
            cat_id = categories.get(row.get('categorie', ''), None)
            
            # Vérifier si le produit existe déjà
            result = conn.execute(
                text("SELECT id FROM produit WHERE nom = :nom"),
                {"nom": row['nom']}
            )
            existing = result.fetchone()
            
            if existing:
                # Mettre à jour le produit existant
                conn.execute(
                    text("""
                        UPDATE produit 
                        SET description = :desc, 
                            prix = :prix, 
                            quantite = :stock,
                            seuil_alerte = :seuil,
                            image = :image,
                            categorie_id = :cat_id
                        WHERE nom = :nom
                    """),
                    {
                        "nom": row['nom'],
                        "desc": row.get('description', ''),
                        "prix": float(row.get('prix', 0)),
                        "stock": int(row.get('stock', 0)),
                        "seuil": int(row.get('seuilAlerte', 5)),
                        "image": row.get('image', ''),
                        "cat_id": cat_id
                    }
                )
            else:
                # Insérer un nouveau produit
                conn.execute(
                    text("""
                        INSERT INTO produit 
                        (nom, description, prix, quantite, seuil_alerte, image, categorie_id, statut)
                        VALUES (:nom, :desc, :prix, :stock, :seuil, :image, :cat_id, 'ACTIF')
                    """),
                    {
                        "nom": row['nom'],
                        "desc": row.get('description', ''),
                        "prix": float(row.get('prix', 0)),
                        "stock": int(row.get('stock', 0)),
                        "seuil": int(row.get('seuilAlerte', 5)),
                        "image": row.get('image', ''),
                        "cat_id": cat_id
                    }
                )
                inserted += 1
        
        conn.commit()
    
    return inserted


def main() -> int:
    args = parse_args()
    
    database_url = os.environ.get("DATABASE_URL", "").strip()
    if not database_url:
        raise ValueError("DATABASE_URL manquant dans l'environnement")
    
    csv_path = args.input
    
    # Lire et nettoyer le CSV
    df = pd.read_csv(csv_path)
    df = clean_products_dataframe(df)
    
    print(f"Produits à importer: {len(df)}")
    
    # 1) Insérer/mettre à jour les catégories
    upserted_categories = upsert_categories(df, database_url)
    print(f"Catégories créées: {upserted_categories}")
    
    # 2) Insérer/mettre à jour les produits
    inserted_products = insert_products(df, database_url)
    print(f"Produits insérés/mis à jour: {inserted_products}")
    
    print("ETL_PRODUITS_OK")
    print({
        "total_rows": len(df),
        "categories_created": upserted_categories,
        "products_inserted": inserted_products
    })
    
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        print(f"ETL_FAILED: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        raise
