import "./SendgridBanner.css";

export function SendgridBanner() {
  return (
    <div className="sendgrid-banner-container" data-testid="sendgrid-banner">
      <iframe
        src="https://cdn.forms-content-1.sg-form.com/baf39de1-2a2b-11f1-9436-7a05af6a6af3"
        className="sendgrid-embed"
        frameBorder={0}
        scrolling="no"
        title="Subscribe to newsletter"
      />
    </div>
  );
}
