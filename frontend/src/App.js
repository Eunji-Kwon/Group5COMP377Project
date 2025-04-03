// MovieSentimentApp.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function MovieSentimentApp() {
  const [movieList, setMovieList] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [review, setReview] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [message, setMessage] = useState('');
  const [postedReviews, setPostedReviews] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/movies")
      .then(res => {
        setMovieList(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch movies", err);
        setMessage("Could not load movie list.");
      });
  }, []);

  const handlePredict = async () => {
    try {
      const res = await axios.post("http://localhost:5000/predict", {
        review: review
      });
      setSentiment(res.data.result);
    } catch (error) {
      console.error("❌ Prediction failed", error);
      setMessage("Prediction failed.");
    }
  };

  const handlePost = async () => {
    if (!selectedMovie || !review.trim() || !sentiment) {
      setMessage("Please select a movie, write a review, and predict sentiment before posting.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/submit_review", {
        movie: selectedMovie,
        review: review,
        sentiment: sentiment
      });

      setPostedReviews([...postedReviews, {
        movie: selectedMovie,
        review,
        sentiment
      }]);

      setMessage("Review posted successfully!");
      setReview('');
      setSentiment(null);
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while posting.");
    }
  };

  const getReviewStats = (title) => {
    const filtered = postedReviews.filter(r => r.movie.title === title);
    const total = filtered.length;
    const positive = filtered.filter(r => r.sentiment === "positive").length;
    const negative = filtered.filter(r => r.sentiment === "negative").length;
    return { total, positive, negative };
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">🎬 Movie Review Sentiment App</h2>

      <div className="row">
        {movieList.map((movie, idx) => {
          const stats = getReviewStats(movie.title);
          return (
            <div className="col-md-3 col-sm-6 mb-4" key={idx}>
              <div className="card h-100" style={{ maxWidth: "250px", margin: "auto" }}>
                <img
                  src={movie.img}
                  className="card-img-top"
                  alt={movie.title}
                  style={{ height: "220px", objectFit: "cover" }}
                />
                <div className="card-body">
                  <h5 className="card-title">{movie.title}</h5>
                  <p className="card-text" style={{ fontSize: "0.9rem" }}>{movie.overview}</p>
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => {
                      setSelectedMovie(movie);
                      setReview('');
                      setSentiment(null);
                      setMessage('');
                    }}
                  >
                    Write Review
                  </button>
                  <div className="mt-3">
                    <strong style={{ color: 'black' }}>Total: {stats.total}</strong><br />
                    <span style={{ color: 'green' }}>Positive: {stats.positive}</span><br />
                    <span style={{ color: 'red' }}>Negative: {stats.negative}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMovie && (
        <div className="card p-4 mt-4">
          <h4>Review for: {selectedMovie.title}</h4>
          <textarea
            className="form-control mb-3"
            rows="4"
            placeholder="Write your review here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <div className="d-flex gap-2">
            <button className="btn btn-info" onClick={handlePredict}>
              Predict Sentiment
            </button>
            <button className="btn btn-success" onClick={handlePost}>
              Post Review
            </button>
          </div>

          {sentiment && (
            <div className="alert alert-info mt-3">
              <strong>Predicted Sentiment:</strong> {sentiment}
            </div>
          )}
          {message && (
            <div className="alert alert-secondary mt-2">
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}