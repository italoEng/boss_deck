from flask import Flask
from flask import render_template
from flask import request
from flask import redirect
from database import init_db, create_deck, get_decks, create_card, get_cards, update_card_review, get_due_cards, delete_deck, update_deck

app = Flask(__name__)

init_db()

@app.route("/")
def index():
    decks = get_decks()
    return render_template("homepage.html", decks=decks)

@app.route("/decks/new", methods=["POST"])
def new_deck():
    name = request.form["name"]
    description = request.form["description"]
    create_deck(name, description)
    return redirect("/")

@app.route("/deck/<int:deck_id>/edit", methods=["POST"])
def editar_deck(deck_id):
    name = request.form["name"]
    description = request.form["description"]
    update_deck(name, description, deck_id)
    return redirect("/")

@app.route("/deck/<int:deck_id>/delete", methods=["POST"])
def deck_excluir(deck_id):
    delete_deck(deck_id)
    return redirect("/")

@app.route("/deck/<int:deck_id>")
def deck_view(deck_id):
    cards = get_cards(deck_id)
    return render_template("decks.html", cards=cards, deck_id=deck_id)

@app.route("/deck/<int:deck_id>/cards/new", methods=["POST"])
def new_card(deck_id):
    front = request.form["front"]
    back = request.form["back"]
    create_card(deck_id, front, back)
    return redirect(f"/deck/{deck_id}")

@app.route("/deck/<int:deck_id>/cards")
def cards(deck_id):
    cards = get_due_cards(deck_id)
    return render_template("cards.html", cards=cards, deck_id=deck_id)

@app.route("/deck/<int:deck_id>/cards/<int:card_id>", methods=["POST"])
def review_card(deck_id, card_id):
    quality = int(request.form["quality"])
    update_card_review(card_id, quality)
    return redirect(f"/deck/{deck_id}/cards")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
