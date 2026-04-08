from flask import Blueprint
from flask import render_template
from flask import request
from flask import redirect
from app.database import create_deck, get_decks, update_deck, delete_deck
from app.database import get_cards, get_due_cards
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

    create_deck(name, description)
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
    cards = get_cards(deck_id)
    due_cards = get_due_cards(deck_id)
    return render_template("decks.html", cards=cards, deck_id=deck_id, due=len(due_cards))