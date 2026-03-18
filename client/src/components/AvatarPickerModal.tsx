import { useState, useCallback } from "react";
import { X, RefreshCw } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { funEmoji, glass, icons, identicon, shapes } from "@dicebear/collection";
import "./AvatarPickerModal.css";

const STYLES = [
  { key: "fun-emoji", label: "Fun Emoji", style: funEmoji },
  { key: "glass",     label: "Glass",     style: glass },
  { key: "icons",     label: "Icons",     style: icons },
  { key: "identicon", label: "Identicon", style: identicon },
  { key: "shapes",    label: "Shapes",    style: shapes },
] as const;

type StyleKey = (typeof STYLES)[number]["key"];

function randomSeed() {
  return Math.random().toString(36).slice(2, 10);
}

function randomSeeds(count: number): string[] {
  return Array.from({ length: count }, randomSeed);
}

function avatarDataUri(styleObj: typeof funEmoji, seed: string): string {
  return createAvatar(styleObj, { seed }).toDataUri();
}

function getStyleObj(key: StyleKey) {
  return STYLES.find((s) => s.key === key)!.style;
}

const GRID_COUNT = 12;
const STYLE_PREVIEW_SEED = "retrocodex-preview";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onSave: (avatarDataUri: string) => void;
}

export function AvatarPickerModal({ isOpen, onClose, currentAvatar, onSave }: AvatarPickerModalProps) {
  const [selectedStyle, setSelectedStyle] = useState<StyleKey>("fun-emoji");
  const [gridSeeds, setGridSeeds] = useState<string[]>(() => randomSeeds(GRID_COUNT));
  const [selectedSeed, setSelectedSeed] = useState<string>(() => randomSeed());

  const previewUri = avatarDataUri(getStyleObj(selectedStyle), selectedSeed);

  const handleSelectRandom = useCallback(() => {
    const newSeed = randomSeed();
    setSelectedSeed(newSeed);
    setGridSeeds(randomSeeds(GRID_COUNT));
  }, []);

  const handleStyleSelect = useCallback((key: StyleKey) => {
    setSelectedStyle(key);
  }, []);

  const handleGridSelect = useCallback((seed: string) => {
    setSelectedSeed(seed);
  }, []);

  const handleSave = useCallback(() => {
    onSave(previewUri);
    onClose();
  }, [previewUri, onSave, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="avatar-picker-overlay" onClick={handleOverlayClick} data-testid="avatar-picker-overlay">
      <div className="avatar-picker-modal" data-testid="avatar-picker-modal">

        <div className="avatar-picker-header">
          <h2 className="avatar-picker-title" data-testid="text-avatar-picker-title">Select your Avatar</h2>
          <button className="avatar-picker-close" onClick={onClose} data-testid="button-avatar-picker-close" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="avatar-picker-preview-area">
          <img
            src={previewUri}
            alt="Avatar preview"
            className="avatar-picker-large-preview"
            data-testid="img-avatar-large-preview"
          />
          <button
            type="button"
            className="avatar-picker-random-btn"
            onClick={handleSelectRandom}
            data-testid="button-select-random"
          >
            <RefreshCw size={14} />
            Select random
          </button>
        </div>

        <div className="avatar-picker-section">
          <p className="avatar-picker-section-label">STYLE</p>
          <div className="avatar-picker-styles-row" data-testid="avatar-picker-styles">
            {STYLES.map(({ key, label, style }) => (
              <button
                key={key}
                type="button"
                className={`avatar-picker-style-card${selectedStyle === key ? " avatar-picker-style-card--selected" : ""}`}
                onClick={() => handleStyleSelect(key)}
                data-testid={`button-style-${key}`}
              >
                <img
                  src={avatarDataUri(style, STYLE_PREVIEW_SEED)}
                  alt={label}
                  className="avatar-picker-style-thumb"
                />
                <span className="avatar-picker-style-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="avatar-picker-section">
          <p className="avatar-picker-section-label">AVATARS</p>
          <div className="avatar-picker-grid" data-testid="avatar-picker-grid">
            {gridSeeds.map((seed) => (
              <button
                key={seed}
                type="button"
                className={`avatar-picker-grid-cell${selectedSeed === seed ? " avatar-picker-grid-cell--selected" : ""}`}
                onClick={() => handleGridSelect(seed)}
                data-testid={`button-avatar-${seed}`}
              >
                <img
                  src={avatarDataUri(getStyleObj(selectedStyle), seed)}
                  alt="Avatar option"
                  className="avatar-picker-grid-thumb"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="avatar-picker-footer">
          <button
            type="button"
            className="avatar-picker-save-btn"
            onClick={handleSave}
            data-testid="button-use-avatar"
          >
            Use this avatar
          </button>
          <p className="avatar-picker-footer-hint">You can change your avatar later in settings.</p>
        </div>

      </div>
    </div>
  );
}
