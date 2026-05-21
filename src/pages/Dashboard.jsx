import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection, addDoc, query, where,
  orderBy, onSnapshot, Timestamp, getCountFromServer
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'

const STATUS_STYLES = {
  pending:  { cls: 'badge-pending',  label: '⏳ Pending Review' },
  approved: { cls: 'badge-approved', label: '✅ Approved' },
  rejected: { cls: 'badge-rejected', label: '❌ Not Selected' },
}

const MAX_POEMS = 2
const MAX_LINES = 50

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [poems,      setPoems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [view,       setView]       = useState('submissions') // 'submissions' | 'submit'
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')

  const [form, setForm] = useState({
    title: '', genre: '', poem: '', note: '',
  })

  // Redirect if not logged in
  useEffect(() => { if (!user) navigate('/') }, [user, navigate])

  // Real-time listener for user's poems
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'poems'),
      where('userId', '==', user.uid),
      orderBy('submittedAt', 'desc')
    )
    const unsub = onSnapshot(
      q,
      snap => {
        setPoems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      err => {
        console.error('Firestore snapshot error:', err)
        setError('Failed to load submissions. Please refresh the page.')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [user])

  const lineCount = form.poem.split('\n').filter(l => l.trim()).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')

    if (!form.title.trim()) return setError('Please enter a poem title.')
    if (!form.poem.trim())  return setError('Please enter your poem.')
    if (lineCount > MAX_LINES) return setError(`Your poem exceeds ${MAX_LINES} lines. Current: ${lineCount} lines.`)
    if (poems.length >= MAX_POEMS) return setError(`You have already submitted ${MAX_POEMS} poems, which is the maximum allowed.`)

    setSubmitting(true)

    // Live server-side count check before writing
    try {
      const countSnap = await getCountFromServer(
        query(collection(db, 'poems'), where('userId', '==', user.uid))
      )
      if (countSnap.data().count >= MAX_POEMS) {
        setError(`You have already submitted ${MAX_POEMS} poems, which is the maximum allowed.`)
        setSubmitting(false)
        return
      }
    } catch (err) {
      setError('Could not verify submission count. Please try again.')
      setSubmitting(false)
      return
    }

    // Optimistic update — show it immediately before Firestore confirms
    const optimisticPoem = {
      id:          '__optimistic__',
      userId:      user.uid,
      userEmail:   user.email,
      userName:    user.displayName,
      title:       form.title.trim(),
      genre:       form.genre.trim(),
      poem:        form.poem.trim(),
      note:        form.note.trim(),
      status:      'pending',
      submittedAt: { toDate: () => new Date() }, // match Firestore shape
      reviewedAt:  null,
      adminNote:   '',
    }
    setPoems(prev => [optimisticPoem, ...prev])
    setForm({ title: '', genre: '', poem: '', note: '' })
    setView('submissions')
    setSubmitting(false)

    try {
      await addDoc(collection(db, 'poems'), {
        userId:      optimisticPoem.userId,
        userEmail:   optimisticPoem.userEmail,
        userName:    optimisticPoem.userName,
        title:       optimisticPoem.title,
        genre:       optimisticPoem.genre,
        poem:        optimisticPoem.poem,
        note:        optimisticPoem.note,
        status:      'pending',
        submittedAt: Timestamp.now(),
        reviewedAt:  null,
        adminNote:   '',
      })
      // onSnapshot will replace the optimistic entry with the real doc automatically
    } catch (err) {
      // Roll back optimistic update on failure
      setPoems(prev => prev.filter(p => p.id !== '__optimistic__'))
      setView('submit')
      setError('Submission failed. Please try again. ' + err.message)
    }
  }

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
            {user.photoURL
              ? <img src={user.photoURL} alt="" style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(201,168,76,0.4)' }} />
              : <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(201,168,76,0.15)', border: '2px solid rgba(201,168,76,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond,serif', fontSize: 22, color: '#c9a84c', fontWeight: 700 }}>
                  {user.displayName?.[0] || 'U'}
                </div>
            }
            <div>
              <p className="font-accent text-xs tracking-widest mb-1" style={{ color: 'rgba(201,168,76,0.5)' }}>WELCOME BACK</p>
              <h1 className="font-display text-2xl font-bold" style={{ color: '#fff' }}>{user.displayName}</h1>
              <p className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.4)' }}>{user.email}</p>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2 }}>
              <div className="font-display text-2xl font-bold" style={{ color: '#c9a84c' }}>{poems.length}</div>
              <div className="font-accent text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.4)' }}>SUBMITTED</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2 }}>
              <div className="font-display text-2xl font-bold" style={{ color: '#27ae60' }}>{poems.filter(p => p.status === 'approved').length}</div>
              <div className="font-accent text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.4)' }}>APPROVED</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2 }}>
              <div className="font-display text-2xl font-bold" style={{ color: '#fff' }}>{MAX_POEMS - poems.length}</div>
              <div className="font-accent text-xs tracking-widest" style={{ color: 'rgba(201,168,76,0.4)' }}>SLOTS LEFT</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'submissions', label: 'My Submissions' },
            { key: 'submit',      label: '+ Submit a Poem' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => { setView(key); setError(''); setSuccess('') }}
              style={{
                fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.15em',
                padding: '10px 20px', cursor: 'pointer', transition: 'all 0.2s',
                background: view === key ? '#c9a84c' : 'transparent',
                color: view === key ? '#000' : 'rgba(201,168,76,0.6)',
                border: `1px solid ${view === key ? '#c9a84c' : 'rgba(201,168,76,0.2)'}`,
                borderRadius: 2,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── SUBMISSIONS VIEW ── */}
        {view === 'submissions' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'rgba(201,168,76,0.4)' }}>
                <div className="font-accent text-xs tracking-widest">LOADING YOUR SUBMISSIONS...</div>
              </div>
            ) : poems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, border: '1px solid rgba(201,168,76,0.1)', borderRadius: 2 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✍️</div>
                <h3 className="font-display text-2xl font-bold mb-3" style={{ color: '#fff' }}>No submissions yet</h3>
                <p className="font-body text-base mb-6" style={{ color: 'rgba(232,213,163,0.5)' }}>
                  You haven't submitted any poems yet. You can submit up to {MAX_POEMS} poems.
                </p>
                <button className="btn-gold" onClick={() => setView('submit')}>Submit Your First Poem</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {poems.map(poem => {
                  const st = STATUS_STYLES[poem.status] || STATUS_STYLES.pending
                  return (
                    <div key={poem.id} className="card" style={{ padding: '28px 32px' }}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
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

                      {/* Preview first 4 lines */}
                      <div style={{ borderTop: '1px solid rgba(201,168,76,0.08)', paddingTop: 16, marginBottom: 12 }}>
                        <p className="font-body text-base" style={{ color: 'rgba(232,213,163,0.5)', lineHeight: 1.8, whiteSpace: 'pre-line', fontStyle: 'italic' }}>
                          {poem.poem.split('\n').slice(0, 4).join('\n')}
                          {poem.poem.split('\n').length > 4 && '\n...'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4 items-center">
                        <span className="font-accent text-xs" style={{ color: 'rgba(201,168,76,0.3)' }}>
                          Submitted: {poem.submittedAt?.toDate?.()?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || '—'}
                        </span>
                        <span className="font-accent text-xs" style={{ color: 'rgba(201,168,76,0.3)' }}>
                          {poem.poem.split('\n').filter(l => l.trim()).length} lines
                        </span>
                      </div>

                      {/* Admin note on rejection */}
                      {poem.status === 'rejected' && poem.adminNote && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', borderRadius: 2 }}>
                          <p className="font-accent text-xs tracking-widest mb-1" style={{ color: 'rgba(192,57,43,0.7)' }}>NOTE FROM REVIEWER</p>
                          <p className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.6)' }}>{poem.adminNote}</p>
                        </div>
                      )}

                      {/* Approval message */}
                      {poem.status === 'approved' && (
                        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)', borderRadius: 2 }}>
                          <p className="font-body text-sm" style={{ color: 'rgba(39,174,96,0.8)' }}>
                            🎉 Congratulations! Your poem has been approved and is in the competition.
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}

                {poems.length < MAX_POEMS && (
                  <button className="btn-outline mt-2" onClick={() => setView('submit')}>
                    Submit Another Poem ({MAX_POEMS - poems.length} slot{MAX_POEMS - poems.length > 1 ? 's' : ''} remaining)
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SUBMIT VIEW ── */}
        {view === 'submit' && (
          <div>
            {poems.length >= MAX_POEMS ? (
              <div style={{ textAlign: 'center', padding: 48, border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🚫</div>
                <h3 className="font-display text-2xl font-bold mb-3" style={{ color: '#fff' }}>Submission Limit Reached</h3>
                <p className="font-body text-base" style={{ color: 'rgba(232,213,163,0.5)' }}>
                  You have submitted {MAX_POEMS} poems, which is the maximum allowed per entrant.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 2, padding: '16px 20px', marginBottom: 28 }}>
                  <p className="font-body text-sm" style={{ color: 'rgba(232,213,163,0.6)' }}>
                    ✦ You may submit up to <strong style={{ color: '#f0d080' }}>{MAX_POEMS} poems</strong> in total.
                    Max <strong style={{ color: '#f0d080' }}>{MAX_LINES} lines</strong> per poem.
                    Entry is completely free. Your submission will be reviewed within 7 days.
                  </p>
                </div>

                {error && (
                  <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 2, padding: '12px 16px', marginBottom: 20 }}>
                    <p className="font-body text-sm" style={{ color: '#e74c3c' }}>{error}</p>
                  </div>
                )}
                {success && (
                  <div style={{ background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: 2, padding: '12px 16px', marginBottom: 20 }}>
                    <p className="font-body text-sm" style={{ color: '#27ae60' }}>{success}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="label-gold">Poem Title *</label>
                    <input className="input-gold" type="text" placeholder="Enter your poem title"
                      value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-gold">Genre / Style (optional)</label>
                    <input className="input-gold" type="text" placeholder="e.g. Free verse, Sonnet, Haiku"
                      value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} />
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between mb-2">
                    <label className="label-gold" style={{ margin: 0 }}>Your Poem *</label>
                    <span className="font-accent text-xs" style={{ color: lineCount > MAX_LINES ? '#e74c3c' : 'rgba(201,168,76,0.4)' }}>
                      {lineCount} / {MAX_LINES} lines
                    </span>
                  </div>
                  <textarea className="input-gold" rows={16}
                    placeholder="Paste or type your poem here..."
                    value={form.poem}
                    onChange={e => setForm({ ...form, poem: e.target.value })}
                    style={{ resize: 'vertical', lineHeight: 1.8, fontStyle: 'italic' }}
                  />
                </div>

                <div className="mb-8">
                  <label className="label-gold">Note to Judges (optional)</label>
                  <textarea className="input-gold" rows={3}
                    placeholder="Any context you'd like the judges to know about this poem..."
                    value={form.note}
                    onChange={e => setForm({ ...form, note: e.target.value })}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-gold" disabled={submitting}
                    style={{ opacity: submitting ? 0.6 : 1 }}>
                    {submitting ? 'Submitting...' : 'Submit Poem'}
                  </button>
                  <button type="button" className="btn-outline" onClick={() => setView('submissions')}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
