const assert = require("node:assert/strict");
const { after, test } = require("node:test");
const { answerQuestion } = require("../src/rag/ragPipeline");
const { extractResults } = require("../src/services/webSearch");

const originalFetch = global.fetch;
const originalApiKey = process.env.GROQ_API_KEY;
const originalThreshold = process.env.SIMILARITY_THRESHOLD;

after(() => {
  global.fetch = originalFetch;
  if (originalApiKey === undefined) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = originalApiKey;
  if (originalThreshold === undefined) delete process.env.SIMILARITY_THRESHOLD;
  else process.env.SIMILARITY_THRESHOLD = originalThreshold;
});

test("answers a known question from local RAG without Groq", async () => {
  process.env.GROQ_API_KEY = "";
  const result = await answerQuestion("How is a security deposit returned?", "India");

  assert.equal(result.sourceType, "local");
  assert.equal(result.retrieval.webSearchUsed, false);
  assert.ok(result.sources.some((source) => source.name === "Security deposits"));
  assert.match(result.answer, /security deposit/i);
});

test("uses recent legal context to answer a short follow-up", async () => {
  process.env.GROQ_API_KEY = "";
  const result = await answerQuestion("what does that mean?", "India", [
    { role: "user", content: "Which leases must be registered under section 107?" },
    { role: "assistant", content: "Section 107 describes registration requirements for certain leases." },
  ]);

  assert.equal(result.sourceType, "local");
  assert.equal(result.retrieval.webSearchUsed, false);
  assert.match(result.answer, /Section 107/i);
  assert.match(result.answer, /registered instrument/i);
});

test("does not let prior legal context make a new unrelated question in-scope", async () => {
  const result = await answerQuestion("who is pm", "India", [
    { role: "user", content: "What are the lease registration rules?" },
  ]);

  assert.equal(result.sourceType, "out_of_scope");
  assert.equal(result.retrieval.webSearchUsed, false);
});

test("uses web search for an in-scope legal question without a local match", async () => {
  process.env.GROQ_API_KEY = "";
  process.env.SIMILARITY_THRESHOLD = "0.99";
  global.fetch = async () => new Response(
    '<a class="result__a" href="https://duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.gov.in%2Fconsumer">Official consumer law guidance</a><a class="result__snippet">Check the current refund rules.</a>',
    { status: 200 },
  );

  const result = await answerQuestion("What does Indian consumer refund law require?", "India");

  assert.equal(result.sourceType, "web");
  assert.equal(result.retrieval.webSearchUsed, true);
  assert.equal(result.sources[0].url, "https://example.gov.in/consumer");
  assert.match(result.answer, /current refund rules/i);
});

test("uses web search when retrieved passages do not contain the requested legal section", async () => {
  process.env.GROQ_API_KEY = "";
  process.env.SIMILARITY_THRESHOLD = "0.18";
  global.fetch = async (requestUrl) => {
    const searchUrl = new URL(requestUrl);
    assert.match(searchUrl.searchParams.get("q"), /section 44.*Consumer Protection Act/i);
    return new Response(
      '<a class="result__a" href="https://duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.indiacode.nic.in%2Fconsumer">India Code Section 44</a><a class="result__snippet">Section 44 provides for appeals under the Act.</a>',
      { status: 200 },
    );
  };

  const result = await answerQuestion(
    "What does section 44 of the Consumer Protection Act, 2019 say?",
    "India",
  );

  assert.equal(result.sourceType, "web");
  assert.equal(result.retrieval.webSearchUsed, true);
  assert.equal(result.retrieval.chunkCount, 0);
  assert.equal(result.sources[0].name, "India Code Section 44");
});

test("uses focused local evidence when the requested statute section is present", async () => {
  process.env.GROQ_API_KEY = "";
  process.env.SIMILARITY_THRESHOLD = "0.18";
  const result = await answerQuestion(
    "What does Section 17(1)(d) of the Registration Act, 1908 say about lease registration?",
    "India",
  );

  assert.equal(result.sourceType, "local");
  assert.equal(result.retrieval.webSearchUsed, false);
  assert.ok(result.retrieval.chunkCount <= 3);
  assert.ok(result.answer.length < 1400);
});

test("declines out-of-domain questions without calling search or Groq", async () => {
  let fetchCalled = false;
  global.fetch = async () => {
    fetchCalled = true;
    throw new Error("Out-of-domain questions must not call a provider.");
  };

  const result = await answerQuestion("who is pm", "India");

  assert.equal(result.sourceType, "out_of_scope");
  assert.equal(result.retrieval.mode, "out_of_scope");
  assert.equal(result.retrieval.webSearchUsed, false);
  assert.match(result.answer, /legal and law-related questions/i);
  assert.equal(fetchCalled, false);
});

test("extracts search result URLs and titles", () => {
  const results = extractResults(
    '<a class="result__a" href="https://duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.gov.in%2F">Official source</a>',
  );

  assert.deepEqual(results, [{ title: "Official source", url: "https://example.gov.in/", snippet: "" }]);
});