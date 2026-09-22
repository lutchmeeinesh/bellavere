import { Card } from "@/components/ui/Card";

/** Notifications notice. The portal does not send emails yet. */
export function NotificationSettings() {
  return (
    <Card className="p-6">
      <h2 className="text-xl">Notifications</h2>
      <p className="mt-1 text-sm text-ink-500">
        Email notifications are not available yet — your statements, bookings
        and maintenance updates are always on your dashboard.
      </p>
    </Card>
  );
}
