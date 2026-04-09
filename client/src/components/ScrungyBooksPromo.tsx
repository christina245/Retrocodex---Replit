import scrungyBubbleImage from "@assets/category_page_wider_1775715349886.png";
import "./ScrungyBooksPromo.css";

export function ScrungyBooksPromo({ className }: { className?: string }) {
  return (
    <div className={`scrungy-books-promo${className ? ` ${className}` : ""}`}>
      <img
        src={scrungyBubbleImage}
        alt="Scrungy the squirrel with a speech bubble"
        className="scrungy-books-promo-img"
      />
      <div className="scrungy-speech-bubble-text">
        <p>Heads up -- many of these topics were disproven years ago, but are still taught today!</p>
        <p>
          Check out the{" "}
          <a
            href="/recommended-reading"
            target="_blank"
            rel="noopener noreferrer"
          >
            Recommended Reading
          </a>{" "}
          page to see why!
        </p>
      </div>
    </div>
  );
}
