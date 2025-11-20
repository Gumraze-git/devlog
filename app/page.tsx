import HomeHero from "./sections/HomeHero";
import AboutSkillSection from "./sections/AboutSkillSection/AboutSkillSection";
import DevlogSection from "./sections/DevlogSection";
import ProjectsSection from "./sections/ProjectsSection";
import EducationSection from "./sections/EducationSection";
import ContactSection from "./sections/ContactSection";
import ProgressNav from "./components/layout/ProgressNav";
import { SectionWatchProvider } from "./components/layout/SectionWatchProvider";
import ScrollIndicator from "./components/ui/ScrollIndicator";

const sections = ["home", "about", "devlog", "projects", "education", "contact"];
const navItems = [
  { id: "home", label: "홈", abbr: "HOME"},
  { id: "about", label: "소개 및 기술 스택", abbr: "ABOUT" },
  { id: "devlog", label: "개발일지", abbr: "DEVLOG" },
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
        <ScrollIndicator />
        <AboutSkillSection />
        <DevlogSection />
        <ProjectsSection />
        <EducationSection />
        <ContactSection />
      </main>
    </SectionWatchProvider>
  );
}
