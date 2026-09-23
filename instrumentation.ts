/**
 * Runs once when a server instance starts. In production it checks the
 * environment (lib/env.ts) and logs any problem to the function logs.
 *
 * It only ever logs: a configuration mistake must not take the public site
 * down, and the code that needs each variable already fails closed (without
 * SESSION_SECRET, for example, sign-in is refused).
 */
export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "production"
  ) {
    try {
      const { checkEnv } = await import("./lib/env");
      const { errors, warnings } = checkEnv();
      for (const error of errors) console.error(`[env] ${error}`);
      for (const warning of warnings) console.warn(`[env] ${warning}`);
    } catch (error) {
      console.error("[env] The environment check could not run:", error);
    }
  }
}
