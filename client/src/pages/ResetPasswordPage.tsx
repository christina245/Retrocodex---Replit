import { useState } from "react";
import { Link, useLocation } from "wouter";
import "./ForgotPasswordPage.css";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-card">
          <Link href="/" className="forgot-password-logo">Retrocodex</Link>
          <p className="forgot-password-title">Invalid link</p>
          <p className="forgot-password-subtitle">This password reset link is missing or invalid.</p>
          <Link href="/forgot-password" className="forgot-password-back-link">Request a new reset link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <Link href="/" className="forgot-password-logo">Retrocodex</Link>

        {success ? (
          <div className="forgot-password-success">
            <p className="forgot-password-success-title">Password updated</p>
            <p className="forgot-password-success-body">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Link href="/" className="forgot-password-back-link">Back to home</Link>
          </div>
        ) : (
          <>
            <p className="forgot-password-title">Choose a new password</p>
            <p className="forgot-password-subtitle">Must be at least 8 characters.</p>
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <label className="forgot-password-label" htmlFor="reset-password">NEW PASSWORD</label>
              <input
                id="reset-password"
                type="password"
                className="forgot-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
                data-testid="input-reset-password"
              />
              <label className="forgot-password-label" htmlFor="reset-confirm-password">CONFIRM PASSWORD</label>
              <input
                id="reset-confirm-password"
                type="password"
                className="forgot-password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                data-testid="input-reset-confirm-password"
              />
              {error && <p className="forgot-password-error" data-testid="text-reset-error">{error}</p>}
              <button
                type="submit"
                className="forgot-password-submit"
                disabled={loading}
                data-testid="button-reset-submit"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
