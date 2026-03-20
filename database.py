import sqlite3
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
        cursor.execute("UPDATE cards SET next_review = date('now') WHERE next_review IS NULL")
    except:
        pass


    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN repetitions INTEGER DEFAULT 0")
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

def create_card(deck_id, front, back):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO cards (deck_id, front, back) VALUES (?, ?, ?)",
        (deck_id, front, back)
    )
    conn.commit()
    conn.close()

def get_decks():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM decks")
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

def update_card_review(card_id, quality):
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
    conn.commit()
    conn.close()

def get_due_cards(deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cards WHERE deck_id = ? AND next_review <= date('now')", (deck_id,))
    cards = cursor.fetchall()
    conn.close()
    return cards

if __name__ == "__main__":
    init_db()
    print("Banco iniciado!")
