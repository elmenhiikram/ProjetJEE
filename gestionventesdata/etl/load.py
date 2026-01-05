from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import pandas as pd
from sqlalchemy import MetaData, Table, create_engine, text


@dataclass
class LoadResult:
    inserted_ventes: int = 0
    upserted_produits: int = 0
    upserted_categories: int = 0
    inserted_kpi: int = 0
    inserted_predictions: int = 0


def _get_engine(database_url: str):
    if not database_url:
        raise ValueError("DATABASE_URL manquant. Configure 'etl.databaseUrl' côté Spring ou la variable d'environnement DATABASE_URL.")
    return create_engine(database_url, pool_pre_ping=True)


def upsert_dimension_tables(df: pd.DataFrame, database_url: str) -> LoadResult:
    """Upsert catégories + produits si les colonnes nécessaires existent.

    - Categorie: table `Categorie` (id_categorie, name_categorie, description)
    - Produit: table `produit` (id_produit, name, prix, description, photo_url, quantite, id_categorie)

    L'ETL reste tolérant: si les colonnes ne sont pas présentes, on saute.
    """
    engine = _get_engine(database_url)
    md = MetaData()

    res = LoadResult()

    # Reflect tables (existant côté JPA)
    categorie_table: Optional[Table]
    produit_table: Optional[Table]

    try:
        categorie_table = Table("Categorie", md, autoload_with=engine)
    except Exception:
        categorie_table = None

    try:
        produit_table = Table("produit", md, autoload_with=engine)
    except Exception:
        produit_table = None

    with engine.begin() as conn:
        # Categories
        if categorie_table is not None:
            if {"id_categorie", "categorie_nom"}.issubset(df.columns):
                cats = (
                    df[["id_categorie", "categorie_nom"]]
                    .dropna(subset=["id_categorie", "categorie_nom"])
                    .drop_duplicates()
                    .rename(columns={"categorie_nom": "name_categorie"})
                )

                rows = cats.to_dict(orient="records")
                if rows:
                    dialect = engine.dialect.name
                    if dialect == "postgresql":
                        from sqlalchemy.dialects.postgresql import insert

                        stmt = insert(categorie_table).values(rows)
                        stmt = stmt.on_conflict_do_update(
                            index_elements=[categorie_table.c.id_categorie],
                            set_={"name_categorie": stmt.excluded.name_categorie},
                        )
                        conn.execute(stmt)
                    elif dialect == "mysql":
                        from sqlalchemy.dialects.mysql import insert

                        stmt = insert(categorie_table).values(rows)
                        stmt = stmt.on_duplicate_key_update(name_categorie=stmt.inserted.name_categorie)
                        conn.execute(stmt)
                    else:
                        # fallback: best-effort insert
                        for r in rows:
                            conn.execute(categorie_table.insert().values(**r))

                    res.upserted_categories = len(rows)

        # Products
        if produit_table is not None:
            needed = {"id_produit", "produit_nom"}
            if needed.issubset(df.columns):
                cols = ["id_produit", "produit_nom"]
                if "prix_unitaire" in df.columns:
                    cols.append("prix_unitaire")
                if "id_categorie" in df.columns:
                    cols.append("id_categorie")

                prod = (
                    df[cols]
                    .dropna(subset=["id_produit", "produit_nom"])
                    .drop_duplicates(subset=["id_produit"])
                    .copy()
                )

                # Mapper vers schéma produit
                prod = prod.rename(columns={"produit_nom": "name", "prix_unitaire": "prix"})

                rows = prod.to_dict(orient="records")
                if rows:
                    dialect = engine.dialect.name
                    if dialect == "postgresql":
                        from sqlalchemy.dialects.postgresql import insert

                        stmt = insert(produit_table).values(rows)
                        update_set = {"name": stmt.excluded.name}
                        if "prix" in prod.columns:
                            update_set["prix"] = stmt.excluded.prix
                        if "id_categorie" in prod.columns:
                            update_set["id_categorie"] = stmt.excluded.id_categorie

                        stmt = stmt.on_conflict_do_update(
                            index_elements=[produit_table.c.id_produit],
                            set_=update_set,
                        )
                        conn.execute(stmt)
                    elif dialect == "mysql":
                        from sqlalchemy.dialects.mysql import insert

                        stmt = insert(produit_table).values(rows)
                        update_set = {"name": stmt.inserted.name}
                        if "prix" in prod.columns:
                            update_set["prix"] = stmt.inserted.prix
                        if "id_categorie" in prod.columns:
                            update_set["id_categorie"] = stmt.inserted.id_categorie

                        stmt = stmt.on_duplicate_key_update(**update_set)
                        conn.execute(stmt)
                    else:
                        for r in rows:
                            conn.execute(produit_table.insert().values(**r))

                    res.upserted_produits = len(rows)

    return res


def insert_ventes(df: pd.DataFrame, database_url: str) -> int:
    """Insertion dans la table métier `Vente` si colonnes présentes.

    Colonnes attendues (côté JPA): id_client, id_produit, date_vente, heure_vente, quantite
    """
    needed = {"id_client", "id_produit", "date_vente", "heure_vente", "quantite"}
    if not needed.issubset(df.columns):
        return 0

    engine = _get_engine(database_url)
    md = MetaData()
    vente_table = Table("Vente", md, autoload_with=engine)

    # Filtrer lignes complètes
    sales = df[list(needed)].dropna().copy()
    if sales.empty:
        return 0

    rows = sales.to_dict(orient="records")

    with engine.begin() as conn:
        dialect = engine.dialect.name
        if dialect == "postgresql":
            from sqlalchemy.dialects.postgresql import insert

            stmt = insert(vente_table).values(rows)
            # clé composite -> ne rien faire si doublon
            stmt = stmt.on_conflict_do_nothing(index_elements=[
                vente_table.c.id_client,
                vente_table.c.id_produit,
                vente_table.c.date_vente,
                vente_table.c.heure_vente,
            ])
            conn.execute(stmt)
        elif dialect == "mysql":
            from sqlalchemy.dialects.mysql import insert

            stmt = insert(vente_table).values(rows)
            # si doublon, on met à jour la quantité
            stmt = stmt.on_duplicate_key_update(quantite=stmt.inserted.quantite)
            conn.execute(stmt)
        else:
            conn.execute(vente_table.insert(), rows)

    return len(rows)


def replace_monthly_table(table_name: str, df: pd.DataFrame, database_url: str, key_cols=("annee", "mois")) -> int:
    """Remplace les lignes d'un mois/année (delete puis insert).

    Pratique pour rerun ETL sans doublons.
    """
    if df.empty:
        return 0

    engine = _get_engine(database_url)
    with engine.begin() as conn:
        # delete per key
        keys = df[list(key_cols)].dropna().drop_duplicates().to_dict(orient="records")
        for k in keys:
            conn.execute(
                text(
                    f"DELETE FROM {table_name} WHERE annee = :annee AND mois = :mois"
                ),
                {"annee": int(k["annee"]), "mois": int(k["mois"])},
            )

        df.to_sql(table_name, conn, if_exists="append", index=False)

    return len(df)
