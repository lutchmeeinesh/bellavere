import type { Metadata } from "next";
import { requireClient } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { ProfileSettings } from "@/components/dashboard/settings/ProfileSettings";
import { NotificationSettings } from "@/components/dashboard/settings/NotificationSettings";
import { PayoutSettings } from "@/components/dashboard/settings/PayoutSettings";
import { PasswordSettings } from "@/components/dashboard/settings/PasswordSettings";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const client = await requireClient();

  // Pass only the fields the settings screens need — never the whole client
  // record (it contains the demo password).
  const profile = {
    name: client.name,
    email: client.email,
    phone: client.phone,
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        sub="Your profile, notifications and account preferences"
      />
      <RevealStagger className="max-w-2xl space-y-6">
        <RevealItem>
          <ProfileSettings initial={profile} />
        </RevealItem>
        <RevealItem>
          <NotificationSettings />
        </RevealItem>
        <RevealItem>
          <PayoutSettings payoutAccount={client.payoutAccount} />
        </RevealItem>
        <RevealItem>
          <PasswordSettings />
        </RevealItem>
      </RevealStagger>
    </div>
  );
}
