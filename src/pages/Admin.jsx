import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, query, orderBy,
  onSnapshot, doc, updateDoc, Timestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLES = {
  pending:  { cls: 'badge-pending',  label: '⏳ Pending'  },
  approved: { cls: 'badge-approved', label: '✅ Approved'  },
  rejected: { cls: 'badge-rejected', label: '❌ Rejected'  },
}

export default function Admin() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [poems,      setPoems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [filter,     setFilter]     = useState('all')
  const [search,     setSearch]     = useState('')
  const [selected,   setSelected]   = useState(null)  // poem being reviewed
  const [adminNote,  setAdminNote]  = useState('')
  const [updating,   setUpdating]   = useState(false)
  const [expanded,   setExpanded]   = useState(null)
  const [judgeScore, setJudgeScore] = useState('')
  const [voteCount,  setVoteCount]  = useState('')

  // Guard — only admin
  useEffect(() => {
    if (!user) { navigate('/'); return }
    if (!isAdmin) { navigate('/'); return }
  }, [user, isAdmin, navigate])

  // Real-time all poems
  useEffect(() => {
    if (!isAdmin) return
    const q = query(collection(db, 'poems'), orderBy('submittedAt', 'desc'))
    const unsub = onSnapshot(
      q,
      snap => {
        setPoems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      err => {
        console.error('Admin snapshot error:', err.code, err.message)
        setLoading(false)
      }
    )
    return () => unsub()
  }, [isAdmin])

  const updateStatus = async (poemId, status) => {
    setUpdating(true)
    try {
      const updateData = {
        status,
        adminNote:  adminNote.trim(),
        reviewedAt: Timestamp.now(),
      }
      if (judgeScore !== '' && !isNaN(Number(judgeScore))) {
        const score = Math.min(100, Math.max(0, Number(judgeScore)))
        updateData.judgeScore = score
      }
      if (voteCount !== '' && !isNaN(Number(voteCount))) {
        updateData.votes = Math.max(0, parseInt(voteCount))
      }
      await updateDoc(doc(db, 'poems', poemId), updateData)
      setSelected(null)
      setAdminNote('')
      setJudgeScore('')
      setVoteCount('')
    } catch (err) {
      alert('Update failed: ' + err.message)
    } finally {
      setUpdating(false)
    }
  }

  const filtered = poems
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => {
      if (!search) return true
      const s = search.toLowerCase()
      return p.title?.toLowerCase().includes(s) ||
             p.userName?.toLowerCase().includes(s) ||
             p.userEmail?.toLowerCase().includes(s)
    })

  const counts = {
    all:      poems.length,
    pending:  poems.filter(p => p.status === 'pending').length,
    approved: poems.filter(p => p.status === 'approved').length,
    rejected: poems.filter(p => p.status === 'rejected').length,
  }

  if (!isAdmin) return null

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: 88 }}>
      {/* Header */}
      <div style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 60%)',
        borderBottom: '1px solid rgba(201,168,76,0.12)',
        padding: '36px 24px 28px',
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span style={{ fontSize: 24 }}>👑</span>
            <div>
              <p className="font-accent text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.5)' }}>ADMIN PANEL</p>
              <h1 className="font-display text-3xl font-bold" style={{ color: '#fff' }}>Poem Submissions</h1>
            </div>
          </div>
          <p className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.4)', marginLeft: 44 }}>
            Logged in as <strong style={{ color: '#c9a84c' }}>{user?.email}</strong>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { key: 'all',      label: 'Total',    color: '#c9a84c' },
            { key: 'pending',  label: 'Pending',  color: '#ffc107' },
            { key: 'approved', label: 'Approved', color: '#27ae60' },
            { key: 'rejected', label: 'Rejected', color: '#c0392b' },
          ].map(({ key, label, color }) => (
            <button key={key} onClick={() => setFilter(key)}
              style={{
                background: filter === key ? `${color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${filter === key ? color + '50' : 'rgba(201,168,76,0.1)'}`,
                borderRadius: 2, padding: '16px 20px', cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.2s',
              }}>
              <div className="font-display text-3xl font-bold" style={{ color }}>{counts[key]}</div>
              <div className="font-accent text-xs tracking-widest mt-1" style={{ color: 'rgba(232,213,163,0.4)' }}>
                {label.toUpperCase()}
              </div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <input className="input-gold" type="text" placeholder="Search by title, poet name, or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 400 }} />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(201,168,76,0.4)' }}>
            <div className="font-accent text-xs tracking-widest">LOADING SUBMISSIONS...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, border: '1px solid rgba(201,168,76,0.1)', borderRadius: 2 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p className="font-body text-base" style={{ color: 'rgba(232,213,163,0.4)' }}>
              No submissions found for this filter.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(poem => {
              const st = STATUS_STYLES[poem.status] || STATUS_STYLES.pending
              const isExpanded = expanded === poem.id
              const isReviewing = selected?.id === poem.id

              return (
                <div key={poem.id} className="card" style={{ overflow: 'hidden' }}>
                  {/* Top bar */}
                  <div style={{ padding: '20px 24px' }}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-display text-lg font-bold" style={{ color: '#fff' }}>{poem.title}</h3>
                          {poem.genre && (
                            <span className="font-accent text-xs px-2 py-0.5" style={{ color: 'rgba(201,168,76,0.5)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2 }}>
                              {poem.genre}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 mt-1 flex-wrap">
                          <span className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.5)' }}>
                            👤 {poem.userName}
                          </span>
                          <span className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.35)' }}>
                            {poem.userEmail}
                          </span>
                          <span className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.35)' }}>
                            {poem.submittedAt?.toDate?.()?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || '—'}
                          </span>
                          <span className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.35)' }}>
                            {poem.poem?.split('\n').filter(l => l.trim()).length} lines
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-accent text-xs tracking-widest px-3 py-1.5 rounded-sm ${st.cls}`}>
                          {st.label}
                        </span>
                        <button onClick={() => setExpanded(isExpanded ? null : poem.id)}
                          style={{ background: 'none', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 2, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.1em', color: '#c9a84c' }}>
                          {isExpanded ? 'HIDE' : 'READ'}
                        </button>
                        {poem.status === 'pending' && (
                          <button onClick={() => { setSelected(poem); setAdminNote('') }}
                            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 2, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.1em', color: '#c9a84c' }}>
                            REVIEW
                          </button>
                        )}
                        {poem.status !== 'pending' && (
                          <button onClick={() => { setSelected(poem); setAdminNote(poem.adminNote || ''); setJudgeScore(poem.judgeScore !== undefined ? String(poem.judgeScore) : ''); setVoteCount(poem.votes !== undefined ? String(poem.votes) : '') }}
                            style={{ background: 'none', border: '1px solid rgba(232,213,163,0.1)', borderRadius: 2, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(232,213,163,0.4)' }}>
                            CHANGE
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded poem text */}
                  {isExpanded && (
                    <div style={{ borderTop: '1px solid rgba(201,168,76,0.08)', padding: '20px 24px', background: 'rgba(201,168,76,0.02)' }}>
                      <p className="font-body text-base" style={{ color: 'rgba(232,213,163,0.7)', whiteSpace: 'pre-line', lineHeight: 2, fontStyle: 'italic' }}>
                        {poem.poem}
                      </p>
                      {poem.note && (
                        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(201,168,76,0.07)' }}>
                          <p className="font-accent text-xs tracking-widest mb-1" style={{ color: 'rgba(201,168,76,0.4)' }}>NOTE FROM POET</p>
                          <p className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.5)', fontStyle: 'italic' }}>{poem.note}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Review panel */}
                  {isReviewing && (
                    <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', padding: '20px 24px', background: 'rgba(0,0,0,0.5)' }}>
                      <p className="font-accent text-xs tracking-widest mb-3" style={{ color: '#c9a84c' }}>
                        REVIEWING: "{poem.title}"
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="label-gold">Note to Poet (optional)</label>
                          <textarea className="input-gold" rows={3}
                            placeholder="e.g. Thank you for submitting..."
                            value={adminNote}
                            onChange={e => setAdminNote(e.target.value)}
                            style={{ resize: 'vertical' }}
                          />
                        </div>
                        <div>
                          <label className="label-gold">Judge Score (0–100)</label>
                          <input className="input-gold" type="number" min="0" max="100"
                            placeholder="e.g. 85"
                            value={judgeScore}
                            onChange={e => setJudgeScore(e.target.value)}
                          />
                          <p style={{ fontFamily:'EB Garamond,serif', fontSize:12, color:'rgba(232,213,163,0.3)', marginTop:6 }}>
                            Counts as 70% of final score
                          </p>
                        </div>
                        <div>
                          <label className="label-gold">VoteNaija Votes</label>
                          <input className="input-gold" type="number" min="0"
                            placeholder="e.g. 320"
                            value={voteCount}
                            onChange={e => setVoteCount(e.target.value)}
                          />
                          <p style={{ fontFamily:'EB Garamond,serif', fontSize:12, color:'rgba(232,213,163,0.3)', marginTop:6 }}>
                            Counts as 30% of final score (normalised against highest votes)
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => updateStatus(poem.id, 'approved')}
                          disabled={updating}
                          style={{ background: '#27ae60', border: 'none', color: '#fff', padding: '10px 24px', fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.15em', cursor: 'pointer', opacity: updating ? 0.6 : 1, borderRadius: 2 }}>
                          ✅ APPROVE
                        </button>
                        <button
                          onClick={() => updateStatus(poem.id, 'rejected')}
                          disabled={updating}
                          style={{ background: '#c0392b', border: 'none', color: '#fff', padding: '10px 24px', fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.15em', cursor: 'pointer', opacity: updating ? 0.6 : 1, borderRadius: 2 }}>
                          ❌ REJECT
                        </button>
                        <button
                          onClick={() => { setSelected(null); setAdminNote('') }}
                          style={{ background: 'none', border: '1px solid rgba(232,213,163,0.2)', color: 'rgba(232,213,163,0.5)', padding: '10px 20px', fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.15em', cursor: 'pointer', borderRadius: 2 }}>
                          CANCEL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
