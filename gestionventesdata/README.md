# gestionventesdata (ETL)

Ce dossier contient le pipeline ETL Python déclenché par le backend Spring.

## Pré-requis
- Python 3.10+
- `pip install -r requirements.txt`

## Variables
- `DATABASE_URL` (SQLAlchemy)
  - MySQL: `mysql+pymysql://root:@localhost:3307/gestionvente`
  - PostgreSQL: `postgresql+psycopg://postgres:password@localhost:5432/gestionvente`

## Exécution manuelle
`python etl/etl_pipeline.py --input path/to/file.csv`
