from dotenv import load_dotenv
import os
import json
from sm2 import sm2
import psycopg2
import psycopg2.extras


load_dotenv()

def get_connection():
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    return conn

def init_db():

    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    try:
        cursor.execute("CREATE INDEX idx_cards_deck_id ON cards(deck_id)")
        conn.commit()
    except:
        conn.rollback()

    try:
        cursor.execute("CREATE INDEX idx_cards_next_review ON cards(next_review)")
        conn.commit()
    except:
        conn.rollback()

    try:
        cursor.execute("CREATE INDEX idx_review_log_reviewed_at ON review_log(reviewed_at)")
        conn.commit()
    except:
        conn.rollback()

    try:
        cursor.execute("CREATE INDEX idx_review_log_deck_id ON review_log(deck_id)")
        conn.commit()
    except:
        conn.rollback()

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN card_type VARCHAR(20) DEFAULT 'basic'")
        conn.commit()
    except:
        conn.rollback()

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN options JSON")
        conn.commit()
    except:
        conn.rollback()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS decks (
            id          SERIAL PRIMARY KEY,
            name        TEXT NOT NULL,
            description TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cards (
            id          SERIAL PRIMARY KEY,
            deck_id     INT NOT NULL,
            front       TEXT NOT NULL,
            back        TEXT NOT NULL,
            easiness    FLOAT DEFAULT 2.5,
            interval    INT DEFAULT 1,
            repetitions INT DEFAULT 0,
            front_img   TEXT,
            front_audio TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS review_log (
            id          SERIAL PRIMARY KEY,
            card_id     INT,
            deck_id     INT,
            reviewed_at DATE
        )
    """)

    try:
        cursor.execute("ALTER TABLE cards ADD COLUMN next_review DATE")
        conn.commit()
    except:
        conn.rollback()

    conn.commit()
    conn.close()


## MY SQL
##def get_connection():
##    conn = pymysql.connect(
##        host=os.environ.get("MYSQLHOST"),
##        port=int(os.environ.get("MYSQLPORT", 3306)),
##        user=os.environ.get("MYSQLUSER"),
##        password=os.environ.get("MYSQLPASSWORD"),
##        database=os.environ.get("MYSQLDATABASE"),
##        cursorclass=pymysql.cursors.DictCursor
##    )
##    return conn

def create_deck(name, description):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(
        "INSERT INTO decks (name, description) VALUES (%s, %s)",
        (name, description)
    )
    conn.commit()
    conn.close()

def create_card(deck_id, front, back, front_img="", front_audio="", card_type="basic", options=None):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute(
        """INSERT INTO cards (deck_id, front, back, next_review, front_img, front_audio, card_type, options) 
           VALUES (%s, %s, %s, CURRENT_DATE, %s, %s, %s, %s)""",
        (deck_id, front, back, front_img, front_audio, card_type, 
         json.dumps(options) if options else None)
    )
    conn.commit()
    conn.close()

def get_decks():
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("""
        SELECT 
            decks.*,
            COUNT(cards.id) AS total,
            COUNT(CASE WHEN cards.next_review <= CURRENT_DATE THEN 1 END) AS due,
            COUNT(CASE WHEN cards.repetitions >= 5 AND cards.interval >= 21 THEN 1 END) AS mastered,
            (
                SELECT COUNT(*) 
                FROM review_log rl 
                WHERE rl.deck_id = decks.id 
                    AND rl.reviewed_at = CURRENT_DATE
            ) AS studied_today
        FROM decks
        LEFT JOIN cards 
            ON cards.deck_id = decks.id
        GROUP BY decks.id
        ORDER BY due DESC
    """)
    decks = cursor.fetchall()
    conn.close()
    return decks

def get_deck_stats(deck_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("""
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN next_review <= CURRENT_DATE THEN 1 ELSE 0 END) AS due,
            SUM(CASE WHEN repetitions >= 5 AND interval >= 21 THEN 1 ELSE 0 END) AS mastered,
            ROUND(AVG(easiness)::numeric, 2) AS avg_easiness
        FROM cards
        WHERE deck_id = %s
    """, (deck_id,))
    stats = cursor.fetchone()
    conn.close()
    return stats

def get_deck(deck_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("""
        SELECT * 
        FROM decks
        WHERE id = %s
    """, (deck_id,))
    deck = cursor.fetchone()
    conn.close()
    return deck

def get_cards(deck_id, page=1, per_page=20):
    offset = (page - 1) * per_page
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("""
        SELECT * 
        FROM cards 
        WHERE deck_id = %s
        LIMIT %s OFFSET %s
    """, (deck_id, per_page, offset))
    cards = cursor.fetchall()
    conn.close()
    return cards

def count_cards(deck_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("SELECT COUNT(*) as total FROM cards WHERE deck_id = %s", (deck_id,))
    result = cursor.fetchone()
    conn.close()
    return result["total"]

def update_card_review(card_id, quality, deck_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("SELECT * FROM cards WHERE id = %s", (card_id,))
    card = cursor.fetchone() 
    new_easiness, new_interval, next_review = sm2(
        card["easiness"], card["interval"], card["repetitions"], quality
    )
    cursor.execute("""
        UPDATE cards SET easiness=%s, interval=%s, next_review=%s, repetitions=%s
        WHERE id=%s
    """, (new_easiness, new_interval, next_review, card["repetitions"] + 1, card_id))
    cursor.execute("INSERT INTO review_log (card_id, deck_id, reviewed_at) VALUES (%s, %s, CURRENT_DATE)", (card_id, deck_id))
    conn.commit()
    conn.close()

def get_due_cards(deck_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("SELECT * FROM cards WHERE deck_id = %s AND next_review <= CURRENT_DATE", (deck_id,))
    cards = cursor.fetchall()
    conn.close()
    return cards

def update_deck(name, description, deck_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("UPDATE decks SET name = %s, description = %s WHERE id = %s", 
        (name, description, deck_id)
    )
    conn.commit()
    conn.close()

def update_card(front, back, card_id, options=None):
    conn = get_connection()
    cursor = conn.cursor()
    if options is not None:
        cursor.execute(
            "UPDATE cards SET front = %s, back = %s, options = %s WHERE id = %s",
            (front, back, json.dumps(options), card_id)
        )
    else:
        cursor.execute(
            "UPDATE cards SET front = %s, back = %s WHERE id = %s",
            (front, back, card_id)
        )
    conn.commit()
    conn.close()

def delete_deck(deck_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("DELETE FROM cards WHERE deck_id = %s", (deck_id,))
    cursor.execute("DELETE FROM decks WHERE id = %s", (deck_id,))
    conn.commit()
    conn.close()

def delete_card(card_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
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
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    cursor.execute("""
        SELECT 
            TO_CHAR(reviewed_at, 'YYYY-MM-DD') as reviewed_at,
            COUNT(*) AS total
        FROM review_log
        GROUP BY reviewed_at
        ORDER BY reviewed_at
    """)
    data = cursor.fetchall()
    conn.commit()
    conn.close()
    return data


def create_cards_bulk(deck_id, cards_list):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    inserted = 0
    for card in cards_list:
        # verifica se já existe
        cursor.execute(
            "SELECT id FROM cards WHERE deck_id = %s AND front = %s AND back = %s",
            (deck_id, card["front"], card["back"])
        )
        if cursor.fetchone() is None:
            cursor.execute(
                """INSERT INTO cards (deck_id, front, back, next_review, front_img, front_audio) 
                   VALUES (%s, %s, %s, CURRENT_DATE, %s, %s)""",
                (deck_id, card["front"], card["back"],
                 card.get("front_img", ""), card.get("front_audio", ""))
            )
            inserted += 1
    conn.commit()
    conn.close()
    return inserted

def delete_cards_bulk(ids):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
    placeholders = ', '.join(['%s'] * len(ids))
    cursor.execute(f"DELETE FROM cards WHERE id IN ({placeholders})", ids)
    conn.commit()
    conn.close()

def get_review_stats(period='day'):
    conn = get_connection()
    cursor = conn.cursor()
    
    if period == 'day':
        trunc = "DATE(reviewed_at)"
        where = "reviewed_at >= CURRENT_DATE - INTERVAL '30 days'"
    elif period == 'week':
        trunc = "DATE_TRUNC('week', reviewed_at)"
        where = "reviewed_at >= CURRENT_DATE - INTERVAL '12 weeks'"
    elif period == 'month':
        trunc = "DATE_TRUNC('month', reviewed_at)"
        where = "reviewed_at >= CURRENT_DATE - INTERVAL '12 months'"
    else:
        trunc = "DATE_TRUNC('year', reviewed_at)"
        where = "reviewed_at >= CURRENT_DATE - INTERVAL '5 years'"

    cursor.execute(f"""
        SELECT 
            {trunc}::text AS periodo,
            d.name AS deck_name,
            COUNT(*) AS total
        FROM review_log rl
        JOIN decks d ON d.id = rl.deck_id
        WHERE {where}
        GROUP BY {trunc}, d.name
        ORDER BY periodo
    """)
    data = cursor.fetchall()
    conn.close()
    return [{"periodo": r[0], "deck_name": r[1], "total": r[2]} for r in data] 


if __name__ == "__main__":
    init_db()
    print("Banco iniciado!")
