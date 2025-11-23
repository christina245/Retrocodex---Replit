import { useParams } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import CategoryChips from "@/components/CategoryChips";
import ExtendedFactCard from "@/components/ExtendedFactCard";
import TimelineSection from "@/components/TimelineSection";
import "./SingleFactPage.css";

export default function SingleFactPage() {
  const { id } = useParams();

  const factData = {
    id: "brain-10-percent",
    myth: '"You only use 10% of your brain."',
    truth: "You use nearly all of your brain at any given time.",
    category: ["Life Sciences", "Social Sciences"],
    details: "Brain imaging research shows that nearly all regions of the brain are active at different times, even during simple tasks and while sleeping. The myth that we only use 10% has been debunked through neuroscience research and has been popularized by movies and self-help claims.",
    moreDetails: "As Adam Grant, author of 'Evolution of the Human Brain and the Myth of the Unexploited 90%' (PLoS Biol, 2004, Vol. 2(3):E11), suggests in his article:",
    sources: [
      {
        type: "editorial",
        name: "McGovern Institute",
        logo: "mcgovern svg",
        url: "https://mcgovern.mit.edu"
      },
      {
        type: "editorial",
        name: "Association for Psychological Science",
        logo: "Association_for_Psychological_Science_Logo_-_PNG 1",
        url: "https://www.psychologicalscience.org"
      },
      {
        type: "academic",
        name: 'How to Win Friends and Influence People" from 1936, released in 1937 by Dale Carnegie',
        url: "#"
      }
    ],
    timeline: [
      {
        year: "1907",
        text: "Psychologist William James suggested that people only utilize a fraction of their mental capacity. However, James referred to potential capacity rather than literal brain usage, a nuance lost in terms of habit, motivation, and conscious utilization of existing faculties, rather than a literal 90% of the brain sitting empty."
      },
      {
        year: "1936",
        text: "The myth becomes commercially popularized through its adoption and promotion by self-help authors and motivational speakers. Lowell Thomas, who wrote the forward for 'Professor William James of Harvard used to say that 'the average man develops only ten per cent of his latent mental ability.'"
      }
    ],
    photos: [
      { 
        src: "how to win friends 1936 version 1",
        hasTransparentBg: false
      },
      { 
        src: "limitless cover",
        hasTransparentBg: false
      },
      { 
        src: "Lucy - Quad Movie Poster (Crop)",
        hasTransparentBg: true
      }
    ],
    addedDate: "Nov. 23, 2025",
    updatedDate: null
  };

  return (
    <div className="single-fact-page">
      <Header variant="simplified" />
      
      <div className="page-content">
        <div className="category-row">
          <CategoryChips categories={factData.category} />
          <div className="date-label">
            {factData.updatedDate 
              ? `Last updated ${factData.updatedDate}` 
              : `Added on ${factData.addedDate}`
            }
          </div>
        </div>

        <div className="content-grid">
          <div className="left-column">
            <ExtendedFactCard fact={factData} />
          </div>

          <div className="right-column">
            <TimelineSection 
              timeline={factData.timeline} 
              photos={factData.photos}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
