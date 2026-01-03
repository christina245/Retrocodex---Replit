import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import Lightbox from "./Lightbox";
import "./TimelineSection.css";

interface TimelineEvent {
  id: string;
  year: string;
  description: string;
  imageUrl?: string;
  imageCaption?: string;
  order: number;
}

interface NuanceItem {
  id: string;
  type: string;
  body: string;
}

interface TimelineSectionProps {
  timeline: TimelineEvent[];
  nuances?: NuanceItem[];
}

export default function TimelineSection({ timeline, nuances = [] }: TimelineSectionProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "nuances">("timeline");
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(max-width: 768px)').matches;
    }
    return false;
  });
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string; caption?: string } | null>(null);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    
    // Set initial state
    setIsMobile(mediaQuery.matches);
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Get photo for a specific timeline entry
  const getEventPhoto = (event: TimelineEvent) => {
    if (!event.imageUrl) return null;
    return { src: event.imageUrl, caption: event.imageCaption };
  };
  
  // Extract photos from timeline entries that have images
  const photos = timeline
    .filter(entry => entry.imageUrl)
    .map(entry => ({
      src: entry.imageUrl!,
      caption: entry.imageCaption
    }));

  // Mobile: Render two separate accordions
  if (isMobile) {
    return (
      <div className="timeline-section timeline-section-mobile" data-testid="timeline-section">
        <div className="mobile-accordions-container">
          {/* Timeline Accordion */}
          <div className="timeline-master-accordion" data-testid="timeline-master-accordion">
            <button
              className="timeline-master-accordion-header"
              onClick={() => toggleAccordion('timeline-master')}
              aria-expanded={openAccordions.has('timeline-master')}
              data-testid="timeline-master-accordion-toggle"
            >
              <span className={`accordion-triangle ${openAccordions.has('timeline-master') ? 'open' : ''}`}>▶</span>
              <span className="timeline-master-accordion-title">How This Information Evolved</span>
            </button>
            {openAccordions.has('timeline-master') && (
              <div className="timeline-master-accordion-content">
                {timeline.length > 0 ? (
                  timeline.map((event, index) => {
                    const eventPhoto = getEventPhoto(event);
                    return (
                      <div key={event.id} className="timeline-accordion-entry" data-testid={`timeline-entry-${index}`}>
                        <div className="timeline-entry-year">{event.year}</div>
                        <div className="timeline-entry-text">
                          <ReactMarkdown
                            rehypePlugins={[rehypeSanitize]}
                            components={{
                              p: ({ children }) => <p style={{ marginBottom: '1em' }}>{children}</p>,
                              em: ({ children }) => <em>{children}</em>,
                              a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {event.description}
                          </ReactMarkdown>
                        </div>
                        {eventPhoto && (
                          <div className="timeline-entry-photo">
                            <img
                              src={eventPhoto.src}
                              alt={eventPhoto.caption || `Timeline photo for ${event.year}`}
                              className="timeline-photo rounded clickable"
                              data-testid={`timeline-entry-photo-${index}`}
                              onClick={() => setLightboxImage({
                                src: eventPhoto.src,
                                alt: eventPhoto.caption || `Timeline photo for ${event.year}`,
                                caption: eventPhoto.caption
                              })}
                            />
                            {eventPhoto.caption && (
                              <div className="timeline-photo-caption" data-testid={`timeline-entry-caption-${index}`}>
                                <ReactMarkdown
                                  rehypePlugins={[rehypeSanitize]}
                                  components={{
                                    p: ({ children }) => <>{children}</>,
                                    em: ({ children }) => <em>{children}</em>,
                                    a: ({ href, children }) => (
                                      <a href={href} target="_blank" rel="noopener noreferrer">
                                        {children}
                                      </a>
                                    ),
                                  }}
                                >
                                  {eventPhoto.caption}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="accordion-empty-message">No timeline information available.</p>
                )}
              </div>
            )}
          </div>

          {/* Nuances Accordion */}
          <div className="timeline-master-accordion" data-testid="nuances-master-accordion">
            <button
              className="timeline-master-accordion-header"
              onClick={() => toggleAccordion('nuances-master')}
              aria-expanded={openAccordions.has('nuances-master')}
              data-testid="nuances-master-accordion-toggle"
            >
              <span className={`accordion-triangle ${openAccordions.has('nuances-master') ? 'open' : ''}`}>▶</span>
              <span className="timeline-master-accordion-title">Nuances & Controversy</span>
            </button>
            {openAccordions.has('nuances-master') && (
              <div className="timeline-master-accordion-content">
                {nuances.length > 0 ? (
                  nuances.map((nuance, index) => (
                    <div 
                      key={nuance.id} 
                      className="nuance-box"
                      data-testid={`nuance-box-${index}`}
                    >
                      <div 
                        className="nuance-category"
                        data-testid={`nuance-category-${index}`}
                      >
                        {nuance.type}
                      </div>
                      <div className="nuance-text" data-testid={`nuance-text-${index}`}>
                        <ReactMarkdown
                          rehypePlugins={[rehypeSanitize]}
                          components={{
                            p: ({ children }) => <>{children}</>,
                            em: ({ children }) => <em>{children}</em>,
                            a: ({ href, children }) => (
                              <a href={href} target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {nuance.body}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="accordion-empty-message">No nuances or controversy noted for this fact.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {lightboxImage && (
          <Lightbox
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            caption={lightboxImage.caption}
            onClose={() => setLightboxImage(null)}
          />
        )}
      </div>
    );
  }

  // Desktop: Keep the original tab-based layout
  return (
    <div className="timeline-section" data-testid="timeline-section">
      <div className="timeline-tabs" role="tablist">
        <button
          id="tab-timeline"
          className={`timeline-tab ${activeTab === "timeline" ? "active" : ""}`}
          onClick={() => setActiveTab("timeline")}
          data-testid="tab-timeline"
          role="tab"
          aria-selected={activeTab === "timeline"}
          aria-controls="timeline-panel"
        >
          How This Information Evolved
        </button>
        <button
          id="tab-nuances"
          className={`timeline-tab ${activeTab === "nuances" ? "active" : ""}`}
          onClick={() => setActiveTab("nuances")}
          data-testid="tab-nuances"
          role="tab"
          aria-selected={activeTab === "nuances"}
          aria-controls="nuances-panel"
        >
          Nuances & Controversy
        </button>
      </div>

      <div className="timeline-content">
        {activeTab === "timeline" ? (
          <div role="tabpanel" id="timeline-panel" aria-labelledby="tab-timeline">
            <div className="timeline-columns">
              <div className="timeline-text-column">
                {timeline.map((event, index) => (
                  <div key={event.id} className="timeline-event" data-testid={`timeline-event-${index}`}>
                    <div className="timeline-line"></div>
                    <div className="timeline-year">{event.year}</div>
                    <div className="timeline-text">
                      <ReactMarkdown
                        rehypePlugins={[rehypeSanitize]}
                        components={{
                          p: ({ children }) => <p style={{ marginBottom: '1em' }}>{children}</p>,
                          em: ({ children }) => <em>{children}</em>,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {event.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>

              {photos.length > 0 && (
                <div className="timeline-photos-column">
                  {photos.map((photo, index) => (
                    <div key={index} className="timeline-photo-wrapper">
                      <img
                        src={photo.src}
                        alt={photo.caption || `Timeline photo ${index + 1}`}
                        className="timeline-photo rounded clickable"
                        data-testid={`timeline-photo-${index}`}
                        onClick={() => setLightboxImage({
                          src: photo.src,
                          alt: photo.caption || `Timeline photo ${index + 1}`,
                          caption: photo.caption
                        })}
                      />
                      {photo.caption && (
                        <div className="timeline-photo-caption" data-testid={`timeline-caption-${index}`}>
                          <ReactMarkdown
                            rehypePlugins={[rehypeSanitize]}
                            components={{
                              p: ({ children }) => <>{children}</>,
                              em: ({ children }) => <em>{children}</em>,
                              a: ({ href, children }) => (
                                <a href={href} target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {photo.caption}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div role="tabpanel" id="nuances-panel" aria-labelledby="tab-nuances" className="nuances-content">
            {nuances.length > 0 ? (
              nuances.map((nuance, index) => (
                <div 
                  key={nuance.id} 
                  className="nuance-box"
                  data-testid={`nuance-box-${index}`}
                >
                  <div 
                    className="nuance-category"
                    data-testid={`nuance-category-${index}`}
                  >
                    {nuance.type}
                  </div>
                  <div className="nuance-text" data-testid={`nuance-text-${index}`}>
                    <ReactMarkdown
                      rehypePlugins={[rehypeSanitize]}
                      components={{
                        p: ({ children }) => <>{children}</>,
                        em: ({ children }) => <em>{children}</em>,
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {nuance.body}
                    </ReactMarkdown>
                  </div>
                </div>
              ))
            ) : (
              <p className="nuances-empty">No nuances or controversy noted for this fact.</p>
            )}
          </div>
        )}
      </div>

      {lightboxImage && (
        <Lightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          caption={lightboxImage.caption}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
