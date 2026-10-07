import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { company } from "@/data/company";
import { routing } from "@/i18n/routing";

/**
 * The social-preview image in each language: /opengraph-image (English) and
 * /fr/opengraph-image, prerendered at build time. Public pages point
 * og:image at it with a translated alt text (localizedMetadata() in
 * lib/i18n/metadata.ts), so there is no static `alt` export here (it could
 * only be in one language).
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Both images are generated at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/*
 * Hex literals are used here ONLY because ImageResponse (Satori) renders
 * outside the browser and cannot read the CSS variables in globals.css.
 * They mirror the design tokens: navy-900 #0B1F33, gold-500 #C9A45C,
 * sand-50 #FAF7F2. No remote fonts are fetched, so the build works offline;
 * the default bundled sans-serif is used.
 */
const NAVY = "#0B1F33";
const GOLD = "#C9A45C";
const SAND = "#FAF7F2";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    namespace: "common",
  });
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: NAVY,
          color: SAND,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 16,
            background: GOLD,
          }}
        />
        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {company.name}
        </div>
        <div
          style={{ display: "flex", width: 120, height: 4, background: GOLD, marginTop: 40 }}
        />
        <div style={{ display: "flex", fontSize: 44, marginTop: 40, color: SAND }}>
          {t("company.tagline")}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            marginTop: 20,
            color: GOLD,
            letterSpacing: "0.04em",
          }}
        >
          {t("og.line")}
        </div>
      </div>
    ),
    size
  );
}
