from __future__ import annotations

import argparse
import os
import sys

import pandas as pd

from cleaning import clean_sales_dataframe
from transform import add_derived_columns, build_kpi_global, build_prediction_ventes
from load import (
    insert_ventes,
    replace_monthly_table,
    upsert_dimension_tables,
)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="ETL pipeline (CSV -> cleaning -> transform -> DB load)")
    p.add_argument("--input", required=True, help="Chemin du fichier CSV")
    return p.parse_args()


def main() -> int:
    args = parse_args()

    database_url = os.environ.get("DATABASE_URL", "").strip()
    csv_path = args.input

    df = pd.read_csv(csv_path)
    df = clean_sales_dataframe(df)
    df = add_derived_columns(df)

    # 1) Tables métier (best-effort)
    dim_res = upsert_dimension_tables(df, database_url)
    inserted_ventes = insert_ventes(df, database_url)

    # 2) Tables analytiques
    kpi_df = build_kpi_global(df)
    pred_df = build_prediction_ventes(kpi_df)

    inserted_kpi = replace_monthly_table("kpi_global", kpi_df, database_url)
    inserted_pred = replace_monthly_table("prediction_ventes", pred_df, database_url)

    print("ETL_OK")
    print(
        {
            "upserted_categories": dim_res.upserted_categories,
            "upserted_produits": dim_res.upserted_produits,
            "inserted_ventes": inserted_ventes,
            "inserted_kpi": inserted_kpi,
            "inserted_predictions": inserted_pred,
        }
    )

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as e:
        print(f"ETL_FAILED: {e}", file=sys.stderr)
        raise
