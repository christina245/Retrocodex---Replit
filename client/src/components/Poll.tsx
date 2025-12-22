import { useState } from "react";
import { VotingModal } from "./VotingModal";
import "./Poll.css";

interface PollProps {
  question: string;
  options: string[];
}

export function Poll({ question, options }: PollProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showVotingModal, setShowVotingModal] = useState(false);

  const handleSubmit = () => {
    setShowVotingModal(true);
  };

  return (
    <>
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
                  onChange={() => setSelectedOption(option)}
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
                  onChange={() => setSelectedOption(option)}
                  className="poll-radio"
                  data-testid={`radio-option-${index + 4}`}
                />
                <span className="poll-radio-custom"></span>
                <span className="poll-option-text">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <button 
          className="poll-submit-button"
          onClick={handleSubmit}
          data-testid="button-poll-submit"
        >
          Submit
        </button>
      </div>

      <VotingModal 
        isOpen={showVotingModal} 
        onClose={() => setShowVotingModal(false)} 
      />
    </>
  );
}
