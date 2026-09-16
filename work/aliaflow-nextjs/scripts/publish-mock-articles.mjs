#!/usr/bin/env node
/**
 * Populates the article-page fields (lead, sections, key_points, cta_*) for
 * all 27 card detail pages, using the content in ./mock-article-content.mjs.
 *
 * This talks to the live site's own CMS API — the same PATCH /api/sections/:key
 * endpoint the admin panel form uses — so it goes through the site's own
 * validation and publishing/revision history. It does NOT touch the database
 * directly.
 *
 * Run it yourself, with your own admin credentials, from your own terminal:
 *
 *   ADMIN_EMAIL='you@example.com' ADMIN_PASSWORD='...' node scripts/publish-mock-articles.mjs
 *
 * Optional env vars:
 *   PROD_URL   Site origin (default: https://aliaflow.houseoftechnocrats.ir)
 *   INTENT     "publish" (default, goes live immediately) or "save" (draft)
 *   DRY_RUN    Set to "1" to print what would change without writing anything
 *
 * Credentials are read from the environment only — never pass them as CLI
 * arguments (they would land in your shell history).
 */

import { MOCK_ARTICLES } from "./mock-article-content.mjs";

const PROD_URL = (process.env.PROD_URL || "https://aliaflow.houseoftechnocrats.ir").replace(/\/$/, "");
const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const INTENT = process.env.INTENT === "save" ? "save" : "publish";
const DRY_RUN = process.env.DRY_RUN === "1";

if (!EMAIL || !PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment before running this script.");
  process.exit(1);
}

/** The three sections that hold the 27 cards between them, and how to reach
 * each section's card lists — either a top-level list, or a list nested
 * inside each statement. Mirrors lib/card-pages.ts. */
const SECTIONS = [
  { key: "thrivable-business", lists: ["futures", "loops", "cultures"] },
  { key: "business-leadership", statementLists: true },
  { key: "technocratic-design", statementLists: true },
];

function displayName(card) {
  return String(card.heading || card.title || "").trim();
}

function applyMockContent(card, matched, log) {
  const name = displayName(card);
  const mock = MOCK_ARTICLES[name];
  if (!mock) {
    log.unmatched.push(name || "(untitled card)");
    return card;
  }
  if (String(card.lead || "").trim()) {
    log.skipped.push(name);
    return card;
  }
  matched.count += 1;
  log.updated.push(name);
  return { ...card, ...mock };
}

async function login() {
  const response = await fetch(`${PROD_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`Login failed (${response.status}): ${body.error || response.statusText}`);
  }
  const setCookie = response.headers.get("set-cookie");
  if (!setCookie) throw new Error("Login succeeded but no session cookie was returned.");
  const [cookiePair] = setCookie.split(";");
  return cookiePair;
}

async function getSection(key) {
  const response = await fetch(`${PROD_URL}/api/sections/${key}`);
  if (!response.ok) throw new Error(`GET ${key} failed (${response.status})`);
  const { data } = await response.json();
  return data;
}

async function putSection(key, data, cookie) {
  if (DRY_RUN) return;
  const response = await fetch(`${PROD_URL}/api/sections/${key}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ data, intent: INTENT }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`PATCH ${key} failed (${response.status}): ${body.error || response.statusText}`);
  }
}

async function main() {
  console.log(`Target: ${PROD_URL}  intent: ${INTENT}${DRY_RUN ? "  [DRY RUN — no writes]" : ""}\n`);

  const cookie = await login();
  console.log("Logged in.\n");

  const matched = { count: 0 };
  const totalLog = { updated: [], skipped: [], unmatched: [] };

  for (const section of SECTIONS) {
    const data = await getSection(section.key);
    const log = { updated: [], skipped: [], unmatched: [] };

    if (section.lists) {
      for (const listKey of section.lists) {
        const items = Array.isArray(data[listKey]) ? data[listKey] : [];
        data[listKey] = items.map((item) => applyMockContent(item, matched, log));
      }
    } else if (section.statementLists) {
      const statements = Array.isArray(data.statements) ? data.statements : [];
      data.statements = statements.map((statement) => ({
        ...statement,
        cards: Array.isArray(statement.cards)
          ? statement.cards.map((card) => applyMockContent(card, matched, log))
          : statement.cards,
      }));
    }

    console.log(`${section.key}`);
    if (log.updated.length) console.log(`  updated:   ${log.updated.join(", ")}`);
    if (log.skipped.length) console.log(`  skipped (already had a lead): ${log.skipped.join(", ")}`);
    if (log.unmatched.length) console.log(`  no mock content found for: ${log.unmatched.join(", ")}`);

    await putSection(section.key, data, cookie);

    totalLog.updated.push(...log.updated);
    totalLog.skipped.push(...log.skipped);
    totalLog.unmatched.push(...log.unmatched);
  }

  console.log(
    `\n${DRY_RUN ? "Would update" : "Updated"} ${totalLog.updated.length} card(s). ` +
      `${totalLog.skipped.length} already had content and were left alone. ` +
      `${totalLog.unmatched.length} had no matching mock content.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
