import { useState } from "react"

export default function PoemExport() {
  const [apiKey,     setApiKey]     = useState("")
  const [projectId,  setProjectId]  = useState("")
  const [poems,      setPoems]      = useState([])
  const [filter,     setFilter]     = useState("all")
  const [log,        setLog]        = useState("")
  const [error,      setError]      = useState("")
  const [fetched,    setFetched]    = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)

  async function firestoreGet(col) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${col}?key=${apiKey}&pageSize=500`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Firestore error ${res.status}: ${await res.text()}`)
    const data = await res.json()
    return (data.documents || []).map(d => {
      const id = d.name.split("/").pop()
      const fields = d.fields || {}
      const out = { id }
      for (const [k, v] of Object.entries(fields)) {
        if      (v.stringValue  !== undefined) out[k] = v.stringValue
        else if (v.integerValue !== undefined) out[k] = parseInt(v.integerValue)
        else if (v.doubleValue  !== undefined) out[k] = parseFloat(v.doubleValue)
        else if (v.booleanValue !== undefined) out[k] = v.booleanValue
        else if (v.timestampValue !== undefined) out[k] = v.timestampValue
        else out[k] = null
      }
      return out
    })
  }

  async function fetchData() {
    setError(""); setLog(""); setFetched(false)
    if (!projectId.trim() || !apiKey.trim()) { setError("Please fill in both API Key and Project ID."); return }
    setLoading(true)
    try {
      setLog("Fetching poems...")
      const p = await firestoreGet("poems")
      setPoems(p)
      setLog(`Fetched ${p.length} poems. Ready to export.`)
      setFetched(true)
    } catch (e) {
      setError(e.message); setLog("")
    }
    setLoading(false)
  }

  function fmtDate(ts) {
    if (!ts) return "—"
    try { return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }
    catch { return ts }
  }

  const filtered = poems.filter(p => filter === "all" || p.status === filter)

  async function exportDoc() {
    if (!window.docx) { setError("docx library not loaded yet — try again in a moment."); return }
    setExporting(true); setError(""); setLog("Building document...")

    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, AlignmentType } = window.docx

      const gap  = () => new Paragraph({ children: [new TextRun("")] })
      const rule = () => new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "C9A84C", space: 1 } },
        children: [new TextRun("")]
      })

      const children = [
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: "Poetry Competition — Submitted Poems", bold: true })]
        }),
        new Paragraph({
          children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}   |   Total shown: ${filtered.length}`, color: "666666", size: 20 })]
        }),
        gap(), rule(), gap(),
      ]

      filtered.forEach((poem, i) => {
        // Poem number + title
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: `${i + 1}. ${poem.title || "Untitled"}`, bold: true })]
        }))

        // Meta row
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `Author: `, bold: true, size: 20 }),
            new TextRun({ text: poem.userName || poem.userEmail || "—", size: 20 }),
            new TextRun({ text: "    |    ", size: 20, color: "AAAAAA" }),
            new TextRun({ text: `Status: `, bold: true, size: 20 }),
            new TextRun({
              text: poem.status === "approved" ? "✅ Approved" : poem.status === "rejected" ? "❌ Rejected" : "⏳ Pending",
              size: 20,
              color: poem.status === "approved" ? "27AE60" : poem.status === "rejected" ? "C0392B" : "F39C12"
            }),
            new TextRun({ text: "    |    ", size: 20, color: "AAAAAA" }),
            new TextRun({ text: `Submitted: `, bold: true, size: 20 }),
            new TextRun({ text: fmtDate(poem.submittedAt), size: 20 }),
          ]
        }))

        // Judge score if present
        if (poem.judgeScore !== undefined && poem.judgeScore !== null) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: `Judge Score: `, bold: true, size: 20 }),
              new TextRun({ text: `${poem.judgeScore}/100`, size: 20, color: "C9A84C" }),
              ...(poem.votes ? [
                new TextRun({ text: "    |    ", size: 20, color: "AAAAAA" }),
                new TextRun({ text: `Votes: `, bold: true, size: 20 }),
                new TextRun({ text: String(poem.votes), size: 20 }),
              ] : [])
            ]
          }))
        }

        // Genre if present
        if (poem.genre) {
          children.push(new Paragraph({
            children: [
              new TextRun({ text: `Genre: `, bold: true, size: 20 }),
              new TextRun({ text: poem.genre, size: 20, italics: true }),
            ]
          }))
        }

        children.push(gap())

        // Poem body — split by line breaks
        const lines = (poem.poem || "").split("\n")
        lines.forEach(line => {
          children.push(new Paragraph({
            children: [new TextRun({
              text: line || " ",
              size: 22,
              font: "Georgia",
              italics: true,
              color: "222222"
            })],
            spacing: { line: 320 }
          }))
        })

        // Note from poet
        if (poem.note) {
          children.push(gap())
          children.push(new Paragraph({
            children: [new TextRun({ text: "Note from poet: ", bold: true, size: 18, color: "888888" }),
                       new TextRun({ text: poem.note, size: 18, italics: true, color: "888888" })]
          }))
        }

        // Admin note
        if (poem.adminNote) {
          children.push(new Paragraph({
            children: [new TextRun({ text: "Judge's note: ", bold: true, size: 18, color: "888888" }),
                       new TextRun({ text: poem.adminNote, size: 18, italics: true, color: "888888" })]
          }))
        }

        children.push(gap())
        children.push(rule())
        children.push(gap())
      })

      const doc = new Document({
        styles: {
          default: { document: { run: { font: "Arial", size: 22 } } },
          paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 36, bold: true, font: "Arial", color: "1a1a1a" },
              paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 26, bold: true, font: "Arial", color: "C9A84C" },
              paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 } },
          ]
        },
        sections: [{
          properties: {
            page: {
              size: { width: 12240, height: 15840 },
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
          },
          children
        }]
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `poems-export-${filter}-${new Date().toISOString().slice(0, 10)}.docx`
      a.click()
      URL.revokeObjectURL(url)
      setLog(`Downloaded ${filtered.length} poems.`)
    } catch (e) {
      setError("Export failed: " + e.message); setLog("")
    }
    setExporting(false)
  }

  const counts = {
    all:      poems.length,
    pending:  poems.filter(p => p.status === "pending").length,
    approved: poems.filter(p => p.status === "approved").length,
    rejected: poems.filter(p => p.status === "rejected").length,
  }

  const statusColors = { approved: "#27ae60", pending: "#f39c12", rejected: "#c0392b" }

  return (
    <>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/docx/8.5.0/docx.umd.min.js" />
      <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 620, margin: "0 auto", padding: 24, background: "#000", minHeight: "100vh", color: "#fff" }}>

        <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", letterSpacing: "0.15em", fontSize: 18, marginBottom: 6 }}>POEM EXPORT</h2>
        <p style={{ color: "rgba(232,213,163,0.4)", fontSize: 13, marginBottom: 24 }}>Download all submitted poems as a Word document — includes title, author, full poem text, scores, and status.</p>

        {/* Firebase config */}
        <div style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 4, padding: 20, marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", color: "rgba(201,168,76,0.6)", marginBottom: 4 }}>API KEY</label>
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIzaSy..."
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 2, padding: "8px 10px", color: "#fff", fontSize: 13, boxSizing: "border-box", marginBottom: 12 }} />

          <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", color: "rgba(201,168,76,0.6)", marginBottom: 4 }}>PROJECT ID</label>
          <input value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="your-project-id"
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 2, padding: "8px 10px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
        </div>

        <button onClick={fetchData} disabled={loading}
          style={{ width: "100%", padding: 11, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 2, color: "#c9a84c", fontSize: 12, letterSpacing: "0.15em", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginBottom: 16 }}>
          {loading ? "FETCHING..." : "FETCH POEMS"}
        </button>

        {fetched && (
          <>
            {/* Stats + filter */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
              {[["ALL", "all", "#c9a84c"], ["PENDING", "pending", "#f39c12"], ["APPROVED", "approved", "#27ae60"], ["REJECTED", "rejected", "#c0392b"]].map(([label, key, color]) => (
                <button key={key} onClick={() => setFilter(key)}
                  style={{ background: filter === key ? `${color}18` : "rgba(255,255,255,0.03)", border: `1px solid ${filter === key ? color + "60" : "rgba(201,168,76,0.12)"}`, borderRadius: 2, padding: "12px 8px", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color }}>{counts[key]}</div>
                  <div style={{ fontSize: 9, letterSpacing: "0.1em", color: "rgba(201,168,76,0.45)", marginTop: 3 }}>{label}</div>
                </button>
              ))}
            </div>

            {/* Poem list preview */}
            <div style={{ maxHeight: 280, overflowY: "auto", border: "1px solid rgba(201,168,76,0.1)", borderRadius: 2, marginBottom: 16 }}>
              {filtered.map((p, i) => (
                <div key={p.id} style={{ padding: "10px 14px", borderBottom: "1px solid rgba(201,168,76,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{i + 1}. {p.title || "Untitled"}</span>
                    <span style={{ fontSize: 12, color: "rgba(232,213,163,0.4)", marginLeft: 10 }}>{p.userName || p.userEmail || "—"}</span>
                  </div>
                  <span style={{ fontSize: 10, color: statusColors[p.status] || "#888", letterSpacing: "0.08em" }}>
                    {p.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: 24, textAlign: "center", color: "rgba(232,213,163,0.3)", fontSize: 13 }}>No poems in this category.</div>
              )}
            </div>

            <button onClick={exportDoc} disabled={exporting || filtered.length === 0}
              style={{ width: "100%", padding: 11, background: "#c9a84c", border: "none", borderRadius: 2, color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", cursor: (exporting || filtered.length === 0) ? "not-allowed" : "pointer", opacity: (exporting || filtered.length === 0) ? 0.6 : 1 }}>
              {exporting ? "BUILDING DOCUMENT..." : `DOWNLOAD ${filtered.length} POEM${filtered.length !== 1 ? "S" : ""} AS WORD DOC`}
            </button>
          </>
        )}

        {log   && <p style={{ fontSize: 13, color: "rgba(201,168,76,0.6)", marginTop: 10 }}>{log}</p>}
        {error && <p style={{ fontSize: 13, color: "#e74c3c", marginTop: 10 }}>{error}</p>}
      </div>
    </>
  )
}
