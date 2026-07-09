import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyQuizzes } from "../api";
import QuizCard from "../components/QuizCard";

export default function MyQuizzes() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyQuizzes();
        setQuizzes(data.quizzes);
      } catch (err) {
        console.error("Failed to load my quizzes:", err);
      }
    }
    load();
  }, []);

  return (
    <>
      <section className="page-title">
        <span className="eyebrow">Creator area</span>
        <h1>My quizzes</h1>
        <p>View, share, and inspect leaderboards for quizzes you published.</p>
      </section>
      <section className="quiz-grid" id="my-quiz-list">
        {quizzes.length === 0 ? (
          <div className="panel">
            <h2>No quizzes yet</h2>
            <p>Create your first quiz and publish it.</p>
            <Link className="button primary" to="/create">Create quiz</Link>
          </div>
        ) : (
          quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} manage />)
        )}
      </section>
    </>
  );
}