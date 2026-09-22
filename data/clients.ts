import type { Client } from "@/lib/types";

/**
 * Demo owner accounts. Mock auth only — passwords are plain text on purpose;
 * see README for how to swap in a real auth provider.
 */
export const clients: Client[] = [
  {
    id: "c-sophie",
    name: "Sophie Laurent",
    shortName: "Sophie",
    email: "sophie@demo.bellavere.com",
    password: "demo1234",
    initials: "SL",
    phone: "+33 6 45 12 89 30",
    payoutAccount: "FR76 •••• •••• 4821",
    payoutCurrency: "EUR",
  },
  {
    id: "c-ravi",
    name: "Ravi Naidoo",
    shortName: "Ravi",
    email: "ravi@demo.bellavere.com",
    password: "demo1234",
    initials: "RN",
    phone: "+230 5 912 6674",
    payoutAccount: "MU17 •••• •••• 0093",
    payoutCurrency: "MUR",
  },
  {
    id: "c-hamilton",
    name: "Hamilton Estates Ltd",
    shortName: "Hamilton Estates",
    company: "Hamilton Estates Ltd",
    email: "hamilton@demo.bellavere.com",
    password: "demo1234",
    initials: "HE",
    phone: "+44 20 7946 0533",
    payoutAccount: "GB29 •••• •••• 7714",
    payoutCurrency: "EUR",
  },
];

export function getClientById(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}

export function getClientByEmail(email: string): Client | undefined {
  return clients.find(
    (c) => c.email.toLowerCase() === email.trim().toLowerCase()
  );
}
