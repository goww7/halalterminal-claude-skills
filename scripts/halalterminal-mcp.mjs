#!/usr/bin/env node
/**
 * Bridges a stdio MCP client (Claude Code) to the Halal Terminal SSE endpoint.
 *
 * Key resolution order:
 *   1. process.env.HALALTERMINAL_API_KEY            (from .mcp.json env substitution)
 *   2. ~/.claude/halalterminal/credentials          (written by /halal-setup)
 *
 * If neither yields an `ht_`-prefixed key, exits with a message pointing
 * the user at /halal-setup.
 */
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

function isValidKey(k) {
  return typeof k === "string" && k.startsWith("ht_") && k.length >= 20;
}

async function resolveApiKey() {
  const fromEnv = process.env.HALALTERMINAL_API_KEY;
  if (isValidKey(fromEnv)) return fromEnv;

  const credPath = join(homedir(), ".claude", "halalterminal", "credentials");
  try {
    const raw = await readFile(credPath, "utf8");
    const match = raw.match(/^\s*HALALTERMINAL_API_KEY\s*=\s*(\S+)\s*$/m);
    if (match && isValidKey(match[1])) return match[1];
  } catch {
    // credentials file absent — fine, fall through
  }

  return null;
}

const API_KEY = await resolveApiKey();
if (!API_KEY) {
  console.error(
    "halalterminal-mcp: no API key found.\n" +
    "  Run /halal-setup, or ask 'Is AAPL halal?' and the plugin will walk you\n" +
    "  through getting a free key from https://api.halalterminal.com."
  );
  process.exit(1);
}

// Header-only auth — never put the key in the URL. The backend logs (Caddy
// access log + any future intermediary) capture full URLs, and `ht_…` keys
// leaking into logs is a chargeback risk.
const SSE_URL = "https://mcp.halalterminal.com/sse";

const sseTransport = new SSEClientTransport(new URL(SSE_URL), {
  requestInit: {
    headers: { "X-API-Key": API_KEY },
  },
});

const stdioTransport = new StdioServerTransport();

// A rejection from start() happens before the handlers below are wired, so
// it used to surface as a raw Node stack trace. A rejected key is the common
// case and deserves to be named.
try {
  await sseTransport.start();
} catch (error) {
  const status = error?.code;
  if (status === 401 || status === 403) {
    console.error(
      `halalterminal-mcp: the API key was rejected (HTTP ${status}).\n` +
      "  Run /halal-setup to store a current key, or check it at\n" +
      "  https://api.halalterminal.com."
    );
  } else {
    console.error(
      `halalterminal-mcp: could not reach ${SSE_URL}.\n` +
      `  ${error?.message ?? error}\n` +
      "  Run /halal-doctor for a full diagnostic."
    );
  }
  process.exit(1);
}

await stdioTransport.start();

stdioTransport.onmessage = (msg) => sseTransport.send(msg);
sseTransport.onmessage = (msg) => stdioTransport.send(msg);

const exitClean = () => process.exit(0);
sseTransport.onclose = exitClean;
stdioTransport.onclose = exitClean;

sseTransport.onerror = (e) => {
  console.error("halalterminal-mcp SSE error:", e?.message ?? e);
  process.exit(1);
};
