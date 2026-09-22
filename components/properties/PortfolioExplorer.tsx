"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import type { Property } from "@/lib/types";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "villa", label: "Villas" },
  { value: "apartment", label: "Apartments" },
] as const;

type TypeFilter = (typeof TYPE_OPTIONS)[number]["value"];

const BEDROOM_OPTIONS = [
  { value: "any", label: "Any" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4+", label: "4+" },
] as const;

type BedroomFilter = (typeof BEDROOM_OPTIONS)[number]["value"];

/**
 * Client-side portfolio: type pills + location/bedroom selects filtering the
 * card grid, with layout animation so cards glide rather than jump.
 */
export function PortfolioExplorer({ properties }: { properties: Property[] }) {
  const [type, setType] = useState<TypeFilter>("all");
  const [location, setLocation] = useState("all");
  const [bedrooms, setBedrooms] = useState<BedroomFilter>("any");

  const locations = useMemo(
    () =>
      Array.from(new Set(properties.map((p) => p.location))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [properties]
  );

  const filtered = useMemo(
    () =>
      properties.filter((property) => {
        if (type !== "all" && property.type !== type) return false;
        if (location !== "all" && property.location !== location) return false;
        if (bedrooms === "4+") return property.bedrooms >= 4;
        if (bedrooms !== "any") return property.bedrooms === Number(bedrooms);
        return true;
      }),
    [properties, type, location, bedrooms]
  );

  const clearFilters = () => {
    setType("all");
    setLocation("all");
    setBedrooms("any");
  };

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="space-y-1.5">
            <span
              id="type-filter-label"
              className="block text-sm font-medium text-navy-900"
            >
              Type
            </span>
            <div
              role="group"
              aria-labelledby="type-filter-label"
              className="flex rounded-full border border-sand-300 bg-white p-1"
            >
              {TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={type === option.value}
                  onClick={() => setType(option.value)}
                  className={cn(
                    "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
                    type === option.value
                      ? "bg-navy-900 text-white"
                      : "text-ink-500 hover:text-navy-900"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Location" htmlFor="filter-location" className="w-full sm:w-56">
            <Select
              id="filter-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option value="all">All locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Bedrooms" htmlFor="filter-bedrooms" className="w-full sm:w-36">
            <Select
              id="filter-bedrooms"
              value={bedrooms}
              onChange={(event) =>
                setBedrooms(event.target.value as BedroomFilter)
              }
            >
              {BEDROOM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <p
            aria-live="polite"
            className="ml-auto pb-3 text-sm text-ink-500"
          >
            {filtered.length} of {properties.length} properties
          </p>
        </div>
      </Reveal>

      {/* Keeps the heading outline sequential (h1 → h2 → card h3s). */}
      <h2 className="sr-only">Properties matching your filters</h2>

      {filtered.length > 0 ? (
        <motion.ul
          layout
          className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((property) => (
              <motion.li
                key={property.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="h-full"
              >
                <PropertyCard property={property} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-10 rounded-2xl border border-dashed border-sand-300 bg-white px-8 py-16 text-center"
        >
          <p className="font-serif text-2xl text-navy-900">
            No properties match those filters
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
            Try widening the search — or ask us directly; the portfolio is
            always growing.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-6"
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        </motion.div>
      )}
    </div>
  );
}
