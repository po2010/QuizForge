import { Link } from "react-router-dom";

export default function QuizCard({ quiz, manage }) {
  const tags = (quiz.tags || []).map((tag) => (
    <span className="tag-pill" key={tag}>{tag}</span>
  ));

  const room =
    quiz.visibility === "private" ? (
      <span className="privacy-pill">Room {quiz.roomCode}</span>
    ) : null;

  const attemptHref =
    quiz.visibility === "private"
      ? `/quiz?id=${quiz.id}&room=${quiz.roomCode}`
      : `/quiz?id=${quiz.id}`;

  function handleCopy() {
    const link = `${window.location.origin}${attemptHref}`;
    navigator.clipboard?.writeText(link);
    const btn = document.getElementById(`copy-${quiz.id}`);
    if (btn) {
      btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = "Copy link"; }, 1200);
    }
  }

  return (
    <article className="quiz-card">
      <div className="card-topline">
        <span className="privacy-pill">{quiz.visibility}</span>
        {room}
      </div>
      <h3>{quiz.title}</h3>
      <p>{quiz.description}</p>
      <div className="tag-list">{tags}</div>
      <small>
        {quiz.questionCount || (quiz.questions && quiz.questions.length) || 0} questions | {quiz.timer}s each | by {quiz.creatorName}
      </small>
      <div className="card-actions">
        <Link className="button primary" to={attemptHref}>Attempt</Link>
        <Link className="button secondary" to={`/leaderboard?id=${quiz.id}`}>Leaderboard</Link>
        {manage && (
          <button className="button secondary" type="button" id={`copy-${quiz.id}`} onClick={handleCopy}>
            Copy link
          </button>
        )}
      </div>
    </article>
  );
}