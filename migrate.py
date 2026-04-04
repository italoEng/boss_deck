import sqlite3
import pymysql
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")

# conexão SQLite
sqlite_conn = sqlite3.connect("boss_deck.db")
sqlite_conn.row_factory = sqlite3.Row
sqlite_cursor = sqlite_conn.cursor()

# conexão MySQL
mysql_conn = pymysql.connect(
    host=__import__('os').environ.get("MYSQLHOST"),
    port=int(__import__('os').environ.get("MYSQLPORT", 3306)),
    user=__import__('os').environ.get("MYSQLUSER"),
    password=__import__('os').environ.get("MYSQLPASSWORD"),
    database=__import__('os').environ.get("MYSQLDATABASE"),
    cursorclass=pymysql.cursors.DictCursor
)
mysql_cursor = mysql_conn.cursor()

# migrar decks
sqlite_cursor.execute("SELECT * FROM decks")
decks = sqlite_cursor.fetchall()
for deck in decks:
    mysql_cursor.execute(
        "INSERT INTO decks (id, name, description) VALUES (%s, %s, %s)",
        (deck["id"], deck["name"], deck["description"])
    )
print(f"{len(decks)} baralhos migrados!")

# migrar cards
sqlite_cursor.execute("SELECT * FROM cards")
cards = sqlite_cursor.fetchall()
for card in cards:
    mysql_cursor.execute("""
        INSERT INTO cards (id, deck_id, front, back, easiness, `interval`, repetitions, next_review, front_img, front_audio)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        card["id"], card["deck_id"], card["front"], card["back"],
        card["easiness"], card["interval"], card["repetitions"],
        card["next_review"], card["front_img"], card["front_audio"]
    ))
print(f"{len(cards)} cards migrados!")

mysql_conn.commit()
sqlite_conn.close()
mysql_conn.close()
print("Migração concluída!")