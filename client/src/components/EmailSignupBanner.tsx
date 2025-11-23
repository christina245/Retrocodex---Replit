import { useState } from "react";
import instagramLogo from "@assets/Instagram_logo_2016.svg (1)_1763699400163.png";
import blueskyLogo from "@assets/Bluesky_Logo.svg_1763699419379.png";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import "./EmailSignupBanner.css";

interface EmailSignupBannerProps {
  onSubmit: (email: string) => Promise<void>;
}

export function EmailSignupBanner({ onSubmit }: EmailSignupBannerProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(email);
      setEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="email-signup-banner" data-testid="email-signup-banner">
      <h3 className="banner-title">
        Be notified when user accounts are available.
      </h3>
      
      <form onSubmit={handleSubmit} className="banner-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="banner-input"
          data-testid="input-email-signup"
          required
        />
        <button 
          type="submit" 
          className="banner-submit"
          disabled={isSubmitting}
          data-testid="button-update-me"
        >
          {isSubmitting ? "Updating..." : "Update me"}
        </button>
      </form>

      <div className="banner-benefits">
        <p className="benefits-intro"><strong>With an account, you can:</strong></p>
        <ul className="benefits-list">
          <li>Vote on whether you were taught a myth or the updated truth</li>
          <li>Discuss and debate on what should and when you graduated from school</li>
          <li>And later on, view maps that show where outdated teaching is more prevalent than others</li>
        </ul>
        <p className="benefits-note">
          In the meantime, you can still join discussions with other unlearners at:
        </p>
      </div>

      <div className="banner-social">
        <a 
          href="https://instagram.com/retrocodex.facts" 
          target="_blank" 
          rel="noopener noreferrer"
          className="banner-social-link"
          data-testid="link-banner-instagram"
          aria-label="Join us on Instagram"
        >
          <img src={instagramLogo} alt="Instagram" className="banner-social-logo" />
        </a>
        <a 
          href="https://reddit.com/r/LearnedWrong" 
          target="_blank" 
          rel="noopener noreferrer"
          className="banner-social-link"
          data-testid="link-banner-reddit"
          aria-label="Join us on Reddit"
        >
          <img src={redditLogo} alt="Reddit" className="banner-social-logo banner-social-logo-reddit" />
        </a>
        <a 
          href="https://bsky.app/profile/the-retrocodex.bsky.social" 
          target="_blank" 
          rel="noopener noreferrer"
          className="banner-social-link"
          data-testid="link-banner-bluesky"
          aria-label="Join us on Bluesky"
        >
          <img src={blueskyLogo} alt="Bluesky" className="banner-social-logo banner-social-logo-bluesky" />
        </a>
      </div>
    </div>
  );
}
