from flask import Blueprint
from flask import render_template
from flask import request
from flask import redirect
from flask import current_app
from app.database import create_card, update_card, get_due_cards, update_card_review, delete_card
from werkzeug.utils import secure_filename
import os

card_bp = Blueprint("card", __name__)

@card_bp.route("/deck/<int:deck_id>/cards/new", methods=["POST"])
def new_card(deck_id):
    front = request.form["front"]
    back = request.form["back"]
    front_img = ""
    front_audio = ""

    if "front_img" in request.files:
        file = request.files["front_img"]
        if file.filename != "":
            filename = secure_filename(file.filename)
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
            front_img = f'uploads/{filename}'
    if not front_img:
        front_img = request.form.get("front_img_url", "")

    if "front_audio" in request.files:
        file = request.files["front_audio"]
        if file.filename != "":
            filename = secure_filename(file.filename)
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
            front_audio = f'uploads/{filename}'


    create_card(deck_id, front, back, front_img, front_audio)
    return redirect(f"/deck/{deck_id}#modal-aberto")

@card_bp.route("/deck/<int:deck_id>/cards/<int:card_id>/edit", methods=["POST"])
def editar_card(deck_id, card_id):
    front = request.form["front"]
    back = request.form["back"]
    update_card(front, back, card_id)
    return redirect(f"/deck/{deck_id}#lista")


@card_bp.route("/deck/<int:deck_id>/cards")
def cards(deck_id):
    cards = get_due_cards(deck_id)
    return render_template("cards.html", cards=cards, deck_id=deck_id)

@card_bp.route("/deck/<int:deck_id>/cards/<int:card_id>", methods=["POST"])
def review_card(deck_id, card_id):
    quality = int(request.form["quality"])
    update_card_review(card_id, quality, deck_id)
    return redirect(f"/deck/{deck_id}/cards")

@card_bp.route("/deck/<int:deck_id>/cards/<int:card_id>/delete", methods=["POST"])
def card_excluir(deck_id, card_id):
    delete_card(card_id)
    return redirect(f"/deck/{deck_id}#lista")