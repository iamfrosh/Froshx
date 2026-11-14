import type { Metadata } from "next";
import RegisterExperience from "@/components/academy/RegisterExperience";

export const metadata: Metadata = {
  title: "Register for FroshX Academy",
  description:
    "Register for a 6-week FroshX Academy course: Data Analysis, Graphics Design, Web Development, Social Media Management, Computer Appreciation or UI/UX Design. Online or physical, certificate included.",
  alternates: { canonical: "/register" },
};

export default function RegisterPage() {
  return <RegisterExperience />;
}
