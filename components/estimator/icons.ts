import {
  AirVent,
  Building,
  Building2,
  CalendarCheck,
  CalendarRange,
  House,
  Sparkles,
  Sunset,
  TreePalm,
  WavesLadder,
  type LucideIcon,
} from "lucide-react";
import type { Feature, PropertyType } from "@/data/estimator-config";

/** Icons of the estimator's choices (decorative; the text names them). */
export const TYPE_ICONS: Record<PropertyType, LucideIcon> = {
  villa: House,
  apartment: Building2,
  penthouse: Building,
};

export const FEATURE_ICONS: Record<Feature, LucideIcon> = {
  privatePool: WavesLadder,
  seaView: Sunset,
  beachfront: TreePalm,
  airCon: AirVent,
  housekeeping: Sparkles,
};

export const AVAILABILITY_ICONS = {
  yearRound: CalendarCheck,
  partYear: CalendarRange,
} as const satisfies Record<string, LucideIcon>;
