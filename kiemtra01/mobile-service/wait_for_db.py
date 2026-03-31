import os
import time

import psycopg2


while True:
    try:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST", "postgres"),
            port=os.getenv("POSTGRES_PORT", "5432"),
            user=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD", ""),
            dbname=os.getenv("POSTGRES_DATABASE_MOBILE", "mobile_db"),
        )
        conn.close()
        break
    except Exception:
        print("Waiting for PostgreSQL...")
        time.sleep(2)
