from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from app.database import init_db
import os


def create_app():
    load_dotenv()

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print(f"BASE_DIR: {BASE_DIR}")
    print(f"static_folder: {os.path.join(BASE_DIR, 'frontend', 'dist')}")
    print(f"index exists: {os.path.exists(os.path.join(BASE_DIR, 'frontend', 'dist', 'index.html'))}")

    app = Flask(
        __name__,
        static_folder=os.path.join(BASE_DIR, "frontend", "dist"),
        static_url_path=""
    )

    CORS(app)

    app.secret_key = os.environ.get(
        "SECRET_KEY",
        "dev-key-local"
    )

    app.config["UPLOAD_FOLDER"] = "app/static/uploads"

    init_db()

    from app.deck.routes import deck_bp
    from app.card.routes import card_bp

    app.register_blueprint(deck_bp)
    app.register_blueprint(card_bp)

    # React SPA
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve(path):

        # evita capturar API
        if path.startswith("api/"):
            return jsonify({"error": "API route not found"}), 404

        full_path = os.path.join(app.static_folder, path)

        # arquivos reais do React build
        if path != "" and os.path.exists(full_path):
            return send_from_directory(app.static_folder, path)

        # React Router
        return send_from_directory(app.static_folder, "index.html")

    return app