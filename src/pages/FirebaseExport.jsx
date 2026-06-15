import { useState } from "react";

export default function FirebaseExport() {
  const [apiKey, setApiKey] = useState("");
  const [projectId, setProjectId] = useState("");
  const [users, setUsers] = useState([]);
  const [poems, setPoems] = useState([]);
  const [log, setLog] = useState("");
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function firestoreGet(col) {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${col}?key=${apiKey}&pageSize=500`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return (data.documents || []).map((d) => {
      const id = d.name.split("/").pop();
      const fields = d.fields || {};
      const out = { id };
      for (const [k, v] of Object.entries(fields)) {
        if (v.stringValue !== undefined) out[k] = v.stringValue;
        else if (v.integerValue !== undefined) out[k] = parseInt(v.integerValue);
        else if (v.doubleValue !== undefined) out[k] = parseFloat(v.doubleValue);
        else if (v.booleanValue !== undefined) out[k] = v.booleanValue;
        else if (v.timestampValue !== undefined) out[k] = v.timestampValue;
        else out[k] = null;
      }
      return out;
    });
  }

  async function fetchData() {
    setError(""); setLog(""); setFetched(false);
    if (!projectId.trim() || !apiKey.trim()) {
      setError("Please fill in both API Key and Project ID.");
      return;
    }
    setLoading(true);
    try {
      setLog("Fetching users...");
      const u = await firestoreGet("users");
      setLog(`Got ${u.length} users. Fetching poems...`);
      const p = await firestoreGet("poems");
      setUsers(u); setPoems(p);
      setLog(`Ready — ${u.length} users, ${p.length} poems fetched.`);
      setFetched(true);
    } catch (e) {
      setError(e.message); setLog("");
    }
    setLoading(false);
  }

  function fmtDate(ts) {
    if (!ts) return "—";
    try { return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
    catch { return ts; }
  }

  async function exportDoc() {
    setExporting(true); setError(""); setLog("Building document...");
    try {
      const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
              WidthType, BorderStyle, ShadingType, HeadingLevel } = window.docx;

      const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
      const borders = { top: border, bottom: border, left: border, right: border };
      const margins = { top: 80, bottom: 80, left: 120, right: 120 };

      const gap = () => new Paragraph({ children: [new TextRun("")] });
      const hdr = (text, level) => new Paragraph({ heading: level, children: [new TextRun({ text, bold: true })] });

      function makeTable(headers, rows, widths) {
        return new Table({
          width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
          columnWidths: widths,
          rows: [
            new TableRow({
              tableHeader: true,
              children: headers.map((h, i) => new TableCell({
                borders, margins, width: { size: widths[i], type: WidthType.DXA },
                shading: { fill: "D5D8DC", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })]
              }))
            }),
            ...rows.map(row => new TableRow({
              children: row.map((cell, i) => new TableCell({
                borders, margins, width: { size: widths[i], type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: String(cell ?? "—"), size: 18 })] })]
              }))
            }))
          ]
        });
      }

      const userMap = Object.fromEntries(users.map(u => [u.id, u]));

      const children = [
        hdr("Poetry Competition — Data Export", HeadingLevel.HEADING_1),
        new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, color: "666666", size: 20 })] }),
        gap(),
        new Paragraph({ children: [new TextRun({ text: `Users: ${users.length}   |   Poems: ${poems.length}   |   Approved: ${poems.filter(p => p.status === "approved").length}`, size: 20 })] }),
        gap(), gap(),

        hdr("1. All Users", HeadingLevel.HEADING_2), gap(),
        makeTable(
          ["#", "Name", "Email", "Phone", "State / Region", "Joined"],
          users.map((u, i) => [i + 1, u.displayName || u.name || "—", u.email || "—", u.phone || u.phoneNumber || "—", u.state || u.region || "—", fmtDate(u.createdAt || u.joinedAt)]),
          [360, 1800, 2160, 1300, 1300, 1240]
        ),
        gap(), gap(),

        hdr("2. All Poems", HeadingLevel.HEADING_2), gap(),
        makeTable(
          ["#", "Title", "Author", "Genre", "Status", "Votes", "Submitted"],
          poems.map((p, i) => [i + 1, p.title || "—", p.userName || userMap[p.userId]?.displayName || p.userEmail || "—", p.genre || "—", p.status || "—", p.votes ?? 0, fmtDate(p.submittedAt)]),
          [360, 1700, 1700, 1100, 1000, 700, 1500]
        ),
        gap(), gap(),

        hdr("3. Users with Their Poems", HeadingLevel.HEADING_2),
      ];

      users.forEach((u, ui) => {
        const uPoems = poems.filter(p => p.userId === u.id);
        children.push(gap());
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${ui + 1}. ${u.displayName || u.name || u.email}`, bold: true, size: 22 }),
            new TextRun({ text: `   ${u.email || ""}${u.phone ? "  ·  " + u.phone : ""}`, size: 20, color: "666666" })
          ]
        }));
        if (uPoems.length === 0) {
          children.push(new Paragraph({ children: [new TextRun({ text: "No poems submitted.", size: 18, color: "999999", italics: true })] }));
        } else {
          uPoems.forEach((p, pi) => {
            children.push(new Paragraph({
              indent: { left: 360 },
              children: [
                new TextRun({ text: `${pi + 1}. ${p.title || "Untitled"}`, bold: true, size: 20 }),
                new TextRun({ text: `  [${p.status}]  ${p.votes ?? 0} votes  ·  ${fmtDate(p.submittedAt)}`, size: 18, color: "666666" })
              ]
            }));
            if (p.genre) children.push(new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: `Genre: ${p.genre}`, size: 18, color: "888888", italics: true })] }));
          });
        }
      });

      const doc = new Document({
        styles: {
          default: { document: { run: { font: "Arial", size: 22 } } },
          paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Arial" }, paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Arial" }, paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 1 } },
          ]
        },
        sections: [{
          properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
          children
        }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `competition-export-${new Date().toISOString().slice(0, 10)}.docx`;
      a.click(); URL.revokeObjectURL(url);
      setLog("Downloaded successfully.");
    } catch (e) {
      setError("Export failed: " + e.message); setLog("");
    }
    setExporting(false);
  }

  const approved = poems.filter(p => p.status === "approved").length;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 600, margin: "0 auto", padding: 24, background: "#000", minHeight: "100vh", color: "#fff" }}>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/docx/8.5.0/docx.umd.min.js" />

      <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", letterSpacing: "0.15em", fontSize: 18, marginBottom: 8 }}>DATA EXPORT</h2>
      <p style={{ color: "rgba(232,213,163,0.5)", fontSize: 13, marginBottom: 24 }}>Enter your Firebase config to fetch and export all users and poems.</p>

      <div style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 4, padding: 20, marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", color: "rgba(201,168,76,0.6)", marginBottom: 4 }}>API KEY</label>
        <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIzaSy..." style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 2, padding: "8px 10px", color: "#fff", fontSize: 13, boxSizing: "border-box", marginBottom: 12 }} />

        <label style={{ display: "block", fontSize: 11, letterSpacing: "0.12em", color: "rgba(201,168,76,0.6)", marginBottom: 4 }}>PROJECT ID</label>
        <input value={projectId} onChange={e => setProjectId(e.target.value)} placeholder="your-project-id" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 2, padding: "8px 10px", color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
      </div>

      <button onClick={fetchData} disabled={loading} style={{ width: "100%", padding: "11px", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.4)", borderRadius: 2, color: "#c9a84c", fontSize: 12, letterSpacing: "0.15em", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, marginBottom: 8 }}>
        {loading ? "FETCHING..." : "FETCH DATA"}
      </button>

      {fetched && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, margin: "16px 0" }}>
            {[["USERS", users.length, "#c9a84c"], ["POEMS", poems.length, "#fff"], ["APPROVED", approved, "#27ae60"]].map(([label, val, color]) => (
              <div key={label} style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.15)", borderRadius: 2, padding: "14px 10px", textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
                <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(201,168,76,0.5)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <button onClick={exportDoc} disabled={exporting} style={{ width: "100%", padding: "11px", background: "#c9a84c", border: "none", borderRadius: 2, color: "#000", fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", cursor: exporting ? "not-allowed" : "pointer", opacity: exporting ? 0.6 : 1 }}>
            {exporting ? "BUILDING DOCUMENT..." : "DOWNLOAD WORD DOCUMENT"}
          </button>
        </>
      )}

      {log && <p style={{ fontSize: 13, color: "rgba(201,168,76,0.6)", marginTop: 10 }}>{log}</p>}
      {error && <p style={{ fontSize: 13, color: "#e74c3c", marginTop: 10 }}>{error}</p>}
    </div>
  );
}
