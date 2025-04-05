import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Link } from 'react-router-dom';

export default function MovieSentimentApp() {
  const [movieList, setMovieList] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [review, setReview] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [message, setMessage] = useState('');
  const [postedReviews, setPostedReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get("http://localhost:5000/movies")
      .then(res => setMovieList(res.data))
      .catch(err => {
        console.error("Failed to fetch movies", err);
        setMessage("Could not load movie list.");
      });

    axios.get("http://localhost:5000/reviews")
      // .then(res => setPostedReviews(res.data))
      .then(res => {
        const validReviews = res.data.filter(r => r.movie && r.movie.title);
        setPostedReviews(validReviews);
      })
      .catch(err => {
        console.error("Failed to load reviews", err);
      });
  }, []);

  const handlePredict = async () => {
    try {
      const res = await axios.post("http://localhost:5000/predict", { review });
      setSentiment(res.data.result);
    } catch (err) {
      console.error("Prediction failed", err);
      setMessage("Prediction failed.");
    }
  };

  const handlePost = async () => {
    if (!selectedMovie || !review.trim() || !sentiment) {
      setMessage("Please select a movie, write a review, and predict sentiment before posting.");
      return;
    }

    const newReview = { movie: selectedMovie, review, sentiment };

    try {
      await axios.post("http://localhost:5000/submit_review", newReview);
      setPostedReviews([...postedReviews, newReview]);
      setMessage("✅ Review posted successfully!");
      setReview('');
      setSentiment(null);
      setSelectedMovie(null);
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while posting.");
    }
  };

  const getReviewStats = (title) => {
    const filtered = postedReviews.filter(r => r.movie && r.movie.title === title);
    return {
      total: filtered.length,
      positive: filtered.filter(r => r.movie && r.sentiment === "Positive").length,
      negative: filtered.filter(r => r.movie && r.sentiment === "Negative").length
    };
  };
  

  const filteredMovies = movieList.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-dark text-white min-vh-100">
      <div className="container py-4">
        <nav className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link to="/" className="btn btn-outline-light me-2">Home</Link>
            <Link to="/reviews" className="btn btn-outline-light">View All Reviews</Link>
          </div>
          <div className="d-flex align-items-center gap-2 w-50">
            <span className="text-secondary">🔍</span>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary"
              placeholder="Search movies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </nav>

        <h2 className="text-center mb-5">🎬 Movie Review Sentiment App</h2>

        <div className="row g-4">
          {filteredMovies.map((movie, idx) => {
            const stats = getReviewStats(movie.title);
            return (
              <div className="col-md-3 col-sm-6" key={idx}>
                <div
                  className="card movie-card text-white bg-dark border-secondary h-100"
                  onClick={() => {
                    setSelectedMovie(movie);
                    setReview('');
                    setSentiment(null);
                    setMessage('');
                  }}
                >
                  <img
                    src={movie.img}
                    className="card-img-top"
                    alt={movie.title}
                    style={{ height: "270px", objectFit: "cover" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{movie.title}</h5>
                    <p className="card-text">{movie.overview}</p>
                    <p className="text-info small fst-italic mt-2">Click card to write a review</p>
                    <div className="text-muted small mt-2">
                      Total: {stats.total}<br />
                      <span className="text-success">Positive: {stats.positive}</span><br />
                      <span className="text-danger">Negative: {stats.negative}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Review Modal */}
{selectedMovie && (
  <>
  
  <div className="modal fade show d-block" tabIndex="-1" role="dialog">
    <div className="modal-dialog modal-dialog-centered" role="document">
      <div className="modal-content bg-dark text-white"
        style={{ backgroundColor: "rgba(33, 37, 41, 0.7)" }}>
        <div className="modal-header">
          <h5 className="modal-title">Review for: {selectedMovie.title}</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={() => {
              setSelectedMovie(null);
              setReview('');
              setSentiment(null);
              setMessage('');
            }}
            aria-label="Close"
          ></button>
        </div>
        <div className="modal-body">
          <textarea
            className="form-control mb-3 bg-dark text-white border-light"
            rows="4"
            placeholder="Write your review here..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <div className="d-flex gap-2">
            <button className="btn btn-info" onClick={handlePredict}>Predict Sentiment</button>
            <button className="btn btn-success" onClick={handlePost}>Post Review</button>
          </div>
          {sentiment && (
            <div className="alert alert-dark mt-3">
              <strong>Predicted Sentiment:</strong> {sentiment}
            </div>
          )}
          {message && (
            <div className="alert alert-secondary mt-2">{message}</div>
          )}
        </div>
      </div>
    </div>
  </div>
    <div className="modal-backdrop fade show"></div>
    </>
)}


        {/* {selectedMovie && (
          <div className="card bg-secondary text-white mt-5 p-4 position-relative">
           
            <button
              className="btn-close position-absolute top-0 end-0 m-3"
              onClick={() => {
                setSelectedMovie(null);
                setReview('');
                setSentiment(null);
                setMessage('');
              }}
              aria-label="Close"
            ></button>

            <h4 className="mb-3">Review for: {selectedMovie.title}</h4>
            <textarea
              className="form-control mb-3 bg-dark text-white border-light"
              rows="4"
              placeholder="Write your review here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <div className="d-flex gap-2">
              <button className="btn btn-info" onClick={handlePredict}>Predict Sentiment</button>
              <button className="btn btn-success" onClick={handlePost}>Post Review</button>
            </div>

            {sentiment && (
              <div className="alert alert-dark mt-3">
                <strong>Predicted Sentiment:</strong> {sentiment}
              </div>
            )}
            {message && (
              <div className="alert alert-secondary mt-2">{message}</div>
            )}
          </div>
        )} */}

      </div>
    </div>
  );
}
