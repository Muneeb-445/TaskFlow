import { useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

import { resetPassword } from "../api/auth";

import "./ResetPassword.css";

function checkPassword(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function CheckRow({ ok, label }) {
  return (
    <div
      className={`reset-password-check-row ${
        ok ? "check-valid" : "check-invalid"
      }`}
    >
      {ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
      {label}
    </div>
  );
}

export default function ResetPassword({ onNav }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const checks = checkPassword(password);
  const allChecks = Object.values(checks).every(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid or missing."
      );
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (!allChecks) {
      setError(
        "Password does not meet all requirements."
      );
      return;
    }

    if (!confirmPassword) {
      setError(
        "Please confirm your new password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Your password has been reset successfully. Please log in.",
        },
      });
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to reset your password. The link may be invalid or expired.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-icon">
          <LockKeyhole size={22} />
        </div>

        <div className="reset-password-header">
          <h1 className="reset-password-title">
            Reset Password
          </h1>

          <p className="reset-password-subtitle">
            Create a new password for your TaskFlow account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="reset-password-form"
        >
          {/* New Password */}
          <div className="reset-password-field">
            <label htmlFor="new-password">
              New Password
            </label>

            <div className="reset-password-input-wrapper">
              <input
                id="new-password"
                type={
                  showPassword ? "text" : "password"
                }
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter new password"
                className="reset-password-input"
              />

              <button
                type="button"
                className="reset-password-eye-button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="reset-password-field">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <div className="reset-password-input-wrapper">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(
                    event.target.value
                  );
                  setError("");
                }}
                placeholder="Confirm new password"
                className="reset-password-input"
              />

              <button
                type="button"
                className="reset-password-eye-button"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </div>

            {/* Password Match */}
            {confirmPassword && (
              <div
                className={`reset-password-match ${
                  password === confirmPassword
                    ? "match-valid"
                    : "match-invalid"
                }`}
              >
                {password === confirmPassword ? (
                  <>
                    <CheckCircle size={12} />
                    Passwords match
                  </>
                ) : (
                  <>
                    <XCircle size={12} />
                    Passwords do not match
                  </>
                )}
              </div>
            )}
          </div>

          {/* Password Requirements */}
          {password && (
            <div className="reset-password-checks">
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

          {error && (
            <p className="reset-password-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="reset-password-submit"
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>
        </form>

        <button
          type="button"
          className="reset-password-back"
          onClick={() => onNav("login")}
        >
          <ArrowLeft size={15} />
          Back to Login
        </button>
      </div>
    </div>
  );
}