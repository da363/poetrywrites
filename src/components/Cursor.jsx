import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dot   = useRef(null)
  const ring  = useRef(null)
  const trails = useRef([])
  const pos   = useRef({ mx: window.innerWidth/2, my: window.innerHeight/2, rx: window.innerWidth/2, ry: window.innerHeight/2 })

  useEffect(() => {
    // Create trail dots
    const trailEls = []
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div')
      el.className = 'cursor-trail'
      el.style.opacity = (1 - i * 0.15).toString()
      el.style.width = el.style.height = `${8 - i}px`
      document.body.appendChild(el)
      trailEls.push({ el, x: pos.current.mx, y: pos.current.my })
    }
    trails.current = trailEls

    const move = (e) => {
      pos.current.mx = e.clientX
      pos.current.my = e.clientY
      if (dot.current) {
        dot.current.style.left = e.clientX + 'px'
        dot.current.style.top  = e.clientY + 'px'
      }
    }

    const enter = () => ring.current?.classList.add('expanded')
    const leave = () => ring.current?.classList.remove('expanded')

    let raf
    const tick = () => {
      const { mx, my } = pos.current
      pos.current.rx += (mx - pos.current.rx) * 0.1
      pos.current.ry += (my - pos.current.ry) * 0.1

      if (ring.current) {
        ring.current.style.left = pos.current.rx + 'px'
        ring.current.style.top  = pos.current.ry + 'px'
      }

      // Trail — each dot follows the one before
      let px = mx, py = my
      trailEls.forEach((t, i) => {
        t.x += (px - t.x) * (0.25 - i * 0.03)
        t.y += (py - t.y) * (0.25 - i * 0.03)
        t.el.style.left = t.x + 'px'
        t.el.style.top  = t.y + 'px'
        px = t.x; py = t.y
      })

      raf = requestAnimationFrame(tick)
    }

    // Make all interactive elements expand ring
    const addListeners = () => {
      document.querySelectorAll('a,button,[data-hover],input,textarea').forEach(el => {
        el.addEventListener('mouseenter', enter)
        el.addEventListener('mouseleave', leave)
      })
    }

    window.addEventListener('mousemove', move)
    addListeners()
    raf = requestAnimationFrame(tick)

    // Re-bind on DOM changes
    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
      observer.disconnect()
      trailEls.forEach(t => t.el.remove())
    }
  }, [])

  return (
    <>
      <div ref={dot}  className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}
