import { X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import logoImage from "@assets/retrocodex thicker logo beta.png";
import "./SignInModal.css";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (value && password && value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }
  };

  return (
    <div className="signin-overlay" onClick={handleOverlayClick} data-testid="signin-modal-overlay">
      <div className="signin-modal" data-testid="signin-modal">
        <button
          className="signin-close"
          onClick={onClose}
          data-testid="button-signin-close"
          aria-label="Close sign in"
        >
          <X size={20} />
        </button>

        <div className="signin-modal-body">
          <img src={logoImage} alt="Retrocodex" className="signin-logo" data-testid="img-signin-logo" />

          <p className="signin-description" data-testid="text-signin-description">
            {isSignUp
              ? "Create an account to save your favorite topics, be notified when they're updated, and leave comments sharing your experiences."
              : "Log in to save your favorite topics, be notified when they're updated, and leave comments sharing your experiences."}
          </p>

          <form className="signin-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="signin-field">
                <label className="signin-label" htmlFor="signin-username">USERNAME</label>
                <input
                  id="signin-username"
                  type="text"
                  className="signin-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  data-testid="input-signin-username"
                />
              </div>
            )}

            <div className="signin-field">
              <label className="signin-label" htmlFor="signin-email">
                {isSignUp ? "EMAIL" : "EMAIL OR USERNAME"}
              </label>
              <input
                id="signin-email"
                type={isSignUp ? "email" : "text"}
                className="signin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-signin-email"
              />
            </div>

            <div className="signin-field">
              <label className="signin-label" htmlFor="signin-password">PASSWORD</label>
              <div className="signin-password-wrapper">
                <input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  className="signin-input signin-input-password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  data-testid="input-signin-password"
                />
                <button
                  type="button"
                  className="signin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {!isSignUp && (
                <button
                  type="button"
                  className="signin-forgot"
                  data-testid="button-forgot-password"
                >
                  Reset password
                </button>
              )}
            </div>

            {isSignUp && (
              <div className="signin-field">
                <label className="signin-label" htmlFor="signin-confirm-password">CONFIRM PASSWORD</label>
                <div className="signin-password-wrapper">
                  <input
                    id="signin-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`signin-input signin-input-password${confirmPasswordError ? " signin-input-error" : ""}`}
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                    data-testid="input-signin-confirm-password"
                  />
                  <button
                    type="button"
                    className="signin-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="button-toggle-confirm-password"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPasswordError && (
                  <span className="signin-error-text" data-testid="text-confirm-password-error">
                    {confirmPasswordError}
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              className="signin-submit-button"
              data-testid="button-signin-submit"
            >
              {isSignUp ? "Sign up" : "Sign in"}
            </button>
          </form>

          <div className="signin-divider">
            <span className="signin-divider-line"></span>
            <span className="signin-divider-text">OR LOG IN WITH</span>
            <span className="signin-divider-line"></span>
          </div>

          <div className="signin-social-buttons">
            <button
              type="button"
              className="signin-social-button"
              data-testid="button-signin-google"
            >
              <FcGoogle size={20} />
              <span>Google</span>
            </button>
            <button
              type="button"
              className="signin-social-button"
              data-testid="button-signin-apple"
            >
              <FaApple size={20} />
              <span>Apple</span>
            </button>
          </div>

          <button
            type="button"
            className="signin-toggle-mode"
            onClick={() => setIsSignUp(!isSignUp)}
            data-testid="button-toggle-signup"
          >
            {isSignUp ? "Already have an account? Sign in" : "Sign up for an account"}
          </button>
        </div>
      </div>
    </div>
  );
}
