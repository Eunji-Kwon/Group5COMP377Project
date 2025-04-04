from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import joblib
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True)

# -------------------- Movie List --------------------

DUMMY_FILE = "movies_dummy.json"

@app.route("/movies", methods=["GET"])
def get_movies():
    try:
        with open(DUMMY_FILE, "r") as f:
            return jsonify(json.load(f))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Sentiment Prediction --------------------

model = joblib.load("model.pkl")  # Make sure this file exists!

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        review = data.get("review", "")
        if not review.strip():
            return jsonify({"error": "Empty review"}), 400

        prediction = model.predict([review])[0]
        sentiment = "Positive" if prediction == "positive" or prediction == 1 else "Negative"
        return jsonify({"result": sentiment})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Reviews --------------------

REVIEWS_FILE = "reviews.json"
if not os.path.exists(REVIEWS_FILE):
    with open(REVIEWS_FILE, "w") as f:
        json.dump([], f)

@app.route("/submit_review", methods=["POST"])
def submit_review():
    try:
        data = request.get_json()
        if not data.get("movie") or not data.get("review") or not data.get("sentiment"):
            return jsonify({"error": "Missing fields in review data"}), 400

        data["timestamp"] = datetime.now().isoformat()

        with open(REVIEWS_FILE, "r") as f:
            reviews = json.load(f)

        reviews.append(data)

        with open(REVIEWS_FILE, "w") as f:
            json.dump(reviews, f, indent=2)

        return jsonify({"message": "Review saved successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reviews", methods=["GET"])
def get_reviews():
    try:
        sentiment_filter = request.args.get("sentiment")
        movie_filter = request.args.get("movie")

        with open(REVIEWS_FILE, "r") as f:
            reviews = json.load(f)

        if sentiment_filter:
            reviews = [r for r in reviews if r["sentiment"].lower() == sentiment_filter.lower()]
        if movie_filter:
            reviews = [r for r in reviews if r["movie"]["title"].lower() == movie_filter.lower()]

        return jsonify(reviews)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reviews/<int:index>", methods=["DELETE"])
def delete_review(index):
    try:
        with open(REVIEWS_FILE, "r") as f:
            reviews = json.load(f)

        if 0 <= index < len(reviews):
            deleted = reviews.pop(index)
            with open(REVIEWS_FILE, "w") as f:
                json.dump(reviews, f, indent=2)
            return jsonify({"message": "Review deleted", "deleted": deleted})
        else:
            return jsonify({"error": "Invalid review index"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/reviews/<int:index>", methods=["PUT"])
def update_review(index):
    try:
        data = request.get_json()
        if not data.get("review"):
            return jsonify({"error": "Missing updated review text"}), 400

        with open(REVIEWS_FILE, "r") as f:
            reviews = json.load(f)

        if 0 <= index < len(reviews):
            reviews[index]["review"] = data["review"]
            prediction = model.predict([data["review"]])[0]
            reviews[index]["sentiment"] = "Positive" if prediction == "positive" or prediction == 1 else "Negative"
            reviews[index]["timestamp"] = datetime.now().isoformat()

            with open(REVIEWS_FILE, "w") as f:
                json.dump(reviews, f, indent=2)

            return jsonify({"message": "Review updated", "updated": reviews[index]})
        else:
            return jsonify({"error": "Invalid review index"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -------------------- Run App --------------------

if __name__ == "__main__":
    app.run(debug=True)
