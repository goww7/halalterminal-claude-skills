#!/usr/bin/env node
/**
 * Bridges a stdio MCP client (Claude Code) to the Halal Terminal SSE endpoint.
 * API key is read from HALALTERMINAL_API_KEY (set via /halal-setup into the
 * MCP server's env block in ~/.claude/settings.json).
 */
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const API_KEY = process.env.HALALTERMINAL_API_KEY;
if (!API_KEY || !API_KEY.startsWith("ht_")) {
  console.error(
    "halalterminal-mcp: HALALTERMINAL_API_KEY is missing or invalid. " +
    "Run /halal-setup to configure."
  );
  process.exit(1);
}

const SSE_URL = `https://mcp.halalterminal.com/sse?api_key=${encodeURIComponent(API_KEY)}`;

const sseTransport = new SSEClientTransport(new URL(SSE_URL), {
  requestInit: {
    headers: { "X-API-Key": API_KEY },
  },
});

const stdioTransport = new StdioServerTransport();

await sseTransport.start();
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
