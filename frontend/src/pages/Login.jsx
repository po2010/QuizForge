import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await login(email, password);
      loginUser(data.token, data.user);
      const next = searchParams.get("next") || "/dashboard";
      navigate(next, { replace: true });
    } catch (err) {
      setStatus({ message: err.message, type: "bad" });
    }
  }

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Login to continue</h1>
        <form className="form-stack" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="button primary" type="submit">Login</button>
          <p className="form-note">No account yet? <Link to="/register">Create one</Link>.</p>
          {status.message && (
            <p className={`status-message ${status.type}`}>{status.message}</p>
          )}
        </form>
      </section>
    </div>
  );
}