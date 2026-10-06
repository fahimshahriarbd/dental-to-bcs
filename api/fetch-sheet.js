// Vercel Serverless Function
// Proxies the public Google Apps Script endpoint for BDS/BCS question data.

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzwEtARZ36HPe6gS6BymvbrDNUVj9MnMWKj4kNOEZATJdmdoe133lzlGtF74l-zoMtU/exec";

export default async function handler(req, res) {
  const sheet = String(req.query?.sheet || "").trim().toUpperCase();

  if (!["BDS", "BCS"].includes(sheet)) {
    return res.status(400).json({
      error: "Invalid sheet. Use BDS or BCS."
    });
  }

  const targetUrl = `${GOOGLE_SCRIPT_URL}?sheet=${encodeURIComponent(sheet)}`;

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "BDS-to-BCS-Study-App/1.0",
        "Accept": "application/json, text/csv, text/plain, */*"
      },
      signal: AbortSignal.timeout(8000)
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      return res.status(502).json({
        error: "Google Sheets endpoint returned an error.",
        status: response.status
      });
    }

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(200).json(data);
    }

    const text = await response.text();

    // Try JSON first even if the upstream content type is incorrect.
    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      res.setHeader("Content-Type", contentType || "text/plain; charset=utf-8");
      return res.status(200).send(text);
    }
  } catch (error) {
    console.error("Google Sheets proxy error:", error);
    return res.status(200).json([]);
  }
}
