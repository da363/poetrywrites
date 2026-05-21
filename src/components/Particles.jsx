import { useEffect, useRef } from 'react'

export default function Particles({ count = 35 }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ps = []
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      const size  = Math.random() * 3 + 1
      const dur   = Math.random() * 22 + 14
      const delay = Math.random() * -25
      const left  = Math.random() * 100
      const drift = (Math.random() - 0.5) * 60
      p.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px; left:${left}%;
        border-radius:50%;
        background: radial-gradient(circle, rgba(201,168,76,${Math.random()*0.8+0.2}), transparent);
        box-shadow: 0 0 ${size*3}px rgba(201,168,76,0.6);
        pointer-events:none;
        animation: particleRise ${dur}s ${delay}s linear infinite;
        --drift: ${drift}px;
      `
      el.appendChild(p)
      ps.push(p)
    }

    // Stars
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div')
      const size = Math.random() * 1.5 + 0.5
      s.className = 'star'
      s.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random()*100}%; top:${Math.random()*100}%;
        animation-duration:${Math.random()*4+2}s;
        animation-delay:${Math.random()*-5}s;
        opacity:${Math.random()*0.5+0.1};
      `
      el.appendChild(s)
      ps.push(s)
    }

    return () => ps.forEach(p => p.remove())
  }, [count])

  return <div ref={ref} className="starfield" />
}
