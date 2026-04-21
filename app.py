from flask import Flask, render_template, request, redirect, session, jsonify
import sqlite3
from transformers import pipeline

app = Flask(__name__)
app.secret_key = "secret123"

# -------- DATABASE --------
def init_db():
    conn = sqlite3.connect("users.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

# -------- MODELS --------
emotion_model = pipeline(
    "text-classification",
    model="j-hartmann/emotion-english-distilroberta-base",
    top_k=None
)

sentiment_model = pipeline(
    "sentiment-analysis",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest"
)

def analyze_text(text):
    emo = emotion_model(text)[0]
    if isinstance(emo, list):
        emo = emo

    emotions = {e['label']: round(e['score']*100, 2) for e in emo}
    main = max(emotions, key=emotions.get)

    sent = sentiment_model(text)[0]['label']

    if "ok" in text.lower():
        main = "neutral"
        sent = "NEUTRAL"

    return emotions, main, sent


# -------- ROUTES --------
@app.route("/")
def home():
    if "user" not in session:
        return redirect("/login")
    return render_template("index.html")


# 🔐 REGISTER
@app.route("/register", methods=["GET", "POST"])
def register():
    error = None

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = sqlite3.connect("users.db")
        c = conn.cursor()

        # check if user exists
        c.execute("SELECT * FROM users WHERE username=?", (username,))
        existing = c.fetchone()

        if existing:
            error = "Username already exists"
        else:
            c.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, password))
            conn.commit()
            conn.close()
            return redirect("/login")

        conn.close()

    return render_template("register.html", error=error)


# 🔐 LOGIN (FIXED)
@app.route("/login", methods=["GET", "POST"])
def login():
    error = None

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = sqlite3.connect("users.db")
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE username=?", (username,))
        user = c.fetchone()
        conn.close()

        if not user:
            error = "User does not exist"
        elif user[2] != password:
            error = "Incorrect password"
        else:
            session["user"] = username
            return redirect("/")

    return render_template("login.html", error=error)


# 🚪 LOGOUT
@app.route("/logout")
def logout():
    session.pop("user", None)
    return redirect("/login")


# 🧠 AI ROUTE
@app.route("/analyze-text", methods=["POST"])
def analyze():
    text = request.json.get("text")

    emotions, main, sentiment = analyze_text(text)

    return jsonify({
        "emotion": main,
        "sentiment": sentiment,
        "emotions": emotions,
        "message": "Processed successfully"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)