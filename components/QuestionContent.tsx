import type { Question } from "@/lib/db";
import { getCaseStudy } from "@/content/az104-case-studies";

/** Shared by practice, review and exams so a case never loses its constraints. */
export function CaseStudyContext({ question }: { question: Question }) {
  const study = getCaseStudy(question.caseStudyId);
  if (!study) return null;
  return (
    <details className="case-study-context" open>
      <summary>{study.title} <span>· shared scenario</span></summary>
      <p>{study.scenario}</p>
    </details>
  );
}

/** Render authored code fences/backticks as text, never executable HTML. */
export function QuestionText({ text }: { text: string }) {
  return <span className="question-text">{text.split(/(```[\s\S]*?```|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("```")) {
      const code = part.slice(3, -3).replace(/^(?:bicep|json|powershell|bash|kql)?\r?\n/, "");
      return <code className="question-code-block" key={index}>{code}</code>;
    }
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  })}</span>;
}

export function AnswerSources({ urls }: { urls?: string[] }) {
  if (!urls?.length) return null;
  const safe = urls.filter(url => {
    try { const parsed = new URL(url); return parsed.protocol === "https:" && parsed.hostname === "learn.microsoft.com"; }
    catch { return false; }
  });
  if (!safe.length) return null;
  return <div className="answer-sources" aria-label="Answer sources">
    <span>Microsoft Learn evidence</span>
    <ul>{safe.map(url => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">
      {new URL(url).pathname.split("/").pop()?.replace(/-/g, " ") || "Documentation"}
    </a></li>)}</ul>
  </div>;
}
