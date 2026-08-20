"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const GA_ID = "G-5VVFPE7HXX";

export default function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("froshx-cookie-consent");
      if (saved === "accepted") setConsented(true);
    } catch {}

    function handleConsent(e: Event) {
      const detail = (e as CustomEvent).detail;
      setConsented(detail === "accepted");
    }

    window.addEventListener("froshx-consent", handleConsent);
    return () => window.removeEventListener("froshx-consent", handleConsent);
  }, []);

  if (!consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}

