import { FaInstagram, FaReddit, FaBluesky } from "react-icons/fa6";
import footerLogo from "@assets/logos/white red logo.png";
import "./Footer.css";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* About Retrocodex */}
        <div className="footer-column">
          <h3 className="footer-heading">About</h3>
          <ul className="footer-links">

            <li><a href="http://theretrocodex.com/about" data-testid="link-footer-about">What is Retrocodex?</a></li>
            <li><a href="http://theretrocodex.com/recommended-reading" data-testid="link-footer-recommended-reading">Recommended reading</a></li>
            <li><a href="http://theretrocodex.com/articles" data-testid="link-footer-blog">Articles</a></li>
          </ul>
        </div>

        {/* Fact Categories */}
        <div className="footer-column">
          <h3 className="footer-heading">Fact categories</h3>
          <ul className="footer-links">
            <li><a href="http://theretrocodex.com/category/history" data-testid="link-footer-history">History</a></li>
            <li><a href="http://theretrocodex.com/category/life-sciences" data-testid="link-footer-life-sciences">Life sciences</a></li>
            <li><a href="http://theretrocodex.com/category/everyday-life" data-testid="link-footer-everyday">Everyday life</a></li>
            <li><a href="http://theretrocodex.com/category/health-fitness" data-testid="link-footer-health">Health & fitness</a></li>
            <li><a href="http://theretrocodex.com/category/social-sciences" data-testid="link-footer-social">Social sciences</a></li>
            <li><a href="http://theretrocodex.com/category/gender-sexuality" data-testid="link-footer-gender">Gender & sexuality</a></li>
            <li><a href="http://theretrocodex.com/category/other" data-testid="link-footer-miscellaneous">More categories</a></li>
          </ul>
        </div>

        {/* Get in Touch */}
        <div className="footer-column">
          <h3 className="footer-heading">Get in touch</h3>
          <ul className="footer-links">
            <li>
              <a 
                href="/contact"
                data-testid="link-footer-contact"
              >
                Contact
              </a>
            </li>
            <li>
              <a 
                href="http://theretrocodex.com/submit" 
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
            Launched in late April 2026, <b>Retrocodex: Stuff You Learned Wrong</b> is an evolving, interactive library of commonly taught misconceptions and outdated facts from all over the world. 
          </p>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="footer-bottom">
        <div className="footer-bottom-links">
          <span className="footer-disabled-link" data-testid="link-footer-privacy">Privacy Policy</span>
          <span>•</span>
          <span className="footer-disabled-link" data-testid="link-footer-terms">Terms of Use</span>
          <span>•</span>
          <span className="footer-disabled-link" data-testid="link-footer-disclaimer">Disclaimers</span>
          <span>•</span>
          <span className="footer-disabled-link" data-testid="link-footer-cookie">Cookie Policy</span>
        </div>
      </div>
    </footer>
  );
}
