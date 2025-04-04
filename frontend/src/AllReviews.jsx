import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AllReviews.css';

export default function AllReviews() {
  const [reviews, setReviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [movieFilter, setMovieFilter] = useState('');
  const [movies, setMovies] = useState([]);
  const [sortOrder, setSortOrder] = useState('latest');
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    axios.get("http://localhost:5000/reviews")
      .then(res => {
        setReviews(res.data);
        setFiltered(res.data);
        const titles = Array.from(new Set(res.data.map(r => r.movie.title))).sort();
        setMovies(titles);
      })
      .catch(err => console.error("Error loading reviews", err));
  };

  useEffect(() => {
    let filteredList = reviews;

    if (sentimentFilter) {
      filteredList = filteredList.filter(r => r.sentiment === sentimentFilter);
    }
    if (movieFilter) {
      filteredList = filteredList.filter(r => r.movie.title === movieFilter);
    }

    if (sortOrder === "latest") {
      filteredList = [...filteredList].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
      filteredList = [...filteredList].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    setFiltered(filteredList);
  }, [sentimentFilter, movieFilter, sortOrder, reviews]);

  const handleDelete = (index) => {
    axios.delete(`http://localhost:5000/reviews/${index}`)
      .then(() => fetchReviews())
      .catch(err => console.error("Error deleting review", err));
  };

  const handleEdit = (index, currentReview) => {
    setEditIndex(index);
    setEditText(currentReview);
  };

  const saveEdit = (index) => {
    axios.put(`http://localhost:5000/reviews/${index}`, { review: editText })
      .then(() => {
        setEditIndex(null);
        setEditText('');
        fetchReviews();
      })
      .catch(err => console.error("Error updating review", err));
  };

  return (
    <div className="app-dark text-white min-vh-100 p-4">
      <div className="container">
        <nav className="mb-4">
          <Link to="/" className="btn btn-outline-light me-2">Home</Link>
        </nav>

        <h3 className="text-center mb-4">📋 All Posted Reviews</h3>

        <div className="row mb-3">
          <div className="col-md-4 mb-2">
            <label>Filter by Sentiment:</label>
            <select className="form-select bg-dark text-white border-secondary" value={sentimentFilter} onChange={e => setSentimentFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <label>Filter by Movie:</label>
            <select className="form-select bg-dark text-white border-secondary" value={movieFilter} onChange={e => setMovieFilter(e.target.value)}>
              <option value="">All</option>
              {movies.map((title, i) => (
                <option key={i} value={title}>{title}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <label>Sort by:</label>
            <select className="form-select bg-dark text-white border-secondary" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="alert alert-warning text-center">No reviews found with current filters.</div>
        ) : (
          <div className="table-responsive rounded-3 overflow-hidden border border-light">
            <table className="table table-dark table-striped align-middle m-0">
              <thead>
                <tr>
                  <th>Movie</th>
                  <th>Review</th>
                  <th>Sentiment</th>
                  <th>Date</th>
                  <th style={{ width: "140px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((review, i) => {
                  // Get correct index from the original reviews list
                  const originalIndex = reviews.findIndex(r =>
                    r.timestamp === review.timestamp &&
                    r.review === review.review &&
                    r.movie.title === review.movie.title
                  );

                  return (
                    <tr key={i}>
                      <td>{review.movie.title}</td>
                      <td>
                        {editIndex === originalIndex ? (
                          <textarea
                            className="form-control bg-dark text-white border-light"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />
                        ) : (
                          review.review
                        )}
                      </td>
                      <td className={review.sentiment === "Positive" ? "text-success" : "text-danger"}>
                        {review.sentiment}
                      </td>
                      <td>{new Date(review.timestamp).toLocaleString()}</td>
                      <td>
                        {editIndex === originalIndex ? (
                          <>
                            <button className="btn btn-success btn-sm me-2" onClick={() => saveEdit(originalIndex)}>Save</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditIndex(null)}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-outline-warning btn-sm me-2" onClick={() => handleEdit(originalIndex, review.review)}>Edit</button>
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(originalIndex)}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
