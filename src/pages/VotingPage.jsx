import { useState, useEffect, useRef } from 'react'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const VOTENAIJA_LINK  = 'https://poetrywrites-rising-voices.votenaija.ng'
const VOTING_DEADLINE = new Date('2026-06-28T23:59:59+01:00')

const PACKAGES = [
  { id: 'bronze', label: 'Bronze', votes: 10,  amount: 500,  color: '#CD7F32', glow: 'rgba(205,127,50,0.3)',  icon: '🥉' },
  { id: 'silver', label: 'Silver', votes: 30,  amount: 1500, color: '#C0C0C0', glow: 'rgba(192,192,192,0.3)', icon: '🥈' },
  { id: 'gold',   label: 'Gold',   votes: 100, amount: 5000, color: '#FFD700', glow: 'rgba(255,215,0,0.4)',   icon: '🥇' },
]

function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.07 }
    )
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  })
}

export default function VotingPage() {
  useReveal()
  const { user, signInWithGoogle } = useAuth()
  const [poems,    setPoems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)
  const [tab,      setTab]      = useState('vote')
  const barRef = useRef(null)
  const [timeLeft, setTimeLeft] = useState(null)

  // Countdown timer
  useEffect(() => {
    function calc() {
      const diff = VOTING_DEADLINE - new Date()
      if (diff <= 0) { setTimeLeft(null); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft({ d, h, m, s })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  const votingOpen = timeLeft !== null

  // Scroll progress
  useEffect(() => {
    const update = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
      if (barRef.current) barRef.current.style.width = pct + '%'
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'poems'),
      where('status', '==', 'approved'),
      orderBy('votes', 'desc')
    )
    const unsub = onSnapshot(q,
      snap => { setPoems(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) },
      err  => { console.error('Voting snapshot error:', err); setLoading(false) }
    )
    return () => unsub()
  }, [])

  // Leaderboard: 70% judge score + 30% vote score
  const leaderboard = [...poems]
    .map(p => {
      const maxVotes   = Math.max(...poems.map(x => x.votes || 0), 1)
      const voteScore  = ((p.votes || 0) / maxVotes) * 100
      const judgeScore = p.judgeScore || 0
      const total      = (judgeScore * 0.7 + voteScore * 0.3).toFixed(1)
      return { ...p, voteScore: voteScore.toFixed(1), total }
    })
    .sort((a, b) => b.total - a.total)

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingTop: 80 }}>
      {/* Scroll progress bar */}
      <div ref={barRef} style={{ position: 'fixed', top: 0, left: 0, height: 2, background: 'linear-gradient(90deg,#c9a84c,#f0d080)', zIndex: 9999, width: '0%', boxShadow: '0 0 8px rgba(201,168,76,0.6)', transition: 'none' }} />

      {/* Header */}
      <div style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 65%)', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '60px 24px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {[700, 460, 260].map((s, i) => (
          <div key={s} style={{ position: 'absolute', width: s, height: s, border: '1px solid rgba(201,168,76,0.04)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: `rotateSlow ${20 + i * 8}s linear infinite${i % 2 ? ' reverse' : ''}`, pointerEvents: 'none' }} />
        ))}
        <div className="reveal" style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.35em', color: '#c9a84c', marginBottom: 12 }}>COMMUNITY ENGAGEMENT</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 'clamp(36px,7vw,68px)', color: '#fff', marginBottom: 10 }}>
            Vote & <span className="gold-text" style={{ fontStyle: 'italic' }}>Leaderboard</span>
          </h1>
          <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 17, color: 'rgba(232,213,163,0.5)', maxWidth: 480, margin: '0 auto 20px' }}>
            Support your favourite poets. Votes count for <strong style={{ color: '#f0d080' }}>30%</strong> of the final score.
          </p>

          {votingOpen ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                {[['d','DAYS'],['h','HRS'],['m','MIN'],['s','SEC']].map(([key, label]) => (
                  <div key={key} style={{ textAlign: 'center', minWidth: 64, padding: '12px 16px', background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 2 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 32, color: '#f0d080', lineHeight: 1 }}>
                      {String(timeLeft[key]).padStart(2, '0')}
                    </div>
                    <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.45)', marginTop: 4 }}>{label}</div>
                  </div>
                ))}
              </div>
              <a href={VOTENAIJA_LINK} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-gold magnetic" style={{ fontSize: 12, padding: '14px 40px' }}>🗳 Vote Now</button>
              </a>
            </>
          ) : (
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'inline-block', padding: '14px 32px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 2, marginBottom: 12 }}>
                <p style={{ fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.2em', color: '#e74c3c', margin: 0 }}>🔒 VOTING HAS CLOSED</p>
              </div>
              <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 15, color: 'rgba(232,213,163,0.35)', margin: 0 }}>
                Thank you to everyone who voted. Check the leaderboard for final standings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid rgba(201,168,76,0.1)', background: '#000' }}>
        {[['vote', '🗳 Poems'], ['leaderboard', '🏆 Leaderboard']].map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.15em',
            padding: '18px 36px',
            color: tab === t ? '#c9a84c' : 'rgba(232,213,163,0.35)',
            borderBottom: tab === t ? '2px solid #c9a84c' : '2px solid transparent',
            transition: 'all 0.3s',
          }}>{l}</button>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 pb-24">

        {/* ── POEMS TAB ── */}
        {tab === 'vote' && (
          <>
            {/* Packages info banner */}
            <div className="reveal" style={{ marginBottom: 40 }}>
              <p style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.25em', color: 'rgba(201,168,76,0.5)', marginBottom: 14 }}>VOTE PACKAGES ON VOTENAIJA</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {PACKAGES.map((p, i) => (
                  <div key={p.id} className={`card d${i + 1}`} style={{ padding: '24px 20px', textAlign: 'center', border: `1px solid ${p.color}33`, boxShadow: `0 0 24px ${p.glow}`, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`, position: 'absolute', top: 0, left: 0, right: 0 }} />
                    <div style={{ fontSize: 36, marginBottom: 8 }}>{p.icon}</div>
                    <div style={{ fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.15em', color: p.color, marginBottom: 4 }}>{p.label.toUpperCase()}</div>
                    <div className="gold-text" style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 28, marginBottom: 2 }}>₦{p.amount.toLocaleString()}</div>
                    <div style={{ fontFamily: 'EB Garamond,serif', fontSize: 13, color: 'rgba(232,213,163,0.4)' }}>{p.votes} votes</div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to vote */}
            <div className="reveal card" style={{ padding: '24px 28px', marginBottom: 40, display: 'flex', gap: 16, alignItems: 'flex-start', background: 'rgba(201,168,76,0.03)' }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>ℹ️</span>
              <div>
                <p style={{ fontFamily: 'Cinzel,serif', fontSize: 10, letterSpacing: '0.15em', color: '#c9a84c', marginBottom: 6 }}>HOW TO VOTE</p>
                <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 16, color: 'rgba(232,213,163,0.6)', lineHeight: 1.8 }}>
                  Click <strong style={{ color: '#fff' }}>"Vote on VoteNaija"</strong> on any poem below or at the top of this page. Select your package, find your favourite poet, and complete payment on VoteNaija's secure platform.
                </p>
              </div>
            </div>

            {/* Approved poems */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(201,168,76,0.4)' }}>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.3em' }}>LOADING POEMS...</div>
              </div>
            ) : poems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, border: '1px solid rgba(201,168,76,0.1)', borderRadius: 2 }}>
                <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
                <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 17, color: 'rgba(232,213,163,0.4)' }}>No approved poems yet. Check back soon.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {poems.map((poem, i) => {
                  const isOpen = selected === poem.id
                  return (
                    <div key={poem.id} className={`reveal d${Math.min(i+1,5)} card`} style={{ overflow: 'hidden', border: isOpen ? '1px solid rgba(201,168,76,0.45)' : '1px solid rgba(201,168,76,0.15)', transition: 'all 0.4s' }}>
                      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{poem.title}</h3>
                          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'EB Garamond,serif', fontSize: 14, color: 'rgba(232,213,163,0.45)' }}>👤 {poem.userName}</span>
                            {poem.genre && <span style={{ fontFamily: 'Cinzel,serif', fontSize: 9, color: 'rgba(201,168,76,0.5)', border: '1px solid rgba(201,168,76,0.15)', padding: '2px 8px' }}>{poem.genre}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ textAlign: 'center', minWidth: 48 }}>
                            <div className="gold-text" style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 26 }}>{poem.votes || 0}</div>
                            <div style={{ fontFamily: 'Cinzel,serif', fontSize: 7, letterSpacing: '0.15em', color: 'rgba(232,213,163,0.3)' }}>VOTES</div>
                          </div>
                          <button onClick={() => setSelected(isOpen ? null : poem.id)} style={{ background: isOpen ? 'rgba(201,168,76,0.1)' : 'none', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 2, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.1em', color: '#c9a84c', transition: 'all 0.3s' }}>
                            {isOpen ? 'CLOSE' : 'DETAILS'}
                          </button>
                          {votingOpen ? (
                            <a href={VOTENAIJA_LINK} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                              <button className="btn-gold" style={{ padding: '8px 18px', fontSize: 9 }}>🗳 VOTE</button>
                            </a>
                          ) : (
                            <div style={{ padding: '8px 14px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 2, fontFamily: 'Cinzel,serif', fontSize: 8, letterSpacing: '0.1em', color: 'rgba(231,76,60,0.6)' }}>CLOSED</div>
                          )}
                        </div>
                      </div>

                      {/* Expanded poem preview */}
                      {isOpen && (
                        <div style={{ borderTop: '1px solid rgba(201,168,76,0.08)', padding: '20px 24px', background: 'rgba(201,168,76,0.02)' }}>
                          <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 16, color: 'rgba(232,213,163,0.65)', whiteSpace: 'pre-line', lineHeight: 2, fontStyle: 'italic', maxHeight: 200, overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                            {poem.poem}
                          </p>
                          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                            {votingOpen ? (
                              <a href={VOTENAIJA_LINK} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                                <button className="btn-gold magnetic" style={{ padding: '10px 24px', fontSize: 10 }}>🗳 Vote for This Poem</button>
                              </a>
                            ) : (
                              <div style={{ padding: '10px 20px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 2, fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(231,76,60,0.6)' }}>🔒 VOTING CLOSED</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── LEADERBOARD TAB ── */}
        {tab === 'leaderboard' && (
          <>
            <div className="reveal" style={{ marginBottom: 24 }}>
              <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2, padding: '14px 20px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                {[['70%', 'Judge Score'], ['30%', 'Community Votes'], ['=', 'Final Ranking']].map(([v, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="gold-text" style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 22 }}>{v}</span>
                    <span style={{ fontFamily: 'EB Garamond,serif', fontSize: 14, color: 'rgba(232,213,163,0.45)' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(201,168,76,0.4)' }}>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.3em' }}>LOADING...</div>
              </div>
            ) : leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, border: '1px solid rgba(201,168,76,0.1)', borderRadius: 2 }}>
                <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 17, color: 'rgba(232,213,163,0.4)' }}>No results yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leaderboard.map((poem, i) => {
                  const medals = ['🥇','🥈','🥉']
                  const rankColors = ['#FFD700','#C0C0C0','#CD7F32']
                  const color = rankColors[i] || 'rgba(201,168,76,0.3)'
                  return (
                    <div key={poem.id} className={`reveal d${Math.min(i+1,5)} card`} style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', border: i < 3 ? `1px solid ${color}44` : '1px solid rgba(201,168,76,0.1)', boxShadow: i < 3 ? `0 0 30px ${color}18` : 'none', position: 'relative', overflow: 'hidden' }}>
                      {i < 3 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />}
                      <div style={{ width: 38, textAlign: 'center', flexShrink: 0 }}>
                        {i < 3
                          ? <span style={{ fontSize: 26 }}>{medals[i]}</span>
                          : <span style={{ fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: 15, color: 'rgba(201,168,76,0.3)' }}>#{i+1}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{poem.title}</h3>
                        <span style={{ fontFamily: 'EB Garamond,serif', fontSize: 13, color: 'rgba(232,213,163,0.4)' }}>👤 {poem.userName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 14, fontWeight: 700, color: '#c9a84c' }}>{poem.judgeScore || '—'}</div>
                          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 7, letterSpacing: '0.12em', color: 'rgba(232,213,163,0.3)' }}>JUDGE</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 14, fontWeight: 700, color: '#c9a84c' }}>{poem.votes || 0}</div>
                          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 7, letterSpacing: '0.12em', color: 'rgba(232,213,163,0.3)' }}>VOTES</div>
                        </div>
                        <div style={{ textAlign: 'center', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 2, padding: '6px 14px' }}>
                          <div className="gold-text" style={{ fontFamily: 'Cormorant Garamond,serif', fontWeight: 700, fontSize: 22 }}>{poem.total}</div>
                          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 7, letterSpacing: '0.12em', color: 'rgba(232,213,163,0.3)' }}>SCORE</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
