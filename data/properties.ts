import type { Property } from "@/lib/types";
import { unsplash } from "@/lib/img";

/**
 * Demo portfolio. Nine properties belong to the three demo owner accounts;
 * three more (clientId: null) exist only to fill the public portfolio grid.
 * All listings are fictional — the public site carries a
 * "Demo listings for illustration" disclaimer.
 */
export const properties: Property[] = [
  {
    id: "p-01",
    slug: "villa-azure",
    name: "Villa Azure",
    type: "villa",
    location: "Grand Baie, north coast",
    bedrooms: 4,
    bathrooms: 4,
    sleeps: 8,
    nightlyRate: 480,
    clientId: "c-sophie",
    managedSince: 2019,
    featured: true,
    headline: "A white-washed contemporary villa two minutes from La Cuvette beach.",
    description:
      "Villa Azure is the house guests extend their stay for: four en-suite bedrooms around a 12-metre infinity pool, a shaded dining terrace under the filaos, and evening light that turns the whole garden gold. Grand Baie's restaurants and the calm waters of La Cuvette are both within a short stroll.",
    amenities: [
      "Private infinity pool",
      "Sea view",
      "Daily housekeeping",
      "Air conditioning throughout",
      "Fibre Wi-Fi",
      "Chef's kitchen",
      "Outdoor dining pavilion",
      "Secure parking",
      "Beach 200 m",
    ],
    images: [
      {
        src: unsplash("1580587771525-78b9dba3b914"),
        alt: "White contemporary villa with a turquoise pool in the foreground",
      },
      {
        src: unsplash("1600585154526-990dced4db0d"),
        alt: "Villa facade in dark cladding and warm timber, lit at dusk",
      },
      {
        src: unsplash("1512918728675-ed5a9ecdebfd"),
        alt: "Bedroom with crisp white bedding and a padded headboard",
      },
      {
        src: unsplash("1584622650111-993a426fbf0a"),
        alt: "Bright bathroom with a glass walk-in shower and double vanity",
      },
      {
        src: unsplash("1600566753190-17f0baa2a6c3"),
        alt: "Villa entrance court in timber, glass and white render",
      },
    ],
  },
  {
    id: "p-02",
    slug: "villa-frangipani",
    name: "Villa Frangipani",
    type: "villa",
    location: "Pereybere, north coast",
    bedrooms: 3,
    bathrooms: 3,
    sleeps: 6,
    nightlyRate: 390,
    clientId: "c-sophie",
    managedSince: 2021,
    headline: "Tropical modern living a short walk from Pereybere's swimming cove.",
    description:
      "Set in a frangipani-filled garden, this single-storey villa opens completely onto its pool deck. Three calm bedrooms, an honest outdoor kitchen, and one of the north coast's best swimming beaches at the end of the lane.",
    amenities: [
      "Private pool",
      "Tropical garden",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Outdoor kitchen & BBQ",
      "Housekeeping 6 days a week",
      "Parking for two cars",
      "Beach 400 m",
    ],
    images: [
      {
        src: unsplash("1600596542815-ffad4c1539a9"),
        alt: "Modern white villa with a pool under a blue sky",
      },
      {
        src: unsplash("1600607687939-ce8a6c25118c"),
        alt: "Modern open-plan living room with a pale sofa and timber feature wall",
      },
      {
        src: unsplash("1578683010236-d716f9a3f461"),
        alt: "Spacious bedroom with a glass-walled en-suite and wide windows",
      },
      {
        src: unsplash("1540541338287-41700207dee6"),
        alt: "Infinity pool framed by palm trees above the ocean",
      },
    ],
  },
  {
    id: "p-03",
    slug: "les-cerisiers-4b",
    name: "Les Cerisiers 4B",
    type: "apartment",
    location: "Trou aux Biches, north coast",
    bedrooms: 2,
    bathrooms: 2,
    sleeps: 4,
    nightlyRate: 140,
    clientId: "c-sophie",
    managedSince: 2022,
    headline: "A breezy two-bedroom apartment 150 metres from Trou aux Biches beach.",
    description:
      "On the second floor of a quiet residence with a shared pool, 4B is the easy base for beach-first holidays: two bedrooms, a generous balcony for breakfast, and Trou aux Biches' long white-sand beach just across the road.",
    amenities: [
      "Shared pool",
      "Large balcony",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Lift access",
      "Covered parking",
      "Beach 150 m",
    ],
    images: [
      {
        src: unsplash("1522708323590-d24dbb6b0267"),
        alt: "Compact apartment living and kitchen area with a red armchair",
      },
      {
        src: unsplash("1502672260266-1c1ef2d93688"),
        alt: "Bright living room with plants, bookshelves and a mid-century chair",
      },
      {
        src: unsplash("1584622650111-993a426fbf0a"),
        alt: "Bright bathroom with a glass walk-in shower and double vanity",
      },
    ],
  },
  {
    id: "p-04",
    slug: "villa-tamarin-bay",
    name: "Villa Tamarin Bay",
    type: "villa",
    location: "Tamarin, west coast",
    bedrooms: 5,
    bathrooms: 5,
    sleeps: 10,
    nightlyRate: 620,
    clientId: "c-ravi",
    managedSince: 2018,
    featured: true,
    headline: "Five suites above Tamarin Bay with sunset views over the surf break.",
    description:
      "The west coast at its best: a five-suite villa stepping down the hillside towards Tamarin Bay, with a 15-metre lap pool, a media room, and the island's most reliable sunsets from every terrace. Salt-air mornings, surfable waves, dolphins most weeks.",
    amenities: [
      "15 m lap pool",
      "Panoramic bay view",
      "Media room",
      "Daily housekeeping & chef on request",
      "Air conditioning throughout",
      "Fibre Wi-Fi",
      "Double garage",
      "Alarm & night guardian",
      "Beach 600 m",
    ],
    images: [
      {
        src: unsplash("1602343168117-bb8ffe3e2e9f"),
        alt: "Contemporary white villa with a long swimming pool",
      },
      {
        src: unsplash("1615571022219-eb45cf7faa9d"),
        alt: "Contemporary beach house perched above breaking waves",
      },
      {
        src: unsplash("1600607687920-4e2a09cf159d"),
        alt: "Modern dining space beside a floating staircase",
      },
      {
        src: unsplash("1512918728675-ed5a9ecdebfd"),
        alt: "Bedroom with crisp white bedding and a padded headboard",
      },
      {
        src: unsplash("1519046904884-53103b34b206"),
        alt: "White-sand beach with a palm tree and a thatched parasol",
      },
    ],
  },
  {
    id: "p-05",
    slug: "les-salines-loft",
    name: "Les Salines Loft",
    type: "apartment",
    location: "Rivière Noire, west coast",
    bedrooms: 2,
    bathrooms: 2,
    sleeps: 4,
    nightlyRate: 150,
    clientId: "c-hamilton",
    managedSince: 2020,
    headline: "An industrial-chic loft in the heart of the Black River marina quarter.",
    description:
      "Concrete floors, double-height windows and a mezzanine master suite give this loft real character. Downstairs: the marina's cafés and paddle-board mornings. Twenty minutes from Le Morne, ten from Tamarin's surf.",
    amenities: [
      "Shared pool & gym",
      "Mezzanine master suite",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Marina view balcony",
      "Secure parking",
    ],
    images: [
      {
        src: unsplash("1493809842364-78817add7ffb"),
        alt: "Living room with a blue sofa, herringbone floor and tall windows",
      },
      {
        src: unsplash("1560448204-e02f11c3d0e2"),
        alt: "Light-filled living and dining room with tall windows",
      },
      {
        src: unsplash("1578683010236-d716f9a3f461"),
        alt: "Spacious bedroom with a glass-walled en-suite and wide windows",
      },
    ],
  },
  {
    id: "p-06",
    slug: "cap-ouest-penthouse",
    name: "Cap Ouest Penthouse",
    type: "apartment",
    location: "Flic-en-Flac, west coast",
    bedrooms: 3,
    bathrooms: 3,
    sleeps: 6,
    nightlyRate: 210,
    clientId: "c-hamilton",
    managedSince: 2019,
    featured: true,
    headline: "Top-floor penthouse with a wraparound terrace over Flic-en-Flac lagoon.",
    description:
      "The penthouse the whole residence envies: three bedrooms, a 60 m² wraparound terrace with plunge pool, and front-row seats for the west coast sunset. The lagoon is directly below; Casela and the golf courses are minutes away.",
    amenities: [
      "Private plunge pool",
      "Wraparound sea-view terrace",
      "Beachfront residence",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Lift access",
      "Gym & tennis in residence",
      "Covered parking",
    ],
    images: [
      {
        src: unsplash("1520250497591-112f2f40a3f4"),
        alt: "Lagoon-style pool framed by palms and mountains",
      },
      {
        src: unsplash("1522708323590-d24dbb6b0267"),
        alt: "Compact apartment living and kitchen area with a red armchair",
      },
      {
        src: unsplash("1510414842594-a61c69b5ae57"),
        alt: "Turquoise cove beneath wooded cliffs",
      },
      {
        src: unsplash("1584622650111-993a426fbf0a"),
        alt: "Bright bathroom with a glass walk-in shower and double vanity",
      },
    ],
  },
  {
    id: "p-07",
    slug: "mont-choisy-2a",
    name: "Mont Choisy Residence 2A",
    type: "apartment",
    location: "Mont Choisy, north coast",
    bedrooms: 2,
    bathrooms: 2,
    sleeps: 4,
    nightlyRate: 135,
    clientId: "c-hamilton",
    managedSince: 2021,
    headline: "Calm, green and 300 metres from Mont Choisy's casuarina-lined beach.",
    description:
      "A quietly elegant ground-floor apartment with its own garden terrace in a residence wrapped around two pools. Mont Choisy's kilometre of white sand — the north's finest beach — is a three-minute walk through the filao trees.",
    amenities: [
      "Two shared pools",
      "Private garden terrace",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Ground-floor access",
      "Parking",
      "Beach 300 m",
    ],
    images: [
      {
        src: unsplash("1560448204-e02f11c3d0e2"),
        alt: "Light-filled living and dining room with tall windows",
      },
      {
        src: unsplash("1493809842364-78817add7ffb"),
        alt: "Living room with a blue sofa, herringbone floor and tall windows",
      },
      {
        src: unsplash("1512918728675-ed5a9ecdebfd"),
        alt: "Bedroom with crisp white bedding and a padded headboard",
      },
    ],
  },
  {
    id: "p-08",
    slug: "la-croisette-garden",
    name: "La Croisette Garden Apartment",
    type: "apartment",
    location: "Grand Baie, north coast",
    bedrooms: 1,
    bathrooms: 1,
    sleeps: 2,
    nightlyRate: 95,
    clientId: "c-hamilton",
    managedSince: 2023,
    headline: "A polished one-bedroom bolthole beside Grand Baie's La Croisette.",
    description:
      "Perfect for couples and long-stay remote workers: a crisp one-bedroom apartment with a leafy patio, five minutes on foot from La Croisette's shops, restaurants and cinema, and a short scooter ride from every beach in the north.",
    amenities: [
      "Shared pool",
      "Garden patio",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Dedicated workspace",
      "Parking",
    ],
    images: [
      {
        src: unsplash("1600607687939-ce8a6c25118c"),
        alt: "Modern open-plan living room with a pale sofa and timber feature wall",
      },
      {
        src: unsplash("1502672260266-1c1ef2d93688"),
        alt: "Bright living room with plants, bookshelves and a mid-century chair",
      },
      {
        src: unsplash("1584622650111-993a426fbf0a"),
        alt: "Bright bathroom with a glass walk-in shower and double vanity",
      },
    ],
  },
  {
    id: "p-09",
    slug: "bain-boeuf-beachfront-5",
    name: "Bain Bœuf Beachfront 5",
    type: "apartment",
    location: "Cap Malheureux, north coast",
    bedrooms: 2,
    bathrooms: 2,
    sleeps: 5,
    nightlyRate: 160,
    clientId: "c-hamilton",
    managedSince: 2020,
    headline: "Toes-in-the-sand beachfront with Coin de Mire filling the horizon.",
    description:
      "Slide the doors open and the beach is literally there. This second-floor apartment looks straight at Coin de Mire island across the channel — the classic north-coast postcard — with snorkelling off the sand below.",
    amenities: [
      "Direct beachfront",
      "Island-view balcony",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Shared pool",
      "Kayaks & snorkelling gear",
      "Parking",
    ],
    images: [
      {
        src: unsplash("1502672260266-1c1ef2d93688"),
        alt: "Bright living room with plants, bookshelves and a mid-century chair",
      },
      {
        src: unsplash("1505142468610-359e7d316be0"),
        alt: "Aerial view of a wave breaking on white sand",
      },
      {
        src: unsplash("1578683010236-d716f9a3f461"),
        alt: "Spacious bedroom with a glass-walled en-suite and wide windows",
      },
    ],
  },
  // Portfolio-only demo listings (not owned by a demo account)
  {
    id: "p-10",
    slug: "villa-coco-palme",
    name: "Villa Coco Palme",
    type: "villa",
    location: "Pointe aux Canonniers, north coast",
    bedrooms: 4,
    bathrooms: 3,
    sleeps: 8,
    nightlyRate: 450,
    clientId: null,
    managedSince: 2022,
    headline: "A colonial-style family villa under the coconut palms.",
    description:
      "Wide verandas, a lawn made for barefoot cricket, and a pool shaded by fifty-year-old palms. Pointe aux Canonniers keeps you between Grand Baie's energy and Mont Choisy's calm.",
    amenities: [
      "Private pool",
      "Half-acre garden",
      "Veranda dining",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Housekeeping",
      "Parking",
    ],
    images: [
      {
        src: unsplash("1600585154340-be6161a56a0c"),
        alt: "Modern villa with glowing windows and a lawn at dusk",
      },
      {
        src: unsplash("1600566752355-35792bedcfea"),
        alt: "Bathroom with a freestanding bath and walk-in shower",
      },
      {
        src: unsplash("1512918728675-ed5a9ecdebfd"),
        alt: "Bedroom with crisp white bedding and a padded headboard",
      },
    ],
  },
  {
    id: "p-11",
    slug: "villa-lhorizon",
    name: "Villa L'Horizon",
    type: "villa",
    location: "Albion, west coast",
    bedrooms: 3,
    bathrooms: 3,
    sleeps: 6,
    nightlyRate: 340,
    clientId: null,
    managedSince: 2021,
    headline: "Clifftop seclusion beside the Albion lighthouse.",
    description:
      "Albion stays wonderfully un-touristy, and L'Horizon makes the most of it: a three-bedroom villa on the low cliffs, an uninterrupted 180° ocean view, and the lighthouse beam sweeping past after dark.",
    amenities: [
      "Clifftop position",
      "Infinity-edge pool",
      "180° ocean view",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Boules court",
      "Parking",
    ],
    images: [
      {
        src: unsplash("1600047509807-ba8f99d2cdde"),
        alt: "Contemporary villa with timber cladding and a landscaped lawn",
      },
      {
        src: unsplash("1540541338287-41700207dee6"),
        alt: "Infinity pool framed by palm trees above the ocean",
      },
      {
        src: unsplash("1600607687939-ce8a6c25118c"),
        alt: "Modern open-plan living room with a pale sofa and timber feature wall",
      },
    ],
  },
  {
    id: "p-12",
    slug: "sunset-reef-apartment",
    name: "Sunset Reef Apartment",
    type: "apartment",
    location: "Tamarin, west coast",
    bedrooms: 2,
    bathrooms: 1,
    sleeps: 4,
    nightlyRate: 155,
    clientId: null,
    managedSince: 2024,
    headline: "Surf-town living with the reef break at the end of the street.",
    description:
      "A relaxed two-bedroom apartment in the heart of Tamarin village: walk to the surf, the salt pans and the Friday food trucks. The balcony faces due west — bring a drink at six.",
    amenities: [
      "West-facing balcony",
      "Shared pool",
      "Air conditioning",
      "Fibre Wi-Fi",
      "Board storage",
      "Parking",
    ],
    images: [
      {
        src: unsplash("1499793983690-e29da59ef1c2"),
        alt: "Thatched beachfront pavilion over a turquoise lagoon",
      },
      {
        src: unsplash("1507525428034-b723cf961d3e"),
        alt: "Calm beach at sunrise with gentle waves",
      },
      {
        src: unsplash("1522708323590-d24dbb6b0267"),
        alt: "Compact apartment living and kitchen area with a red armchair",
      },
    ],
  },
];

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((p) => p.slug === slug);
}

export function getPropertiesForClient(clientId: string): Property[] {
  return properties.filter((p) => p.clientId === clientId);
}

export function getFeaturedProperties(): Property[] {
  return properties.filter((p) => p.featured);
}
