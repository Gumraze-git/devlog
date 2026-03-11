import MarkdownRenderer from "../../components/MarkdownRenderer";
import {
  normalizeArrowNotation,
  parseTroubleshootingTabContent,
  TROUBLE_ROWS,
} from "../../lib/markdown";

type ProjectTroubleshootingTabProps = {
  title: string;
  content: string;
  codeHtmlByKey?: Record<string, string>;
};

export default function ProjectTroubleshootingTab({
  title,
  content,
  codeHtmlByKey,
}: ProjectTroubleshootingTabProps) {
  const { introContent, cases } = parseTroubleshootingTabContent(content);

  if (cases.length === 0) {
    return (
      <div className="space-y-5">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
          {title}
        </h2>
        <MarkdownRenderer
          content={content}
          codeHtmlByKey={codeHtmlByKey}
          className="project-md-readable max-w-none mx-0 prose-p:leading-[1.72] prose-li:my-2 prose-li:leading-[1.65]"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="min-w-0 space-y-4">
        <div className="space-y-5">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl border-b border-[var(--border)] pb-4">
            {title}
          </h2>

          {introContent.trim().length > 0 ? (
            <MarkdownRenderer
              content={introContent}
              codeHtmlByKey={codeHtmlByKey}
              className="project-md-readable max-w-none mx-0 prose-p:leading-[1.72] prose-li:my-2 prose-li:leading-[1.65]"
            />
          ) : null}
        </div>

        <div className="space-y-16">
          {cases.map((caseItem, index) => (
            <article
              key={caseItem.id}
              id={`trouble-${index}`}
              className={`scroll-mt-28 ${index > 0 ? "border-t border-[var(--border)] pt-16" : "pt-4"}`}
            >
              <div className="mb-6 space-y-2">
                <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]">
                  Trouble Case {index + 1}
                </p>
                <h3 className="text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-[2rem] leading-snug">
                  {caseItem.title}
                </h3>
              </div>

              <div className="space-y-8 mt-8">
                {TROUBLE_ROWS.map((row) => {
                  const rawValue = caseItem[row.key];
                  if (!rawValue) return null;
                  const value = normalizeArrowNotation(rawValue);

                  let introValue = value;
                  let compareValue = "";
                  
                  // Extract the !compare section if it exists
                  const compareMarker = "> !compare";
                  const cIndex = value.indexOf(compareMarker);
                  if (cIndex !== -1) {
                    introValue = value.substring(0, cIndex).trim();
                    compareValue = value.substring(cIndex + compareMarker.length).trim();
                  } else if (value.includes("!compare")) {
                    const altIndex = value.indexOf("!compare");
                    introValue = value.substring(0, altIndex).trim();
                    compareValue = value.substring(altIndex + "!compare".length).trim();
                  }

                  return (
                    <section
                      key={row.key}
                      className="border-l-4 border-[var(--border)] pl-4 md:pl-6"
                    >
                      <div className="mb-4">
                        <h4 className={`text-[15px] font-bold uppercase tracking-wider trouble-label--${row.key}`}>
                          {row.label}
                        </h4>
                      </div>
                      
                      {introValue && (
                        <MarkdownRenderer
                          content={introValue}
                          codeHtmlByKey={codeHtmlByKey}
                          className="project-md-readable max-w-none mx-0 prose-p:text-[15px] prose-p:leading-[1.8] prose-li:my-2 prose-li:leading-[1.7]"
                        />
                      )}

                      {compareValue && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-6 p-4 md:p-6 rounded-3xl border border-[var(--border)] bg-[var(--card-subtle)]/40 backdrop-blur-sm shadow-sm">
                          {(() => {
                            // Clean up redundant markers like !compare
                            const cleanCompare = compareValue
                              .split("\n")
                              .filter(l => !l.trim().endsWith("!compare"))
                              .map(l => l.startsWith("> ") ? l.substring(2) : l.startsWith(">") ? l.substring(1) : l)
                              .join("\n");
                            
                            // Split into As-Is and To-Be chunks by looking for ```chips
                            const rawChunks = cleanCompare.split(/(?=```chips)/).filter(c => c.trim().length > 0);
                            
                            const asIsContent: string[] = [];
                            const toBeContent: string[] = [];
                            
                            rawChunks.forEach(chunk => {
                              const normalizedChunk = chunk.toLowerCase().replace(/\s+/g, "").replace(/[^a-z-]/g, "");
                              
                              if (normalizedChunk.includes("asis") || normalizedChunk.includes("as-is")) {
                                asIsContent.push(chunk);
                              } else if (normalizedChunk.includes("tobe") || normalizedChunk.includes("to-be")) {
                                toBeContent.push(chunk);
                              } else {
                                // Fallback: append to whoever was last or default to As-Is if first
                                if (asIsContent.length === 0) {
                                  asIsContent.push(chunk);
                                } else if (toBeContent.length > 0 && asIsContent.length === toBeContent.length) {
                                  toBeContent[toBeContent.length - 1] += "\n" + chunk;
                                } else {
                                  asIsContent[asIsContent.length - 1] += "\n" + chunk;
                                }
                              }
                            });

                            return (
                              <>
                                <div className="space-y-6 min-w-0">
                                  {asIsContent.map((content, i) => (
                                    <div key={`asis-${i}`} className="space-y-3">
                                      <MarkdownRenderer content={content} codeHtmlByKey={codeHtmlByKey} />
                                    </div>
                                  ))}
                                </div>
                                <div className="space-y-6 min-w-0">
                                  {toBeContent.map((content, i) => (
                                    <div key={`tobe-${i}`} className="space-y-3">
                                      <MarkdownRenderer content={content} codeHtmlByKey={codeHtmlByKey} />
                                    </div>
                                  ))}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
