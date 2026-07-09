import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyQuizzes, getMyAttempts } from "../api";

export default function Dashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [qData, aData] = await Promise.all([
          getMyQuizzes(),
          getMyAttempts(),
        ]);
        setQuizzes(qData.quizzes);
        setAttempts(aData.attempts);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    }
    load();
  }, []);

  const publicCount = quizzes.filter((q) => q.visibility === "public").length;
  const privateCount = quizzes.filter((q) => q.visibility === "private").length;

  return (
    <>
      <section className="page-title">
        <span className="eyebrow">Dashboard</span>
        <h1>Welcome, {user?.name || "creator"}.</h1>
        <p>Track what you created and attempted from this browser.</p>
      </section>

      <section className="metric-grid">
        <article><strong>{quizzes.length}</strong><span>created quizzes</span></article>
        <article><strong>{attempts.length}</strong><span>attempts made</span></article>
        <article><strong>{publicCount}</strong><span>public quizzes</span></article>
        <article><strong>{privateCount}</strong><span>private rooms</span></article>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="section-heading">
            <span className="eyebrow">Quick actions</span>
            <h2>Build and share</h2>
          </div>
          <div className="action-list">
            <Link className="button primary" to="/create">Create quiz</Link>
            <Link className="button secondary" to="/my-quizzes">Manage quizzes</Link>
            <Link className="button secondary" to="/">Attempt quizzes</Link>
          </div>
        </div>
        <div className="panel">
          <div className="section-heading">
            <span className="eyebrow">Recent attempts</span>
            <h2>Your activity</h2>
          </div>
          <div className="list-stack" id="recent-attempts">
            {attempts.length === 0 ? (
              <div className="list-item"><strong>No attempts yet</strong><span>Attempt a public quiz to see activity here.</span></div>
            ) : (
              attempts.slice(-5).reverse().map((a) => (
                <div className="list-item" key={a.id}>
                  <strong>{a.quizTitle}</strong>
                  <span>{a.score}/{a.total} in {a.timeTaken}s</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}