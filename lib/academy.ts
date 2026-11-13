export const ACADEMY = {
  name: "FroshX Academy",
  weeks: 6,
  reminderMinutes: 20,
};

export const FEES = { online: 15000, physical: 25000 } as const;
export type Mode = keyof typeof FEES;
export const MODES: { id: Mode; label: string; note: string }[] = [
  { id: "online", label: "Online training", note: "Learn live from anywhere with a phone or laptop and data." },
  { id: "physical", label: "Physical training", note: "In-person classes in Gombe. Venue is confirmed after registration." },
];

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

export type IconKey = "chart" | "palette" | "code" | "share" | "monitor" | "pen";

export type Course = {
  id: string;
  title: string;
  icon: IconKey;
  blurb: string;
  skills: string[];
  outcome: string;
};

// Edit the skills/outcomes below to match your real syllabus.
export const COURSES: Course[] = [
  {
    id: "data-analysis",
    title: "Data Analysis for Beginners",
    icon: "chart",
    blurb: "Turn raw numbers into decisions people trust.",
    skills: [
      "Clean and organise messy data",
      "Spreadsheets, formulas and pivot tables",
      "Charts and simple dashboards",
      "Explain findings clearly to non-technical people",
    ],
    outcome: "Build a real analysis report you can show employers.",
  },
  {
    id: "graphics-design",
    title: "Graphics Design",
    icon: "palette",
    blurb: "Create visuals that make brands look professional.",
    skills: [
      "Colour, typography and layout principles",
      "Logos, flyers and social media designs",
      "Brand identity basics",
      "Exporting print and web-ready files",
    ],
    outcome: "Finish with a portfolio of designs you made yourself.",
  },
  {
    id: "web-development",
    title: "Web Development",
    icon: "code",
    blurb: "Build and publish real websites from scratch.",
    skills: [
      "HTML and CSS fundamentals",
      "JavaScript basics for interactivity",
      "Responsive layouts for phones and desktops",
      "Putting a website live on the internet",
    ],
    outcome: "Launch your own live website by week six.",
  },
  {
    id: "social-media-management",
    title: "Social Media Management",
    icon: "share",
    blurb: "Grow brands online and get paid to manage pages.",
    skills: [
      "Content planning and calendars",
      "Writing captions that get engagement",
      "Branded post and reel basics",
      "Reading analytics and reporting results",
    ],
    outcome: "Run a content plan for a real or mock brand.",
  },
  {
    id: "computer-appreciation",
    title: "Computer Appreciation",
    icon: "monitor",
    blurb: "Get confident and fast on any computer.",
    skills: [
      "Typing and file management",
      "Word, Excel and PowerPoint essentials",
      "Internet, email and online safety",
      "Everyday digital tools for school and work",
    ],
    outcome: "Use a computer confidently for study, work or business.",
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    icon: "pen",
    blurb: "Design apps and websites people enjoy using.",
    skills: [
      "User research and problem framing",
      "Wireframes and clickable prototypes",
      "Visual design and design systems basics",
      "Presenting a case study",
    ],
    outcome: "Complete a portfolio-ready case study.",
  },
];

export const AGE_RANGES = ["Under 18", "18–24", "25–34", "35–44", "45 and above"];
export const EDUCATION = ["Secondary school", "Diploma / NCE / OND", "Undergraduate", "Graduate (BSc / HND)", "Postgraduate", "Other"];
export const EXPERIENCE = ["Complete beginner", "I know a little", "I have some experience"];
export const DEVICES = ["I have a laptop", "I have a smartphone only", "I will use a computer at the training venue"];
export const SOURCES = ["Instagram", "Facebook", "WhatsApp", "A friend or family", "Google search", "Flyer / poster", "Other"];
export const GENDERS = ["Female", "Male", "Prefer not to say"];

export const getCourse = (id: string) => COURSES.find((c) => c.id === id);
