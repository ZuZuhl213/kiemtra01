import os
import time

import pymysql


while True:
    try:
        conn = pymysql.connect(
            host=os.getenv("MYSQL_HOST", "mysql"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE_CUSTOMER", "customer_db"),
        )
        conn.close()
        break
    except Exception:
        print("Waiting for MySQL...")
        time.sleep(2)
