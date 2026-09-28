const fs = require("fs/promises"),
  path = require("path"),
  { embed } = require("./embeddingService");
let records = [];
const file = path.join(__dirname, "../../data/embeddings/embeddings.json");
async function load() {
  try {
    records = JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    records = [];
  }
}
async function retrieve(query) {
  if (!records.length) await load();
  const q = embed(query),
    top = records
      .map((x) => ({
        ...x,
        score: x.embedding.reduce((s, v, i) => s + v * q[i], 0),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(process.env.TOP_K || 5));
  const threshold = Number(process.env.SIMILARITY_THRESHOLD || 0.18);
  return {
    chunks: top.filter((x) => x.score >= threshold),
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
