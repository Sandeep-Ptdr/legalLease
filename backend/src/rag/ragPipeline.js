const { retrieve } = require("./retriever");
const { generateAnswer } = require("../services/llmService");
const { searchWeb } = require("../services/webSearch");
const outOfScopeMessage = "I can't provide an answer to that. I'm here to help with legal and law-related questions.";
const legalTopics = /\b(?:legal|law|lawful|unlawful|illegal|lawyer|attorney|advocate|court|judge|judgment|case law|rights?|liabilit(?:y|ies)|liable|sue|lawsuit|litigation|dispute|legislation|statute|contract|agreement|clause|tenant|tenancy|landlord|leases?|rent(?:al)?|evict(?:ion|ed|ing)?|deposit|maintenance|notice|stamp duty|registration|sublet(?:ting)?|property|housing|divorc(?:e|ing)|marri(?:age|ed)|custody|inheritance|employ(?:ment|ee|er)|salary|wage|consumer|refund|complaint|criminal|crime|arrest|bail|police|fine|penalt(?:y|ies)|tax|visa|immigration|copyright|trademark|privacy|harass(?:ment)?|fraud|theft|assault|negligence|injury|insurance|constitution|bankruptcy|loan|debt|rera|ipc|bns|crpc|bnss)\b/i;

const followUpPattern = /^(?:(?:and|also)\b|what about (?:it|that|this)\b|how about (?:it|that|this)\b|what does (?:it|that|this)\b|why(?:\b|$)|how so\b|can you explain (?:it|that|this)\b|explain (?:it|that|this)\b|tell me more\b|what did i ask\b|what was my question\b|what did you say\b|summarize (?:our|the) conversation\b)/i;

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-6).flatMap((entry) => {
    if (!entry || !["user", "assistant"].includes(entry.role) || typeof entry.content !== "string")
      return [];
    const content = entry.content.trim().slice(0, 1200);
    return content ? [{ role: entry.role, content }] : [];
  });
}

function lastUserMessage(history) {
  return [...history].reverse().find((entry) => entry.role === "user")?.content || "";
}

function isInScope(query, history) {
  if (legalTopics.test(query)) return true;
  return followUpPattern.test(query.trim()) && legalTopics.test(lastUserMessage(history));
}

function retrievalQuery(query, history) {
  if (!followUpPattern.test(query.trim())) return query;
  const previousQuestion = lastUserMessage(history);
  return previousQuestion && legalTopics.test(previousQuestion)
    ? `${previousQuestion}\n${query}`
    : query;
}

function selectEvidenceChunks(query, chunks) {
  const sectionReference = query.match(/\bsection\s+(\d+[a-z]?(?:\s*\(\s*\d+\s*\))?(?:\s*\(\s*[a-z]\s*\))?)/i)?.[1];
  const words = query.toLowerCase().match(/[a-z0-9]+/g) || [];
  const actIndex = words.lastIndexOf("act");
  const ignoredActWords = new Set([
    "a", "an", "and", "of", "the", "under", "in", "what", "which", "does", "say",
    "about", "section", "lease", "leases", "registration", "requirements", "rule", "rules",
  ]);
  const actNameTerms = actIndex < 0
    ? []
    : words.slice(Math.max(0, actIndex - 8), actIndex)
      .filter((word) => word.length > 2 && !/^\d+$/.test(word) && !ignoredActWords.has(word));
  const actYear = actIndex >= 0 && /^\d{4}$/.test(words[actIndex + 1] || "")
    ? words[actIndex + 1]
    : null;
  const specificReference = Boolean(sectionReference || actNameTerms.length || actYear);
  if (!specificReference) return chunks.slice(0, 3);

  const normalizedSection = sectionReference?.replace(/\s+/g, "").toLowerCase();
  return chunks
    .filter((chunk) => {
      const evidence = `${chunk.title || ""} ${chunk.source || ""} ${chunk.text}`.toLowerCase();
      const normalizedEvidence = evidence.replace(/\s+/g, "");
      const hasSection = !normalizedSection ||
        normalizedEvidence.includes(`section${normalizedSection}`);
      const hasAct = actNameTerms.every((word) => new RegExp(`\\b${word}\\b`, "i").test(evidence));
      const hasYear = !actYear || new RegExp(`\\b${actYear}\\b`).test(evidence);
      return hasSection && hasAct && hasYear;
    })
    .slice(0, 3);
}

function localAnswer(query, chunks) {
  const stopWords = new Set(["about", "and", "are", "does", "for", "from", "how", "the", "what", "which", "with"]);
  const queryTerms = new Set(
    (query.toLowerCase().match(/[a-z0-9]+/g) || [])
      .map((word) => word.length > 4 && word.endsWith("s") ? word.slice(0, -1) : word)
      .filter((word) => word.length > 2 && !stopWords.has(word)),
  );
  const candidates = chunks.flatMap((chunk) =>
    chunk.text.split(/(?<=[.!?])\s+/).map((text, index) => {
      const sentenceTerms = new Set((text.toLowerCase().match(/[a-z0-9]+/g) || []));
      const score = [...queryTerms].filter((term) => sentenceTerms.has(term)).length;
      return { text: text.trim(), title: chunk.title || chunk.source, score, index };
    }),
  );
  const excerpts = candidates
    .filter((candidate) => candidate.text && candidate.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, 3)
    .map((candidate) => `${candidate.title}: ${candidate.text.slice(0, 360).trimEnd()}`)
    .join("\n\n");
  return `I couldn't generate a concise AI response. The closest matching local information is:\n\n${excerpts || "No concise matching passage was found."}\n\nThis is general educational information, not legal advice.`;
}

function webAnswer(results) {
  if (!results.length)
    return "I could not find relevant local information or web results for this question. Please check current official sources or consult a qualified Indian property lawyer.";
  const evidence = results
    .filter((result) => result.snippet)
    .map((result) => `${result.title}: ${result.snippet}`)
    .join("\n\n");
  return `${evidence || "I found relevant web pages, but they did not provide a readable summary."}\n\nThese search snippets are not a substitute for checking current official law. This is general information, not legal advice.`;
}

async function answerQuestion(query, jurisdiction, conversationHistory = []) {
  const history = normalizeHistory(conversationHistory);
  if (!isInScope(query, history))
    return {
      answer: outOfScopeMessage,
      sourceType: "out_of_scope",
      sources: [],
      retrieval: {
        mode: "out_of_scope",
        topScore: 0,
        chunkCount: 0,
        webSearchUsed: false,
        generation: "scope-check",
      },
    };

  const contextualQuery = retrievalQuery(query, history);
  const retrieval = await retrieve(contextualQuery);
  const evidenceChunks = selectEvidenceChunks(contextualQuery, retrieval.chunks);
  if (evidenceChunks.length) {
    const sources = evidenceChunks.map((chunk) => ({
      name: chunk.title || chunk.source,
      url: chunk.url,
      page: chunk.page,
      type: "local",
    }));
    const context = evidenceChunks
      .map((chunk) => `[${chunk.title || chunk.source}] ${chunk.text}`)
      .join("\n\n");
    let answer = localAnswer(contextualQuery, evidenceChunks);
    let generation = "extractive";
    try {
      const generated = await generateAnswer(query, jurisdiction, context, history);
      if (generated) {
        answer = generated;
        generation = "groq";
      }
    } catch (error) {
      console.warn("Groq unavailable; returning retrieved excerpts:", error.message);
    }
    return {
      answer,
      sourceType: "local",
      sources,
      retrieval: {
        mode: "local",
        topScore: retrieval.topScore,
        chunkCount: evidenceChunks.length,
        webSearchUsed: false,
        generation,
      },
    };
  }

  let results = [];
  try {
    results = await searchWeb(contextualQuery, jurisdiction);
  } catch (error) {
    console.warn("Web search unavailable:", error.message);
  }
  const sources = results.map(({ title, url }) => ({ name: title, url, type: "web" }));
  const context = results
    .filter((result) => result.snippet)
    .map((result) => `[${result.title}] ${result.snippet} (${result.url})`)
    .join("\n\n");
  let answer = webAnswer(results);
  let generation = "search-snippets";
  if (context) {
    try {
      const generated = await generateAnswer(query, jurisdiction, context, history);
      if (generated) {
        answer = generated;
        generation = "groq";
      }
    } catch (error) {
      console.warn("Groq unavailable; returning web search excerpts:", error.message);
    }
  }
  return {
    answer,
    sourceType: results.length ? "web" : "none",
    sources,
    retrieval: {
      mode: results.length ? "web" : "none",
      topScore: retrieval.topScore,
      chunkCount: 0,
      webSearchUsed: true,
      generation,
    },
  };
}
module.exports = { answerQuestion };
