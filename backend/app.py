# backend/app.py
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import joblib

app = Flask(__name__)
CORS(app, supports_credentials=True)

# -------------------- Movie List from TMDB or Dummy --------------------

TMDB_API_KEY = os.getenv("TMDB_API_KEY")  
TMDB_API_URL = "https://api.themoviedb.org/3/movie/popular"
DUMMY_FILE = "movies_dummy.json"

@app.route("/movies", methods=["GET"])
def get_movies():
    try:
        if TMDB_API_KEY:
            response = requests.get(TMDB_API_URL, params={
                "api_key": TMDB_API_KEY,
                "language": "en-US",
                "page": 1
            })
            data = response.json()
            movie_list = []

            for movie in data.get("results", []):
                movie_list.append({
                    "title": movie.get("title"),
                    "overview": movie.get("overview"),
                    "img": f"https://image.tmdb.org/t/p/w200{movie.get('poster_path')}"
                })

            return jsonify(movie_list)

        else:
            with open(DUMMY_FILE, "r") as f:
                return jsonify(json.load(f))

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Sentiment Prediction --------------------

# Load trained model
model = joblib.load("model.pkl")  # 반드시 존재해야 함

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        review = data.get("review", "")
        if not review.strip():
            return jsonify({"error": "Empty review"}), 400

        prediction = model.predict([review])[0]
        return jsonify({"result": prediction})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Review 저장 --------------------

REVIEWS_FILE = "reviews.json"
if not os.path.exists(REVIEWS_FILE):
    with open(REVIEWS_FILE, "w") as f:
        json.dump([], f)

@app.route("/submit_review", methods=["POST"])
def submit_review():
    try:
        data = request.get_json()
        with open(REVIEWS_FILE, "r") as f:
            reviews = json.load(f)

        reviews.append(data)

        with open(REVIEWS_FILE, "w") as f:
            json.dump(reviews, f, indent=2)

        return jsonify({"message": "Review saved successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Run Flask --------------------

if __name__ == "__main__":
    app.run(debug=True)
