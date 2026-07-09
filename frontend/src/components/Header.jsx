import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Header() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout(e) {
    e.preventDefault();
    logoutUser();
    navigate("/");
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="brand-mark">Q</span>
        <span>QuizForge</span>
      </Link>
      <button
        className="nav-toggle"
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
      >
        Menu
      </button>
      <nav className={`site-nav ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Discover</Link>
        <Link to="/create" onClick={() => setMenuOpen(false)}>Create</Link>
        <Link to="/my-quizzes" onClick={() => setMenuOpen(false)}>My quizzes</Link>
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
        {user ? (
          <a href="#logout" onClick={handleLogout}>Logout</a>
        ) : (
          <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
        )}
      </nav>
    </header>
  );
}