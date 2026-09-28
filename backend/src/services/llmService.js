async function generateAnswer(context, query, jurisdiction) {
  if (!process.env.LLM_API_KEY)
    return `Based on the local educational knowledge base for ${jurisdiction}:\n\n${context}\n\nThis is general information, not legal advice. Laws and procedures vary by state and local jurisdiction.`;
  const r = await fetch(
    `${process.env.LLM_BASE_URL || "https://api.openai.com/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a Legal Lease Information Assistant. Use only provided evidence. Do not invent laws, procedures or citations. State this is general information, not legal advice.",
          },
          {
            role: "user",
            content: `Jurisdiction: ${jurisdiction}\nEvidence:\n${context}\nQuestion: ${query}`,
          },
        ],
        temperature: 0.2,
      }),
    },
  );
  if (!r.ok) throw new Error("LLM service unavailable");
  return (await r.json()).choices[0].message.content;
}
module.exports = { generateAnswer };
