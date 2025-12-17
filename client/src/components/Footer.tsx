import { FaInstagram, FaReddit, FaBluesky } from "react-icons/fa6";
import footerLogo from "@assets/footer_logo_1765927001444.png";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Retrocodex */}
        <div className="footer-column">
          <h3 className="footer-heading">About</h3>
          <ul className="footer-links">

            <li><a href="#" data-testid="link-footer-about">About the site</a></li>
            <li><a href="#" data-testid="link-footer-blog">Blog</a></li>
          </ul>
        </div>

        {/* Fact Categories */}
        <div className="footer-column">
          <h3 className="footer-heading">Fact categories</h3>
          <ul className="footer-links">
            <li><a href="https://retrocodex.replit.app/category/history" data-testid="link-footer-history">History</a></li>
            <li><a href="https://retrocodex.replit.app/category/life-sciences" data-testid="link-footer-life-sciences">Life sciences</a></li>
            <li><a href="https://retrocodex.replit.app/category/everyday-life" data-testid="link-footer-everyday">Everyday life</a></li>
            <li><a href="https://retrocodex.replit.app/category/health-fitness" data-testid="link-footer-health">Health & fitness</a></li>
            <li><a href="https://retrocodex.replit.app/category/social-sciences" data-testid="link-footer-social">Social sciences</a></li>
            <li><a href="https://retrocodex.replit.app/category/gender-sexuality" data-testid="link-footer-gender">Gender & sexuality</a></li>
            <li><a href="https://retrocodex.replit.app/category/other" data-testid="link-footer-miscellaneous">More categories</a></li>
          </ul>
        </div>

        {/* Get in Touch */}
        <div className="footer-column">
          <h3 className="footer-heading">Get in touch</h3>
          <ul className="footer-links">
            <li>
              <a 
                href="https://form.typeform.com/to/tC2dk1xb" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-footer-donate"
              >
                Contact
              </a>
            </li>
            <li>
              <a 
                href="https://form.typeform.com/to/pal6ZbpG" 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid="link-footer-submit"
              >
                Submit a new fact
              </a>
            </li>
          </ul>
        </div>

        {/* Join the Community */}
        <div className="footer-column">
          <h3 className="footer-heading">Join the community</h3>
          <div className="footer-social">
            <a 
              href="https://instagram.com/stuffyoulearnedwrong" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-social-link"
              data-testid="link-footer-instagram"
              aria-label="Follow us on Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://reddit.com/r/LearnedWrong" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-social-link"
              data-testid="link-footer-reddit"
              aria-label="Join us on Reddit"
            >
              <FaReddit />
            </a>
            <a 
              href="https://bsky.app/profile/the-retrocodex.bsky.social" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-social-link"
              data-testid="link-footer-bluesky"
              aria-label="Follow us on Bluesky"
            >
              <FaBluesky />
            </a>
          </div>
          <a 
            href="https://buymeacoffee.com/retrocodex" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-donate-button"
            data-testid="button-footer-donate"
          >
            Donate
          </a>
        </div>

        {/* Footer Logo and Description */}
        <div className="footer-brand">
          <img 
            src={footerLogo} 
            alt="Retrocodex" 
            className="footer-brand-logo"
          />
          <p className="footer-brand-description">
            <b>Retrocodex: Stuff You Might Have Learned Wrong</b> is a living archive of commonly taught misconceptions from all over the world. It explores how each misconception originated, why it persisted, and what the evidence really says.
          </p>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="footer-bottom">
        <div className="footer-bottom-links">
          <a href="#" data-testid="link-footer-privacy">Privacy Policy</a>
          <span>•</span>
          <a href="#" data-testid="link-footer-terms">Terms of Use</a>
          <span>•</span>
          <a href="#" data-testid="link-footer-disclaimer">Disclaimers</a>
          <span>•</span>
          <a href="#" data-testid="link-footer-cookie">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
