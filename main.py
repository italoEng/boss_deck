from flask import Flask
import os
from werkzeug.utils import secure_filename
from flask import render_template
from flask import request
from flask import redirect
from database import init_db, create_deck, get_decks, create_card, get_cards, update_card_review, get_due_cards, update_deck, update_card
from database import delete_deck, delete_card, get_review_heatmap

app = Flask(__name__)
app.config["UPLOAD_FOLDER"] = "static/uploads"
init_db()

@app.route("/")
def index():
    decks = get_decks()
    heatmap = get_review_heatmap()
    return render_template("homepage.html", decks=decks, heatmap=[dict(h) for h in heatmap])

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
    due_cards = get_due_cards(deck_id)
    return render_template("decks.html", cards=cards, deck_id=deck_id, due=len(due_cards))

@app.route("/deck/<int:deck_id>/cards/new", methods=["POST"])
def new_card(deck_id):
    front = request.form["front"]
    back = request.form["back"]
    front_img = ""
    front_audio = ""

    if "front_img" in request.files:
        file = request.files["front_img"]
        if file.filename != "":
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
            front_img = f'uploads/{filename}'
    if not front_img:
        front_img = request.form.get("front_img_url", "")

    if "front_audio" in request.files:
        file = request.files["front_audio"]
        if file.filename != "":
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
            front_audio = f'uploads/{filename}'


    create_card(deck_id, front, back, front_img, front_audio)
    return redirect(f"/deck/{deck_id}#modal-aberto")

@app.route("/deck/<int:deck_id>/cards/<int:card_id>/edit", methods=["POST"])
def editar_card(deck_id, card_id):
    front = request.form["front"]
    back = request.form["back"]
    update_card(front, back, card_id)
    return redirect(f"/deck/{deck_id}#lista")


@app.route("/deck/<int:deck_id>/cards")
def cards(deck_id):
    cards = get_due_cards(deck_id)
    return render_template("cards.html", cards=cards, deck_id=deck_id)

@app.route("/deck/<int:deck_id>/cards/<int:card_id>", methods=["POST"])
def review_card(deck_id, card_id):
    quality = int(request.form["quality"])
    update_card_review(card_id, quality, deck_id)
    return redirect(f"/deck/{deck_id}/cards")

@app.route("/deck/<int:deck_id>/cards/<int:card_id>/delete", methods=["POST"])
def card_excluir(deck_id, card_id):
    delete_card(card_id)
    return redirect(f"/deck/{deck_id}#lista")

if __name__ == "__main__":
    app.run(debug=True, port=5000)
