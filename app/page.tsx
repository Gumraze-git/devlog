import HomeHero from "./sections/HomeHero";
import AboutSection from "./sections/AboutSection";
import DevlogSection from "./sections/DevlogSection";
import SkillSection from "./sections/SkillSection";
import ProjectsSection from "./sections/ProjectsSection";
import EducationSection from "./sections/EducationSection";
import ContactSection from "./sections/ContactSection";
import ProgressNav from "./components/layout/ProgressNav";
import { SectionWatchProvider } from "./components/layout/SectionWatchProvider";

const sections = ["home", "about", "devlog", "skill", "projects", "education", "contact"];
const navItems = [
  { id: "about", label: "About" },
  { id: "devlog", label: "Devlog" },
  { id: "skill", label: "Skill" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

export default function Home() {
  return (
    <SectionWatchProvider sections={sections}>
      <main className="mx-auto flex max-w-6xl flex-col gap-24 px-4 py-16">
        <HomeHero />
        <ProgressNav items={navItems} />
        <AboutSection />
        <DevlogSection />
        <SkillSection />
        <ProjectsSection />
        <EducationSection />
        <ContactSection />
      </main>
    </SectionWatchProvider>
  );
}
