import { useEffect, useRef } from "react";
import "./SendgridBanner.css";

export function SendgridBanner() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    
    const existingScript = document.querySelector('script[src="https://subscribe-forms.beehiiv.com/embed.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://subscribe-forms.beehiiv.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
    
    scriptLoaded.current = true;
  }, []);

  return (
    <div className="beehiiv-banner-container" data-testid="beehiiv-banner">
      <iframe
        src="https://subscribe-forms.beehiiv.com/cd6cc3b1-314b-448c-8991-0a480610863c"
        className="beehiiv-embed"
        data-test-id="beehiiv-embed"
        frameBorder="0"
        scrolling="no"
        title="Subscribe to newsletter"
      />
    </div>
  );
}
