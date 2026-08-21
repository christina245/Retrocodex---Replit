import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function InFeedAd({ adSlot, layoutKey }: { adSlot: string; layoutKey: string }) {
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
      style={{ display: "block" }}
      data-ad-format="fluid"
      data-ad-layout-key={layoutKey}
      data-ad-client="ca-pub-2301734370307739"
      data-ad-slot={adSlot}
      data-adtest={import.meta.env.DEV ? "on" : undefined}
    />
  );
}
