import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function DisplayAd({ adSlot }: { adSlot: string }) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    pushedRef.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense push failed", error);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%" }}
      data-ad-client="ca-pub-2301734370307739"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-adtest={import.meta.env.DEV ? "on" : undefined}
    />
  );
}
