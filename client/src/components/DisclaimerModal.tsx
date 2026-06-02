import { useState } from "react";
import "./DisclaimerModal.css";

const SCRUNGY_IMG = "/scrungy-research.png";

const DISCLAIMERS = [
  "Your results may not fully reflect your lived experiences. Retrocodex features facts reported by social media users predominantly based in the United States. If you weren't actually taught the facts you'll read, that's great!",
  "Many of your results will include urban legends and other cultural misconceptions that were already disproven when you may have been taught them, if at all. They are included because their teaching persisted and may have been believed by some users.",
  "What counts as factually accurate information is always evolving! For example, many featured facts include countries that officially changed their names or dissolved, which means you were taught correctly at the time.",
  
];

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
}

export function DisclaimerModal({ isOpen, onConfirm }: Props) {
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false]);

  if (!isOpen) return null;

  const allChecked = checked.every(Boolean);

  const toggle = (i: number) => {
    setChecked(prev => prev.map((v, idx) => idx === i ? !v : v));
  };

  const ScrungyBlock = ({ extraClass }: { extraClass: string }) => (
    <div className={`disclaimer-scrungy-block ${extraClass}`}>
      <img
        src={SCRUNGY_IMG}
        alt="Scrungy the squirrel doing research at a laptop"
        className="disclaimer-scrungy-img"
      />
      <p className="disclaimer-scrungy-caption">
        Scrungy's doing some research to improve<br />content accuracy and needs your feedback!
      </p>
    </div>
  );

  return (
    <div className="disclaimer-overlay" role="dialog" aria-modal="true" aria-labelledby="disclaimer-title">
      <div className="disclaimer-modal">

        <div className="disclaimer-header">
          <div className="disclaimer-header-left">
            <h2 id="disclaimer-title" className="disclaimer-wait">Wait!</h2>
            <p className="disclaimer-subtitle">
              Before you view your results, here's a few disclaimers Scrungy the squirrel wants you to acknowledge:
            </p>
            <ScrungyBlock extraClass="disclaimer-scrungy-mobile" />
          </div>
          <ScrungyBlock extraClass="disclaimer-scrungy-desktop" />
        </div>

        <div className="disclaimer-checklist">
          {DISCLAIMERS.map((text, i) => (
            <label
              key={i}
              className={`disclaimer-item${checked[i] ? " disclaimer-item-checked" : ""}`}
              data-testid={`disclaimer-item-${i}`}
            >
              <input
                type="checkbox"
                className="disclaimer-checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                data-testid={`disclaimer-checkbox-${i}`}
              />
              <span className="disclaimer-item-text">{text}</span>
            </label>
          ))}
        </div>

        <div className="disclaimer-footer">
          <button
            className={`disclaimer-btn${allChecked ? " disclaimer-btn-active" : ""}`}
            disabled={!allChecked}
            onClick={onConfirm}
            data-testid="button-disclaimer-confirm"
          >
            View results
          </button>
        </div>

      </div>
    </div>
  );
}
