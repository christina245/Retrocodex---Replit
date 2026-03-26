import { useState } from "react";
import { MapPin } from "lucide-react";
import { useAuth } from "@/lib/auth";
import "./Poll.css";

interface PollProps {
  question: string;
  options: string[];
  factId: string;
}

export function Poll({ question, options, factId }: PollProps) {
  const { user, isLoggedIn } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votedOption, setVotedOption] = useState<string | null>(null);
  const [votedLocation, setVotedLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changingVote, setChangingVote] = useState(false);

  const locationOptions: string[] = [];
  if (user?.currentLocation) locationOptions.push(user.currentLocation);
  if (user?.placesLived?.length) {
    user.placesLived.forEach(p => {
      if (p && !locationOptions.includes(p)) locationOptions.push(p);
    });
  }
  const hasLocations = isLoggedIn && locationOptions.length > 0;
  const hasOnlyOneLocation = locationOptions.length === 1;

  const handleSubmit = async () => {
    if (!isLoggedIn) return;
    if (!selectedOption) {
      setError("Please select an answer.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/poll-votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          factId,
          optionChosen: selectedOption,
          locationChosen: selectedLocation || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to save vote");
      }
      setVoted(true);
      setVotedOption(selectedOption);
      setVotedLocation(selectedLocation || null);
      setChangingVote(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vote");
    } finally {
      setSubmitting(false);
    }
  };

  if (voted && !changingVote) {
    return (
      <div className="poll-container poll-voted-state" data-testid="poll-container">
        <h3 className="poll-title" data-testid="poll-title">{question}</h3>
        <div className="poll-voted-display" data-testid="poll-voted-display">
          <div className="poll-voted-row">
            <div className="poll-radio-static-filled" />
            <span className="poll-option-text" data-testid="poll-voted-answer">{votedOption}</span>
          </div>
          {votedLocation && (
            <p className="poll-voted-location" data-testid="poll-voted-location">
              <MapPin size={11} />
              {votedLocation}
            </p>
          )}
        </div>
        <p className="poll-voted-thanks">Your vote was recorded. Thank you!</p>
        <button
          className="poll-change-vote-link"
          onClick={() => {
            setChangingVote(true);
            setSelectedOption(votedOption);
            setSelectedLocation(votedLocation || "");
          }}
          data-testid="button-poll-change-vote"
        >
          Change vote
        </button>
      </div>
    );
  }

  return (
    <div className="poll-container" data-testid="poll-container">
      <h3 className="poll-title" data-testid="poll-title">{question}</h3>

      <div className="poll-options">
        <div className="poll-column poll-column-left">
          {options.slice(0, 4).map((option, index) => (
            <label key={index} className="poll-option" data-testid={`poll-option-${index}`}>
              <input
                type="radio"
                name="poll"
                value={option}
                checked={selectedOption === option}
                onChange={() => { setSelectedOption(option); setError(null); }}
                className="poll-radio"
                data-testid={`radio-option-${index}`}
              />
              <span className="poll-radio-custom"></span>
              <span className="poll-option-text">{option}</span>
            </label>
          ))}
        </div>
        <div className="poll-column poll-column-right">
          {options.slice(4).map((option, index) => (
            <label key={index + 4} className="poll-option" data-testid={`poll-option-${index + 4}`}>
              <input
                type="radio"
                name="poll"
                value={option}
                checked={selectedOption === option}
                onChange={() => { setSelectedOption(option); setError(null); }}
                className="poll-radio"
                data-testid={`radio-option-${index + 4}`}
              />
              <span className="poll-radio-custom"></span>
              <span className="poll-option-text">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {hasLocations && (
        <div className="poll-location-section" data-testid="poll-location-section">
          <label className="poll-location-label" htmlFor="poll-location-select">
            Where did you learn this?
          </label>
          <select
            id="poll-location-select"
            className="poll-location-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            data-testid="select-poll-location"
          >
            <option value="" disabled>Select a location...</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          {hasOnlyOneLocation && (
            <p className="poll-location-hint" data-testid="poll-location-hint">
              Learned this somewhere else?{" "}
              <a href="/dashboard?editProfile=true" className="poll-location-hint-link">
                Add other locations to your profile
              </a>
            </p>
          )}
        </div>
      )}

      {error && <p className="poll-error" data-testid="poll-error">{error}</p>}

      {!isLoggedIn ? (
        <p className="poll-login-prompt" data-testid="poll-login-prompt">
          <a href="/login" className="poll-login-link">Log in</a> to record your vote.
        </p>
      ) : (
        <button
          className="poll-submit-button"
          onClick={handleSubmit}
          disabled={submitting}
          data-testid="button-poll-submit"
        >
          {submitting ? "Saving..." : "Submit"}
        </button>
      )}
    </div>
  );
}
