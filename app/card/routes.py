from flask import Blueprint
from flask import render_template
from flask import request
from flask import redirect
from flask import current_app
from app.database import create_card, update_card, get_due_cards, update_card_review, delete_card
from app.database import get_deck
from werkzeug.utils import secure_filename
import json
import os
import random

card_bp = Blueprint("card", __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
ALLOWED_AUDIO = {'mp3', 'wav', 'ogg', 'm4a'}

def allowed_image(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def allowed_audio(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO

@card_bp.route("/deck/<int:deck_id>/cards/new", methods=["POST"])
def new_card(deck_id):
    front = request.form["front"].strip()
    back = request.form["back"].strip()
    card_type = request.form.get("card_type", "basic")
    front_img = ""
    front_audio = ""
    options = None

    if card_type == "multiple_choice":
        texts = request.form.getlist("option_text")
        correct = request.form.get("correct_option")
        options = [
            {"text": text, "correct": str(i) == correct}
            for i, text in enumerate(texts)
            if text.strip()
        ]

    if not front and not back:
        return redirect(f"/deck/{deck_id}?erro=Card+precisa+de+frente+e+verso")

    if "front_img" in request.files:
        file = request.files["front_img"]
        if file.filename != "":
            if not allowed_image(file.filename):
                return redirect(f"/deck/{deck_id}?erro=Formato+de+imagem+invalido")
            filename = secure_filename(file.filename)
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
            front_img = f'uploads/{filename}'
    if not front_img:
        front_img = request.form.get("front_img_url", "")

    if "front_audio" in request.files:
        file = request.files["front_audio"]
        if file.filename != "":
            if not allowed_audio(file.filename):
                return redirect(f"/deck/{deck_id}?erro=Formato+de+audio+invalido")
            filename = secure_filename(file.filename)
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
            front_audio = f'uploads/{filename}'

    try:
        create_card(deck_id, front, back, front_img, front_audio, card_type, options)
    except Exception as e:
        print(f"Erro ao criar card: {e}")
        return redirect("/?erro=Erro+ao+criar+card")
    
    return redirect(f"/deck/{deck_id}#modal-aberto")

@card_bp.route("/deck/<int:deck_id>/cards/<int:card_id>/edit", methods=["POST"])
def editar_card(deck_id, card_id):
    front = request.form["front"]
    back = request.form["back"]
    update_card(front, back, card_id)
    return redirect(f"/deck/{deck_id}#lista")


@card_bp.route("/deck/<int:deck_id>/cards")
def cards(deck_id):
    deck = get_deck(deck_id)
    
    if not deck:
        return redirect("/?erro=Baralho+nao+encontrado")
    
    cards_list = get_due_cards(deck_id)       
    total = len(cards_list)
    index = request.args.get('index', 0, type=int)

    if index >= total:
        return redirect(f"/deck/{deck_id}")
    
    card_atual = cards_list[index]
    if card_atual.get("options"):
        options = card_atual["options"]
        if isinstance(options, str):
            options = json.loads(options)
            
        random.shuffle(options)
        card_atual["options"] = options
            
    return render_template("cards.html", cards=[card_atual], deck_id=deck_id, total=total, index=index)

@card_bp.route("/deck/<int:deck_id>/cards/<int:card_id>", methods=["POST"])
def review_card(deck_id, card_id):
    quality = int(request.form["quality"])
    update_card_review(card_id, quality, deck_id)
    return redirect(f"/deck/{deck_id}/cards")

@card_bp.route("/deck/<int:deck_id>/cards/<int:card_id>/delete", methods=["POST"])
def card_excluir(deck_id, card_id):
    delete_card(card_id)
    return redirect(f"/deck/{deck_id}#lista")