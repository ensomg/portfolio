import { cn } from "@/lib/utils";

type IconProps = { className?: string };

/** Inline glyphs sized to the current text — `1em` keeps them on the baseline. */
const inline = "inline size-[1em] shrink-0 mb-[2px]";

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={cn(inline, className)}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={cn(inline, className)}>
      <path d="M19.913 5.322a1.034 1.034 0 0 1 .837 1.629l-1.042 1.481c-.064 5.086-1.765 8.539-5.056 10.264A10.917 10.917 0 0 1 9.6 19.835a12.233 12.233 0 0 1-6.2-1.524.76.76 0 0 1-.317-.8.768.768 0 0 1 .63-.6 20.6 20.6 0 0 0 3.745-.886C2 13.5 3.19 7.824 3.71 6.081a1.028 1.028 0 0 1 1.729-.422 9.931 9.931 0 0 0 5.995 2.95A4.188 4.188 0 0 1 12.725 5.3a4.125 4.125 0 0 1 5.7.02ZM4.521 17.794c1.862.872 6.226 1.819 9.667.016 2.955-1.549 4.476-4.732 4.521-9.461a.771.771 0 0 1 .142-.436l1.081-1.538-.041-.053c-.518-.007-1.029-.014-1.55 0a.835.835 0 0 1-.547-.221 3.13 3.13 0 0 0-4.383-.072 3.174 3.174 0 0 0-.935 2.87.646.646 0 0 1-.154.545.591.591 0 0 1-.516.205A10.924 10.924 0 0 1 4.722 6.354c-.67 2.078-1.52 7.094 3.869 9.065a.632.632 0 0 1 .416.538.625.625 0 0 1-.3.6 13.178 13.178 0 0 1-4.186 1.237Z" />
    </svg>
  );
}

export function DiscordIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={cn(inline, className)}>
      <path d="M20.32 4.37A17.37 17.37 0 0 0 16.02 3a12.02 12.02 0 0 0-.55 1.12 16.14 16.14 0 0 0-6.94 0A10.5 10.5 0 0 0 7.98 3a17.07 17.07 0 0 0-4.31 1.38C.95 8.53.21 12.57.58 16.55A17.5 17.5 0 0 0 5.85 19.2c.43-.58.81-1.2 1.13-1.86-.62-.24-1.21-.54-1.76-.89.15-.11.3-.22.44-.34a12.23 12.23 0 0 0 10.7 0c.15.12.29.23.44.34-.55.35-1.14.65-1.76.89.32.66.7 1.28 1.13 1.86a17.38 17.38 0 0 0 5.28-2.65c.43-4.62-.74-8.62-3.43-12.18ZM8.68 14.14c-1.05 0-1.92-.97-1.92-2.16s.84-2.16 1.92-2.16c1.09 0 1.94.98 1.92 2.16 0 1.19-.84 2.16-1.92 2.16Zm6.64 0c-1.05 0-1.92-.97-1.92-2.16s.84-2.16 1.92-2.16c1.09 0 1.94.98 1.92 2.16 0 1.19-.84 2.16-1.92 2.16Z" />
    </svg>
  );
}

export function SpotifyIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={cn(inline, className)}>
      <path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0Zm5.505 17.315a.749.749 0 0 1-1.031.247c-2.826-1.726-6.383-2.118-10.57-1.164a.75.75 0 1 1-.333-1.462c4.582-1.045 8.52-.598 11.685 1.337a.75.75 0 0 1 .249 1.042Zm1.472-3.276a.937.937 0 0 1-1.289.309c-3.235-1.989-8.169-2.565-11.995-1.401a.938.938 0 0 1-.546-1.794c4.37-1.327 9.804-.69 13.523 1.598a.938.938 0 0 1 .307 1.288Zm.126-3.412C15.223 8.338 8.808 8.127 4.91 9.31a1.125 1.125 0 1 1-.654-2.153c4.476-1.359 11.577-1.097 16.024 1.542a1.125 1.125 0 1 1-1.177 1.928Z" />
    </svg>
  );
}

export function LocationIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(inline, className)}
    >
      <path d="M12 20.5s6-5.35 6-11a6 6 0 1 0-12 0c0 5.65 6 11 6 11Z" />
      <circle cx="12" cy="9.5" r="2.25" />
    </svg>
  );
}

export function HtmlIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={cn(inline, className)}>
      <path d="M3.2 2.5h17.6l-1.6 18.1L12 22.5l-7.2-1.9L3.2 2.5Zm14.3 5.2H9.1l.2 2.2h8l-.6 6.6-4.7 1.3-4.6-1.3-.3-3.2h2.3l.2 1.4 2.4.7 2.4-.7.2-2.5H7.2L6.5 5.5h11.2Z" />
    </svg>
  );
}

export function PythonIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={cn(inline, className)}>
      <path d="M12.1 2.5c-4.1 0-3.9 1.8-3.9 1.8v1.9h3.9v.6H6.7c-2.3 0-4.2 1.9-4.2 4.2v2.4c0 2.3 1.9 4.2 4.2 4.2h2.1v-2.9c0-2.8 2.4-5.1 5.3-5.1h3.8c2.1 0 3.8-1.7 3.8-3.8V6.3c0-2.2-1.9-3.8-3.8-3.8h-5.8Zm2.2 2.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM11.9 21.5c4.1 0 3.9-1.8 3.9-1.8v-1.9h-3.9v-.6h5.4c2.3 0 4.2-1.9 4.2-4.2v-2.4c0-2.3-1.9-4.2-4.2-4.2h-2.1v2.9c0 2.8-2.4 5.1-5.3 5.1H6.1c-2.1 0-3.8 1.7-3.8 3.8v.5c0 2.2 1.9 3.8 3.8 3.8h5.8Zm-2.2-2.3a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z" />
    </svg>
  );
}

export function NodeIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={cn(inline, className)}>
      <path d="m12 1.9 8.2 4.7v10.8L12 22.1l-8.2-4.7V6.6L12 1.9Zm0 2.2L5.7 7.7v8.6l6.3 3.6 6.3-3.6V7.7L12 4.1Zm0 3.1c2 0 3.5.8 4.4 2.3l-1.6.9c-.5-.9-1.4-1.4-2.7-1.4-1.8 0-3 .9-3.5 2.7-.4 1.7-.1 3 .9 4 .8.8 1.8 1.1 3.1 1.1 1 0 1.9-.2 2.6-.7v-1.9h-2.9v-1.7H17v4.6c-1.3 1-2.8 1.5-4.6 1.5-2 0-3.6-.6-4.8-1.9-1.3-1.3-1.8-3-1.4-5 .7-2.8 2.7-4.6 5.8-4.6Z" />
    </svg>
  );
}

export function RobloxIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" className={cn(inline, className)}>
      <path d="M16.18 20.97 3.03 16.18 7.82 3.03 20.97 7.82ZM13.67 15.59l-5.26-1.92 1.92-5.26 5.26 1.92Z" />
    </svg>
  );
}

export function MinecraftIcon({ className }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={cn(inline, className)}>
      <path d="M12 2.6 21.4 8 12 13.4 2.6 8Z" />
      <path d="M2.6 9.6 11.2 14.6v6.8L2.6 16.4Z" opacity="0.72" />
      <path d="M21.4 9.6 12.8 14.6v6.8l8.6-5Z" opacity="0.45" />
    </svg>
  );
}

export function SteamIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(inline, className)}
    >
      <circle cx="12" cy="12" r="9.2" />
      <circle cx="15.4" cy="9.2" r="3" />
      <circle cx="7.6" cy="15.4" r="2.4" fill="currentColor" stroke="none" />
      <path d="m12.9 10.6-4.1 3.1" />
      <path d="M2.9 13.2 5.6 14.4" />
    </svg>
  );
}

export const techIcons: Record<string, (props: IconProps) => React.JSX.Element> = {
  HTML: HtmlIcon,
  Python: PythonIcon,
  "Node.js": NodeIcon,
};
