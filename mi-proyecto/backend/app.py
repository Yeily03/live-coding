# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os

app = Flask(__name__)
CORS(app)

DB_FILE = "bbdd.json"

# ===== Funciones de lectura/escritura =====
def load_db():
    if not os.path.exists(DB_FILE):
        return {"users": {}, "notes": {}}
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(db):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=4, ensure_ascii=False)


# ===== Registro =====
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Usuario o contraseña vacíos"}), 400

    db = load_db()
    if username in db["users"]:
        return jsonify({"error": "Usuario ya existe"}), 400

    db["users"][username] = generate_password_hash(password)
    db["notes"][username] = []
    save_db(db)

    return jsonify({"message": "Usuario registrado con éxito"}), 200


# ===== Login =====
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    db = load_db()
    hashed = db["users"].get(username)
    if hashed and check_password_hash(hashed, password):
        return jsonify({"message": "Login exitoso"}), 200
    return jsonify({"error": "Usuario o contraseña incorrectos"}), 400


# ===== Notas =====
@app.route("/api/notes/<username>", methods=["GET", "POST", "DELETE"])
def user_notes(username):
    db = load_db()
    if username not in db["users"]:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if request.method == "GET":
        return jsonify({"notes": db["notes"].get(username, [])})

    if request.method == "POST":
        data = request.json
        content = data.get("content", "").strip()
        if not content:
            return jsonify({"error": "Nota vacía"}), 400
        db["notes"][username].append(content)
        save_db(db)
        return jsonify({"message": "Nota añadida"}), 200

    if request.method == "DELETE":
        data = request.json
        index = data.get("index")
        if index is None or index < 0 or index >= len(db["notes"][username]):
            return jsonify({"error": "Índice inválido"}), 400
        db["notes"][username].pop(index)
        save_db(db)
        return jsonify({"message": "Nota eliminada"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)