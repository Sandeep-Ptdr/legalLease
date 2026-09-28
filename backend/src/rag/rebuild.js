const fs = require("fs/promises"),
  path = require("path"),
  { embed } = require("./embeddingService");

  
const docs = path.join(__dirname, "../../data/documents"),
  out = path.join(__dirname, "../../data/embeddings/embeddings.json");
async function rebuild() {
  await fs.mkdir(path.dirname(out), { recursive: true });
  const names = (await fs.readdir(docs)).filter((n) => n.endsWith(".txt"));
  const records = [];
  for (const source of names) {
    const text = await fs.readFile(path.join(docs, source), "utf8");
    const words = text.replace(/\s+/g, " ").trim().split(" ");
    for (let i = 0; i < words.length; i += 575) {
      const chunk = words.slice(i, i + 650).join(" ");
      if (chunk)
        records.push({
          chunkId: `${source}-${i}`,
          source,
          page: 1,
          text: chunk,
          embedding: embed(chunk),
        });
    }
  }
  await fs.writeFile(out, JSON.stringify(records));
  return { documents: names.length, chunks: records.length };
}
if (require.main === module)
  rebuild()
    .then(console.log)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
module.exports = { rebuild };
