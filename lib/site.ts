export const SITE = {
  name: "FroshX",
  fullName: "FroshX Technologies",
  tagline: "Tech Redefined",
  url: "https://froshx.ng",
  description:
    "FroshX Technologies designs and builds websites, platforms and digital products for institutions, unions and businesses across Nigeria — clean engineering, sharp design, delivered on time.",
  email: "froshxtechnologies@gmail.com",
  phone: "+234 701 410 13001", // TODO: replace with your real business line
  phoneDisplay: "+234 701 410 13001",
  whatsapp: "https://wa.me/2347041013001", // TODO: replace with your real WhatsApp number (234XXXXXXXXXX, no + or spaces)
  instagram: "https://instagram.com/froshx.ng",
  facebook: "https://facebook.com/froshx.ng",
  instagramHandle: "@froshx.ng",
  facebookHandle: "Froshx.ng",
  address: "Gombe State, Nigeria",
  startingPrice: "₦50,000", // TODO: set your real starting price
  typicalTimeline: "2–4 weeks",
};

// TODO: replace with a real quote once you've collected one from a client —
// don't publish this placeholder as-is.
export const TESTIMONIALS = [
  {
    quote:
      "",
    name: "",
    role: "Organisation",
  },
];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Our Work" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/contact", label: "Contact" },
];

export type WorkItem = {
  slug: string;
  idx: string;
  title: string;
  meta: string;
  category: string;
  summary: string;
  href: string;
  year?: string;
  featured?: boolean;
};

export const WORK_ITEMS: WorkItem[] = [
  {
    slug: "froshai",
    idx: "01",
    title: "FroshAI",
    meta: "Next.js, Vapi AI",
    category: "AI voice product",
    summary:
      "A voice-driven medical AI assistant built on Next.js with Vapi for real-time conversational interaction — designed to make health guidance feel like a conversation, not a form.",
    href: "https://froshai.vercel.app/",
  },
  {
    slug: "school-management-system",
    idx: "02",
    title: "School Management System",
    meta: "React, Node.js, MongoDB",
    category: "Full-stack web app",
    summary:
      "An operations system for secondary schools — role-based access for admins, teachers and students, attendance tracking, result management and lesson-note uploads.",
    href: "https://froshschoolmanagement.vercel.app/",
  },
  {
    slug: "fixnaija",
    idx: "03",
    title: "FixNaija",
    meta: "React, Node.js, Express, MongoDB",
    category: "Service marketplace",
    summary:
      "A platform connecting verified service providers with people who need them — built around trust, with user verification and a ratings system at its core.",
    href: "https://fixnaija.vercel.app/",
  },
  {
    slug: "gnf",
    idx: "04",
    title: "GNF",
    meta: "React, Node.js",
    category: "E-commerce",
    summary:
      "A clothing brand storefront designed to sell — a clean, product-first browsing experience built for a fashion label's identity.",
    href: "https://gnf-nine.vercel.app/",
  },
  {
    slug: "xox",
    idx: "05",
    title: "XOX",
    meta: "React, Node.js",
    category: "E-commerce",
    summary:
      "A second clothing brand build, taking a different visual direction while keeping the same commerce fundamentals: catalog, detail views, checkout flow.",
    href: "https://xox-sand.vercel.app/",
  },
  {
    slug: "foe-fuk",
    idx: "06",
    title: "Faculty of Education Portal",
    meta: "Federal University of Kashere — via the Faculty of Education Student Union",
    category: "Institutional website",
    summary:
      "A faculty-wide website commissioned through the student union, built to give the Faculty of Education a proper digital front door — news, academic information and a clean structure staff and students actually use.",
    href: "#",
    year: "2025",
    featured: true,
  },
];

export const SERVICES = [
  {
    title: "Web design & development",
    description:
      "Custom, responsive websites built on modern frameworks — fast to load, easy to update, and built to represent your institution or brand properly.",
  },
  {
    title: "Software & platforms",
    description:
      "Purpose-built systems — learning platforms, portals and internal tools — designed around how your team actually works.",
  },
  {
    title: "Mobile app development",
    description:
      "Native-feeling mobile experiences for iOS and Android, built to match the same standard as everything else we ship.",
  },
  {
    title: "UI/UX design",
    description:
      "Interfaces planned around real users first: clear navigation, sensible flows, and screens that hold up on every device.",
  },
  {
    title: "Brand & graphics",
    description:
      "Logos, visual identity and design assets that give a young brand a consistent, professional look across every touchpoint.",
  },
  {
    title: "Social media management",
    description:
      "Consistent, well-designed presence across Instagram and Facebook — content planning, graphics and posting handled for you.",
  },
];
