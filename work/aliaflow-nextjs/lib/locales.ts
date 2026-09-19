import type { FieldSchema } from "./section-validation";
import { normalizeSectionData, validateSectionData } from "./section-validation";

export const siteLocales = ["en", "fa"] as const;
export type SiteLocale = (typeof siteLocales)[number];
export type SectionData = Record<string, unknown>;
export type LocalizedSectionData = Record<SiteLocale, SectionData>;

export function isLocalizedSectionData(value: unknown): value is LocalizedSectionData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const data = value as Record<string, unknown>;
  return Boolean(data.en && typeof data.en === "object" && data.fa && typeof data.fa === "object");
}

export function normalizeLocalizedSectionData(
  fields: Record<string, FieldSchema>,
  value: unknown,
): LocalizedSectionData {
  if (isLocalizedSectionData(value)) {
    return {
      en: normalizeSectionData(fields, value.en),
      fa: normalizeSectionData(fields, value.fa),
    };
  }

  const legacy = value && typeof value === "object" && !Array.isArray(value)
    ? value as SectionData
    : {};
  return {
    en: normalizeSectionData(fields, legacy),
    fa: normalizeSectionData(fields, legacy),
  };
}

export function validateLocalizedSectionData(
  fields: Record<string, FieldSchema>,
  value: unknown,
): string[] {
  if (!isLocalizedSectionData(value)) {
    return ["Content must include both English and Persian versions."];
  }

  return siteLocales.flatMap((locale) =>
    validateSectionData(fields, value[locale]).map((issue) => `${locale.toUpperCase()}: ${issue}`),
  );
}
