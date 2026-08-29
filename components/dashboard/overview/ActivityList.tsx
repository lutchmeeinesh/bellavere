import { ActivityIcon } from "@/components/dashboard/ActivityIcon";
import type { ActivityItem } from "@/lib/types";
import { formatDateShort } from "@/lib/format";

/** "Recent activity" feed card on the overview. */
export function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <div>
      <h3 className="text-lg">Recent activity</h3>
      <p className="mt-0.5 text-xs text-ink-500">
        Across your whole portfolio
      </p>

      {items.length === 0 ? (
        <p className="mt-6 rounded-xl bg-sand-50 px-4 py-6 text-center text-sm text-ink-500">
          Nothing to report yet
        </p>
      ) : (
        <ul className="mt-4 space-y-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-2">
              <ActivityIcon type={item.type} />
              <div className="min-w-0">
                <p className="text-sm text-ink-900">{item.message}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {formatDateShort(item.date)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
