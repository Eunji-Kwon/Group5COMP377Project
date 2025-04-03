# backend/train_model.py

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib

# Sample training data
X_train = [
    "I loved this movie",
    "This was a terrible film",
    "Amazing acting and direction",
    "Worst plot ever",
    "Super fun experience",
    "Boring and slow"
]
y_train = ["positive", "negative", "positive", "negative", "positive", "negative"]

# Model training pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer()),
    ("clf", LogisticRegression())
])

# Train and save
model.fit(X_train, y_train)
joblib.dump(model, "model.pkl")
print("model.pkl saved successfully!")
