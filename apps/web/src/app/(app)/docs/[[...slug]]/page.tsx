import Link from "next/link";
import { DOC_PAGES, getDoc } from "@/lib/docs";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return [{ slug: [] as string[] }, ...DOC_PAGES.map((p) => ({ slug: p.slug.split("/") }))];
}

export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const doc = await getDoc(slug?.join("/") ?? "");

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-6 py-8">
        <nav className="mb-8 flex flex-wrap gap-2">
          {DOC_PAGES.map((p) => (
            <Link
              key={p.slug}
              href={`/docs/${p.slug}`}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                p.slug === doc.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {p.title}
            </Link>
          ))}
          {/* Scalar reference is a standalone full-screen document (own route handler). */}
          <a
            href="/docs/api"
            className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            API Reference
          </a>
        </nav>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: trusted first-party docs rendered at build time */}
        <article className="docs-prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
      </div>
    </div>
  );
}
