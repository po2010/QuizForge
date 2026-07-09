import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register } from "../api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await register(name, email, password);
      loginUser(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setStatus({ message: err.message, type: "bad" });
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <span className="eyebrow">Create account</span>
        <h1>Start publishing quizzes</h1>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              name="name"
              type="text"
              required
              maxLength={32}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={4}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="button primary" type="submit">Create account</button>
          <p className="form-note">Already registered? <Link to="/login">Login</Link>.</p>
          {status.message && (
            <p className={`status-message ${status.type}`}>{status.message}</p>
          )}
        </form>
      </section>
    </div>
  );
}