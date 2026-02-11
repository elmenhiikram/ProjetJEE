import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import pymysql

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Azeroual@Ftah5")
DB_NAME = os.getenv("DB_NAME", "GestionVente")

# Encode password if needed, but lets try direct first
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print(f"Connecting to {DB_NAME} as {DB_USER}")

try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        print(f"Success: {result.scalar()}")
except Exception as e:
    print(f"Error type: {type(e).__name__}")
    print(f"Error: {e}")
