import { useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const modeDefaults = {
  strict: { temperature: 0.2, maxTokens: 150 },
  balanced: { temperature: 0.5, maxTokens: 180 },
  friendly: { temperature: 0.7, maxTokens: 200 },
}

function App() {
  const [complaint, setComplaint] = useState('')
  const [mode, setMode] = useState('strict')
  const [temperature, setTemperature] = useState(modeDefaults.strict.temperature)
  const [maxTokens, setMaxTokens] = useState(modeDefaults.strict.maxTokens)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const modeDescription = useMemo(() => {
    if (mode === 'strict') return 'Deterministic and policy-constrained output'
    if (mode === 'friendly') return 'Empathetic and natural customer-facing tone'
    return 'Neutral support response for standard cases'
  }, [mode])

  const onModeChange = (nextMode) => {
    setMode(nextMode)
    setTemperature(modeDefaults[nextMode].temperature)
    setMaxTokens(modeDefaults[nextMode].maxTokens)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setResult(null)

    if (!complaint.trim()) {
      setError('Please enter a customer complaint before generating a response.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint,
          mode,
          temperature: Number(temperature),
          max_tokens: Number(maxTokens),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail ?? 'Backend request failed.')
      }

      const data = await response.json()
      setResult(data)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">AI-Assisted Customer Support</p>
        <h1>Response Generator</h1>
        <p className="subhead">
          BM25 retrieval + Sarvam API for consistent, policy-grounded complaint handling.
        </p>
      </header>

      <section className="grid">
        <form className="panel" onSubmit={handleSubmit}>
          <label className="label" htmlFor="complaint">
            Customer Complaint
          </label>
          <textarea
            id="complaint"
            value={complaint}
            onChange={(event) => setComplaint(event.target.value)}
            rows={6}
            placeholder="My product arrived late and damaged. Can I get a refund?"
          />

          <div className="controls">
            <div>
              <label className="label" htmlFor="mode">
                Mode
              </label>
              <select id="mode" value={mode} onChange={(event) => onModeChange(event.target.value)}>
                <option value="strict">Strict Policy</option>
                <option value="balanced">Balanced</option>
                <option value="friendly">Friendly Tone</option>
              </select>
              <p className="hint">{modeDescription}</p>
            </div>

            <div>
              <label className="label" htmlFor="temperature">
                Temperature
              </label>
              <input
                id="temperature"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(event) => setTemperature(event.target.value)}
              />
            </div>

            <div>
              <label className="label" htmlFor="maxTokens">
                Max Tokens
              </label>
              <input
                id="maxTokens"
                type="number"
                min="50"
                max="400"
                step="10"
                value={maxTokens}
                onChange={(event) => setMaxTokens(event.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Response'}
          </button>

          {error && <p className="error">{error}</p>}
        </form>

        <section className="panel output" aria-live="polite">
          <h2>Assistant Output</h2>
          {!result && <p className="placeholder">Generated response and policy sources appear here.</p>}

          {result && (
            <>
              <div className="answerCard">
                <p>{result.response}</p>
              </div>
              <div className="meta">
                <span>Mode: {result.mode}</span>
                <span>Temperature: {result.temperature}</span>
                <span>Max tokens: {result.max_tokens}</span>
                <span>{result.fallback_used ? 'Fallback used' : 'Policy match found'}</span>
              </div>

              <h3>Retrieved Documents (Top 3)</h3>
              {result.retrieved_docs.length === 0 && (
                <p className="placeholder">No relevant policy document was retrieved.</p>
              )}

              <div className="docs">
                {result.retrieved_docs.map((doc, index) => (
                  <article key={`${doc.title}-${index}`} className="docCard">
                    <h4>{doc.title}</h4>
                    <p className="score">BM25 score: {doc.score}</p>
                    <p>{doc.content}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </section>

      <footer className="footer">
        <p>Experiment tip: 0.1-0.3 = strict, 0.5 = balanced, 0.7-0.9 = friendlier tone.</p>
      </footer>
    </main>
  )
}

export default App
