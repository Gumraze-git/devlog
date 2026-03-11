import MarkdownRenderer from "../../components/MarkdownRenderer";
import type { ProjectContentSection } from "../../lib/markdown";
import ProjectSectionTabs from "./ProjectSectionTabs";

type ProjectDetailBodyProps = {
  sections: ProjectContentSection[];
  codeHtmlByKey?: Record<string, string>;
  content: string;
};

export default function ProjectDetailBody({
  sections,
  codeHtmlByKey,
  content,
}: ProjectDetailBodyProps) {
  const hasTabbedSections = sections.length >= 2;

  return (
    <section className="w-full space-y-8">
      {hasTabbedSections ? (
        <ProjectSectionTabs sections={sections} codeHtmlByKey={codeHtmlByKey} />
      ) : (
        <div className="mx-auto w-full max-w-6xl">
          <MarkdownRenderer
            content={content}
            codeHtmlByKey={codeHtmlByKey}
            className="project-md-readable max-w-4xl prose-p:leading-[1.72] prose-li:my-2 prose-li:leading-[1.65]"
          />
        </div>
      )}
    </section>
  );
}
