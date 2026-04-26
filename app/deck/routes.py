from flask import Blueprint
from flask import render_template
from flask import request
from flask import redirect
import csv
import io
from app.database import create_deck, get_decks, get_deck, update_deck, delete_deck, get_deck_stats
from app.database import get_cards, get_due_cards, count_cards, create_cards_bulk
from app.database import get_review_heatmap


deck_bp = Blueprint("deck", __name__)

@deck_bp.route("/")
def index():
    decks = get_decks()
    heatmap = get_review_heatmap()
    return render_template("homepage.html", decks=decks, heatmap=[dict(h) for h in heatmap])

@deck_bp.route("/decks/new", methods=["POST"])
def new_deck():
    name = request.form["name"].strip()
    description = request.form["description"].strip()

    if not name:
        return redirect("/?erro=Obrigatorio+definir+um+nome+para+deck")
    
    try:
        create_deck(name, description)
    except Exception as e:
        print(f"Erro ao criar deck: {e}")
        return redirect("/?erro=Erro+ao+criar+baralho")

    return redirect("/")

@deck_bp.route("/deck/<int:deck_id>/edit", methods=["POST"])
def editar_deck(deck_id):
    name = request.form["name"]
    description = request.form["description"]
    update_deck(name, description, deck_id)
    return redirect("/")

@deck_bp.route("/deck/<int:deck_id>/delete", methods=["POST"])
def deck_excluir(deck_id):
    delete_deck(deck_id)
    return redirect("/")

@deck_bp.route("/deck/<int:deck_id>")
def deck_view(deck_id):
    deck = get_deck(deck_id)

    if not deck:
            return redirect("/?erro=Baralho+nao+encontrado")

    page = request.args.get('page', 1, type=int)
    per_page = 20
    cards = get_cards(deck_id, page=page, per_page=per_page)
    total = count_cards(deck_id)
    total_pages = (total + per_page - 1) // per_page
    due_cards = get_due_cards(deck_id)
    lista_aberta = request.args.get('lista') == '1' or request.args.get('page') is not None
    stats = get_deck_stats(deck_id)

    if page < 1:
        page = 1
    if page > total_pages and total_pages > 0:
        page = total_pages

    return render_template("decks.html", 
        cards=cards, 
        deck_id=deck_id,
        deck=deck,
        due=len(due_cards),
        page=page,
        total_pages=total_pages,
        lista_aberta=lista_aberta,
        total_cards=total,
        stats=stats
    )

@deck_bp.route("/deck/<int:deck_id>/cards/import", methods=["POST"])
def import_cards(deck_id):
    if "csv_file" not in request.files:
        return redirect(f"/deck/{deck_id}?erro=Arquivo+nao+encontrado")
    
    file = request.files["csv_file"]
    if file.filename == "" or not file.filename.endswith(".csv"):
        return redirect(f"/deck/{deck_id}?erro=Arquivo+invalido")
    
    try:
        content = file.read().decode("utf-8")
        reader = csv.DictReader(io.StringIO(content))
        cards_list = []
        for row in reader:
            if row.get("front") or row.get("frente") and row.get("back") or row.get("verso"):
                cards_list.append({
                    "front": row["front"],
                    "back": row["back"],
                    "front_img": row.get("front_img", ""),
                    "front_audio": row.get("front_audio", "")
                })
        create_cards_bulk(deck_id, cards_list)
        return redirect(f"/deck/{deck_id}?sucesso={len(cards_list)}+cards+importados")
    except Exception as e:
        print(f"Erro ao importar CSV: {e}")
        
        return redirect(f"/deck/{deck_id}?erro=Erro+ao+importar+CSV")