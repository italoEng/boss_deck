import pymysql
from dotenv import load_dotenv
import os
from sm2 import sm2


load_dotenv()

def init_db():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS decks (
            id          INTEGER PRIMARY KEY AUTO_INCREMENT,
            name        TEXT NOT NULL,
            description TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cards (
            id          INT PRIMARY KEY AUTO_INCREMENT,
            deck_id     INT NOT NULL,
            front       TEXT NOT NULL,
            back        TEXT NOT NULL,
            easiness    FLOAT DEFAULT 2.5,
            `interval`    INT DEFAULT 1,
            repetitions INT DEFAULT 0,
            front_img   TEXT,
            front_audio TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS review_log (
            id          INT PRIMARY KEY AUTO_INCREMENT,
            card_id     INT,
            deck_id     INT,
            reviewed_at DATE
        )
    """)

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN next_review DATE")
    except:
        pass

    conn.commit()
    conn.close()

def get_connection():
    conn = pymysql.connect(
        host=os.environ.get("MYSQLHOST"),
        port=int(os.environ.get("MYSQLPORT", 3306)),
        user=os.environ.get("MYSQLUSER"),
        password=os.environ.get("MYSQLPASSWORD"),
        database=os.environ.get("MYSQLDATABASE"),
        cursorclass=pymysql.cursors.DictCursor
    )
    return conn

def create_deck(name, description):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO decks (name, description) VALUES (%s, %s)",
        (name, description)
    )
    conn.commit()
    conn.close()

def create_card(deck_id, front, back, front_img="", front_audio=""):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO cards (deck_id, front, back, next_review, front_img, front_audio) VALUES (%s, %s, %s, CURDATE(), %s, %s)",
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
            COUNT(CASE WHEN cards.next_review <= CURDATE() THEN 1 END) AS due
        FROM decks
        LEFT JOIN cards 
            ON cards.deck_id = decks.id
        GROUP BY decks.id
    """)
    decks = cursor.fetchall()
    conn.close()
    return decks

def get_deck(deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM decks WHERE id = %s", (deck_id,))
    deck = cursor.fetchone()
    conn.close()
    return deck

def get_cards(deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cards WHERE deck_id = %s", (deck_id,))
    cards = cursor.fetchall()
    conn.close()
    return cards

def update_card_review(card_id, quality, deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cards WHERE id = %s", (card_id,))
    card = cursor.fetchone() 
    new_easiness, new_interval, next_review = sm2(
        card["easiness"], card["interval"], card["repetitions"], quality
    )
    cursor.execute("""
        UPDATE cards SET easiness=%s, `interval`=%s, next_review=%s, repetitions=%s
        WHERE id=%s
    """, (new_easiness, new_interval, next_review, card["repetitions"] + 1, card_id))
    cursor.execute("INSERT INTO review_log (card_id, deck_id, reviewed_at) VALUES (%s, %s, CURDATE())", (card_id, deck_id))
    conn.commit()
    conn.close()

def get_due_cards(deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM cards WHERE deck_id = %s AND next_review <= CURDATE()", (deck_id,))
    cards = cursor.fetchall()
    conn.close()
    return cards

def update_deck(name, description, deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE decks SET name = %s, description = %s WHERE id = %s", 
        (name, description, deck_id)
    )
    conn.commit()
    conn.close()

def update_card(front, back, card_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE cards SET front = %s, back = %s WHERE id = %s",
        (front, back, card_id)
    )
    conn.commit()
    conn.close()

def delete_deck(deck_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM cards WHERE deck_id = %s", (deck_id,))
    cursor.execute("DELETE FROM decks WHERE id = %s", (deck_id,))
    conn.commit()
    conn.close()

def delete_card(card_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT front_img, front_audio FROM cards WHERE id = %s", (card_id,))
    card = cursor.fetchone()

    if card:
        if card["front_img"] and card["front_img"].startswith("uploads/"):
            path = os.path.join("static", card["front_img"])
            if os.path.exists(path):
                os.remove(path)


        if card["front_audio"] and card["front_audio"].startswith("uploads/"):
            path = os.path.join("static", card["front_audio"])
            if os.path.exists(path):
                os.remove(path)   



    cursor.execute("DELETE FROM cards WHERE id = %s", (card_id,))
    conn.commit()
    conn.close()


# grafico heatmap
def get_review_heatmap():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            DATE_FORMAT(reviewed_at, '%Y-%m-%d') as reviewed_at,
            COUNT(*) AS total
        FROM review_log
        GROUP BY reviewed_at
        ORDER BY reviewed_at
    """)
    data = cursor.fetchall()
    conn.commit()
    conn.close()
    return data

if __name__ == "__main__":
    init_db()
    print("Banco iniciado!")
