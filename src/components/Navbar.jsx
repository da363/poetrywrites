import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useState, useEffect } from 'react'
import logoImg from '../assets/logo.jpg'

const NAV = [
  { label: 'Home',        path: '/' },
  { label: 'About',       path: '/about' },
  { label: 'Competition', path: '/competition' },
  { label: 'Prizes',      path: '/prizes' },
  { label: 'Terms',       path: '/terms' },
  { label: 'Contact',     path: '/contact' },
  { label: 'Vote',        path: '/vote' },
]

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const { user, isAdmin, signInWithGoogle, logout } = useAuth()
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (!user) { setProfilePhoto(null); return }
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists() && snap.data().photoURL) setProfilePhoto(snap.data().photoURL)
    })
  }, [user])

  useEffect(() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }, [location.pathname])

  useEffect(() => {
    if (!user) { setProfilePhoto(null); return }
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setProfilePhoto(snap.data().photoURL || null)
    })
  }, [user])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? 'rgba(0,0,0,0.96)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : '1px solid transparent',
      transition: 'all 0.5s ease',
    }}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
            border: '1.5px solid rgba(201,168,76,0.5)',
            boxShadow: '0 0 20px rgba(201,168,76,0.3)',
            transition: 'all 0.4s ease',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(201,168,76,0.7)'; e.currentTarget.style.transform = 'scale(1.08) rotate(5deg)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'scale(1) rotate(0deg)' }}>
            <img src={logoImg} alt="PoetryWrites" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{
              fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 14,
              letterSpacing: '0.25em', color: '#c9a84c',
              background: 'linear-gradient(135deg, #c9a84c, #f0d080, #c9a84c)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', animation: 'shimmer 4s linear infinite',
            }}>POETRYWRITES</div>
            <div style={{ fontSize: 8, letterSpacing: '0.22em', color: 'rgba(201,168,76,0.4)', fontFamily: 'Cinzel,serif' }}>
              WHERE WORDS BECOME RECOGNITION
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {NAV.map(({ label, path }) => (
            <Link key={path} to={path} className={`nav-link ${location.pathname === path ? 'active' : ''}`}>
              {label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/admin" style={{ textDecoration: 'none' }}>
                  <button className="btn-gold" style={{ padding: '8px 18px', fontSize: 10 }}>👑 Admin</button>
                </Link>
              )}
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)',
                  borderRadius: 100, padding: '6px 14px',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.15)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.25)' }}>
                  {(profilePhoto || user.photoURL)
                    ? <img src={profilePhoto || user.photoURL} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#000', fontWeight: 700 }}>
                        {user.displayName?.[0] || 'U'}
                      </div>
                  }
                  <span style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#c9a84c', letterSpacing: '0.1em' }}>
                    {user.displayName?.split(' ')[0] || 'Account'}
                  </span>
                </div>
              </Link>
              <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(232,213,163,0.35)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#c0392b'}
                onMouseLeave={e => e.target.style.color = 'rgba(232,213,163,0.35)'}>
                Sign out
              </button>
            </div>
          ) : (
            <button className="btn-gold" onClick={signInWithGoogle} style={{ padding: '10px 22px', fontSize: 10 }}>
              Sign In
            </button>
          )}
        </div>

        {/* Hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          {[0,1,2].map(i => (
            <span key={i} style={{
              display: 'block', width: 24, height: 1, background: '#c9a84c', margin: '6px 0',
              transition: 'all 0.3s ease', transformOrigin: 'center',
              transform: menuOpen
                ? i===0 ? 'rotate(45deg) translate(5px,5px)'
                : i===1 ? 'scaleX(0)'
                : 'rotate(-45deg) translate(5px,-5px)'
                : 'none',
            }} />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      <div style={{
        maxHeight: menuOpen ? '600px' : 0,
        overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1)',
        background: 'rgba(0,0,0,0.98)',
        borderTop: menuOpen ? '1px solid rgba(201,168,76,0.12)' : 'none',
      }}>
        <div className="px-6 py-4 flex flex-col gap-3">
          {NAV.map(({ label, path }) => (
            <Link key={path} to={path} style={{
              textDecoration: 'none', fontFamily: 'Cinzel,serif', fontSize: 13,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: location.pathname === path ? '#c9a84c' : 'rgba(232,213,163,0.6)',
              padding: '10px 0', borderBottom: '1px solid rgba(201,168,76,0.07)',
              transition: 'color 0.2s',
            }}>
              {label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-3">
            {user ? (
              <>
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                  <button className="btn-outline" style={{ width: '100%' }}>My Dashboard</button>
                </Link>
                {isAdmin && (
                  <Link to="/admin" style={{ textDecoration: 'none' }}>
                    <button className="btn-gold" style={{ width: '100%' }}>👑 Admin Panel</button>
                  </Link>
                )}
                <button onClick={logout} className="btn-outline" style={{ width: '100%' }}>Sign Out</button>
              </>
            ) : (
              <button onClick={signInWithGoogle} className="btn-gold" style={{ width: '100%' }}>
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
