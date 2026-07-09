import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getQuiz, submitAttempt } from "../api";

export default function QuizAttempt() {
  const [searchParams] = useSearchParams();
  const quizId = searchParams.get("id");
  const roomParam = searchParams.get("room");

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomError, setRoomError] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  // Attempt state
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startedAt] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getQuiz(quizId);
        setQuiz(data.quiz);
        setTimeLeft(data.quiz.timer);

        // Auto-unlock if room code matches
        if (data.quiz.visibility === "private" && roomParam === data.quiz.roomCode) {
          setUnlocked(true);
        } else if (data.quiz.visibility === "public") {
          setUnlocked(true);
        }
      } catch {
        setError("Quiz not found.");
      } finally {
        setLoading(false);
      }
    }
    if (quizId) load();
    else {
      setError("No quiz ID provided.");
      setLoading(false);
    }
  }, [quizId, roomParam]);

  // Timer
  useEffect(() => {
    if (!unlocked || finished || !quiz) return;
    if (answered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleGrade("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [unlocked, finished, quiz, index, answered]);

  function handleRoomSubmit(e) {
    e.preventDefault();
    if (roomCode.toUpperCase().trim() === quiz.roomCode) {
      setUnlocked(true);
    } else {
      setRoomError("Incorrect room number.");
    }
  }

  function handleGrade(answer, selectedButton) {
    if (answered) return;
    clearInterval(timerRef.current);
    setAnswered(true);
    setSelectedAnswer(answer);

    const question = quiz.questions[index];
    const correct = answer.trim().toLowerCase() === question.correct.trim().toLowerCase();
    if (correct) setScore((s) => s + 1);

    setAnswers((prev) => [...prev, { questionId: question.id, answer, correct }]);
    setFeedback(correct ? "Correct answer." : `Correct answer: ${question.correct}`);
    setFeedbackType(correct ? "good" : "bad");
  }

  function handleNext() {
    if (index >= quiz.questions.length - 1) {
      finishAttempt();
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    setFeedback("");
    setFeedbackType("");
    setTimeLeft(quiz.timer);
  }

  async function finishAttempt() {
    clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - startedAt) / 1000);

    try {
      const data = await submitAttempt(quizId, answers, startedAt);
      setResult(data.attempt);
      setFinished(true);
    } catch (err) {
      // Fallback: show local result even if API fails
      setResult({
        score,
        total: quiz.questions.length,
        timeTaken,
      });
      setFinished(true);
    }
  }

  if (loading) return <div className="quiz-attempt-shell"><p>Loading quiz...</p></div>;

  if (error) {
    return (
      <section className="quiz-attempt-shell">
        <article className="quiz-panel">
          <h1>Quiz not found</h1>
          <p>{error}</p>
          <Link className="button primary" to="/">Back to discover</Link>
        </article>
      </section>
    );
  }

  if (!unlocked) {
    return (
      <section className="quiz-attempt-shell">
        <div className="room-gate panel">
          <span className="eyebrow">Private room</span>
          <h1>Enter room no</h1>
          <p>This quiz is private. Ask the creator for the room number.</p>
          <form className="form-stack" onSubmit={handleRoomSubmit}>
            <input
              name="roomCode"
              type="text"
              required
              placeholder="Room no"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
            />
            <button className="button primary" type="submit">Unlock quiz</button>
            {roomError && <p className="status-message bad">{roomError}</p>}
          </form>
        </div>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="quiz-attempt-shell">
        <article className="quiz-panel">
          <span className="eyebrow">Round complete</span>
          <h1>You scored {result?.score || score}/{result?.total || quiz.questions.length}</h1>
          <p>Your result has been saved to this quiz leaderboard.</p>
          <div className="hero-actions">
            <Link className="button primary" to={`/leaderboard?id=${quizId}`}>View leaderboard</Link>
            <Link className="button secondary" to="/">Discover more</Link>
          </div>
        </article>
      </section>
    );
  }

  const question = quiz.questions[index];
  const progress = (index / quiz.questions.length) * 100;

  return (
    <section className="quiz-attempt-shell">
      <article className="quiz-panel">
        <div className="quiz-topline">
          <span className="eyebrow" id="attempt-category">{quiz.title}</span>
          <span className="timer" id="attempt-timer">{timeLeft}s</span>
        </div>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <div className="question-meta">
          <span>Question {index + 1} of {quiz.questions.length}</span>
          <span>Score {score}</span>
        </div>
        <h1 className="question-title">{question.prompt}</h1>
        <div className="answers" id="attempt-answers">
          {question.type === "fill" ? (
            <>
              <input type="text" placeholder="Type your answer" id="fill-input" />
              <button
                className="button primary"
                type="button"
                onClick={() => {
                  const input = document.getElementById("fill-input");
                  handleGrade(input?.value || "");
                }}
              >
                Submit answer
              </button>
            </>
          ) : (
            question.options.map((option) => {
              let btnClass = "answer-button";
              if (answered) {
                const isCorrect = option.trim().toLowerCase() === question.correct.trim().toLowerCase();
                const isSelected = option === selectedAnswer;
                if (isCorrect) btnClass += " correct";
                if (isSelected && !isCorrect) btnClass += " wrong";
              }
              return (
                <button
                  key={option}
                  className={btnClass}
                  type="button"
                  disabled={answered}
                  onClick={(e) => handleGrade(option, e.currentTarget)}
                >
                  {option}
                </button>
              );
            })
          )}
        </div>
        {feedback && (
          <p className={`feedback ${feedbackType}`}>{feedback}</p>
        )}
        <div className="quiz-actions">
          <Link className="button secondary" to={`/leaderboard?id=${quizId}`}>Leaderboard</Link>
          <button
            className="button primary"
            type="button"
            disabled={!answered}
            onClick={handleNext}
          >
            {index === quiz.questions.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </article>
    </section>
  );
}