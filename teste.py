from flask import jsonify
from app.database import get_decks, get_cards

@app.route("/export-all")
def export_all():
    return jsonify({
        "decks": get_decks(),
        "cards": get_cards(1, 1, 10000)  # ajuste se tiver mais decks
    })