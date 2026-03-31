import sqlite3
import os
from sm2 import sm2

DB = "boss_deck.db"

def init_db():

    conn = sqlite3.connect(DB)
    cursor  = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS decks (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            description TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cards (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            deck_id     INTEGER NOT NULL REFERENCES decks(id),
            front       TEXT NOT NULL,
            back        TEXT NOT NULL
        )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS review_log (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id     INTEGER,
        reviewed_at TEXT DEFAULT (date('now'))
    )
    """)

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN easiness REAL DEFAULT 2.5")
    except:
        pass

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN interval INTEGER DEFAULT 1")
    except:
        pass

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN next_review TEXT")
    except:
        pass

    cursor.execute("UPDATE cards SET next_review = date('now') WHERE next_review IS NULL")

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN repetitions INTEGER DEFAULT 0")
    except:
        pass

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN front_img TEXT")
    except:
        pass

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN front_audio TEXT")
    except:
        pass

    try:
        cursor.execute("ALTER TABLE review_log ADD COLUMN deck_id INTEGER")
    except:
        pass

    conn.commit()
    conn.close()

def get_connection():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn

def create_deck(name, description):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO decks (name, description) VALUES (?, ?)",
        (name, description)
    )
    conn.commit()
    conn.close()

def create_card(deck_id, front, back, front_img="", front_audio=""):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO cards (deck_id, front, back, next_review, front_img, front_audio) VALUES (?, ?, ?, date('now'), ?, ?)",
        (deck_id, front, back, front_img, front_audio)
    )
    conn.commit()
    conn.close()

def get_decks():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            decks.*, 
            COUNT(CASE WHEN cards.next_review <= date('now') THEN 1 END) AS due
        FROM decks
        LEFT JOIN cards 
            ON cards.deck_id = decks.id
        GROUP BY decks.id
    """)
    decks = cursor.fetchall()
    conn.close()
    return decks

def get_cards(deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cards WHERE deck_id = ?", (deck_id,))
    cards = cursor.fetchall()
    conn.close()
    return cards

def update_card_review(card_id, quality, deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    card = cursor.execute("SELECT * FROM cards WHERE id = ?", (card_id,)).fetchone()
    new_easiness, new_interval, next_review = sm2(
        card["easiness"], card["interval"], card["repetitions"], quality
    )
    cursor.execute("""
        UPDATE cards SET easiness=?, interval=?, next_review=?, repetitions=?
        WHERE id=?
    """, (new_easiness, new_interval, next_review, card["repetitions"] + 1, card_id))
    cursor.execute("INSERT INTO review_log (card_id, deck_id) VALUES (?, ?)", (card_id, deck_id))
    conn.commit()
    conn.close()

def get_due_cards(deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cards WHERE deck_id = ? AND next_review <= date('now')", (deck_id,))
    cards = cursor.fetchall()
    conn.close()
    return cards

def update_deck(name, description, deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE decks SET name = ?, description = ? WHERE id = ?", 
        (name, description, deck_id)
    )
    conn.commit()
    conn.close()

def update_card(front, back, card_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE cards SET front = ?, back = ? WHERE id = ?",
        (front, back, card_id)
    )
    conn.commit()
    conn.close()

def delete_deck(deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM decks WHERE id = ?", (deck_id,))
    cursor.execute("DELETE FROM decks WHERE id = ?", (deck_id,))
    conn.commit()
    conn.close()

def delete_card(card_id):
    conn = get_connection()
    cursor = conn.cursor()
    card = cursor.execute("SELECT front_img, front_audio FROM cards WHERE id = ?", (card_id,)).fetchone()

    if card:
        if card["front_img"] and card["front_img"].startswith("uploads/"):
            path = os.path.join("static", card["front_img"])
            if os.path.exists(path):
                os.remove(path)


        if card["front_audio"] and card["front_audio"].startswith("uploads/"):
            path = os.path.join("static", card["front_audio"])
            if os.path.exists(path):
                os.remove(path)   



    cursor.execute("DELETE FROM cards WHERE id = ?", (card_id,))
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Banco iniciado!")
