import { Panel, PanelLink } from "@/components/panel";
import { techIcons } from "@/components/icons";
import { site } from "@/lib/site";

export function AboutSection() {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-3 md:grid-cols-6 md:gap-4">
      <Panel solid label="About" className="md:col-span-4">
        <div className="space-y-3.5">
          {site.about.map((paragraph) => (
            <p key={paragraph} className="text-[1rem] leading-[1.7] sm:text-[1.0625rem]">
              {paragraph}
            </p>
          ))}
        </div>
      </Panel>

      <Panel solid label="Stack" className="md:col-span-2" contentClassName="flex items-center">
        <ul className="w-full space-y-2.5">
          {site.interests.map((interest) => {
            const Icon = techIcons[interest.label];
            return (
              <li key={interest.label}>
                <a
                  href={interest.href}
                  target="_blank"
                  rel="noreferrer"
                  className="quiet-link inline-flex items-baseline gap-2 text-[0.9375rem]"
                >
                  {Icon ? <Icon /> : null}
                  <span>{interest.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </Panel>

      {site.companies.map((company) => (
        <Panel
          key={company.href}
          solid
          label="Company"
          action={<PanelLink href={company.href}>Visit</PanelLink>}
          className="md:col-span-3"
        >
          <a
            href={company.href}
            target="_blank"
            rel="noreferrer"
            className="block focus-visible:outline-none"
          >
            <p className="text-[1.125rem] leading-tight tracking-[-0.015em]">{company.name}</p>
            <p className="mt-1.5 text-[0.875rem] leading-[1.55] text-soft">{company.description}</p>
          </a>
        </Panel>
      ))}
    </div>
  );
}
