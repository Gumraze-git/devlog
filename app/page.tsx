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
  { id: "home", label: "홈", abbr: "Home"},
  { id: "about", label: "소개", abbr: "ABOUT" },
  { id: "devlog", label: "개발일지", abbr: "DEVLOG" },
  { id: "skill", label: "기술", abbr: "SKILL" },
  { id: "projects", label: "프로젝트", abbr: "PROJECTS" },
  { id: "education", label: "교육", abbr: "EDUCATION" },
  { id: "contact", label: "연락", abbr: "CONTACT" },
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
