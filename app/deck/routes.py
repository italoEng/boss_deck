from unicodedata import name

from flask import Blueprint
from flask import render_template
from flask import request
from flask import redirect
from flask import jsonify
import csv
import io
from app.database import get_connection, get_user_id_from_token
from app.database import create_deck, get_decks, get_deck, update_deck, delete_deck, get_deck_stats
from app.database import get_cards, get_due_cards, count_cards, create_cards_bulk, delete_cards_bulk
from app.database import get_review_heatmap, get_review_stats


deck_bp = Blueprint("deck", __name__)

def get_user_id():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    return get_user_id_from_token(token)

@deck_bp.route("/api/decks")
def index():
    decks = get_decks()
    heatmap = get_review_heatmap()
    period = request.args.get('period', 'day')
    review_stats = get_review_stats(period)
    
    return jsonify({
        "decks": [dict(deck) for deck in decks],
        "heatmap": [dict(h) for h in heatmap],
        "review_stats": [dict(r) for r in review_stats],
        "period": period
    })

@deck_bp.route("/api/decks/new", methods=["POST"])
def new_deck():
    data = request.get_json()
    name = data.get("name", "").strip()
    description = data.get("description", "").strip()

    if not name:
        return jsonify({
            "error": "Nome obrigatório"
        }), 400

    try:
        create_deck(name, description)

        return jsonify({
            "success": True
        })

    except Exception as e:
        print(f"Erro ao criar deck: {e}")

        return jsonify({
            "error": "Erro ao criar deck"
        }), 500

    return redirect("/")

@deck_bp.route("/api/decks/<int:deck_id>/edit", methods=["POST"])
def editar_deck(deck_id):
    name = request.form["name"]
    description = request.form["description"]
    update_deck(name, description, deck_id)
    return jsonify({"ok": True})

@deck_bp.route("/api/decks/<int:deck_id>/delete", methods=["POST"])
def deck_excluir(deck_id):
    delete_deck(deck_id)
    return jsonify({"ok": True})

@deck_bp.route("/api/decks/<int:deck_id>")
def deck_view(deck_id):
    deck = get_deck(deck_id)

    if not deck:
        return jsonify({"error": "Baralho não encontrado"}), 404

    page = request.args.get('page', 1, type=int)
    per_page = 20
    cards = get_cards(deck_id, page=page, per_page=per_page)
    total = count_cards(deck_id)
    total_pages = (total + per_page - 1) // per_page
    due_cards = get_due_cards(deck_id)
    stats = get_deck_stats(deck_id)

    if page < 1:
        page = 1
    if page > total_pages and total_pages > 0:
        page = total_pages

    return jsonify({
        "deck": dict(deck),
        "cards": [dict(c) for c in cards],
        "total": total,
        "total_pages": total_pages,
        "due": len(due_cards),
        "stats": dict(stats) if stats else {}
    })

@deck_bp.route("/api/decks/<int:deck_id>/cards/import", methods=["POST"])
def import_cards(deck_id):
    if "csv_file" not in request.files:
        return jsonify({"error": "Arquivo não encontrado"}), 400
    
    file = request.files["csv_file"]
    if file.filename == "" or not file.filename.endswith(".csv"):
        return jsonify({"error": "Arquivo inválido"}), 400
    
    try:
        content = file.read().decode("utf-8")
        reader = csv.DictReader(io.StringIO(content))
        cards_list = []
        for row in reader:
            front = row.get("front") or row.get("frente", "")
            back = row.get("back") or row.get("verso", "")
            if front and back:
                cards_list.append({
                    "front": front,
                    "back": back,
                    "front_img": row.get("front_img", ""),
                    "front_audio": row.get("front_audio", "")
                })
        inserted = create_cards_bulk(deck_id, cards_list)
        return jsonify({
            "ok": True,
            "imported": inserted,
            "skipped": len(cards_list) - inserted
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@deck_bp.route("/api/decks/<int:deck_id>/cards/delete-bulk", methods=["POST"])
def delete_cards_bulk_route(deck_id):
    from app.database import delete_cards_bulk
    data = request.json
    ids = data.get("ids", [])
    if not ids:
        return jsonify({"error": "nenhum card selecionado"}), 400
    delete_cards_bulk(ids)
    return jsonify({"ok": True})
