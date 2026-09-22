import "dotenv/config";
import { prisma } from "../lib/db";

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

function mirrorMedia(english: unknown, persian: unknown): unknown {
  if (Array.isArray(persian)) {
    return persian.map((item, index) => mirrorMedia(Array.isArray(english) ? english[index] : undefined, item));
  }
  if (!isRecord(persian)) return persian;

  const englishRecord = isRecord(english) ? english : {};
  return Object.fromEntries(Object.entries(persian).map(([field, persianValue]) => {
    const englishValue = englishRecord[field];
    if (field === "image" && typeof englishValue === "string" && englishValue.trim() !== "") {
      return [field, englishValue];
    }
    return [field, mirrorMedia(englishValue, persianValue)];
  }));
}

function syncVersion(serialized: string | null): string | null {
  if (!serialized) return serialized;
  const parsed = JSON.parse(serialized) as JsonRecord;
  if (!isRecord(parsed.en) || !isRecord(parsed.fa)) return serialized;

  const fa = { ...parsed.fa };
  for (const field of ["loops", "cultures"] as const) {
    fa[field] = mirrorMedia(parsed.en[field], parsed.fa[field]);
  }
  return JSON.stringify({ ...parsed, fa });
}

async function main() {
  const section = await prisma.section.findUnique({
    where: { key: "thrivable-business" },
    select: { data: true, publishedData: true },
  });
  if (!section) throw new Error('The "thrivable-business" section is missing. Run npm run seed first.');

  const data = syncVersion(section.data);
  const publishedData = syncVersion(section.publishedData);
  await prisma.section.update({
    where: { key: "thrivable-business" },
    data: { data: data ?? section.data, publishedData },
  });
  console.log("Synced English card media for Critical Business Loop and Brand Culture & XP into Persian.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
