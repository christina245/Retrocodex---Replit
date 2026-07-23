import scrungyMailImage from "@assets/scrungy/scrungy mail transparent.png";
import "./SendgridBanner.css";

export function SendgridBanner({ hideMascot = false }: { hideMascot?: boolean }) {
  return (
    <div className="sendgrid-banner-wrapper" data-testid="sendgrid-banner">
      {!hideMascot && (
        <img src={scrungyMailImage} className="sendgrid-banner-mascot" alt="" />
      )}
      <div className="sendgrid-banner-container">
        <iframe
          src="https://cdn.forms-content-1.sg-form.com/c0c22481-8647-11f1-b1b2-b2242c52482b"
          className="sendgrid-embed"
          frameBorder={0}
          scrolling="no"
          title="Subscribe to newsletter"
        />
      </div>
    </div>
  );
}
