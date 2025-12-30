import { useEffect, useId } from "react";

interface FAQSchemaProps {
  question: string;
  answer: string;
}

export function FAQSchema({ question, answer }: FAQSchemaProps) {
  const schemaId = useId();
  const dataAttr = `faq-schema-${schemaId.replace(/:/g, '-')}`;

  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": answer
          }
        }
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-schema", dataAttr);
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector(`script[data-schema="${dataAttr}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [question, answer, dataAttr]);

  return null;
}
