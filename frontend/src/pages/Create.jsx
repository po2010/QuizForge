import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "../api";

export default function Create() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [timer, setTimer] = useState("30");
  const [visibility, setVisibility] = useState("public");
  const [roomCode, setRoomCode] = useState("");
  const [qType, setQType] = useState("mcq");
  const [qPrompt, setQPrompt] = useState("");
  const [qOptions, setQOptions] = useState("");
  const [qAnswer, setQAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState({ message: "", type: "" });

  function handleTypeChange(e) {
    const val = e.target.value;
    setQType(val);
    if (val === "truefalse") {
      setQOptions("True\nFalse");
    } else {
      setQOptions("");
    }
  }

  function addQuestion() {
    const cleanPrompt = qPrompt.trim();
    const cleanAnswer = qAnswer.trim();
    if (!cleanPrompt || !cleanAnswer) {
      setStatus({ message: "Complete the question fields before adding.", type: "bad" });
      return;
    }

    let question;
    if (qType === "mcq") {
      const opts = qOptions.split("\n").map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2 || !opts.includes(cleanAnswer)) {
        setStatus({ message: "MCQ needs at least 2 options and answer must match one.", type: "bad" });
        return;
      }
      question = { id: `q-${Date.now()}-${Math.random().toString(16).slice(2)}`, type: qType, prompt: cleanPrompt, options: opts, correct: cleanAnswer };
    } else if (qType === "truefalse") {
      const norm = cleanAnswer.toLowerCase();
      if (!["true", "false"].includes(norm)) {
        setStatus({ message: "Answer must be True or False.", type: "bad" });
        return;
      }
      question = { id: `q-${Date.now()}-${Math.random().toString(16).slice(2)}`, type: qType, prompt: cleanPrompt, options: ["True", "False"], correct: norm === "true" ? "True" : "False" };
    } else {
      question = { id: `q-${Date.now()}-${Math.random().toString(16).slice(2)}`, type: qType, prompt: cleanPrompt, options: [], correct: cleanAnswer };
    }

    setQuestions([...questions, question]);
    setQPrompt("");
    setQOptions("");
    setQAnswer("");
    setStatus({ message: "Question added.", type: "good" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (questions.length === 0) {
      setStatus({ message: "Add at least one question before publishing.", type: "bad" });
      return;
    }

    try {
      await createQuiz({
        title,
        description,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        visibility,
        roomCode,
        timer: Number(timer),
        questions,
      });
      navigate("/my-quizzes");
    } catch (err) {
      setStatus({ message: err.message, type: "bad" });
    }
  }

  return (
    <>
      <section className="page-title">
        <span className="eyebrow">Quiz maker</span>
        <h1>Create and publish a quiz.</h1>
        <p>Choose public visibility or private room access. Add MCQ, fill in the blank, and true/false questions.</p>
      </section>

      <section className="builder-layout">
        <form className="panel form-stack" onSubmit={handleSubmit}>
          <div className="section-heading"><h2>Quiz details</h2></div>
          <label>
            Title
            <input name="title" type="text" required maxLength={70} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            Description
            <textarea name="description" required maxLength={180} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          <label>
            Tags
            <input name="tags" type="text" placeholder="science, class 8, html" value={tags} onChange={(e) => setTags(e.target.value)} />
          </label>
          <div className="form-grid">
            <label>
              Timer per question
              <select name="timer" value={timer} onChange={(e) => setTimer(e.target.value)}>
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="45">45 seconds</option>
                <option value="60">60 seconds</option>
              </select>
            </label>
            <label>
              Visibility
              <select name="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <option value="public">Public</option>
                <option value="private">Private room</option>
              </select>
            </label>
          </div>
          {visibility === "private" && (
            <label>
              Room no
              <input name="roomCode" type="text" placeholder="Auto-generated if empty" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
            </label>
          )}

          <div className="section-heading compact"><h2>Add question</h2></div>
          <label>
            Question type
            <select value={qType} onChange={handleTypeChange}>
              <option value="mcq">MCQ</option>
              <option value="truefalse">True / False</option>
              <option value="fill">Fill in the blank</option>
            </select>
          </label>
          <label>
            Question
            <textarea value={qPrompt} onChange={(e) => setQPrompt(e.target.value)} />
          </label>
          {qType === "mcq" && (
            <label>
              Options
              <textarea value={qOptions} onChange={(e) => setQOptions(e.target.value)} placeholder="One option per line" />
            </label>
          )}
          <label>
            Correct answer
            <input type="text" value={qAnswer} onChange={(e) => setQAnswer(e.target.value)} placeholder={qType === "fill" ? "Exact text answer" : "Correct option"} />
          </label>
          <button className="button secondary" type="button" onClick={addQuestion}>Add question</button>
          {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

          <button className="button primary" type="submit">Publish quiz</button>
        </form>

        <aside className="panel">
          <div className="section-heading">
            <span className="eyebrow">Preview</span>
            <h2>Questions added</h2>
          </div>
          <div className="list-stack">
            {questions.length === 0 ? (
              <div className="list-item"><strong>No questions yet</strong><span>Add at least one to publish.</span></div>
            ) : (
              questions.map((q, i) => (
                <div className="list-item" key={q.id}>
                  <strong>{i + 1}. {q.prompt}</strong>
                  <span>{q.type} | answer: {q.correct}</span>
                </div>
              ))
            )}
          </div>
        </aside>
      </section>
    </>
  );
}