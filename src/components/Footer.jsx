import { Link } from 'react-router-dom'
import logoImg from '../assets/logo.jpg'

const LINKS = [
  { label: 'Home', path: '/' }, { label: 'About', path: '/about' },
  { label: 'Competition', path: '/competition' }, { label: 'Prizes', path: '/prizes' },
  { label: 'Terms', path: '/terms' }, { label: 'Contact', path: '/contact' },
]

export default function Footer() {
  return (
    <footer style={{ background: '#000', borderTop: '1px solid rgba(201,168,76,0.1)', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 200, background: 'radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <hr className="gold-hr" />
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-10">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(201,168,76,0.4)', boxShadow: '0 0 20px rgba(201,168,76,0.2)', flexShrink: 0 }}>
                <img src={logoImg} alt="PoetryWrites" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'Cinzel,serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.25em', color: '#c9a84c' }}>POETRYWRITES</div>
                <div style={{ fontSize: 8, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.35)', fontFamily: 'Cinzel,serif' }}>WHERE WORDS BECOME RECOGNITION</div>
              </div>
            </div>
            <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 15, color: 'rgba(232,213,163,0.45)', lineHeight: 1.75, maxWidth: 280 }}>
              A digital literary arts platform celebrating poetic excellence across Nigeria and beyond.
            </p>
            <p style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.3)', marginTop: 14 }}>
              write · compete · inspire
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.25em', color: '#c9a84c', marginBottom: 18, textTransform: 'uppercase' }}>Navigate</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {LINKS.map(({ label, path }) => (
                <Link key={path} to={path} style={{ textDecoration: 'none', fontFamily: 'EB Garamond,serif', fontSize: 15, color: 'rgba(232,213,163,0.45)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#c9a84c'}
                  onMouseLeave={e => e.target.style.color = 'rgba(232,213,163,0.45)'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.25em', color: '#c9a84c', marginBottom: 18, textTransform: 'uppercase' }}>Connect</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '📸', label: 'Poetrywrites1804', href: 'https://www.instagram.com/poetrywrites1804' },
                { icon: '📘', label: 'Calliope writes',  href: 'https://www.facebook.com/calliopewrites' },
                { icon: '✉️', label: 'poetrywrites1804@gmail.com', href: 'mailto:poetrywrites1804@gmail.com' },
                { icon: '📞', label: '09043334201', href: 'tel:+2349043334201' },
              ].map(({ icon, label, href }) => (
                <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  style={{ display: 'flex', gap: 10, alignItems: 'center', textDecoration: 'none', fontFamily: 'EB Garamond,serif', fontSize: 14, color: 'rgba(232,213,163,0.45)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#c9a84c'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(232,213,163,0.45)'}>
                  <span style={{ fontSize: 16 }}>{icon}</span>{label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="gold-hr mb-6" />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <p style={{ fontFamily: 'EB Garamond,serif', fontSize: 13, color: 'rgba(232,213,163,0.2)' }}>© 2026 PoetryWrites. All rights reserved.</p>
          <p style={{ fontFamily: 'Cinzel,serif', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(201,168,76,0.2)' }}>REGISTERED WITH CAC NIGERIA</p>
        </div>
      </div>
    </footer>
  )
}
