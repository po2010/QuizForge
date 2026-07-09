import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getQuizzes, getQuizTags, getQuizStats, verifyRoom } from "../api";
import QuizCard from "../components/QuizCard";

export default function Home() {
  const [quizzes, setQuizzes] = useState([]);
  const [tags, setTags] = useState(["all"]);
  const [activeTag, setActiveTag] = useState("all");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ count: 0 });
  const [roomCode, setRoomCode] = useState("");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [qData, tData, sData] = await Promise.all([
        getQuizzes(search, activeTag),
        getQuizTags(),
        getQuizStats(),
      ]);
      setQuizzes(qData.quizzes);
      setTags(["all", ...tData.tags]);
      setStats(sData);
    } catch (err) {
      console.error("Failed to load quizzes:", err);
    }
  }, [search, activeTag]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleSearch(e) {
    setSearch(e.target.value);
  }

  function handleTagClick(tag) {
    setActiveTag(tag);
  }

  async function handleRoomSubmit(e) {
    e.preventDefault();
    try {
      const data = await verifyRoom(roomCode);
      navigate(`/quiz?id=${data.quizId}&room=${data.roomCode}`);
    } catch {
      alert("No private quiz found for that room number.");
    }
  }

  return (
    <>
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Public quizzes and private rooms</span>
          <h1>Find a quiz, join a room, or publish your own.</h1>
          <p>
            QuizForge now works as a multi-page quiz website with accounts, question formats, timers, tags,
            room codes, and leaderboards for every quiz.
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/create">Create a quiz</Link>
            <a className="button secondary" href="#discover">Browse quizzes</a>
          </div>
        </div>
        <div className="hero-panel">
          <div>
            <strong>{stats.count}</strong>
            <span>published quizzes</span>
          </div>
          <div>
            <strong>MCQ</strong>
            <span>true/false and fill blanks too</span>
          </div>
          <div>
            <strong>Room</strong>
            <span>private code access</span>
          </div>
        </div>
      </section>

      <section className="section-block" id="discover">
        <div className="section-heading split">
          <div>
            <span className="eyebrow">Discover</span>
            <h2>Published public quizzes</h2>
          </div>
          <form className="room-form" onSubmit={handleRoomSubmit}>
            <input
              type="text"
              name="roomCode"
              placeholder="Enter private room no"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <button className="button secondary" type="submit">Join room</button>
          </form>
        </div>

        <div className="toolbar">
          <label className="search-box">
            <span>Search</span>
            <input
              id="quiz-search"
              type="search"
              placeholder="Search title, description, or tag"
              value={search}
              onChange={handleSearch}
            />
          </label>
          <div className="tag-filter" id="tag-filter">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-pill ${activeTag === tag ? "active" : ""}`}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="quiz-grid" id="quiz-list">
          {quizzes.length === 0 ? (
            <div className="panel">
              <h3>No quizzes found</h3>
              <p>Try another search or tag.</p>
            </div>
          ) : (
            quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
          )}
        </div>
      </section>
    </>
  );
}