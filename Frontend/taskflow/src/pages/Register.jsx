import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react'

import './Register.css'

function checkPassword(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

function CheckRow({ ok, label }) {
  return (
    <div
      className={`register-check-row ${
        ok ? 'check-valid' : 'check-invalid'
      }`}
    >
      {ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {label}
    </div>
  )
}

export default function Register({ onRegister, onNav }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const checks = checkPassword(password)
  const allChecks = Object.values(checks).every(Boolean)

  const validate = () => {
    const errors = {}

    if (!name.trim()) {
      errors.name = 'Full name is required.'
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Enter a valid email.'
    }

    if (!allChecks) {
      errors.password = 'Password does not meet all requirements.'
    }

    return errors
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      onRegister()
    }, 900)
  }

  return (
    <div className="register-page">
      {/* Left panel */}
      <div className="register-left-panel">
        <div className="register-decoration register-decoration-top" />
        <div className="register-decoration register-decoration-bottom" />

        <div className="register-left-content">
          {/* Logo */}
          <div className="register-logo">
            <div className="register-logo-icon">
              <Zap size={20} fill="white" />
            </div>

            <span>TaskFlow</span>
          </div>

          {/* Hero */}
          <div className="register-hero">
            <h1>
              Start shipping
              <br />
              with clarity.
            </h1>

            <p>
              Join thousands of makers who use TaskFlow to stay focused and
              get things done.
            </p>

            {/* Stats */}
            <div className="register-stats">
              {[
                { stat: '14k+', label: 'Active users' },
                { stat: '98%', label: 'Satisfaction rate' },
                { stat: '2.4M', label: 'Tasks completed' },
                { stat: '4.9★', label: 'App store rating' },
              ].map(({ stat, label }) => (
                <div
                  className="register-stat-card"
                  key={label}
                >
                  <p>{stat}</p>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="register-right-panel">
        {/* Mobile logo */}
        <div className="register-mobile-logo">
          <div className="register-mobile-logo-icon">
            <Zap size={16} fill="white" />
          </div>

          <span>TaskFlow</span>
        </div>

        <div className="register-form-wrapper">
          {/* Heading */}
          <div className="register-heading">
            <h2>Create your account</h2>
            <p>Free forever. No credit card required.</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="register-form"
          >
            {/* Full name */}
            <div className="register-field">
              <label>Full name</label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Muneeb Hassan"
                className={
                  errors.name ? 'register-input-error' : ''
                }
              />

              {errors.name && (
                <p className="register-error">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="register-field">
              <label>Email address</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={
                  errors.email ? 'register-input-error' : ''
                }
              />

              {errors.email && (
                <p className="register-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="register-field">
              <label>Password</label>

              <div className="register-password-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={
                    errors.password
                      ? 'register-input-error'
                      : ''
                  }
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPass((current) => !current)
                  }
                  className="register-password-toggle"
                  aria-label={
                    showPass
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPass ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              {/* Password requirements */}
              {password && (
                <div className="register-password-checks">
                  <CheckRow
                    ok={checks.length}
                    label="8+ characters"
                  />

                  <CheckRow
                    ok={checks.upper}
                    label="Uppercase letter"
                  />

                  <CheckRow
                    ok={checks.number}
                    label="Number"
                  />

                  <CheckRow
                    ok={checks.special}
                    label="Special character"
                  />
                </div>
              )}

              {errors.password && (
                <p className="register-error">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="register-submit-button"
            >
              {loading ? (
                <span className="register-spinner" />
              ) : (
                <>
                  Create account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="register-login-text">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNav('login')}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}