# backend/train_model.py

from sklearn.datasets import load_files
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
import joblib
import os

# Load dataset
dataset_path = os.path.join("aclImdb", "train")
print(f"Loading dataset from: {dataset_path}")

data = load_files(dataset_path, categories=["pos", "neg"], encoding="utf-8")

# Split into training and testing
X_train, X_test, y_train, y_test = train_test_split(
    data.data, data.target, test_size=0.2, random_state=42
)

# Build pipeline: TF-IDF + Logistic Regression
model = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2))),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced"))
])

print("Training model...")
model.fit(X_train, y_train)

# Evaluate on test data
print("Evaluating model...")
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred, target_names=["Negative", "Positive"]))

# Save model
model_path = os.path.join("model.pkl")
joblib.dump(model, model_path)
print(f"Model saved as: {model_path}")
