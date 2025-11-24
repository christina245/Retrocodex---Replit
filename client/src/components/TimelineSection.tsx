import { useState } from "react";
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

interface TimelineSectionProps {
  timeline: TimelineEvent[];
  photos: Photo[];
}

const photoMap: Record<string, string> = {
  "how to win friends 1936 version 1": howToWinFriends,
  "limitless cover": limitlessCover,
  "Lucy - Quad Movie Poster (Crop)": lucyPoster,
};

export default function TimelineSection({ timeline, photos }: TimelineSectionProps) {
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
                    <div 
                      className="timeline-text"
                      dangerouslySetInnerHTML={{ __html: event.text }}
                    />
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
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div role="tabpanel" id="nuances-panel" aria-labelledby="tab-nuances" className="nuances-content">
            <p>Nuances and controversy content will be added here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
