import { useState } from 'react'
import { ArrowLeft, Zap, Mail, CheckCircle } from 'lucide-react'

import './ForgotPassword.css'

export default function ForgotPassword({ onNav }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email) return

    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 900)
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">

        <div className="forgot-password-brand">
          <div className="forgot-password-logo">
            <Zap size={16} color="#ffffff" fill="#ffffff" />
          </div>

          <span className="forgot-password-brand-name">
            TaskFlow
          </span>
        </div>

        <div className="forgot-password-card">
          {sent ? (
            <div className="forgot-password-success">
              <div className="forgot-password-success-icon">
                <CheckCircle size={28} />
              </div>

              <h2 className="forgot-password-title">
                Check your inbox
              </h2>

              <p className="forgot-password-message">
                We sent a password reset link to{' '}
                <strong>{email}</strong>
              </p>

              <button
                type="button"
                onClick={() => onNav('login')}
                className="forgot-password-primary-button forgot-password-back-button"
              >
                Back to login
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onNav('login')}
                className="forgot-password-back-link"
              >
                <ArrowLeft size={14} />
                Back to login
              </button>

              <div className="forgot-password-mail-icon">
                <Mail size={22} />
              </div>

              <h2 className="forgot-password-title">
                Reset your password
              </h2>

              <p className="forgot-password-description">
                Enter your email and we will send you a reset link.
              </p>

              <form
                onSubmit={handleSubmit}
                className="forgot-password-form"
              >
                <div className="forgot-password-field">
                  <label htmlFor="forgot-password-email">
                    Email address
                  </label>

                  <input
                    id="forgot-password-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="forgot-password-primary-button"
                >
                  {loading ? (
                    <span className="forgot-password-spinner" />
                  ) : (
                    'Send reset link'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}