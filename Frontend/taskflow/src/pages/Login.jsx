import { useState } from "react";
import { Eye, EyeOff, Zap, CheckCircle, ArrowRight } from "lucide-react";

import "./Login.css";
import { loginUser } from "../api/auth";

export default function Login({ onLogin, onNav }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await loginUser({
        email: email.trim(),
        password,
      });

      console.log("Login response:", data);

      localStorage.setItem("access_token", data.access_token);

      onLogin();
    } catch (error) {
      const message =
        error.response?.data?.detail || "Login failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left-panel">
        {/* Decorative circles */}
        <div className="login-decoration login-decoration-top" />
        <div className="login-decoration login-decoration-bottom" />
        <div className="login-decoration login-decoration-center" />

        {/* Logo */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Zap size={20} color="#ffffff" fill="#ffffff" />
          </div>

          <span className="login-brand-name">TaskFlow</span>
        </div>

        {/* Hero copy */}
        <div className="login-hero">
          <div>
            <h1 className="login-hero-title">
              Your tasks,
              <br />
              under control.
            </h1>

            <p className="login-hero-description">
              The productivity tool built for makers who move fast and ship
              often.
            </p>
          </div>

          <div className="login-features">
            {[
              "Organize tasks across any category",
              "Track progress with visual dashboards",
              "Never miss a deadline again",
            ].map((feature) => (
              <div key={feature} className="login-feature">
                <div className="login-feature-icon">
                  <CheckCircle size={12} color="#ffffff" />
                </div>

                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="login-testimonial">
          <p className="login-testimonial-text">
            "TaskFlow completely changed how I manage projects. The interface is
            clean and the insights are genuinely useful."
          </p>

          <div className="login-testimonial-author">
            <div className="login-avatar">SK</div>

            <div>
              <p className="login-author-name">Sarah Kim</p>

              <p className="login-author-role">Product Lead @ Vercel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="login-right-panel">
        {/* Mobile logo */}
        <div className="login-mobile-brand">
          <div className="login-mobile-logo">
            <Zap size={16} color="#ffffff" fill="#ffffff" />
          </div>

          <span>TaskFlow</span>
        </div>

        <div className="login-form-wrapper">
          <div className="login-heading">
            <h2>Welcome back</h2>

            <p>Sign in to continue to TaskFlow</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Email */}
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="muneeb@taskflow.io"
              />
            </div>

            {/* Password */}
            <div className="login-field">
              <div className="login-password-header">
                <label htmlFor="login-password">Password</label>

                <button
                  type="button"
                  onClick={() => onNav("forgot-password")}
                  className="login-forgot-button"
                >
                  Forgot password?
                </button>
              </div>

              <div className="login-password-wrapper">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPass((current) => !current)}
                  className="login-password-toggle"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-submit-button"
            >
              {loading ? (
                <span className="login-spinner" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="login-register-text">
            No account?{" "}
            <button
              type="button"
              onClick={() => onNav("register")}
              className="login-register-button"
            >
              Create one free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
