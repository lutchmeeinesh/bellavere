import type { Client } from "@/lib/types";

/**
 * Demo owner accounts (password "demo1234", shown on the login page). Only
 * scrypt hashes are stored. These accounts stop working when DEMO_MODE=false.
 * Real owners belong in a database — see README "Swapping the mocks".
 */
export const clients: Client[] = [
  {
    id: "c-sophie",
    name: "Sophie Laurent",
    shortName: "Sophie",
    email: "sophie@demo.bellavere.com",
    passwordHash:
      "scrypt:CKXbYpVuas6Ist06nKPcew==:xxMA1iIliTvF7xQAA8bHFxA4PPXCCHBYIc/FrJ3phoYuunuFxye4x0cbWEAAaXKUNlAGe+/JdA/92bzxBa3zkw==",
    initials: "SL",
    phone: "+33 6 45 12 89 30",
    payoutAccount: "FR76 •••• •••• 4821",
    payoutCurrency: "EUR",
    feeRate: 0.14,
  },
  {
    id: "c-ravi",
    name: "Ravi Naidoo",
    shortName: "Ravi",
    email: "ravi@demo.bellavere.com",
    passwordHash:
      "scrypt:7KP04ZPYiQaYdPNbXCgaMQ==:bGNz525mNVghnmejokeLJ7/5YEw/zOYxwuw32u8eNPvruXgrOEtMQfqr+S+0kIHzuSOV8/8RO/yWLo9KpuLrQw==",
    initials: "RN",
    phone: "+230 5 912 6674",
    payoutAccount: "MU17 •••• •••• 0093",
    payoutCurrency: "MUR",
    feeRate: 0.15,
  },
  {
    id: "c-hamilton",
    name: "Hamilton Estates Ltd",
    shortName: "Hamilton Estates",
    company: "Hamilton Estates Ltd",
    email: "hamilton@demo.bellavere.com",
    passwordHash:
      "scrypt:CXn6nkAw6J4ensEcJbZ6gw==:Ej19wgYGuK2+0pf22pvbnPcMUQWYkopvN/DFFGoylLx539PJmuASp7L9dSv1bXiqFEoHbBDYvuYtzBjWOBE4Cw==",
    initials: "HE",
    phone: "+44 20 7946 0533",
    payoutAccount: "GB29 •••• •••• 7714",
    payoutCurrency: "EUR",
    feeRate: 0.12,
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
