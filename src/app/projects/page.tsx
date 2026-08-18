import Link from "next/link";
import type { Metadata } from "next";
import { Panel } from "@/components/panel";
import { getProjects } from "@/lib/repos";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `Projects — ${site.name}`,
  description: `Things ${site.name} is building.`,
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    // One screen, no scrolling: the list is capped so it always fits.
    <main className="flex h-dvh w-full items-center justify-center overflow-hidden px-3 py-6 sm:px-5 sm:py-10">
      <div className="w-full max-w-3xl">
        <Panel
          label="Projects"
          action={
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[0.6875rem] tracking-[0.02em] text-soft transition-colors duration-200 hover:text-[var(--accent)] focus-visible:outline-none active:text-[var(--accent)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-3"
              >
                <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </Link>
          }
        >
          {projects.length === 0 ? (
            <p className="accent-serif text-[0.9375rem] text-soft">Currently nothing.</p>
          ) : (
            <ul className="flex flex-col">
              {projects.map((project) => (
                <li key={project.href}>
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group/project -mx-2 flex items-baseline gap-3 rounded-md px-2 py-2 transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50 active:bg-[color-mix(in_oklab,var(--foreground)_9%,transparent)]"
                  >
                    <span className="shrink-0 text-[0.9375rem] leading-[1.5] transition-colors duration-200 group-hover/project:text-[var(--accent)]">
                      {project.name}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] leading-[1.5] text-soft">
                      {project.description ?? ""}
                    </span>
                    {project.language ? (
                      <span className="shrink-0 text-[0.6875rem] tracking-[0.02em] text-soft">
                        {project.language}
                      </span>
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </main>
  );
}
