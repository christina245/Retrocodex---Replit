import { useParams } from "wouter";
import { SingleFactHeader } from "@/components/SingleFactHeader";
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
    details: "Brain imaging shows that nearly all regions are active at different times, even during simple tasks and while sleeping. The myth likely came from misinterpretations of neuroscience research and has been popularized by movies and self-help claims.",
    moreDetails: "People often lose noticeable abilities with damage to just small portions of the brain, which is inconsistent with it being 90% unused. It is possible that this myth may be a misinterpretation of the fact that some parts of the brain may be less active than others.",
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
        name: 'S. Anum et al., “Evolution of the Human Brain and the Myth of its Ten-Percent Use,” None, Sep. 2024, doi: 10.30884/seh/2024.02.02.',
        url: "https://www.sociostudies.org/upload/socionauki.ru/journal/seh/2024_2/002_Anum.pdf"
      }
    ],
    timeline: [
      {
        year: "1907",
        text: "Psychologist William James suggested that people utilize only a fraction of their mental capacity. However, James referred to psychological capability and mental potential in terms of habit, motivation, and conscious utilization of existing faculties, rather than a literal percentage of brain tissue humans employ."
      },
      {
        year: "1936",
        text: 'The myth becomes commercially popularized through its adoption and promotion by self-help authors and motivational speakers throughout the twentieth century. The self-help book How to Win Friends and Influence People by Dale Carnegie is released in 1936 with a foreword by broadcaster Lowell Thomas, who wrote "Professor William James of Harvard used to say that the average man develops only ten per cent of his latent mental ability."'
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
      <SingleFactHeader />
      
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
