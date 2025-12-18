import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
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
  
  // Extract photos from timeline entries that have images
  const photos = timeline
    .filter(entry => entry.imageUrl)
    .map(entry => ({
      src: entry.imageUrl!,
      caption: entry.imageCaption
    }));

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
                          p: ({ children }) => <>{children}</>,
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
                        className="timeline-photo rounded"
                        data-testid={`timeline-photo-${index}`}
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
    </div>
  );
}
