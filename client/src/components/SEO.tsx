import { useEffect } from "react";
import { useLocation } from "wouter";

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}

const SITE_NAME = "Retrocodex";
const DEFAULT_IMAGE = "/og-icon.png";
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

export function SEO({ 
  title, 
  description, 
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false
}: SEOProps) {
  const [location] = useLocation();
  
  const fullTitle = title === SITE_NAME 
    ? `${SITE_NAME}: Stuff You Might Have Learned Wrong`
    : `${title} | ${SITE_NAME}`;
  
  const canonicalUrl = `${BASE_URL}${location}`;
  const imageUrl = image.startsWith("http") ? image : `${BASE_URL}${image}`;

  useEffect(() => {
    document.title = fullTitle;

    const updateMetaTag = (selector: string, content: string, attribute = "content") => {
      let element = document.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (element) {
        if (attribute === "href") {
          (element as HTMLLinkElement).href = content;
        } else {
          (element as HTMLMetaElement).content = content;
        }
      } else {
        const tag = selector.includes('link') ? 'link' : 'meta';
        element = document.createElement(tag) as HTMLMetaElement | HTMLLinkElement;
        
        if (selector.includes('property=')) {
          const match = selector.match(/property="([^"]+)"/);
          if (match) (element as HTMLMetaElement).setAttribute("property", match[1]);
        } else if (selector.includes('name=')) {
          const match = selector.match(/name="([^"]+)"/);
          if (match) (element as HTMLMetaElement).name = match[1];
        } else if (selector.includes('rel=')) {
          const match = selector.match(/rel="([^"]+)"/);
          if (match) (element as HTMLLinkElement).rel = match[1];
        }
        
        if (attribute === "href") {
          (element as HTMLLinkElement).href = content;
        } else {
          (element as HTMLMetaElement).content = content;
        }
        document.head.appendChild(element);
      }
    };

    updateMetaTag('meta[name="description"]', description);
    
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    updateMetaTag('meta[property="og:title"]', fullTitle);
    updateMetaTag('meta[property="og:description"]', description);
    updateMetaTag('meta[property="og:image"]', imageUrl);
    updateMetaTag('meta[property="og:url"]', canonicalUrl);
    updateMetaTag('meta[property="og:type"]', type);

    updateMetaTag('meta[name="twitter:title"]', fullTitle);
    updateMetaTag('meta[name="twitter:description"]', description);
    updateMetaTag('meta[name="twitter:image"]', imageUrl);

    if (noIndex) {
      updateMetaTag('meta[name="robots"]', "noindex, nofollow");
    } else {
      const robotsTag = document.querySelector('meta[name="robots"]');
      if (robotsTag) robotsTag.remove();
    }

    return () => {
    };
  }, [fullTitle, description, canonicalUrl, imageUrl, type, noIndex]);

  return null;
}
