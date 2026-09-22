import { ShieldCheck } from "lucide-react";

/**
 * Shown across the owner dashboard while an admin is viewing it, so it is
 * always obvious whose data is on screen and how to get back.
 */
export function AdminViewBanner({
  adminName,
  clientName,
}: {
  adminName: string;
  clientName: string;
}) {
  return (
    <div className="bg-gold-500 text-navy-900">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-2.5 text-sm sm:px-8">
        <p className="flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0" aria-hidden />
          <span>
            <strong className="font-semibold">Admin view</strong> — {adminName}
            , you are viewing <strong className="font-semibold">{clientName}</strong>
            &rsquo;s owner portal.
          </span>
        </p>
        <form method="post" action="/api/admin/view-as">
          <input type="hidden" name="clientId" value="" />
          <button
            type="submit"
            className="rounded-full bg-navy-900 px-4 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-navy-700"
          >
            Back to admin
          </button>
        </form>
      </div>
    </div>
  );
}
