import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * App-wide theme provider.
 *
 * The shadcn theme in `src/index.css` is class based
 * (`@custom-variant dark (&:is(.dark *))`), so the `class` attribute is used
 * on <html> and the system preference is followed until the user picks a
 * theme.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
