"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";

const NOTIFICATIONS = [
  {
    id: "notif-statement",
    label: "Monthly statement email",
    description: "Your owner statement, delivered when it is published.",
    defaultOn: true,
  },
  {
    id: "notif-bookings",
    label: "New booking alerts",
    description: "An email the moment a new booking is confirmed.",
    defaultOn: true,
  },
  {
    id: "notif-maintenance",
    label: "Maintenance updates",
    description: "Progress notes as tickets move from reported to resolved.",
    defaultOn: true,
  },
  {
    id: "notif-occupancy",
    label: "Occupancy reports",
    description: "A quarterly summary of occupancy across your portfolio.",
    defaultOn: false,
  },
  {
    id: "notif-offers",
    label: "Partner offers",
    description: "Occasional offers from vetted local partners.",
    defaultOn: false,
  },
];

/** Notification preferences. Demo only — state is local and resets on refresh. */
export function NotificationSettings() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultOn]))
  );

  return (
    <Card className="p-6">
      <h2 className="text-xl">Notifications</h2>
      <p className="mt-1 text-sm text-ink-500">
        Choose what lands in your inbox.
      </p>
      <ul className="mt-5 divide-y divide-sand-300/60">
        {NOTIFICATIONS.map((n) => (
          <li
            key={n.id}
            className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-navy-900">{n.label}</p>
              <p className="mt-0.5 text-sm text-ink-500">{n.description}</p>
            </div>
            <Toggle
              id={n.id}
              label={n.label}
              checked={prefs[n.id]}
              onChange={(next) => setPrefs((p) => ({ ...p, [n.id]: next }))}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
