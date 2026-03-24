import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { FaLinkedin, FaEnvelope } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogin = () => {
    localStorage.setItem("token", "123"); // mock login
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className="home">

      {/* HEADER */}
      <header className="home-header">
        <h1 className="animated-header">TaskFlow</h1>
        <div>
          {!isLoggedIn ? (
            <button onClick={handleLogin}>Login</button>
          ) : (
            <button onClick={handleLogout}>Logout</button>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <h2>Organize Your Tasks Efficiently 🚀</h2>
        <p>Track, manage, and complete your tasks all in one place.</p>
        <button
          className="dashboard-btn"
          onClick={() =>
            isLoggedIn ? navigate("/dashboard") : handleLogin()
          }
        >
          Go to Dashboard
        </button>
      </section>

      {/* HOW IT WORKS */}
      <section className="features">
        <h2>How It Works</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>📝 Create Tasks</h3>
            <p>Add your tasks quickly and easily.</p>
          </div>
          <div className="card">
            <h3>✅ Track Progress</h3>
            <p>Mark tasks as completed or pending.</p>
          </div>
          <div className="card">
            <h3>⚡ Stay Productive</h3>
            <p>Focus on what matters most each day.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 TaskFlow</p>
        <div className="footer-links">
          <a href="mailto:your@email.com">
            <FaEnvelope /> Email
          </a>
          <a
            href="https://linkedin.com/in/yourprofile"
            target="_blank"
            rel="noreferrer"
          >
            <FaLinkedin /> LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}

export default Home;