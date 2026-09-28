const { retrieve } = require("./retriever"),
  { generateAnswer } = require("../services/llmService");
async function answerQuestion(query, jurisdiction) {
  const r = await retrieve(query);
  if (!r.chunks.length)
    return {
      answer:
        "I could not find enough relevant information in the local educational knowledge base to answer reliably. Check an official source for your state or consult a qualified lawyer.",
      sourceType: "web",
      sources: [],
      retrieval: {
        mode: "web",
        topScore: r.topScore,
        chunkCount: 0,
        webSearchUsed: false,
      },
    };
  const context = r.chunks
    .map((x) => `[${x.source}, page ${x.page}] ${x.text}`)
    .join("\n\n");
  return {
    answer: await generateAnswer(context, query, jurisdiction),
    sourceType: "local",
    sources: r.chunks.map((x) => ({ name: x.source, page: x.page })),
    retrieval: {
      mode: "local",
      topScore: r.topScore,
      chunkCount: r.chunks.length,
      webSearchUsed: false,
    },
  };
}
module.exports = { answerQuestion };
