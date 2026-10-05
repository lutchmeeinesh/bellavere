/**
 * The app has two root documents, each with its own <html>:
 *
 *   app/[locale]/layout.tsx   the public site, in English (/) or French (/fr)
 *   app/(portal)/layout.tsx   the owner portal and admin area, in English
 *
 * This file only passes children through. It exists so that
 * app/not-found.tsx (which renders its own document) can catch URLs that
 * neither root matches, and so app/global-error.tsx has a root to replace.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
