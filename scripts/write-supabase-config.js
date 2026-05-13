#!/usr/bin/env node
/**
 * Writes root supabase-config.js from env so Railway/static hosting never commits secrets.
 * Uses SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY only (browser-safe with RLS).
 * SUPABASE_SECRET_KEY is never written here.
 */
const fs = require("fs");
const path = require("path");

const url = (process.env.SUPABASE_URL || "").trim();
const anonKey = (process.env.SUPABASE_PUBLISHABLE_KEY || "").trim();

if (!url || !anonKey) {
  console.error(
    "[write-supabase-config] Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY. Set them in Railway Variables or .env."
  );
  process.exit(1);
}

const outPath = path.join(__dirname, "..", "supabase-config.js");
const content =
  "/* Generated at startup — do not edit; set SUPABASE_* env vars instead */\n" +
  `window.SPRINTTRACK_SUPABASE = ${JSON.stringify({ url, anonKey }, null, 2)};\n`;

fs.writeFileSync(outPath, content, "utf8");
console.log("[write-supabase-config] Wrote supabase-config.js");
