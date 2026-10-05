import type { Metadata } from "next";
import Image from "next/image";
import { Logo } from "@/components/site/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSiteImages } from "@/lib/i18n/images";
import { isDemoMode } from "@/lib/session";

export const metadata: Metadata = {
  title: "Owner login",
  description:
    "Sign in to the Bellavere owner portal to follow bookings, revenue and the care of your property.",
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  const demoMode = isDemoMode();
  // The portal is English-only.
  const { loginBackdrop } = await getSiteImages("en");

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-navy-900 px-5 py-28 sm:px-8">
      <Image
        src={loginBackdrop.src}
        alt={loginBackdrop.alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="scale-105 object-cover blur-[2px]"
      />
      <div className="absolute inset-0 bg-navy-900/70" aria-hidden />

      <div className="absolute top-6 left-6 z-10 sm:top-8 sm:left-8">
        <Logo dark />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Prerendered: the form reads ?from= in the browser at sign-in. */}
        <LoginForm demoMode={demoMode} />
      </div>
    </div>
  );
}
