const fs = require("fs/promises"),
  path = require("path"),
  { embed } = require("./embeddingService");
let records = [];
const file = path.join(__dirname, "../../data/embeddings/embeddings.json");
const stopWords = new Set([
  "about", "after", "and", "are", "can", "for", "from", "how", "into", "is", "it",
  "my", "of", "on", "the", "to", "what", "when", "where", "which", "who", "why", "with",
]);

function terms(text) {
  return new Set(
    (text.toLowerCase().match(/[a-z0-9]+/g) || [])
      .map((word) => (word.length > 4 && word.endsWith("s") ? word.slice(0, -1) : word))
      .filter((word) => word.length > 2 && !stopWords.has(word)),
  );
}
async function load() {
  try {
    records = JSON.parse(await fs.readFile(file, "utf8"));
    if (!Array.isArray(records)) records = [];
  } catch {
    records = [];
  }
}
async function retrieve(query) {
  if (!records.length) {
    await load();
    if (!records.length) return { chunks: [], topScore: 0 };
  }
  const q = embed(query),
    queryTerms = terms(query),
    top = records
      .map((x) => {
        const cosine = x.embedding.reduce((sum, value, i) => sum + value * q[i], 0);
        const documentTerms = terms(`${x.title || ""} ${x.text}`);
        const overlap = [...queryTerms].filter((word) => documentTerms.has(word)).length;
        const lexical = queryTerms.size ? overlap / queryTerms.size : 0;
        return { ...x, lexical, score: cosine * 0.45 + lexical * 0.55 };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(process.env.TOP_K || 5));
  const threshold = Number(process.env.SIMILARITY_THRESHOLD || 0.18);
  return {
    chunks: top.filter((x) => queryTerms.size > 0 && x.score >= threshold && x.lexical > 0),
    topScore: top[0]?.score || 0,
  };
}
module.exports = {
  load,
  retrieve,
  get count() {
    return records.length;
  },
};
