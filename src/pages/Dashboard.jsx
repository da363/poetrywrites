import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, query, where,
  orderBy, onSnapshot, doc, getDoc
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLES = {
  pending:  { cls: 'badge-pending',  label: '⏳ Pending Review' },
  approved: { cls: 'badge-approved', label: '✅ Approved' },
  rejected: { cls: 'badge-rejected', label: '❌ Not Selected' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [poems,       setPoems]       = useState([])
  const [allPoems,    setAllPoems]    = useState([]) // all approved poems for ranking
  const [loading,     setLoading]     = useState(true)
  const [profile,     setProfile]     = useState(null)

  // Redirect if not logged in
  useEffect(() => { if (!user) navigate('/') }, [user, navigate])

  // Load profile
  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setProfile(snap.data())
    })
  }, [user])

  // Real-time listener for this user's poems
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'poems'),
      where('userId', '==', user.uid),
      orderBy('submittedAt', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setPoems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    }, err => {
      console.error('Firestore snapshot error:', err)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  // Real-time listener for ALL approved poems (to compute rank)
  useEffect(() => {
    const q = query(
      collection(db, 'poems'),
      where('status', '==', 'approved'),
      orderBy('votes', 'desc')
    )
    const unsub = onSnapshot(q, snap => {
      setAllPoems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  // Compute rank for a given poem id among all approved poems sorted by votes
  const getRank = (poemId) => {
    const idx = allPoems.findIndex(p => p.id === poemId)
    return idx === -1 ? null : idx + 1
  }

  const totalVotes = poems.reduce((sum, p) => sum + (p.votes || 0), 0)
  const approvedPoems = poems.filter(p => p.status === 'approved')

  if (!user) return null

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: 88 }}>

      {/* Header */}
      <div style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)',
        borderBottom: '1px solid rgba(201,168,76,0.1)',
        padding: '40px 24px 32px',
      }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {(profile?.photoURL || user.photoURL)
              ? <img src={profile?.photoURL || user.photoURL} alt="" style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(201,168,76,0.4)', objectFit: 'cover', boxShadow: '0 0 20px rgba(201,168,76,0.3)' }} />
              : <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '2px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond,serif', fontSize: 22, color: '#c9a84c', fontWeight: 700 }}>
                  {(profile?.displayName || user.displayName)?.[0] || 'U'}
                </div>
            }
            <div>
              <p className="font-accent text-xs tracking-widest mb-1" style={{ color: 'rgba(201,168,76,0.5)' }}>WELCOME BACK</p>
              <h1 className="font-display text-2xl font-bold" style={{ color: '#fff' }}>{profile?.displayName || user.displayName}</h1>
              <p className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.4)' }}>{user.email}</p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="flex gap-3 flex-wrap">
            <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2 }}>
              <div className="font-display text-2xl font-bold" style={{ color: '#c9a84c' }}>{totalVotes}</div>
              <div className="font-accent text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.4)' }}>TOTAL VOTES</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2 }}>
              <div className="font-display text-2xl font-bold" style={{ color: '#27ae60' }}>{approvedPoems.length}</div>
              <div className="font-accent text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.4)' }}>APPROVED</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2 }}>
              <div className="font-display text-2xl font-bold" style={{ color: '#fff' }}>{allPoems.length}</div>
              <div className="font-accent text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.4)' }}>COMPETING</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Submissions closed notice */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2, marginBottom: 32 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <p className="font-accent text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.5)' }}>
            SUBMISSIONS ARE NOW CLOSED — VOTING IS LIVE
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(201,168,76,0.4)' }}>
            <div className="font-accent text-xs tracking-widest">LOADING YOUR SUBMISSIONS...</div>
          </div>
        ) : poems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, border: '1px solid rgba(201,168,76,0.1)', borderRadius: 2 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <h3 className="font-display text-2xl font-bold mb-3" style={{ color: '#fff' }}>No submissions found</h3>
            <p className="font-body text-base" style={{ color: 'rgba(232,213,163,0.5)' }}>
              You did not submit any poems for this competition.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {poems.map(poem => {
              const st = STATUS_STYLES[poem.status] || STATUS_STYLES.pending
              const rank = poem.status === 'approved' ? getRank(poem.id) : null
              const votes = poem.votes || 0

              return (
                <div key={poem.id} className="card" style={{ padding: '28px 32px' }}>

                  {/* Title + status */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                    <div>
                      <h3 className="font-display text-xl font-bold mb-1" style={{ color: '#fff' }}>{poem.title}</h3>
                      {poem.genre && (
                        <span className="font-accent text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.5)' }}>{poem.genre}</span>
                      )}
                    </div>
                    <span className={`font-accent text-xs tracking-widest px-3 py-1.5 rounded-sm ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>

                  {/* Votes + Rank (approved only) */}
                  {poem.status === 'approved' ? (
                    <div className="flex gap-4 flex-wrap mb-6">

                      {/* Votes */}
                      <div style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: '20px 16px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 2 }}>
                        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 40, fontWeight: 700, color: '#c9a84c', lineHeight: 1 }}>
                          {votes}
                        </div>
                        <div className="font-accent text-xs tracking-widest mt-2" style={{ color: 'rgba(201,168,76,0.5)' }}>
                          VOTES
                        </div>
                      </div>

                      {/* Rank */}
                      <div style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: '20px 16px', background: rank === 1 ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.05)', border: `1px solid ${rank === 1 ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)'}`, borderRadius: 2 }}>
                        <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 40, fontWeight: 700, color: rank === 1 ? '#f0d080' : '#fff', lineHeight: 1 }}>
                          {rank ? `#${rank}` : '—'}
                        </div>
                        <div className="font-accent text-xs tracking-widest mt-2" style={{ color: 'rgba(201,168,76,0.5)' }}>
                          {rank === 1 ? '🏆 LEADING' : `OF ${allPoems.length}`}
                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Not approved — no rank/votes to show */
                    <div style={{ padding: '16px 20px', background: 'rgba(201,168,76,0.03)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: 2, marginBottom: 16 }}>
                      <p className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.4)' }}>
                        {poem.status === 'pending'
                          ? 'Your poem is awaiting review. Votes and rank will appear once it is approved.'
                          : 'This poem was not selected for the competition.'}
                      </p>
                    </div>
                  )}

                  {/* Judge score (if set) */}
                  {poem.status === 'approved' && poem.judgeScore > 0 && (
                    <div style={{ padding: '16px 20px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 2, marginBottom: 16 }}>
                      <p className="font-accent text-xs tracking-widest mb-3" style={{ color: 'rgba(201,168,76,0.5)' }}>JUDGE'S SCORE</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="5" />
                            <circle cx="32" cy="32" r="26" fill="none" stroke="#c9a84c" strokeWidth="5"
                              strokeDasharray={`${2 * Math.PI * 26}`}
                              strokeDashoffset={`${2 * Math.PI * 26 * (1 - (poem.judgeScore || 0) / 100)}`}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 1s ease' }}
                            />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 16, color: '#c9a84c' }}>{poem.judgeScore}</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                            {poem.judgeScore >= 85 ? 'Outstanding' : poem.judgeScore >= 70 ? 'Excellent' : poem.judgeScore >= 55 ? 'Good' : 'Developing'}
                          </p>
                          <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 13, color: 'rgba(232,213,163,0.4)' }}>
                            out of 100 · counts as 70% of final score
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Judge review note */}
                  {poem.status === 'approved' && poem.adminNote && (
                    <div style={{ padding: '14px 18px', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2, marginBottom: 16 }}>
                      <p className="font-accent text-xs tracking-widest mb-2" style={{ color: 'rgba(201,168,76,0.5)' }}>JUDGE'S REVIEW</p>
                      <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 16, color: 'rgba(232,213,163,0.7)', lineHeight: 1.8, fontStyle: 'italic' }}>"{poem.adminNote}"</p>
                    </div>
                  )}

                  {/* Rejection note */}
                  {poem.status === 'rejected' && poem.adminNote && (
                    <div style={{ padding: '10px 14px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 2 }}>
                      <p className="font-accent text-xs tracking-widest mb-1" style={{ color: 'rgba(192,57,43,0.7)' }}>NOTE FROM REVIEWER</p>
                      <p className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.6)' }}>{poem.adminNote}</p>
                    </div>
                  )}

                  {/* Submitted date */}
                  <div style={{ marginTop: 12 }}>
                    <span className="font-accent text-xs" style={{ color: 'rgba(201,168,76,0.3)' }}>
                      Submitted: {poem.submittedAt?.toDate?.()?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || '—'}
                    </span>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
