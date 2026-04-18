from flask import Blueprint
from flask import render_template
from flask import request
from flask import redirect
from app.database import create_deck, get_decks, get_deck, update_deck, delete_deck
from app.database import get_cards, get_due_cards, count_cards
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

    return render_template("decks.html", 
        cards=cards, 
        deck_id=deck_id, 
        due=len(due_cards),
        page=page,
        total_pages=total_pages,
        lista_aberta=lista_aberta,
        total_cards=total
    )