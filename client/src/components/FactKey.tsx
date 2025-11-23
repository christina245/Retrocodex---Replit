import { X, Check } from "lucide-react";
import "./FactKey.css";

export function FactKey() {
  return (
    <div className="fact-key" data-testid="fact-key">
      <div className="fact-key-item">
        <X className="fact-key-icon myth-icon" />
        <span className="fact-key-text">What you may have learned</span>
      </div>
      <div className="fact-key-item">
        <Check className="fact-key-icon truth-icon" />
        <span className="fact-key-text">Current understanding as of 2025. Facts are subject to change based on new discoveries.</span>
      </div>
    </div>
  );
}
