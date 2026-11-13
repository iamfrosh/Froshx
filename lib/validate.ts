import { COURSES, FEES } from "./academy";

export type RegistrationInput = {
  course: string;
  mode: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  ageRange: string;
  location: string;
  education: string;
  device: string;
  experience: string;
  startAsap: boolean;
  preferredStart: string;
  goal: string;
  source: string;
  consent: boolean;
  website?: string; // honeypot
};

export type Errors = Partial<Record<keyof RegistrationInput, string>>;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function cleanPhone(p: string) {
  return p.replace(/[^\d+]/g, "");
}

export function validateStep(step: 1 | 2 | 3, d: RegistrationInput): Errors {
  const e: Errors = {};
  if (step === 1) {
    if (!COURSES.some((c) => c.id === d.course)) e.course = "Please choose a course.";
    if (!(d.mode in FEES)) e.mode = "Please choose online or physical training.";
  }
  if (step === 2) {
    if (d.fullName.trim().split(/\s+/).filter(Boolean).length < 2) e.fullName = "Enter your first and last name.";
    if (!emailRe.test(d.email.trim())) e.email = "Enter a valid email address.";
    const digits = cleanPhone(d.phone).replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) e.phone = "Enter a valid phone number (WhatsApp preferred).";
    if (!d.ageRange) e.ageRange = "Select your age range.";
    if (d.location.trim().length < 2) e.location = "Tell us where you are (town / state).";
    if (!d.education) e.education = "Select your education level.";
  }
  if (step === 3) {
    if (!d.device) e.device = "Tell us what device you will learn on.";
    if (!d.experience) e.experience = "Select your experience level.";
    if (!d.startAsap && !d.preferredStart) e.preferredStart = "Pick a preferred start date or choose “As soon as possible”.";
    if (!d.consent) e.consent = "Please agree so we can contact you about your registration.";
  }
  return e;
}

export function validateAll(d: RegistrationInput): Errors {
  return { ...validateStep(1, d), ...validateStep(2, d), ...validateStep(3, d) };
}
