import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Create from "./pages/Create";
import Dashboard from "./pages/Dashboard";
import MyQuizzes from "./pages/MyQuizzes";
import QuizAttempt from "./pages/QuizAttempt";
import Leaderboard from "./pages/Leaderboard";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-shell"><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/create"
            element={<ProtectedRoute><Create /></ProtectedRoute>}
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/my-quizzes"
            element={<ProtectedRoute><MyQuizzes /></ProtectedRoute>}
          />
          <Route path="/quiz" element={<QuizAttempt />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <span>QuizForge</span>
        <span>Powered by MERN stack</span>
      </footer>
    </>
  );
}