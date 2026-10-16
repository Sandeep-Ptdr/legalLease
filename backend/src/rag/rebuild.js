const fs = require("fs/promises"),
  path = require("path"),
  { embed } = require("./embeddingService");

  
const knowledgeBase = path.join(__dirname, "../../data/knowledge-base.json"),
  documentsPath = path.join(__dirname, "../../data/documents"),
  out = path.join(__dirname, "../../data/embeddings/embeddings.json");
async function rebuild() {
  await fs.mkdir(path.dirname(out), { recursive: true });
  const knowledgeDocuments = JSON.parse(await fs.readFile(knowledgeBase, "utf8"));
  const textFiles = (await fs.readdir(documentsPath)).filter((name) => name.endsWith(".txt"));
  const textDocuments = await Promise.all(
    textFiles.map(async (name) => ({
      id: path.parse(name).name,
      title: path.parse(name).name.replace(/[_-]+/g, " "),
      source: name,
      jurisdiction: "India",
      content: await fs.readFile(path.join(documentsPath, name), "utf8"),
    })),
  );
  const documents = [...knowledgeDocuments, ...textDocuments];
  const records = [];
  for (const document of documents) {
    const words = document.content.replace(/\s+/g, " ").trim().split(" ");
    for (let i = 0; i < words.length; i += 575) {
      const chunk = words.slice(i, i + 650).join(" ");
      if (chunk)
        records.push({
          chunkId: `${document.id}-${i}`,
          source: document.source || "LegalLease educational knowledge base",
          url: document.sourceUrl,
          title: document.title,
          jurisdiction: document.jurisdiction,
          page: 1,
          text: chunk,
          embedding: embed(chunk),
        });
    }
  }
  await fs.writeFile(out, JSON.stringify(records));
  return {
    documents: documents.length,
    jsonDocuments: knowledgeDocuments.length,
    textDocuments: textDocuments.length,
    chunks: records.length,
  };
}
if (require.main === module)
  rebuild()
    .then(console.log)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
module.exports = { rebuild };
