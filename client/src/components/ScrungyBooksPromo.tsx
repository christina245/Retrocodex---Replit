import scrungyBubbleImage from "@assets/category_page_blank_1775711054375.png";
import "./ScrungyBooksPromo.css";

export function ScrungyBooksPromo() {
  return (
    <div className="scrungy-books-promo">
      <img
        src={scrungyBubbleImage}
        alt="Scrungy the squirrel with a speech bubble"
        className="scrungy-books-promo-img"
      />
      <div className="scrungy-speech-bubble-text">
        <p>Heads up -- many of these topics were disproven years ago, but are still taught today!</p>
        <p>
          Want to learn why this happens? Check out the{" "}
          <a
            href="/recommended-reading"
            target="_blank"
            rel="noopener noreferrer"
          >
            Recommended Reading
          </a>{" "}
          page to see why outdated information and myths stick around.
        </p>
      </div>
    </div>
  );
}
