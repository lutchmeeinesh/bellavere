/**
 * Route-change transition: content fades in and rises 12px over 0.45s.
 * Used by `template.tsx` files, which remount on every navigation, so it
 * replays on each route change. It is a CSS animation (globals.css), so it
 * starts with the first paint instead of waiting for JavaScript, and it is
 * switched off for visitors who prefer reduced motion.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-enter">{children}</div>;
}
