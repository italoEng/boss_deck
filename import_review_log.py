import re
import psycopg2
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

pg = psycopg2.connect(
    host=os.environ.get("PGHOST"),
    port=int(os.environ.get("PGPORT", 5432)),
    database=os.environ.get("PGDATABASE"),
    user=os.environ.get("PGUSER"),
    password=os.environ.get("PGPASSWORD")
)
pc = pg.cursor()
pg.rollback()
pc.execute("DELETE FROM review_log")
print("Cleared existing review_log")

with open("railway_review_log_2026-05-09_021122.sql", "r", encoding="utf-8") as f:
    content = f.read()

# Extract INSERT VALUES
match = re.search(r"INSERT INTO `review_log` VALUES (.*?);", content, re.DOTALL)
if not match:
    print("No INSERT found!")
    exit()

values_str = match.group(1)

# Parse each row: (id, card_id, deck_id, reviewed_at)
rows = re.findall(r'\((\d+),(\d+),(\d+),(\'[^\']*\'|NULL)\)', values_str)

print(f"Found {len(rows)} rows")

count = 0
errors = 0

for row in rows:
    try:
        log_id = int(row[0])
        card_id = int(row[1])
        deck_id = int(row[2])
        
        reviewed_at_raw = row[3].strip()
        reviewed_at = None if reviewed_at_raw == 'NULL' else reviewed_at_raw.strip("'")
        
        pc.execute("""
            INSERT INTO review_log (id, card_id, deck_id, reviewed_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (log_id, card_id, deck_id, reviewed_at))
        count += 1
    except Exception as e:
        pg.rollback()  # ← reseta a transação após erro
        errors += 1
        print(f"Error on row {row[0]}: {e}")

pg.commit()
pg.close()
print(f"✓ {count} revisões importadas! {errors} errors.")