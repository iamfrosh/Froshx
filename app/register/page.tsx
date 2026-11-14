import type { Metadata } from "next";
import RegisterExperience from "@/components/academy/RegisterExperience";

export const metadata: Metadata = {
  title: "Register for FroshX Academy",
  description:
    "Register for a 6-week beginner course at FroshX Academy: Web Development, App Development, Programming, Data Analysis, UI/UX, Graphics Design, Social Media Management or Computer Appreciation. Certificate included.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return <RegisterExperience />;
}
