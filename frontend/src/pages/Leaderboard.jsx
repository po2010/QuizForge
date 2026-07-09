import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getLeaderboard } from "../api";

export default function Leaderboard() {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("id");
  const [title, setTitle] = useState("All quiz attempts");
  const [subtitle, setSubtitle] = useState("Choose a quiz from Discover to see a specific leaderboard.");
  const [attempts, setAttempts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getLeaderboard(quizId || "");
        setAttempts(data.attempts);

        if (data.attempts.length > 0 && quizId) {
          setTitle(data.attempts[0].quizTitle);
          setSubtitle("");
        }
      } catch (err) {
        console.error("Leaderboard load error:", err);
      }
    }
    load();
  }, [quizId]);

  return (
    <>
      <section className="page-title">
        <span className="eyebrow">Leaderboard</span>
        <h1 id="leaderboard-title">{title}</h1>
        <p id="leaderboard-subtitle">{subtitle || "Scores are ranked by points, then completion time."}</p>
      </section>
      <section className="panel">
        <div className="leaderboard-table" id="leaderboard-table">
          {attempts.length === 0 ? (
            <div className="leaderboard-row">
              <strong>No attempts yet</strong>
              <span>Be the first to play this quiz.</span>
            </div>
          ) : (
            attempts.map((attempt, i) => (
              <div className="leaderboard-row" key={attempt.id}>
                <div>
                  <strong>#{i + 1} {attempt.userName}</strong>
                  <span>{attempt.quizTitle}</span>
                </div>
                <div>
                  <strong>{attempt.score}/{attempt.total}</strong>
                  <span>{attempt.timeTaken}s</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}