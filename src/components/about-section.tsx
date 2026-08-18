import { Panel, PanelLink } from "@/components/panel";
import { StageExit, type Exit } from "@/components/stage-exit";
import { techIcons } from "@/components/icons";
import { site } from "@/lib/site";

/**
 * Where each card goes when this screen is dismissed.
 *
 * Flat on purpose. The bento above it tumbles through depth on two axes; this
 * one is swept off the table sideways, so the two screens do not read as one
 * long effect that happens to repeat.
 */
const exits: Exit[] = [
  { x: -460, y: -110, r: -7, s: 0.92 },
  { x: 430, y: -150, r: 9, s: 0.9 },
  { x: -390, y: 210, r: -10, s: 0.88 },
  { x: 410, y: 230, r: 11, s: 0.88 },
];

export function AboutSection() {
  return (
    <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-3 md:grid-cols-6 md:gap-4">
      <StageExit exit={exits[0]} index={0} className="md:col-span-4">
        <Panel solid label="About">
          <div className="space-y-3.5">
            {site.about.map((paragraph) => (
              <p key={paragraph} className="text-[1rem] leading-[1.7] sm:text-[1.0625rem]">
                {paragraph}
              </p>
            ))}
          </div>
        </Panel>
      </StageExit>

      <StageExit exit={exits[1]} index={1} className="md:col-span-2">
        <Panel solid label="Stack" contentClassName="flex items-center">
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
      </StageExit>

      {site.companies.map((company, index) => (
        <StageExit
          key={company.href}
          exit={exits[index + 2] ?? exits[3]}
          index={index + 2}
          className="md:col-span-3"
        >
          <Panel
            solid
            label="Company"
            action={<PanelLink href={company.href}>Visit</PanelLink>}
          >
            <a
              href={company.href}
              target="_blank"
              rel="noreferrer"
              className="block focus-visible:outline-none"
            >
              <p className="text-[1.125rem] leading-tight tracking-[-0.015em]">{company.name}</p>
              <p className="mt-1.5 text-[0.875rem] leading-[1.55] text-soft">
                {company.description}
              </p>
            </a>
          </Panel>
        </StageExit>
      ))}
    </div>
  );
}
