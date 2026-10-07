"use client";

import { useEffect } from "react";
import { company } from "@/data/company";
import { PUBLIC_EMAIL } from "@/data/site";

/*
 * Last-resort error page, used only when the root layout itself fails. It
 * replaces the whole document, so globals.css and the fonts may not be
 * there: everything is styled inline. The hex values mirror the design
 * tokens (navy-900, gold-500, gold-700, sand-50, sand-300, ink-900, ink-500).
 */
const NAVY = "#0b1f33";
const GOLD = "#c9a45c";
const GOLD_700 = "#7d6128";
const SAND = "#faf7f2";
const SAND_300 = "#d9cdb8";
const INK = "#1c1c1c";
const INK_500 = "#666666";

const styles = {
  body: {
    margin: 0,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 20px",
    boxSizing: "border-box",
    background: SAND,
    color: INK,
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    lineHeight: 1.6,
    textAlign: "center",
  },
  main: { maxWidth: 480 },
  eyebrow: {
    margin: 0,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: GOLD_700,
  },
  heading: {
    margin: "12px 0 0",
    fontFamily: "'Cormorant Garamond', Georgia, 'Times New Roman', serif",
    fontSize: 40,
    fontWeight: 600,
    lineHeight: 1.1,
    color: NAVY,
  },
  text: { margin: "16px 0 0", fontSize: 17, color: INK_500 },
  button: {
    marginTop: 28,
    padding: "12px 28px",
    border: 0,
    borderRadius: 999,
    background: GOLD,
    color: NAVY,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  contacts: { margin: "32px 0 0", padding: 0, listStyle: "none", fontSize: 15, color: INK_500 },
  link: {
    display: "inline-block",
    padding: "4px 0",
    color: NAVY,
    fontWeight: 600,
    textDecorationColor: SAND_300,
    textUnderlineOffset: 4,
  },
  digest: { margin: "28px 0 0", fontSize: 12, color: INK_500 },
} satisfies Record<string, React.CSSProperties>;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong · Bellavere</title>
        <meta name="robots" content="noindex" />
      </head>
      <body style={styles.body}>
        <main style={styles.main}>
          <p style={styles.eyebrow}>{company.name}</p>
          <h1 style={styles.heading}>Sorry, something went wrong</h1>
          <p style={styles.text}>
            The site couldn&rsquo;t load just now. Please try again — and if it
            keeps happening, call or write to us: a real person answers
            {company.hours ? `, ${company.hours.toLowerCase()}` : ""}.
          </p>

          <button type="button" onClick={() => reset()} style={styles.button}>
            Try again
          </button>

          <ul style={styles.contacts}>
            {company.contacts.map((person) => (
              <li key={person.name}>
                {person.name.split(" ")[0]}{" "}
                <a href={`tel:${person.phone.replace(/\s/g, "")}`} style={styles.link}>
                  {person.phone}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${PUBLIC_EMAIL}`} style={styles.link}>
                {PUBLIC_EMAIL}
              </a>
            </li>
          </ul>

          {error.digest ? (
            <p style={styles.digest}>Reference: {error.digest}</p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
