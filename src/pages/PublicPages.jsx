import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Particles from '../components/Particles.jsx'
import logoImg from '../assets/logo.jpg'

const SOCIAL = {
  facebook:  'https://www.facebook.com/calliopewrites',
  instagram: 'https://www.instagram.com/poetrywrites1804',
  email:     'mailto:poetrywrites1804@gmail.com',
  phone1:    'tel:+2348122304109',
  phone2:    'tel:+2349061413710',
}
const CONTACT = {
  emailDisplay: 'poetrywrites1804@gmail.com',
  emailBusiness:'poetrywrites@gmail.com',
  phone1:'08122304109', phone2:'09061413710',
  instagram:'Poetrywrites1804', facebook:'Calliope writes',
}

const PRIZES = [
  { place:'1st', ordinal:'First Place',  medal:'🥇', amount:'₦150,000', color:'#FFD700', glow:'rgba(255,215,0,0.4)', border:'rgba(255,215,0,0.5)', label:'Gold Prize',
    perks:['Cash award of ₦150,000','Featured publication','Mentorship session','Certificate of Excellence','Social media spotlight','PoetryWrites plaque'] },
  { place:'2nd', ordinal:'Second Place', medal:'🥈', amount:'₦100,000', color:'#C0C0C0', glow:'rgba(192,192,192,0.3)', border:'rgba(192,192,192,0.4)', label:'Silver Prize',
    perks:['Cash award of ₦100,000','Featured publication','Certificate of Merit','Social media spotlight'] },
  { place:'3rd', ordinal:'Third Place',  medal:'🥉', amount:'₦50,000',  color:'#CD7F32', glow:'rgba(205,127,50,0.3)', border:'rgba(205,127,50,0.4)', label:'Bronze Prize',
    perks:['Cash award of ₦50,000','Honourable mention','Certificate of Merit','Social media spotlight'] },
]

const TERMS_UPDATED = 'April 28, 2026'
const TERMS = [
  { num:'1', title:'About POETRYWRITES', clauses:[
    {sub:'1.1',text:'POETRYWRITES is a digital literary arts and advertising platform operating in Nigeria.'},
    {sub:'1.2',text:'Business Type: Registered with the Corporate Affairs Commission (CAC).'},
  ]},
  { num:'2', title:'Contact Information', clauses:[
    {sub:'2.1',text:'Support & Submissions: poetrywrites1804@gmail.com — For poem uploads, customer complaints, and general inquiries.'},
    {sub:'2.2',text:'Business & Legal: poetrywrites@gmail.com — For CAC matters, payment receipts, and official correspondence.'},
  ]},
  { num:'3', title:'Nature of Services', clauses:[
    {sub:'3.1',text:'POETRYWRITES provides promotional, advertising, and audience-reach services for writers and poets.'},
    {sub:'3.2',text:'We host digital literary showcases where submitted works are evaluated on artistic merit by independent judges.'},
    {sub:'3.3',text:'POETRYWRITES is NOT a lottery, betting, gaming, or contest platform.'},
  ]},
  { num:'4', title:'Winner Selection Process', clauses:[
    {sub:'4.1',text:'Winners are determined using a weighted scoring system: 70% Judge Score (awarded by independent literary judges based on creativity, literary technique, and originality) and 30% Community Engagement Score (calculated from organic audience interactions including page views, free likes, shares, and comments on the POETRYWRITES platform).'},
    {sub:'4.2',text:"Promotional Packages: Supporters may purchase promotional packages to increase visibility for a poet's work. Packages may include homepage features, social media advertising campaigns, and audience reach services. All pricing is displayed on the promotion portal."},
    {sub:'4.3',text:"Important Clarification: Purchasing a promotional package is a payment for advertising services only. It increases a poem's visibility and potential for organic engagement. It does NOT directly add points to the Community Engagement Score, does NOT constitute a vote, and does NOT guarantee a win, placement, or any specific outcome. The Judge Score remains the primary deciding factor at 70%."},
    {sub:'4.4',text:'Revenue Use: Funds from promotional packages are used to support platform operations, judge honorariums, marketing expenses, and prize pools for literary excellence.'},
  ]},
  { num:'5', title:'Important Disclaimers', clauses:[
    {sub:'5.1',text:'POETRYWRITES does NOT operate lotteries, betting, games of chance, pay-to-win contests, or prize competitions where payment increases odds of winning.'},
    {sub:'5.2',text:'All payments made to POETRYWRITES are for promotional and advertising services only.'},
    {sub:'5.3',text:'No Guarantee: While promotions increase reach, POETRYWRITES does not guarantee wins, specific levels of engagement, follower growth, or financial returns.'},
    {sub:'5.4',text:'No Refunds: All promotional package purchases are final and non-refundable once campaign delivery begins.'},
  ]},
  { num:'6', title:'Eligibility & Payouts', clauses:[
    {sub:'6.1',text:'Eligibility: Open to Nigerian residents aged 18 and above.'},
    {sub:'6.2',text:'KYC Requirement: All prize recipients must complete Know Your Customer verification with valid NIN, BVN, and bank account details as required by CBN regulations.'},
    {sub:'6.3',text:'Prize Disbursement: Approved prizes are paid within 7 working days via bank transfer to the verified account of the winner.'},
  ]},
  { num:'7', title:'User Submissions & Intellectual Property', clauses:[
    {sub:'7.1',text:'By submitting work to POETRYWRITES, you confirm it is your original creation.'},
    {sub:'7.2',text:'You grant POETRYWRITES a non-exclusive, worldwide license to display, promote, and advertise your submitted work across our platform and marketing channels.'},
    {sub:'7.3',text:'You retain full copyright ownership of your work.'},
  ]},
  { num:'8', title:'Payments', clauses:[
    {sub:'8.1',text:'All payments are processed by licensed payment partners. POETRYWRITES does not store card or bank details.'},
    {sub:'8.2',text:'Transaction receipts will reflect POETRYWRITES as the merchant.'},
  ]},
  { num:'9', title:'Amendments', clauses:[
    {sub:'9.0',text:'POETRYWRITES may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.'},
  ]},
]

// ── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const barRef = useRef(null)
  useEffect(() => {
    const update = () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100
      if (barRef.current) barRef.current.style.width = pct + '%'
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return <div ref={barRef} className="scroll-progress" />
}

// ── Magnetic tilt card ───────────────────────────────────────────────────────
function MagneticCard({ children, className = '', style = {}, strength = 12 }) {
  const ref = useRef(null)
  const shineRef = useRef(null)
  const raf = useRef(null)
  const target = useRef({ rx: 0, ry: 0 })
  const current = useRef({ rx: 0, ry: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      target.current.rx = ((e.clientY - cy) / rect.height) * strength
      target.current.ry = -((e.clientX - cx) / rect.width) * strength
      const sx = ((e.clientX - rect.left) / rect.width) * 100
      const sy = ((e.clientY - rect.top) / rect.height) * 100
      if (shineRef.current) {
        shineRef.current.style.setProperty('--sx', sx + '%')
        shineRef.current.style.setProperty('--sy', sy + '%')
        shineRef.current.style.opacity = '1'
      }
    }
    const onLeave = () => {
      target.current.rx = 0
      target.current.ry = 0
      if (shineRef.current) shineRef.current.style.opacity = '0'
    }

    const tick = () => {
      current.current.rx += (target.current.rx - current.current.rx) * 0.1
      current.current.ry += (target.current.ry - current.current.ry) * 0.1
      el.style.transform = `perspective(800px) rotateX(${current.current.rx}deg) rotateY(${current.current.ry}deg) translateZ(8px)`
      raf.current = requestAnimationFrame(tick)
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    raf.current = requestAnimationFrame(tick)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [strength])

  return (
    <div ref={ref} className={`tilt-card ${className}`} style={{ position: 'relative', ...style }}>
      <div ref={shineRef} className="card-shine" style={{ position:'absolute', inset:0, borderRadius:'inherit', pointerEvents:'none', background:'radial-gradient(circle at var(--sx,50%) var(--sy,50%), rgba(255,255,255,0.1) 0%, transparent 55%)', opacity:0, transition:'opacity 0.4s', zIndex:2 }} />
      {children}
    </div>
  )
}

// ── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.07, rootMargin: '0px 0px -30px 0px' }
    )
    document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  })
}

// ── Char split headline ──────────────────────────────────────────────────────
function SplitText({ text, style = {}, delay = 0 }) {
  return (
    <span style={{ display:'inline-block', overflow:'hidden', ...style }}>
      {text.split('').map((ch, i) => (
        <span key={i} className="char" style={{ animationDelay: `${delay + i * 40}ms` }}>
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  )
}

// ── Page header ──────────────────────────────────────────────────────────────
function PageHeader({ eyebrow, title, accent, subtitle }) {
  return (
    <div style={{ background:'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 65%)', borderBottom:'1px solid rgba(201,168,76,0.1)', padding:'88px 24px 60px', textAlign:'center', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'50%', left:'50%', width:600, height:600, border:'1px solid rgba(201,168,76,0.05)', borderRadius:'50%', transform:'translate(-50%,-50%)', animation:'rotateSlow 30s linear infinite', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'50%', left:'50%', width:380, height:380, border:'1px solid rgba(201,168,76,0.04)', borderRadius:'50%', transform:'translate(-50%,-50%)', animation:'rotateSlow 20s linear infinite reverse', pointerEvents:'none' }} />
      <div className="reveal" style={{ position:'relative', zIndex:2 }}>
        <p style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.35em', color:'#c9a84c', marginBottom:18, textTransform:'uppercase' }}>{eyebrow}</p>
        <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:'clamp(38px,7vw,72px)', color:'#fff', lineHeight:1.1, marginBottom: subtitle ? 20 : 0 }}>
          {title}{' '}
          {accent && <span className="gold-text" style={{ fontStyle:'italic' }}>{accent}</span>}
        </h1>
        {subtitle && <p style={{ fontFamily:'EB Garamond,serif', fontSize:19, color:'rgba(232,213,163,0.55)', maxWidth:520, margin:'0 auto' }}>{subtitle}</p>}
      </div>
    </div>
  )
}

// ════════════ HOME ════════════════════════════════════════════════════════════
export function Home() {
  useReveal()
  const { user, signInWithGoogle } = useAuth()
  const [vis, setVis] = useState(false)
  const logoRef = useRef(null)
  const heroRef = useRef(null)

  useEffect(() => { setTimeout(() => setVis(true), 80) }, [])

  // Parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        const y = window.scrollY
        heroRef.current.style.transform = `translateY(${y * 0.35}px)`
        heroRef.current.style.opacity = Math.max(0, 1 - y / 600)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 3D logo tilt
  useEffect(() => {
    const el = logoRef.current
    if (!el) return
    const move = (e) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top  + rect.height / 2
      const rx = ((e.clientY - cy) / 30).toFixed(2)
      const ry = (-(e.clientX - cx) / 30).toFixed(2)
      el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.06)`
    }
    const leave = () => { el.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)' }
    window.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => { window.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) }
  }, [vis])

  return (
    <div style={{ background:'#000', minHeight:'100vh' }} className="grain">
      <ScrollProgress />

      {/* Hero */}
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', background:'radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.07) 0%, #000 65%)', padding:'88px 24px 60px' }}>
        <Particles count={40} />

        {/* Orbital rings */}
        {[800,580,380].map((s,i) => (
          <div key={s} style={{ position:'absolute', width:s, height:s, border:'1px solid rgba(201,168,76,0.04)', borderRadius:'50%', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:`rotateSlow ${28+i*10}s linear infinite${i%2?' reverse':''}`, pointerEvents:'none' }} />
        ))}

        {/* Ambient glow orbs */}
        <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)', top:'20%', left:'10%', filter:'blur(60px)', animation:'orbFloat 14s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', bottom:'20%', right:'10%', filter:'blur(60px)', animation:'orbFloat 18s ease-in-out infinite reverse', pointerEvents:'none' }} />

        <div ref={heroRef} style={{ position:'relative', zIndex:10, textAlign:'center', maxWidth:800 }}>
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, border:'1px solid rgba(201,168,76,0.35)', borderRadius:100, padding:'6px 22px', marginBottom:44, background:'rgba(201,168,76,0.05)', opacity:vis?1:0, transform:vis?'translateY(0)':'translateY(20px)', transition:'all 0.8s ease 0.2s', backdropFilter:'blur(8px)' }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#c9a84c', display:'inline-block', animation:'glowPulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.2em', color:'#c9a84c' }}>ENTRY IS FREE — COMPETITION COMING SOON</span>
          </div>

          {/* 3D Logo */}
          <div ref={logoRef} style={{
            display:'flex', justifyContent:'center', marginBottom:40,
            opacity:vis?1:0, transition:'opacity 1s ease 0.4s, transform 0.3s ease',
            animation:'logoGlow 4s ease-in-out infinite',
          }}>
            <div style={{
              width:170, height:170, borderRadius:'50%', overflow:'hidden',
              border:'2px solid rgba(201,168,76,0.5)',
              boxShadow:'0 0 80px rgba(201,168,76,0.5), 0 0 160px rgba(201,168,76,0.18)',
            }}>
              <img src={logoImg} alt="PoetryWrites" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
          </div>

          {/* Headline with char split */}
          <h1 style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:'clamp(44px,9vw,94px)', color:'#fff', lineHeight:1.0, marginBottom:8, opacity:vis?1:0, transition:'opacity 0.3s ease 0.5s' }}>
            {vis && <SplitText text="Poetry Writing" delay={600} />}
          </h1>
          <h1 className="gold-text" style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:300, fontStyle:'italic', fontSize:'clamp(44px,9vw,94px)', lineHeight:1.0, marginBottom:36, opacity:vis?1:0, transition:'opacity 0.3s ease 0.7s' }}>
            {vis && <SplitText text="Competition" delay={900} />}
          </h1>

          <p style={{ fontFamily:'EB Garamond,serif', fontSize:20, color:'rgba(232,213,163,0.65)', maxWidth:560, margin:'0 auto 52px', lineHeight:1.8, opacity:vis?1:0, transition:'all 0.9s ease 1.4s' }}>
            Where words become recognition. Submit your finest verse and compete for prizes worth up to <strong style={{ color:'#f0d080' }}>₦150,000</strong>.
          </p>

          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap', opacity:vis?1:0, transition:'all 0.9s ease 1.6s' }}>
            {user
              ? <Link to="/dashboard" style={{ textDecoration:'none' }}><button className="btn-gold magnetic">My Dashboard →</button></Link>
              : <button className="btn-gold magnetic" onClick={signInWithGoogle}>Sign In to Enter</button>
            }
            <Link to="/prizes" style={{ textDecoration:'none' }}><button className="btn-outline magnetic">View Prizes</button></Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position:'absolute', bottom:36, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, opacity:vis?0.6:0, transition:'opacity 1.2s ease 2s' }}>
          <span style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.3em', color:'rgba(201,168,76,0.6)' }}>SCROLL</span>
          <div style={{ width:1, height:48, background:'linear-gradient(to bottom, #c9a84c, transparent)', animation:'floatSlow 2s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Stats marquee */}
      <div style={{ background:'#050505', borderTop:'1px solid rgba(201,168,76,0.1)', borderBottom:'1px solid rgba(201,168,76,0.1)', padding:'20px 0', overflow:'hidden' }}>
        <div className="marquee-track">
          {[...Array(2)].flatMap(() => ['₦300,000+ PRIZE POOL','✦','FREE ENTRY','✦','3 PRIZE TIERS','✦','OPEN TO ALL POETS','✦','CAC REGISTERED','✦','7-DAY PRIZE PAYOUT','✦']).map((t,i) => (
            <span key={i} style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.25em', whiteSpace:'nowrap', padding:'0 20px', color: t==='✦' ? '#c9a84c' : 'rgba(232,213,163,0.4)' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ padding:'90px 24px', background:'#000' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[['₦300,000+','Total Prizes'],['FREE','Entry Cost'],['3','Prize Tiers'],['7 Days','Prize Payout']].map(([v,l],i) => (
            <MagneticCard key={l} className={`reveal d${i+1} card`} style={{ padding:'32px 20px', textAlign:'center', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
              <div className="gold-text" style={{ fontFamily:'Cormorant Garamond,serif', fontSize:38, fontWeight:700, marginBottom:8 }}>{v}</div>
              <div style={{ fontFamily:'Cinzel,serif', fontSize:8, letterSpacing:'0.2em', color:'rgba(232,213,163,0.35)' }}>{l.toUpperCase()}</div>
            </MagneticCard>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding:'0 24px 90px', background:'#000' }}>
        <div className="max-w-5xl mx-auto">
          <div className="reveal" style={{ textAlign:'center', marginBottom:52 }}>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:'clamp(32px,5vw,52px)', fontWeight:700, color:'#fff' }}>
              Why <span className="gold-text" style={{ fontStyle:'italic' }}>PoetryWrites?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon:'✦', title:'Literary Excellence', desc:'Judged by independent literary experts on creativity, technique, and originality.' },
              { icon:'◈', title:'Real Cash Prizes', desc:'Win up to ₦150,000 in cash. Paid within 7 working days directly to your account.' },
              { icon:'❋', title:'Free to Enter', desc:'No submission fee ever. We remove all barriers between talent and recognition.' },
            ].map(({ icon, title, desc }, i) => (
              <MagneticCard key={title} className={`reveal d${i+1} card`} style={{ padding:'40px 28px', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)' }} />
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:34, color:'#c9a84c', marginBottom:18 }}>{icon}</div>
                <h3 style={{ fontFamily:'Cinzel,serif', fontSize:13, letterSpacing:'0.12em', color:'#fff', marginBottom:12 }}>{title.toUpperCase()}</h3>
                <p style={{ fontFamily:'EB Garamond,serif', fontSize:16, color:'rgba(232,213,163,0.55)', lineHeight:1.75 }}>{desc}</p>
              </MagneticCard>
            ))}
          </div>
        </div>
      </div>

      {/* Quote CTA */}
      <div style={{ padding:'90px 24px', background:'radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, #000 70%)', borderTop:'1px solid rgba(201,168,76,0.08)', textAlign:'center' }}>
        <div className="reveal max-w-xl mx-auto">
          <p style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontStyle:'italic', color:'rgba(232,213,163,0.5)', lineHeight:1.7, marginBottom:18 }}>
            "Poetry is when an emotion has found its thought and the thought has found words."
          </p>
          <p style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.25em', color:'rgba(201,168,76,0.4)', marginBottom:40 }}>— ROBERT FROST</p>
          {!user && <button className="btn-gold magnetic" onClick={signInWithGoogle}>Create Your Account — Free</button>}
        </div>
      </div>
    </div>
  )
}

// ════════════ ABOUT ═══════════════════════════════════════════════════════════
export function About() {
  useReveal()
  return (
    <div style={{ background:'#000', minHeight:'100vh', paddingTop:80 }}>
      <ScrollProgress />
      <PageHeader eyebrow="OUR STORY" title="About" accent="PoetryWrites" />
      <div className="max-w-4xl mx-auto px-6 py-16 pb-24">

        {/* Logo showcase */}
        <div className="reveal" style={{ display:'flex', justifyContent:'center', marginBottom:64 }}>
          <MagneticCard style={{ padding:'44px 60px', border:'1px solid rgba(201,168,76,0.2)', borderRadius:4, background:'rgba(201,168,76,0.03)', textAlign:'center', boxShadow:'0 0 60px rgba(201,168,76,0.08)', animation:'borderGlow 4s ease-in-out infinite', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
            <div style={{ width:120, height:120, borderRadius:'50%', overflow:'hidden', border:'2px solid rgba(201,168,76,0.5)', boxShadow:'0 0 40px rgba(201,168,76,0.4)', margin:'0 auto 16px', animation:'logoGlow 4s ease-in-out infinite' }}>
              <img src={logoImg} alt="PoetryWrites" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            </div>
            <div className="gold-text" style={{ fontFamily:'Cinzel,serif', fontWeight:700, fontSize:18, letterSpacing:'0.25em', marginBottom:6 }}>POETRYWRITES</div>
            <div style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.25em', color:'rgba(201,168,76,0.4)' }}>WHERE WORDS BECOME RECOGNITION</div>
          </MagneticCard>
        </div>

        {[
          ['WHO WE ARE','A Stage for Every Poet','PoetryWrites is a digital literary arts and advertising platform dedicated to discovering, celebrating, and amplifying poetic voices across Nigeria and beyond. Registered with the Corporate Affairs Commission (CAC), we are committed to giving every poet a stage.'],
          ['OUR MISSION','Bridging Talent & Recognition','We bridge the gap between raw poetic talent and meaningful recognition. Through competitions, publications, and community engagement, we create pathways for emerging and established poets to gain visibility and be rewarded for their creativity.'],
          ['WHY POETRY?','The Most Human Art Form','Poetry is the most condensed and powerful form of human expression. PoetryWrites champions this art form by providing competitive platforms that challenge poets to push boundaries and speak their truth, beautifully.'],
        ].map(([ey,h,b],i) => (
          <div key={ey} className={`reveal d${i+1}`} style={{ marginBottom:52, paddingBottom:52, borderBottom:'1px solid rgba(201,168,76,0.07)' }}>
            <p style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.3em', color:'#c9a84c', marginBottom:10 }}>{ey}</p>
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, fontWeight:700, color:'#fff', marginBottom:16 }}>{h}</h2>
            <p style={{ fontFamily:'EB Garamond,serif', fontSize:18, color:'rgba(232,213,163,0.6)', lineHeight:1.9 }}>{b}</p>
          </div>
        ))}

        {/* Values grid */}
        <div className="reveal" style={{ marginBottom:52 }}>
          <p style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.3em', color:'#c9a84c', marginBottom:10 }}>OUR VALUES</p>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, fontWeight:700, color:'#fff', marginBottom:28 }}>What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon:'✦', title:'Excellence',  desc:'We hold every submitted poem to the highest standard of craft and originality.' },
              { icon:'◈', title:'Inclusion',    desc:'Our platform is open to every voice, regardless of background or experience.' },
              { icon:'❋', title:'Recognition', desc:'We believe talent deserves to be seen, celebrated, and rewarded.' },
              { icon:'⟡', title:'Community',   desc:'We are building a living literary ecosystem where poets inspire one another.' },
            ].map(({ icon,title,desc },i) => (
              <MagneticCard key={title} className={`card d${i+1}`} style={{ padding:'30px 26px', overflow:'hidden' }}>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, color:'#c9a84c', marginBottom:12 }}>{icon}</div>
                <h3 style={{ fontFamily:'Cinzel,serif', fontSize:11, letterSpacing:'0.12em', color:'#fff', marginBottom:10 }}>{title.toUpperCase()}</h3>
                <p style={{ fontFamily:'EB Garamond,serif', fontSize:15, color:'rgba(232,213,163,0.55)', lineHeight:1.75 }}>{desc}</p>
              </MagneticCard>
            ))}
          </div>
        </div>

        <div className="reveal" style={{ textAlign:'center' }}>
          <Link to="/competition" style={{ textDecoration:'none' }}><button className="btn-gold magnetic">Join the Competition</button></Link>
        </div>
      </div>
    </div>
  )
}

// ════════════ COMPETITION ═════════════════════════════════════════════════════
export function Competition() {
  useReveal()
  const { user, signInWithGoogle } = useAuth()
  const steps = [
    ['01','Create an Account','Click "Sign In with Google" to create your free account. This lets you submit poems and track your entry status in real time.'],
    ['02','Write Your Poem','Craft an original poem (max 50 lines) not previously published. You may submit up to 2 poems per account. No AI-generated poems.'],
    ['03','Submit via Dashboard','Log in, go to your dashboard, and paste your poem into the submission form. Include title and optional genre. No email needed.'],
    ['04','Track Your Status','Your dashboard shows Pending, Approved, or Not Selected — updated in real time by our review team.'],
    ['05','Winners Announced','Winners are announced on our Instagram (@Poetrywrites1804) and Facebook (Calliope writes). Prizes paid within 7 days.'],
  ]
  return (
    <div style={{ background:'#000', minHeight:'100vh', paddingTop:80 }}>
      <ScrollProgress />
      <PageHeader eyebrow="ENTRY IS FREE" title="The" accent="Competition" subtitle="A free poetry writing competition open to all. Compete for cash prizes totalling ₦300,000." />
      <div className="max-w-4xl mx-auto px-6 py-16 pb-24">

        {/* Coming soon banner */}
        <MagneticCard className="reveal" style={{ background:'linear-gradient(135deg, rgba(201,168,76,0.09), rgba(201,168,76,0.03))', border:'1px solid rgba(201,168,76,0.3)', borderRadius:4, padding:'48px 40px', textAlign:'center', marginBottom:64, animation:'borderGlow 4s ease-in-out infinite', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg, transparent, #c9a84c, #f0d080, #c9a84c, transparent)' }} />
          <div style={{ fontSize:56, marginBottom:14, animation:'float 5s ease-in-out infinite' }}>⏳</div>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:38, fontWeight:700, color:'#fff', marginBottom:12 }}>Competition Launching Soon!</h2>
          <p style={{ fontFamily:'EB Garamond,serif', fontSize:18, color:'rgba(232,213,163,0.55)', maxWidth:440, margin:'0 auto 32px', lineHeight:1.8 }}>
            Create your free account now so you're ready to submit the moment entries open.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            {user
              ? <Link to="/dashboard" style={{ textDecoration:'none' }}><button className="btn-gold magnetic">Go to My Dashboard →</button></Link>
              : <button className="btn-gold magnetic" onClick={signInWithGoogle}>Sign In with Google — Free</button>
            }
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}><button className="btn-outline magnetic">📸 Follow for Updates</button></a>
          </div>
        </MagneticCard>

        {/* Steps */}
        <div className="reveal" style={{ marginBottom:60 }}>
          <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:40, fontWeight:700, color:'#fff', marginBottom:40 }}>How to Enter</h2>
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', left:20, top:0, bottom:0, width:1, background:'linear-gradient(to bottom, #c9a84c, rgba(201,168,76,0.05))' }} />
            {steps.map(([num,title,desc],i) => (
              <div key={num} className={`reveal d${i+1}`} style={{ display:'flex', gap:24, marginBottom:40 }}>
                <div style={{ width:42, height:42, borderRadius:'50%', background:'#000', border:'1px solid rgba(201,168,76,0.5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1, boxShadow:'0 0 24px rgba(201,168,76,0.25)', transition:'all 0.3s' }}>
                  <span style={{ fontFamily:'Cinzel,serif', fontSize:11, fontWeight:700, color:'#c9a84c' }}>{num}</span>
                </div>
                <div style={{ paddingTop:8 }}>
                  <h3 style={{ fontFamily:'Cinzel,serif', fontSize:12, letterSpacing:'0.12em', color:'#fff', marginBottom:8 }}>{title.toUpperCase()}</h3>
                  <p style={{ fontFamily:'EB Garamond,serif', fontSize:16, color:'rgba(232,213,163,0.55)', lineHeight:1.8 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="reveal">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[['📝','Up to 2 poems','per entrant'],['📏','Max 50 lines','per poem'],['🇳🇬','Nigerians 18+','only'],['🚫','No AI poems','original only'],['💻','Submit online','via dashboard'],['💰','Completely free','zero cost']].map(([icon,l1,l2]) => (
              <MagneticCard key={l1} className="card" style={{ padding:'24px 16px', textAlign:'center', overflow:'hidden' }}>
                <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.08em', color:'#fff', marginBottom:4 }}>{l1}</div>
                <div style={{ fontFamily:'EB Garamond,serif', fontSize:13, color:'rgba(232,213,163,0.35)' }}>{l2}</div>
              </MagneticCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════ PRIZES ══════════════════════════════════════════════════════════
export function Prizes() {
  useReveal()
  return (
    <div style={{ background:'#000', minHeight:'100vh', paddingTop:80 }}>
      <ScrollProgress />
      <PageHeader eyebrow="CASH AWARDS" title="Prizes &" accent="Rewards" subtitle={<>Compete for over <strong style={{ color:'#f0d080' }}>₦300,000</strong> in total cash prizes.</>} />
      <div className="max-w-5xl mx-auto px-6 py-16 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {PRIZES.map((p,i) => (
            <MagneticCard key={p.place} className={`reveal d${i+1}`} style={{ background:'rgba(6,6,6,0.95)', border:`1px solid ${p.border}`, borderRadius:2, boxShadow:`0 0 60px ${p.glow}`, overflow:'hidden' }}>
              <div style={{ height:3, background:`linear-gradient(90deg, transparent, ${p.color}, ${p.color}cc, ${p.color}, transparent)` }} />
              <div style={{ background:`radial-gradient(ellipse at center, ${p.color}12 0%, transparent 70%)`, padding:'48px 28px 28px', textAlign:'center' }}>
                <div style={{ fontSize:72, marginBottom:18, animation:`float ${5+i*1.5}s ease-in-out infinite`, filter:`drop-shadow(0 0 30px ${p.color}99)` }}>{p.medal}</div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:10, letterSpacing:'0.2em', color:p.color, marginBottom:10 }}>{p.ordinal.toUpperCase()}</div>
                <div className="gold-text" style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:52, lineHeight:1, marginBottom:4 }}>{p.amount}</div>
                <div style={{ fontFamily:'Cinzel,serif', fontSize:9, letterSpacing:'0.15em', color:'rgba(232,213,163,0.3)' }}>{p.label.toUpperCase()}</div>
              </div>
              <div style={{ borderTop:`1px solid ${p.color}22`, padding:'24px 28px 36px' }}>
                {p.perks.map(pk => (
                  <div key={pk} style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                    <span style={{ color:p.color, fontSize:10, marginTop:4, flexShrink:0 }}>✦</span>
                    <span style={{ fontFamily:'EB Garamond,serif', fontSize:15, color:'rgba(232,213,163,0.6)' }}>{pk}</span>
                  </div>
                ))}
              </div>
            </MagneticCard>
          ))}
        </div>

        <MagneticCard className="reveal card" style={{ padding:'36px 44px', textAlign:'center', marginBottom:52, overflow:'hidden' }}>
          <p style={{ fontFamily:'EB Garamond,serif', fontSize:18, color:'rgba(232,213,163,0.6)', lineHeight:1.8 }}>
            All winners receive a <strong style={{ color:'#fff' }}>digital certificate</strong> and social media feature.
            Cash prizes disbursed within <strong style={{ color:'#f0d080' }}>7 working days</strong> via bank transfer after KYC verification (NIN, BVN required).
          </p>
        </MagneticCard>

        <div className="reveal" style={{ textAlign:'center' }}>
          <div className="gold-text" style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:'clamp(52px,10vw,90px)', marginBottom:8 }}>₦300,000</div>
          <p style={{ fontFamily:'EB Garamond,serif', fontSize:18, color:'rgba(232,213,163,0.35)', marginBottom:40 }}>combined prize pool</p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/competition" style={{ textDecoration:'none' }}><button className="btn-gold magnetic">Enter for Free</button></Link>
            <Link to="/terms"       style={{ textDecoration:'none' }}><button className="btn-outline magnetic">Read the Terms</button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ════════════ TERMS ═══════════════════════════════════════════════════════════
export function Terms() {
  useReveal()
  return (
    <div style={{ background:'#000', minHeight:'100vh', paddingTop:80 }}>
      <ScrollProgress />
      <PageHeader eyebrow="LEGAL DOCUMENT" title="Terms &" accent="Conditions" />
      <div style={{ textAlign:'center', marginTop:-8, paddingBottom:8 }}>
        <p style={{ fontFamily:'EB Garamond,serif', fontSize:14, color:'rgba(201,168,76,0.4)', letterSpacing:'0.15em' }}>Last Updated: {TERMS_UPDATED}</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 pb-24">
        <div className="reveal" style={{ background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.22)', borderRadius:2, padding:'22px 26px', marginBottom:48, display:'flex', gap:14, alignItems:'flex-start' }}>
          <span style={{ color:'#c9a84c', fontSize:22, flexShrink:0 }}>⚠</span>
          <p style={{ fontFamily:'EB Garamond,serif', fontSize:17, color:'rgba(232,213,163,0.75)', lineHeight:1.85 }}>
            By using POETRYWRITES or purchasing promotional packages, you agree to these Terms and Conditions in full. Please read them carefully.
          </p>
        </div>

        {TERMS.map(({ num, title, clauses }, i) => (
          <div key={num} className={`reveal d${Math.min(i+1,5)}`} style={{ marginBottom:48, paddingBottom:48, borderBottom: i < TERMS.length-1 ? '1px solid rgba(201,168,76,0.07)' : 'none' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:20 }}>
              <span className="gold-text" style={{ fontFamily:'Cinzel,serif', fontWeight:700, fontSize:13, flexShrink:0 }}>{num}.</span>
              <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:700, color:'#fff' }}>{title}</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {clauses.map(({ sub, text }) => (
                <div key={sub} style={{ display:'flex', gap:14, paddingLeft:34 }}>
                  <span style={{ fontFamily:'Cinzel,serif', fontSize:10, color:'rgba(201,168,76,0.4)', flexShrink:0, paddingTop:3, minWidth:28 }}>{sub}</span>
                  <p style={{ fontFamily:'EB Garamond,serif', fontSize:17, color:'rgba(232,213,163,0.62)', lineHeight:1.9 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="reveal" style={{ background:'linear-gradient(135deg,rgba(201,168,76,0.06),rgba(201,168,76,0.02))', border:'1px solid rgba(201,168,76,0.18)', borderRadius:2, padding:'26px 30px', textAlign:'center', marginBottom:22 }}>
          <p style={{ fontFamily:'EB Garamond,serif', fontSize:18, fontStyle:'italic', color:'rgba(232,213,163,0.7)' }}>
            By using POETRYWRITES or purchasing promotional packages, you agree to these Terms.
          </p>
        </div>
        <div className="reveal" style={{ background:'rgba(8,8,8,0.9)', border:'1px solid rgba(201,168,76,0.1)', borderRadius:2, padding:'20px 24px' }}>
          <p style={{ fontFamily:'EB Garamond,serif', fontSize:15, color:'rgba(232,213,163,0.45)' }}>
            Questions? Contact support at{' '}
            <a href={`mailto:${CONTACT.emailDisplay}`} style={{ color:'#c9a84c', textDecoration:'none' }}>{CONTACT.emailDisplay}</a>
            {' '}or legal/business at{' '}
            <a href="mailto:poetrywrites@gmail.com" style={{ color:'#c9a84c', textDecoration:'none' }}>poetrywrites@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

// ════════════ CONTACT ═════════════════════════════════════════════════════════
export function Contact() {
  useReveal()
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' })
  const [sent, setSent] = useState(false)
  const [errs, setErrs] = useState({})
  const [focused, setFocused] = useState('')

  const submit = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Required'
    if (!form.email.trim())   e.email   = 'Required'
    if (!form.message.trim()) e.message = 'Required'
    if (Object.keys(e).length) { setErrs(e); return }
    setSent(true)
  }

  const inp = (field) => ({
    className: 'input-gold',
    value: form[field],
    onFocus: () => setFocused(field),
    onBlur:  () => setFocused(''),
    onChange: e => { setForm({...form,[field]:e.target.value}); setErrs({...errs,[field]:''}) },
    style: { borderColor: errs[field] ? 'rgba(192,57,43,0.6)' : focused===field ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.2)' },
  })

  return (
    <div style={{ background:'#000', minHeight:'100vh', paddingTop:80 }}>
      <ScrollProgress />
      <PageHeader eyebrow="GET IN TOUCH" title="Contact" accent="Us" />
      <div className="max-w-5xl mx-auto px-6 py-16 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Info */}
          <div className="reveal-left">
            <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:34, fontWeight:700, color:'#fff', marginBottom:14 }}>Reach Our Team</h2>
            <p style={{ fontFamily:'EB Garamond,serif', fontSize:17, color:'rgba(232,213,163,0.5)', lineHeight:1.8, marginBottom:30 }}>
              Have a question about the competition, submissions, or prizes? We'd love to hear from you.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[
                { icon:'✉️', label:'Support',   value:CONTACT.emailDisplay,   href:`mailto:${CONTACT.emailDisplay}`, ext:false },
                { icon:'📧', label:'Legal',      value:'poetrywrites@gmail.com', href:'mailto:poetrywrites@gmail.com', ext:false },
                { icon:'📞', label:'Phone 1',    value:CONTACT.phone1,         href:SOCIAL.phone1, ext:false },
                { icon:'📞', label:'Phone 2',    value:CONTACT.phone2,         href:SOCIAL.phone2, ext:false },
                { icon:'📸', label:'Instagram',  value:`@${CONTACT.instagram}`, href:SOCIAL.instagram, ext:true },
                { icon:'📘', label:'Facebook',   value:CONTACT.facebook,       href:SOCIAL.facebook, ext:true },
              ].map(({ icon,label,value,href,ext }) => (
                <a key={label} href={href} target={ext?'_blank':undefined} rel={ext?'noreferrer':undefined}
                  style={{ display:'flex', gap:14, alignItems:'center', textDecoration:'none' }}
                  onMouseEnter={e => { e.currentTarget.querySelector('.cv').style.color='#c9a84c'; e.currentTarget.querySelector('.box').style.boxShadow='0 0 24px rgba(201,168,76,0.25)' }}
                  onMouseLeave={e => { e.currentTarget.querySelector('.cv').style.color='rgba(232,213,163,0.65)'; e.currentTarget.querySelector('.box').style.boxShadow='none' }}>
                  <div className="box" style={{ width:48, height:48, background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.18)', borderRadius:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, transition:'box-shadow 0.3s' }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily:'Cinzel,serif', fontSize:8, letterSpacing:'0.2em', color:'rgba(201,168,76,0.4)', marginBottom:2 }}>{label.toUpperCase()}</div>
                    <div className="cv" style={{ fontFamily:'EB Garamond,serif', fontSize:15, color:'rgba(232,213,163,0.65)', transition:'color 0.2s' }}>{value}</div>
                  </div>
                </a>
              ))}
            </div>
            <div style={{ borderTop:'1px solid rgba(201,168,76,0.08)', paddingTop:26, marginTop:22, display:'flex', gap:10 }}>
              <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}><button className="btn-gold magnetic" style={{ padding:'10px 18px', fontSize:10 }}>📸 Instagram</button></a>
              <a href={SOCIAL.facebook}  target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}><button className="btn-outline magnetic" style={{ padding:'10px 18px', fontSize:10 }}>📘 Facebook</button></a>
            </div>
          </div>

          {/* Form */}
          <div className="reveal">
            {sent ? (
              <MagneticCard style={{ background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:4, padding:'60px 44px', textAlign:'center', animation:'borderGlow 3s ease-in-out infinite', overflow:'hidden' }}>
                <div style={{ fontSize:52, marginBottom:18 }}>✦</div>
                <h3 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:30, fontWeight:700, color:'#fff', marginBottom:12 }}>Message Received</h3>
                <p style={{ fontFamily:'EB Garamond,serif', fontSize:17, color:'rgba(232,213,163,0.55)' }}>We'll get back to you as soon as possible.</p>
              </MagneticCard>
            ) : (
              <div>
                <h2 style={{ fontFamily:'Cormorant Garamond,serif', fontSize:34, fontWeight:700, color:'#fff', marginBottom:26 }}>Send a Message</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[['name','Your Name','text','Full name'],['email','Email','email','you@example.com']].map(([k,l,t,ph]) => (
                    <div key={k}>
                      <label className="label-gold">{l} *</label>
                      <input type={t} placeholder={ph} {...inp(k)} />
                      {errs[k] && <p style={{ color:'#e74c3c', fontSize:11, marginTop:3 }}>{errs[k]}</p>}
                    </div>
                  ))}
                </div>
                <div className="mb-4">
                  <label className="label-gold">Subject</label>
                  <input type="text" placeholder="What is this about?" {...inp('subject')} />
                </div>
                <div className="mb-6">
                  <label className="label-gold">Message *</label>
                  <textarea rows={6} placeholder="Your message..." {...inp('message')} style={{ ...inp('message').style, resize:'vertical' }} />
                  {errs.message && <p style={{ color:'#e74c3c', fontSize:11, marginTop:3 }}>{errs.message}</p>}
                </div>
                <button className="btn-gold magnetic" style={{ width:'100%' }} onClick={submit}>Send Message</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
