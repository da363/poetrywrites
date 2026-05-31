import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

const CLOUDINARY_CLOUD  = 'dhrwq9jyj'
const CLOUDINARY_PRESET = 'oosjuoex'
import { useAuth } from '../context/AuthContext'
import logoImg from '../assets/logo.jpg'

export default function SignupPage() {
  const { user, signInWithGoogle, loading, markProfileComplete } = useAuth()
  const navigate = useNavigate()

  const [step,        setStep]        = useState(1) // 1 = sign in, 2 = complete profile
  const [name,        setName]        = useState('')
  const [phone,       setPhone]       = useState('')
  const [photoFile,   setPhotoFile]   = useState(null)
  const [photoPreview,setPhotoPreview]= useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')
  const [dragOver,    setDragOver]    = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    if (loading) return
    if (user) {
      setStep(2)
      setName(prev => prev || user.displayName || '')
    }
  }, [user, loading, navigate])

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB.'); return }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleSubmit = async () => {
    if (!name.trim())  { setError('Please enter your name.'); return }
    if (!phone.trim()) { setError('Please enter your phone number.'); return }
    if (!/^[0-9+\s\-()]{7,15}$/.test(phone.trim())) { setError('Please enter a valid phone number.'); return }
    setSubmitting(true); setError('')

    try {
      let photoURL = user.photoURL || ''

      if (photoFile) {
        const formData = new FormData()
        formData.append('file', photoFile)
        formData.append('upload_preset', CLOUDINARY_PRESET)
        formData.append('folder', 'poetrywrites/profiles')
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`, {
          method: 'POST', body: formData,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error?.message || 'Image upload failed')
        photoURL = data.secure_url
      }

      await setDoc(doc(db, 'users', user.uid), {
        uid:             user.uid,
        email:           user.email,
        displayName:     name.trim(),
        phone:           phone.trim(),
        photoURL,
        joinedAt:        new Date().toISOString(),
        profileComplete: true,
      }, { merge: true })

      markProfileComplete()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again. ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: 'float 2s ease-in-out infinite' }}>✍️</div>
        <p style={{ fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.5)' }}>LOADING...</p>
      </div>
    </div>
  )

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative', overflow: 'hidden' }}>

      {/* Background orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', top: '10%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', bottom: '10%', right: '5%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      {[600, 420, 240].map((s, i) => (
        <div key={s} style={{ position: 'absolute', width: s, height: s, border: '1px solid rgba(201,168,76,0.04)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: `rotateSlow ${24 + i * 8}s linear infinite${i % 2 ? ' reverse' : ''}`, pointerEvents: 'none' }} />
      ))}

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(201,168,76,0.5)', boxShadow: '0 0 40px rgba(201,168,76,0.4)', margin: '0 auto 14px', animation: 'logoGlow 4s ease-in-out infinite' }}>
            <img src={logoImg} alt="PoetryWrites" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: 14, letterSpacing: '0.25em', background: 'linear-gradient(135deg,#c9a84c,#f0d080,#c9a84c)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', animation: 'shimmer 4s linear infinite' }}>POETRYWRITES</div>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.35)', marginTop: 4 }}>WHERE WORDS BECOME RECOGNITION</div>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 32 }}>
          {[1, 2].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= s ? 'linear-gradient(135deg,#c9a84c,#f0d080)' : 'rgba(255,255,255,0.04)',
                border: step >= s ? 'none' : '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cinzel,serif', fontSize: 11, fontWeight: 700,
                color: step >= s ? '#000' : 'rgba(201,168,76,0.3)',
                transition: 'all 0.4s',
                boxShadow: step >= s ? '0 0 20px rgba(201,168,76,0.5)' : 'none',
              }}>{s}</div>
              {i === 0 && <div style={{ width: 60, height: 1, background: step > 1 ? 'linear-gradient(90deg,#c9a84c,#f0d080)' : 'rgba(201,168,76,0.15)', transition: 'all 0.5s' }} />}
            </div>
          ))}
        </div>

        {/* Main card */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,168,76,0.18)', borderRadius: 4, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(201,168,76,0.06)' }}>
          <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, #c9a84c, #f0d080, #c9a84c, transparent)' }} />
          <div style={{ padding: '36px 28px' }}>

            {/* ── STEP 1: Sign In ── */}
            {step === 1 && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.5)', marginBottom: 10 }}>STEP 1 OF 2</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Welcome</h2>
                <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 16, color: 'rgba(232,213,163,0.5)', marginBottom: 36, lineHeight: 1.7 }}>
                  Sign in with Google to create your PoetryWrites account.
                </p>

                <button onClick={signInWithGoogle} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                  background: '#fff', border: 'none', borderRadius: 2, padding: '14px 24px', cursor: 'pointer',
                  fontFamily: 'Cinzel,serif', fontSize: 11, letterSpacing: '0.1em', fontWeight: 600, color: '#000',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)', transition: 'all 0.3s', marginBottom: 20,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Continue with Google
                </button>

                <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 13, color: 'rgba(232,213,163,0.25)', lineHeight: 1.7 }}>
                  By continuing you agree to our{' '}
                  <a href="/terms" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>Terms & Conditions</a>
                </p>
              </div>
            )}

            {/* ── STEP 2: Complete Profile ── */}
            {step === 2 && (
              <div>
                <p style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.3em', color: 'rgba(201,168,76,0.5)', marginBottom: 10 }}>STEP 2 OF 2</p>
                <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Complete Your Profile</h2>
                <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 15, color: 'rgba(232,213,163,0.45)', marginBottom: 28, lineHeight: 1.7 }}>
                  Signed in as <strong style={{ color: '#c9a84c' }}>{user?.email}</strong>
                </p>

                {/* Photo upload */}
                <div style={{ marginBottom: 24 }}>
                  <label className="label-gold">Profile Photo</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${dragOver ? '#c9a84c' : 'rgba(201,168,76,0.25)'}`,
                      borderRadius: 4, padding: '28px 16px', textAlign: 'center', cursor: 'pointer',
                      background: dragOver ? 'rgba(201,168,76,0.05)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.3s', position: 'relative',
                    }}>
                    {photoPreview ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <img src={photoPreview} alt="Preview" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,168,76,0.5)', boxShadow: '0 0 24px rgba(201,168,76,0.3)' }} />
                        <span style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.15em', color: 'rgba(201,168,76,0.6)' }}>CLICK TO CHANGE</span>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.5 }}>📷</div>
                        <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 15, color: 'rgba(232,213,163,0.4)', marginBottom: 4 }}>
                          Tap to upload or drag & drop
                        </p>
                        <p style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(201,168,76,0.3)' }}>JPG, PNG · MAX 5MB</p>
                      </>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                  </div>
                </div>

                {/* Name */}
                <div style={{ marginBottom: 16 }}>
                  <label className="label-gold">Full Name *</label>
                  <input
                    className="input-gold"
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={e => { setName(e.target.value); setError('') }}
                  />
                </div>

                {/* Phone */}
                <div style={{ marginBottom: 24 }}>
                  <label className="label-gold">Phone Number *</label>
                  <input
                    className="input-gold"
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setError('') }}
                  />
                </div>

                {/* Error */}
                {error && (
                  <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 2, padding: '10px 14px', marginBottom: 16 }}>
                    <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 14, color: '#e74c3c' }}>{error}</p>
                  </div>
                )}

                <button className="btn-gold" onClick={handleSubmit} disabled={submitting} style={{ width: '100%', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Saving...' : 'Complete Registration →'}
                </button>
              </div>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontFamily: 'EB Garamond,serif', fontSize: 13, color: 'rgba(232,213,163,0.2)', marginTop: 20 }}>
          © 2026 PoetryWrites · CAC Registered
        </p>
      </div>
    </div>
  )
}
