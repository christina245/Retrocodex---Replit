import thanksgivingPhoto from "@assets/thanksgiving myths stock photo_1763852604175.jpg";
import "./HeroSection.css";

export function HeroSection() {
  const date = new Date();
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const currentDate = `${month}. ${day}, ${year}`;

  return (
    <section className="hero-section">
      <div className="hero-container" data-testid="hero-container">
        <div className="hero-content">
          <div className="hero-tag">
            <div className="hero-tag-line"></div>
            <span className="hero-tag-text">ARTICLE</span>
          </div>
          
          <a 
            href="#" 
            className="hero-link"
            data-testid="link-hero-article"
          >
            <h2 className="hero-title" data-testid="text-hero-title">
              5 Misconceptions You Might Have About Thanksgiving
            </h2>
          </a>
          
          <p className="hero-summary" data-testid="text-hero-summary">
            Did you know that turkey might not have been served at the legendary 1621 "first Thanksgiving meal"? Let's take a closer look at the real history behind the iconic American holiday, from the troubled relationship between the Native Americans and Pilgrims to what the Pilgrims actually wore.
          </p>
          
          <div className="hero-date" data-testid="text-hero-date">{currentDate}</div>
        </div>
        
        <div className="hero-image-container">
          <a 
            href="#" 
            className="hero-image-link"
            data-testid="link-hero-image"
          >
            <img 
              src={thanksgivingPhoto} 
              alt="Thanksgiving dinner spread" 
              className="hero-image"
            />
          </a>
          <div className="hero-attribution" data-testid="text-hero-attribution">Photo by Megan Watson on Unsplash</div>
        </div>
      </div>
    </section>
  );
}
