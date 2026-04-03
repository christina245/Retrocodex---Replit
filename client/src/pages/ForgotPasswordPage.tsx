import { useState } from "react";
import { Link } from "wouter";
import lockImage from "@assets/cute_lock_1775201659214.png";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <Link href="/"><img src={lockImage} className="forgot-password-logo" alt="Retrocodex" /></Link>

        {submitted ? (
          <div className="forgot-password-success">
            <p className="forgot-password-success-title">Check your inbox</p>
            <p className="forgot-password-success-body">
              If that email is registered, we've sent a reset link. It expires in 1 hour.
            </p>
            <Link href="/" className="forgot-password-back-link">Back to home</Link>
          </div>
        ) : (
          <>
            <p className="forgot-password-title">Reset your password</p>
            <p className="forgot-password-subtitle">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <label className="forgot-password-label" htmlFor="forgot-email">EMAIL</label>
              <input
                id="forgot-email"
                type="email"
                className="forgot-password-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                data-testid="input-forgot-email"
              />
              {error && <p className="forgot-password-error" data-testid="text-forgot-error">{error}</p>}
              <button
                type="submit"
                className="forgot-password-submit"
                disabled={loading}
                data-testid="button-forgot-submit"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
            <Link href="/" className="forgot-password-back-link">Back to home</Link>
          </>
        )}
      </div>
    </div>
  );
}
