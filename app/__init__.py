from flask import Flask
from dotenv import load_dotenv
from app.database import init_db

def create_app():
    load_dotenv()

    app = Flask(__name__)
    app.config["UPLOAD_FOLDER"] = "app/static/uploads"

    init_db()

    from app.deck.routes import deck_bp
    from app.card.routes import card_bp

    app.register_blueprint(deck_bp)
    app.register_blueprint(card_bp)

    return app