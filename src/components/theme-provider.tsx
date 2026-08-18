"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { defaultTheme, themeIds } from "@/lib/themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      themes={themeIds}
      defaultTheme={defaultTheme}
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
