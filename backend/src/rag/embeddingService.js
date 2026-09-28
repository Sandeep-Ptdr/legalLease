const DIMENSIONS = 256;
function embed(text) {
  const v = Array(DIMENSIONS).fill(0);
  for (const word of text.toLowerCase().match(/[a-z0-9]+/g) || []) {
    let h = 2166136261;
    for (let i = 0; i < word.length; i++)
      h = Math.imul(h ^ word.charCodeAt(i), 16777619);
    v[(h >>> 0) % DIMENSIONS]++;
  }
  const n = Math.hypot(...v) || 1;
  return v.map((x) => x / n);
}
module.exports = { embed };
