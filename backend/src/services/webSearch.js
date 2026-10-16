const endpoint = "https://html.duckduckgo.com/html/";

function decodeHtml(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .trim();
}

function extractResults(html) {
  const links = [...html.matchAll(/<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  const snippets = [...html.matchAll(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>|<div[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)];

  return links.slice(0, 5).flatMap((match, index) => {
    let url;
    try {
      const parsed = new URL(match[1], endpoint);
      url = parsed.searchParams.get("uddg") || parsed.href;
      url = decodeURIComponent(url);
      if (!/^https?:\/\//i.test(url)) return [];
    } catch {
      return [];
    }
    const snippet = snippets[index]?.[1] || snippets[index]?.[2] || "";
    return [{ title: decodeHtml(match[2]), url, snippet: decodeHtml(snippet) }];
  });
}

async function searchWeb(query, jurisdiction) {
  const searchQuery = `${query} ${jurisdiction}`.trim();
  const response = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}`, {
    headers: { "User-Agent": "LegalLease/1.0 (educational legal information assistant)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Web search returned HTTP ${response.status}.`);
  const results = extractResults(await response.text());
  return results.sort((a, b) => Number(isOfficial(b.url)) - Number(isOfficial(a.url)));
}

function isOfficial(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return hostname.endsWith(".gov.in") || hostname.endsWith(".nic.in") || hostname === "indiacode.nic.in";
  } catch {
    return false;
  }
}

module.exports = { searchWeb, extractResults };