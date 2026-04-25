import { useState } from "react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import scrungyContact from "@assets/scrungy_contact_page_1777084410520.png";
import instagramLogo from "@assets/Instagram_logo_2016.svg (1)_1763699400163.png";
import redditLogo from "@assets/Reddit-Logo-500x281_1763705445995.png";
import "./ContactPage.css";

export default function ContactPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="contact-page">
      <SEO
        title="Contact | Retrocodex"
        description="Get in touch with Retrocodex through our social media or email."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} hideTagline />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <main className="contact-main">
        <div className="contact-layout">
          <div className="contact-text-column">
            <h1 className="contact-header" data-testid="text-contact-header">Contact</h1>

            <p className="contact-body" data-testid="text-contact-body">
              Have any questions, concerns, or suggestions on how Retrocodex could be a more inclusive and factually accurate platform? The best way to reach us is through our social media:
            </p>

            <div className="contact-social-row" data-testid="contact-social-links">
              <a
                href="https://instagram.com/stuffyoulearnedwrong"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-link"
                data-testid="link-contact-instagram"
                aria-label="Retrocodex on Instagram"
              >
                <img src={instagramLogo} alt="Instagram" className="contact-social-logo" />
              </a>
              <a
                href="http://reddit.com/r/LearnedWrong"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-link"
                data-testid="link-contact-reddit"
                aria-label="Retrocodex on Reddit"
              >
                <img src={redditLogo} alt="Reddit" className="contact-social-logo contact-social-logo-reddit" />
              </a>
            </div>

            <p className="contact-body" data-testid="text-contact-email">
              Or send us an email at contact@theretrocodex.com!
            </p>

            <p className="contact-body" data-testid="text-contact-history">
              This site is just getting started! Retrocodex was first designed in September 2025 with the first read-only version launched in December 2025. Its current beta with user accounts has only been up since April 2026.
            </p>
          </div>

          <div className="contact-image-column">
            <img
              src={scrungyContact}
              alt="Scrungy the squirrel holding mail with a speech bubble"
              className="contact-scrungy-image"
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
