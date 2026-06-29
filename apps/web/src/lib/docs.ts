import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import markedShiki from "marked-shiki";
import { codeToHtml } from "shiki";

// Markdown docs under apps/web/content/docs, read at build time and rendered
// statically (see app/docs/[[...slug]]/page.tsx).
const DOCS_DIR = path.join(process.cwd(), "content/docs");

// The pages surfaced in the docs nav; order here drives that nav.
export const DOC_PAGES = [
  { slug: "getting-started", file: "getting-started.md", title: "Getting Started" },
  { slug: "agents/concepts", file: "agents/concepts.md", title: "Agent Concepts" },
] as const;

// Shiki highlights at build time; dual themes drive off the app's OS color
// scheme via the .shiki dark-mode rule in globals.css.
const marked = new Marked().use(
  markedShiki({
    highlight: (code, lang) =>
      codeToHtml(code, {
        lang: lang || "text",
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: "light",
      }),
  }),
);

export async function getDoc(slug: string) {
  const page = DOC_PAGES.find((p) => p.slug === slug) ?? DOC_PAGES[0];
  const raw = fs.readFileSync(path.join(DOCS_DIR, page.file), "utf8");
  const body = raw.replace(/^---\n[\s\S]*?\n---\n/, ""); // drop YAML frontmatter
  return { title: page.title, slug: page.slug, html: await marked.parse(body) };
}
