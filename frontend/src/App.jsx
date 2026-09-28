import { useEffect, useRef, useState } from 'react'
import './App.css'

const examples = ['What is a rental agreement?', 'What should I check before signing a lease?', 'What is a security deposit?', 'Who is responsible for maintenance?']
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function App() {
  const [jurisdiction, setJurisdiction] = useState('India')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const end = useRef(null)
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [messages, loading])
  async function ask(value = input) {
    const message = value.trim(); if (!message || loading) return
    setInput(''); setError(''); setLoading(true); setMessages(m => [...m, { role: 'user', text: message }])
    try { const r = await fetch(`${API}/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, jurisdiction }) }); const data = await r.json(); if (!r.ok) throw new Error(data.message); setMessages(m => [...m, { role: 'assistant', ...data }]) }
    catch (e) { setError(e.message || 'Could not reach the backend. Start the server and try again.') }
    finally { setLoading(false) }
  }
  return <main><header><div className="logo">§</div><div><small>LEGALLEASE</small><h1>Legal Lease Assistant</h1></div><span className="ready">? Local RAG ready</span></header><section className="toolbar"><p>Clear, source-backed rental and lease information.</p><label>JURISDICTION<select value={jurisdiction} onChange={e => setJurisdiction(e.target.value)}><option>India</option><option>Gujarat</option></select></label></section><section className="chat">{!messages.length ? <div className="welcome"><i>?</i><h2>How can we help?</h2><p>Ask about rental agreements, deposits, tenant rights, or lease clauses.</p><div className="examples">{examples.map(q => <button key={q} onClick={() => ask(q)}>{q}</button>)}</div></div> : <div className="feed">{messages.map((m, i) => <article key={i} className={m.role}><b>{m.role === 'user' ? 'Y' : '§'}</b><div><p>{m.text || m.answer}</p>{m.role === 'assistant' && <><em>{m.sourceType === 'web' ? 'Local knowledge was insufficient' : 'Answered from local knowledge base'}</em><div className="sources">{m.sources?.map((s, x) => <a key={x} href={s.url} target="_blank" rel="noreferrer">{s.url ? '?' : '?'} {s.name || s.title}{s.page ? ` · Page ${s.page}` : ''}</a>)}</div><details><summary>Technical details</summary><span>Mode: {m.retrieval?.mode === 'web' ? 'Web fallback' : 'Local RAG'} · Similarity: {m.retrieval?.topScore?.toFixed(2) || '—'} · Chunks: {m.retrieval?.chunkCount || 0}</span></details></>}</div></article>)}{loading && <article className="assistant"><b>§</b><div className="dots">? ? ?</div></article>}<div ref={end}/></div>} {error && <p className="error">{error}</p>}<form onSubmit={e => { e.preventDefault(); ask() }}><textarea rows="1" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask() } }} placeholder="Ask a question about renting or leases..."/><button disabled={!input.trim() || loading}>?</button></form><small className="hint">Press Enter to send · Shift + Enter for a new line</small></section>{messages.length > 0 && <button className="clear" onClick={() => setMessages([])}>Clear conversation</button>}<footer><strong>Educational information only.</strong> This assistant provides general legal information, not legal advice. Rental laws vary by jurisdiction and can change; verify important matters using current official sources or a qualified lawyer.</footer></main>
}