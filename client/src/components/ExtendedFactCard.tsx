import { X, Check, BookOpen } from "lucide-react";
import mcgovernLogo from "@assets/mcgovern svg_1763930576954.png";
import apsLogo from "@assets/Association_for_Psychological_Science_Logo_-_PNG 1_1763930617322.png";
import "./ExtendedFactCard.css";

interface Source {
  type: "editorial" | "academic";
  name: string;
  logo?: string;
  url: string;
}

interface ExtendedFactCardProps {
  fact: {
    myth: string;
    truth: string;
    category: string[];
    details: string;
    moreDetails?: string;
    sources: Source[];
  };
}

const logoMap: Record<string, string> = {
  "mcgovern svg": mcgovernLogo,
  "Association_for_Psychological_Science_Logo_-_PNG 1": apsLogo,
};

export default function ExtendedFactCard({ fact }: ExtendedFactCardProps) {
  return (
    <div className="extended-fact-card" data-testid="extended-fact-card">
      <div className="extended-fact-content">
        <div className="fact-section">
          <div className="fact-label">
            <X className="fact-icon fact-icon-myth" size={16} />
            <span className="label-text">YOU MIGHT HAVE BEEN TAUGHT</span>
          </div>
          <p className="fact-myth">{fact.myth}</p>
        </div>

        <div className="fact-section">
          <div className="fact-label">
            <Check className="fact-icon fact-icon-truth" size={16} />
            <span className="label-text">CURRENT UNDERSTANDING</span>
          </div>
          <p className="fact-truth">{fact.truth}</p>
          <p className="fact-details">{fact.details}</p>
          {fact.moreDetails && (
            <p className="fact-more-details">{fact.moreDetails}</p>
          )}
        </div>

        <div className="fact-section">
          <div className="fact-label">
            <BookOpen className="fact-icon fact-icon-sources" size={16} />
            <span className="label-text">SOURCES</span>
          </div>
          
          <div className="sources-list">
            {fact.sources
              .filter(s => s.type === "editorial")
              .map((source, idx) => (
                <div key={idx} className="source-item editorial-source">
                  {source.logo && logoMap[source.logo] && (
                    <img 
                      src={logoMap[source.logo]} 
                      alt={source.name} 
                      className="source-logo"
                    />
                  )}
                </div>
              ))}
            
            {fact.sources
              .filter(s => s.type === "academic")
              .map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  className="source-item academic-source"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`source-link-${idx}`}
                >
                  {source.name}
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
