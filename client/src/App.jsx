import { useState, useCallback } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { oneDark } from '@codemirror/theme-one-dark'
import './App.css'

// ─── Default code samples with intentional errors ────────────────────────────
const DEFAULT_CODE = {
  html: `<!DOCTYPE html>
<html>
<head>
  <title>Mi Página Web</title>
</head>
<body>
  <div class="container">
    <h1>Bienvenido</h1>
    <p>Este es un párrafo con un <a href="#">enlace
    <div>
      <img src="foto.jpg">
      <span>Texto sin cerrar
    </div>
  </div>
</body>
</html>`,

  css: `/* Estilos principales */
.container {
  width: 100%
  max-width: 1200px;
  margin: 0 auto
  padding: 20px;
  color: red !important;
  color: blue;
}

.heading {
  font-size: 24px;
  font-size: 2rem;
  background: red;
}`,

  javascript: `var nombre = "Juan"
var nombre = "Pedro"

function saludar() {
  console.log("Hola " + nombre)
  var resultado = 1 == "1"
  
  if (resultado == true) {
    alert("Son iguales")
  }
  
  for (i = 0; i < 10; i++) {
    console.log(i)
  }
}

saludar()`,
}

const LANGUAGES = [
  { id: 'html', label: 'HTML', icon: '◈' },
  { id: 'css', label: 'CSS', icon: '◉' },
  { id: 'javascript', label: 'JavaScript', icon: '◆' },
]

function getLangExtension(lang) {
  if (lang === 'html') return [html()]
  if (lang === 'css') return [css()]
  return [javascript({ jsx: false })]
}

// ─── Score Ring Component ─────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const color =
    score >= 80 ? '#00ff41' : score >= 50 ? '#ffaa00' : '#ff3355'
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="score-ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#1e2530" strokeWidth="5" />
        <circle
          cx="36" cy="36" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 36 36)"
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="score-center">
        <span className="score-num" style={{ color }}>{score}</span>
        <span className="score-sub">/100</span>
      </div>
    </div>
  )
}

// ─── Collapsible Result Card ──────────────────────────────────────────────────
function ResultCard({ item, variant }) {
  const [open, setOpen] = useState(false)

  const iconMap = { error: '✗', warning: '⚠', suggestion: '◈' }
  const icon = iconMap[variant] || '▸'

  return (
    <div className={`rcard rcard--${variant}`} onClick={() => setOpen(o => !o)}>
      <div className="rcard__header">
        <span className="rcard__icon">{icon}</span>
        <div className="rcard__meta">
          {item.line != null && (
            <span className="rcard__line">línea {item.line}</span>
          )}
          <span className="rcard__msg">{item.message}</span>
        </div>
        <span className="rcard__toggle">{open ? '▴' : '▾'}</span>
      </div>

      {open && (
        <div className="rcard__body">
          {item.explanation && (
            <p className="rcard__explanation">{item.explanation}</p>
          )}
          {item.code && (
            <code className="rcard__snippet">{item.code}</code>
          )}
          {/* Suggestion diff */}
          {item.before && (
            <div className="diff">
              <div className="diff__block diff__block--before">
                <span className="diff__label">Antes</span>
                <code>{item.before}</code>
              </div>
              <div className="diff__block diff__block--after">
                <span className="diff__label">Después</span>
                <code>{item.after}</code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, count, variant, children }) {
  if (!count) return null
  return (
    <div className="section">
      <div className={`section__title section__title--${variant}`}>
        <span>{title}</span>
        <span className="section__count">{count}</span>
      </div>
      {children}
    </div>
  )
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [language, setLanguage] = useState('html')
  const [code, setCode] = useState(DEFAULT_CODE.html)
  const [results, setResults] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleLangChange = (lang) => {
    setLanguage(lang)
    setCode(DEFAULT_CODE[lang])
    setResults(null)
    setStatus('idle')
  }

  const analyze = async () => {
    if (!code.trim() || status === 'loading') return
    setStatus('loading')
    setResults(null)
    setErrorMsg('')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error del servidor')
      setResults(data)
      setStatus('idle')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  const lineCount = code.split('\n').length

  return (
    <div className="app">
      <div className="scanlines" aria-hidden="true" />

      {/* ── HEADER ── */}
      <header className="header">
        <div className="logo">
          <span className="logo__bracket">[</span>
          <span className="logo__text">CODE</span>
          <span className="logo__accent">SCAN</span>
          <span className="logo__bracket">]</span>
        </div>
        <p className="header__tag">
          Detector de errores con IA&nbsp;&nbsp;·&nbsp;&nbsp;HTML · CSS · JS
        </p>
      </header>

      {/* ── MAIN ── */}
      <main className="workspace">

        {/* LEFT – Editor */}
        <section className="pane pane--editor">

          {/* Language tabs */}
          <div className="pane__top">
            <nav className="lang-tabs">
              {LANGUAGES.map(({ id, label, icon }) => (
                <button
                  key={id}
                  className={`lang-tab ${language === id ? 'lang-tab--active' : ''}`}
                  onClick={() => handleLangChange(id)}
                >
                  <span className="lang-tab__icon">{icon}</span>
                  {label}
                </button>
              ))}
            </nav>
            <span className="line-info">{lineCount} líneas</span>
          </div>

          {/* CodeMirror */}
          <div className="editor-wrap">
            <CodeMirror
              value={code}
              height="100%"
              theme={oneDark}
              extensions={getLangExtension(language)}
              onChange={useCallback(val => setCode(val), [])}
              basicSetup={{
                lineNumbers: true,
                foldGutter: false,
                dropCursor: false,
                allowMultipleSelections: false,
                indentOnInput: true,
                highlightActiveLine: true,
                highlightActiveLineGutter: true,
                autocompletion: true,
              }}
            />
          </div>

          {/* Analyze bar */}
          <div className="analyze-bar">
            <button
              className={`btn-analyze ${status === 'loading' ? 'btn-analyze--loading' : ''}`}
              onClick={analyze}
              disabled={status === 'loading' || !code.trim()}
            >
              {status === 'loading' ? (
                <><span className="spin" />Analizando...</>
              ) : (
                <><span>▶</span>Analizar Código</>
              )}
            </button>
            <span className="powered">Powered by Claude AI</span>
          </div>
        </section>

        {/* RIGHT – Results */}
        <section className="pane pane--results">

          {/* IDLE */}
          {status === 'idle' && !results && (
            <div className="state-empty">
              <div className="state-empty__glyph">⟨/⟩</div>
              <p>Escribe o pega tu código</p>
              <p className="state-empty__hint">y presiona <em>Analizar Código</em></p>
            </div>
          )}

          {/* LOADING */}
          {status === 'loading' && (
            <div className="state-loading">
              <div className="pulse-bars">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="pulse-bar" style={{ animationDelay: `${i * 0.12}s` }} />
                ))}
              </div>
              <p>Analizando con inteligencia artificial...</p>
              <p className="state-loading__sub">Esto puede tomar unos segundos</p>
            </div>
          )}

          {/* ERROR */}
          {status === 'error' && (
            <div className="state-error">
              <div className="state-error__icon">!</div>
              <p>{errorMsg}</p>
              <button className="btn-retry" onClick={analyze}>Reintentar</button>
            </div>
          )}

          {/* RESULTS */}
          {results && (
            <div className="results">

              {/* Score header */}
              <div className="results__score">
                <ScoreRing score={results.score ?? 0} />
                <div className="results__score-info">
                  <p className="results__summary">{results.summary}</p>
                  <div className="badge-row">
                    <span className="badge badge--error">{results.errors?.length ?? 0} errores</span>
                    <span className="badge badge--warning">{results.warnings?.length ?? 0} advertencias</span>
                    <span className="badge badge--suggestion">{results.suggestions?.length ?? 0} sugerencias</span>
                  </div>
                </div>
              </div>

              {/* Errors */}
              <Section
                title="✗  Errores"
                count={results.errors?.length}
                variant="error"
              >
                {results.errors?.map((e, i) => (
                  <ResultCard key={i} item={e} variant="error" />
                ))}
              </Section>

              {/* Warnings */}
              <Section
                title="⚠  Advertencias"
                count={results.warnings?.length}
                variant="warning"
              >
                {results.warnings?.map((w, i) => (
                  <ResultCard key={i} item={w} variant="warning" />
                ))}
              </Section>

              {/* Suggestions */}
              <Section
                title="◈  Sugerencias"
                count={results.suggestions?.length}
                variant="suggestion"
              >
                {results.suggestions?.map((s, i) => (
                  <ResultCard key={i} item={s} variant="suggestion" />
                ))}
              </Section>

              {/* Best Practices */}
              {results.best_practices?.length > 0 && (
                <div className="section">
                  <div className="section__title section__title--practice">
                    <span>★  Buenas Prácticas</span>
                    <span className="section__count">{results.best_practices.length}</span>
                  </div>
                  {results.best_practices.map((p, i) => (
                    <div key={i} className="practice-item">
                      <span className="practice-item__dot">▸</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Perfect code */}
              {!results.errors?.length && !results.warnings?.length && results.score >= 85 && (
                <div className="perfect">
                  <span className="perfect__icon">✓</span>
                  <p>¡Excelente código! No se encontraron problemas significativos.</p>
                </div>
              )}

            </div>
          )}
        </section>
      </main>
    </div>
  )
}
