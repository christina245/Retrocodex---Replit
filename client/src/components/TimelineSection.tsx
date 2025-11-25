import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import howToWinFriends from "@assets/how to win friends 1936 version 1_1763930466764.png";
import limitlessCover from "@assets/limitless cover_1763930486983.jpg";
import lucyPoster from "@assets/Lucy - Quad Movie Poster (Crop)_1763930493964.png";
import "./TimelineSection.css";

interface TimelineEvent {
  year: string;
  text: string;
}

interface Photo {
  src: string;
  hasTransparentBg: boolean;
  caption?: string;
}

interface NuanceItem {
  category: string;
  text: string;
  isControversial?: boolean;
}

interface TimelineSectionProps {
  timeline: TimelineEvent[];
  photos: Photo[];
  nuances?: NuanceItem[];
}

const photoMap: Record<string, string> = {
  "how to win friends 1936 version 1": howToWinFriends,
  "limitless cover": limitlessCover,
  "Lucy - Quad Movie Poster (Crop)": lucyPoster,
};

export default function TimelineSection({ timeline, photos, nuances = [] }: TimelineSectionProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "nuances">("timeline");

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
                  <div key={index} className="timeline-event" data-testid={`timeline-event-${index}`}>
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
                        {event.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>

              <div className="timeline-photos-column">
                {photos.map((photo, index) => (
                  <div key={index} className="timeline-photo-wrapper">
                    <img
                      src={photoMap[photo.src]}
                      alt={`Timeline photo ${index + 1}`}
                      className={`timeline-photo ${photo.hasTransparentBg ? "" : "rounded"}`}
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
            </div>
          </div>
        ) : (
          <div role="tabpanel" id="nuances-panel" aria-labelledby="tab-nuances" className="nuances-content">
            {nuances.length > 0 ? (
              nuances.map((nuance, index) => (
                <div 
                  key={index} 
                  className={`nuance-box ${nuance.isControversial ? "nuance-box-controversial" : ""}`}
                  data-testid={`nuance-box-${index}`}
                >
                  <div 
                    className={`nuance-category ${nuance.isControversial ? "nuance-category-controversial" : ""}`}
                    data-testid={`nuance-category-${index}`}
                  >
                    {nuance.category}
                  </div>
                  <div className="nuance-text" data-testid={`nuance-text-${index}`}>
                    {nuance.text}
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
