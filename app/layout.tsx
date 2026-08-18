import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieConsent from "@/components/CookieConsent";
import { SITE } from "@/lib/site";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.fullName} — ${SITE.tagline}`,
    template: `%s — ${SITE.fullName}`,
  },
  description: SITE.description,
  keywords: [
    "FroshX",
    "FroshX Technologies",
    "web design Nigeria",
    "web development Gombe",
    "software company Nigeria",
    "UI/UX design Nigeria",
    "university website developer",
  ],
  authors: [{ name: SITE.fullName }],
  creator: SITE.fullName,
  applicationName: SITE.fullName,
  robots: { index: true, follow: true },
    verification: {
    google: "dcFf5hKKHJhYHanLjnO_ooOtKQgpkkqkFDRAVm7GvkU",
  },

  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.fullName,
    title: `${SITE.fullName} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: "/images/froshx-logo.png", width: 1200, height: 630, alt: SITE.fullName }],
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.fullName} — ${SITE.tagline}`,
    description: SITE.description,
    images: ["/images/froshx-logo.png"],
  },
  icons: {
    icon: "/images/froshx-logo.png",
    apple: "/images/froshx-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#15130F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.fullName,
    alternateName: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/images/froshx-logo.png`,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone,
    sameAs: [SITE.instagram, SITE.facebook],
    address: {
      "@type": "PostalAddress",
      addressRegion: "Gombe State",
      addressCountry: "NG",
    },
  };

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body bg-white text-ink antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
