require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const express = require("express"),
  cors = require("cors"),
  mongoose = require("mongoose");
const { answerQuestion } = require("./rag/ragPipeline"),
  { rebuild } = require("./rag/rebuild"),
  retriever = require("./rag/retriever"),
  Chat = require("./models/Chat");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/api/rag/status", async (req, res) => {
  await retriever.load();
  res.json({ ready: retriever.count > 0, chunks: retriever.count });
});
app.post("/api/rag/rebuild", async (req, res) => {
  try {
    const result = await rebuild();
    await retriever.load();
    res.json({ ...result, ready: retriever.count > 0 });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to rebuild the knowledge index." });
  }
});
app.post("/api/chat", async (req, res) => {
  const { message, jurisdiction = "India", history } = req.body;
  if (typeof message !== "string" || !message.trim())
    return res
      .status(400)
      .json({ message: "A non-empty message is required." });
  try {
    const result = await answerQuestion(message.trim(), jurisdiction, history);
    if (mongoose.connection.readyState === 1)
      await Chat.create({
        question: message,
        answer: result.answer,
        jurisdiction,
        sourceType: result.sourceType,
        sources: result.sources,
      });
    res.json(result);
  } catch (error) {
    res
      .status(502)
      .json({ message: error.message || "Unable to generate answer." });
  }
});
(async () => {
  await retriever.load();
  if (!retriever.count) {
    await rebuild();
    await retriever.load();
  }
  if (process.env.MONGODB_URI)
    mongoose
      .connect(process.env.MONGODB_URI)
      .catch((error) =>
        console.warn(
          "MongoDB unavailable; history will not be saved:",
          error.message,
        ),
      );
  app.listen(process.env.PORT || 5000, () =>
    console.log("Legal Lease API running"),
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
