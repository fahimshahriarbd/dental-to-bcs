// Proxies the public Google Apps Script endpoint for BDS/BCS question data.
// Features in-memory caching and extended timeout resilience.

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzwEtARZ36HPe6gS6BymvbrDNUVj9MnMWKj4kNOEZATJdmdoe133lzlGtF74l-zoMtU/exec";

// In-memory cache to serve subsequent requests instantly and survive upstream cold starts/slow responses
const memoryCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

export default async function handler(req, res) {
  const sheet = String(req.query?.sheet || "").trim().toUpperCase();

  if (!["BDS", "BCS"].includes(sheet)) {
    return res.status(400).json({
      error: "Invalid sheet. Use BDS or BCS."
    });
  }

  // 1. Serve fresh cache immediately if available
  const cached = memoryCache.get(sheet);
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return res.status(200).json(cached.data);
  }

  const targetUrl = `${GOOGLE_SCRIPT_URL}?sheet=${encodeURIComponent(sheet)}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "BDS-to-BCS-Study-App/1.0",
        "Accept": "application/json, text/csv, text/plain, */*"
      },
      // Google Apps Script cold starts can take 10-15s; give generous timeout
      signal: AbortSignal.timeout(18000)
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (cached?.data) {
        return res.status(200).json(cached.data);
      }
      return res.status(200).json([]);
    }

    let parsedData = [];
    if (contentType.includes("application/json")) {
      parsedData = await response.json();
    } else {
      const text = await response.text();
      try {
        parsedData = JSON.parse(text);
      } catch {
        res.setHeader("Content-Type", contentType || "text/plain; charset=utf-8");
        return res.status(200).send(text);
      }
    }

    if (Array.isArray(parsedData) && parsedData.length > 0) {
      memoryCache.set(sheet, { data: parsedData, timestamp: Date.now() });
      const otherSheet = sheet === "BDS" ? "BCS" : "BDS";
      if (!memoryCache.has(otherSheet)) {
        memoryCache.set(otherSheet, { data: parsedData, timestamp: Date.now() });
      }
    }

    return res.status(200).json(parsedData);
  } catch (error) {
    // If timed out or failed, serve stale cache if available, or empty array gracefully
    if (cached?.data) {
      return res.status(200).json(cached.data);
    }
    return res.status(200).json([]);
  }
}
