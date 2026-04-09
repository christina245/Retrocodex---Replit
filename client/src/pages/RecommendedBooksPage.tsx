import { useState } from "react";
import { Header } from "@/components/Header";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { HomepageCategoryNav } from "@/components/HomepageCategoryNav";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

import liesCover from "@assets/lies_my_teacher_told_me_1775699033524.jpeg";
import legendsCover from "@assets/legends,_lies_1775699143129.jpg";
import generalIgnoranceCover from "@assets/the_book_of_general_ignorance_1775699653542.jpg";
import fiftyMythsCover from "@assets/50_great_myths_1775699653541.jpeg";
import misconceptionsCover from "@assets/misconceptions_guide_1775699653541.jpeg";
import badAstronomyCover from "@assets/bad_astronomy_1775699653540.jpeg";
import dontSwallowCover from "@assets/don't_swallow_your_gum_1775699653539.jpeg";
import scrungyImg from "@assets/scrungy/recommended reading.png";

import "./RecommendedBooksPage.css";

interface Book {
  title: string;
  fullTitle?: string;
  author: string;
  year: number;
  summary: string;
  amazonLink: string;
  cover: string | null;
}

interface Section {
  id: string;
  heading: string;
  description: string;
  books: Book[];
}

const sections: Section[] = [
  {
    id: "myths-we-were-taught",
    heading: "Myths & Misconceptions We Were Taught",
    description:
      'History textbooks, teachers, and popular culture have handed down plenty of \u201cfacts\u201d that turn out to be legend, half-truth, or outright invention. These books set the record straight.',
    books: [
      {
        title: "Lies My Teacher Told Me",
        fullTitle: "Lies My Teacher Told Me: Everything Your American History Textbook Got Wrong",
        author: "James W. Loewen",
        year: 2018,
        summary:
          "Loewen combs through a dozen leading U.S. history textbooks to expose the myths, omissions, and distortions that generations of Americans learned in school—from Columbus to the civil rights movement.",
        amazonLink: "https://amzn.to/4t3O3uC",
        cover: liesCover,
      },
      {
        title: "Legends, Lies & Cherished Myths of World History",
        author: "Richard Shenkman",
        year: 1993,
        summary:
          "Explodes enduring myths from ancient Rome to WWII—from the real height of Napoleon to what the Iron Maiden actually was. A witty, well-researched guide to history's most stubborn falsehoods.",
        amazonLink: "https://amzn.to/4tBw3HO",
        cover: legendsCover,
      },
      {
        title: "The Book of General Ignorance",
        author: "John Lloyd & John Mitchinson",
        year: 2007,
        summary:
          "From the QI team: a delightful compendium of things everyone thinks they know but don't—from who really invented the telephone to how many legs a centipede actually has.",
        amazonLink: "https://amzn.to/41iQz3U",
        cover: generalIgnoranceCover,
      },
      {
        title: "50 Great Myths of Popular Psychology",
        author: "Scott O. Lilienfeld et al.",
        year: 2010,
        summary:
          "Four psychology professors dismantle 50 widespread misconceptions about human behavior—from \"we only use 10% of our brains\" to \"opposites attract\"—with clear, accessible science.",
        amazonLink: "https://amzn.to/3Q9Kvbu",
        cover: fiftyMythsCover,
      },
      {
        title: "Misconceptions: A Guide to the World's Most Popular Myths",
        author: "Tim Rayborn",
        year: 2021,
        summary:
          "A wide-ranging tour of popular false facts about history, science, and culture. Rayborn traces where each myth originated, why it stuck, and what the evidence actually shows.",
        amazonLink: "https://amzn.to/4dxP0GF",
        cover: misconceptionsCover,
      },
      {
        title: "Bad Astronomy: Misconceptions and Misuses Revealed",
        author: "Philip Plait",
        year: 2002,
        summary:
          "Astronomer Philip Plait dismantles popular astronomy misconceptions—from astrology to moon landing conspiracy theories—with humor, solid science, and genuine enthusiasm.",
        amazonLink: "https://amzn.to/3PXHbAd",
        cover: badAstronomyCover,
      },
      {
        title: "Don't Swallow Your Gum!",
        author: "Aaron Carroll & Rachel Vreeman",
        year: 2009,
        summary:
          "Two doctors investigate medical folklore and old wives' tales, revealing which health \"facts\" are fiction and what peer-reviewed science actually shows about everyday health myths.",
        amazonLink: "https://amzn.to/4vqGxvt",
        cover: dontSwallowCover,
      },
    ],
  },
  {
    id: "why-misinformation-persists",
    heading: "Why Misinformation Persists",
    description:
      "Even when hard evidence debunks a belief, many people hold on to it anyway. These books explore the psychology, sociology, and neuroscience behind why false beliefs spread—and why they're so hard to dislodge.",
    books: [
      {
        title: "The Misinformation Age",
        fullTitle: "The Misinformation Age: How False Beliefs Spread",
        author: "Cailin O'Connor & James Weatherall",
        year: 2019,
        summary:
          "Two philosophers of science argue that social networks—not individual irrationality—drive false beliefs, using game theory and social epistemology to reveal why truth so often loses.",
        amazonLink: "https://amzn.to/4dB9JcH",
        cover: null,
      },
      {
        title: "Foolproof",
        fullTitle: "Foolproof: Why Misinformation Infects Our Minds and How to Build Immunity",
        author: "Sander van der Linden",
        year: 2023,
        summary:
          "A leading misinformation researcher explains why fake news spreads and introduces \"prebunking\"—a psychological inoculation strategy that builds resistance to disinformation before it takes hold.",
        amazonLink: "https://amzn.to/3NT16Ql",
        cover: null,
      },
      {
        title: "Why People Believe Weird Things",
        author: "Michael Shermer",
        year: 2002,
        summary:
          "Science historian Shermer explores the psychology behind pseudoscience, superstition, and conspiracy theories—from creationism to Holocaust denial—and what it might take to change minds.",
        amazonLink: "https://amzn.to/41WKev6",
        cover: null,
      },
      {
        title: "Factfulness",
        fullTitle: "Factfulness: Ten Reasons We're Wrong About the World",
        author: "Hans Rosling",
        year: 2018,
        summary:
          "The late Swedish physician reveals that most people—including experts—hold profoundly wrong ideas about global trends, and explains how media and cognitive instincts distort our worldview.",
        amazonLink: "https://amzn.to/3QsEd6R",
        cover: null,
      },
      {
        title: "You Are Not So Smart",
        author: "David McRaney",
        year: 2011,
        summary:
          "A journalist catalogs the cognitive biases and self-delusions that lead smart people into irrational thinking—entertaining, accessible, and uncomfortably accurate.",
        amazonLink: "https://amzn.to/3NVpyR3",
        cover: null,
      },
    ],
  },
  {
    id: "critical-thinking",
    heading: "The Critical Thinking Toolkit",
    description:
      "Knowing that misinformation exists is just the start. These books give you practical tools to evaluate claims, spot logical fallacies, and—perhaps hardest of all—change your own mind when the evidence demands it.",
    books: [
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        year: 2011,
        summary:
          "Nobel laureate Kahneman explains the two systems driving our thinking—one fast and intuitive, one slow and deliberate—revealing why we're prone to systematic, predictable mental errors.",
        amazonLink: "https://amzn.to/4cgPZsu",
        cover: null,
      },
      {
        title: "Think Again",
        fullTitle: "Think Again: The Power of Knowing What You Don't Know",
        author: "Adam Grant",
        year: 2021,
        summary:
          "Organizational psychologist Adam Grant argues that the ability to rethink and unlearn is one of our most valuable skills—and explains how to cultivate the intellectual humility it requires.",
        amazonLink: "https://amzn.to/4veX31v",
        cover: null,
      },
      {
        title: "The Skeptic's Guide to the Universe",
        author: "Steven Novella",
        year: 2018,
        summary:
          "Neurologist and Science-Based Medicine host Steven Novella delivers a comprehensive guide to practical skepticism: cognitive biases, logical fallacies, and evaluating scientific claims.",
        amazonLink: "https://amzn.to/41mKDqG",
        cover: null,
      },
      {
        title: "Being Wrong",
        fullTitle: "Being Wrong: Adventures in the Margin of Error",
        author: "Kathryn Schulz",
        year: 2010,
        summary:
          "A journalist explores the rich, underexamined experience of being wrong—what it feels like, why it happens, and why our instinct to believe we're right is often our biggest blind spot.",
        amazonLink: "https://amzn.to/4mfYLLM",
        cover: null,
      },
    ],
  },
  {
    id: "junk-science",
    heading: "Junk Science & Research Under the Microscope",
    description:
      'Not all misinformation comes from bad actors\u2014sometimes it comes from flawed studies, bad statistics, and a broken publish-or-perish culture. These books pull back the curtain on how \u201cscientific\u201d claims can mislead us.',
    books: [
      {
        title: "Bad Science",
        fullTitle: "Bad Science: Quacks, Hacks, and Big Pharma Flacks",
        author: "Ben Goldacre",
        year: 2008,
        summary:
          "A British physician skewers misleading media health reporting, dubious supplement claims, and pseudoscientific fads, arming readers with the tools to recognize flawed evidence.",
        amazonLink: "https://amzn.to/4smnFLe",
        cover: null,
      },
      {
        title: "Science Fictions",
        fullTitle: "Science Fictions: How Fraud, Bias, Negligence, and Hype Undermine the Search for Truth",
        author: "Stuart Ritchie",
        year: 2020,
        summary:
          "A psychologist exposes the replication crisis rocking modern science, examining how publication bias and perverse incentives corrupt the research we rely on to understand the world.",
        amazonLink: "https://amzn.to/4smnGPi",
        cover: null,
      },
      {
        title: "The Body: A Guide for Occupants",
        author: "Bill Bryson",
        year: 2019,
        summary:
          "Bryson's entertaining tour of the human body debunks decades of medical mythology while celebrating the astonishing complexity modern science has uncovered—warm, funny, and full of surprises.",
        amazonLink: "https://amzn.to/3Or8676",
        cover: null,
      },
    ],
  },
];

function BookCard({ book }: { book: Book }) {
  return (
    <div className="books-card" data-testid={`card-book-${book.title.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="books-cover-wrap">
        {book.cover ? (
          <img
            src={book.cover}
            alt={`${book.title} cover`}
            className="books-cover-img"
          />
        ) : (
          <div className="books-cover-placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="books-card-info">
        <a
          href={book.amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          className="books-card-title"
          title={book.fullTitle ?? book.title}
          data-testid={`link-book-${book.title.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {book.fullTitle ?? book.title}
        </a>
        <p className="books-card-author">{book.author}</p>
        <p className="books-card-year">{book.year}</p>
        <p className="books-card-summary">{book.summary}</p>
      </div>
    </div>
  );
}

export default function RecommendedBooksPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="books-page">
      <SEO
        title="Recommended Reading | Retrocodex"
        description="Books for curious minds who like questioning what they were told. From debunked history to the psychology of misinformation, these are the reads we think belong on every skeptic's shelf."
      />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <HomepageCategoryNav sticky />

      <main className="books-main">
        <div className="books-intro-wrap">
          <div className="books-intro-text">
            <h1 className="books-h1" data-testid="text-books-heading">Recommended reading</h1>
            <p className="books-subtitle">
              Looking to learn more about common misconceptions and myths? Here&rsquo;s some
              books for curious minds who like questioning what they were told. From debunked
              history to the psychology of misinformation, these reads will help you better
              recognize fact from fiction whether you learned it from school, the media, or
              even right here on this site.
            </p>
            <p className="books-subtitle books-subtitle-note">
              &#9888;&#65039; Note: because information often evolves, it&rsquo;s possible some
              content in the books below were disproven after publication and thus is outdated.
            </p>
          </div>
          <div className="books-intro-squirrel" aria-hidden="true">
            <img src={scrungyImg} alt="" className="books-squirrel-img" />
          </div>
        </div>

        <div className="books-sections">
          {sections.map((section) => (
            <section key={section.id} className="books-section" id={section.id}>
              <h2 className="books-section-heading" data-testid={`text-section-${section.id}`}>
                {section.heading}
              </h2>
              <p className="books-section-desc">{section.description}</p>
              <hr className="books-hr" />
              <div className="books-grid">
                {section.books.map((book) => (
                  <BookCard key={book.title} book={book} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="books-footer-note">
          Have a recommendation that belongs here?{" "}
          <a href="/contact" className="books-footer-link">
            Let us know
          </a>
          .
        </p>
      </main>

      <Footer />
    </div>
  );
}
