import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import iconSonrisa from '../assets/miiles/Sonrisa.svg';
import iconFlecha from '../assets/miiles/Flecha.png';
import iconIsotipo from '../assets/miiles/isotipo.png';
import iconFlor from '../assets/miiles/Flor.svg';
import iconMiiles from '../assets/miiles/Miiles.svg';

const mediaSrcs = [
  iconSonrisa,
  iconFlecha,
  iconIsotipo,
  iconFlor,
  iconMiiles
];

/**
 * InteractiveTitle — mwg_effect093 React port
 *
 * Strategy:
 *  • The word lives in a portal div appended to document.body (position: fixed)
 *    so it is NEVER inside smooth-wrapper's overflow:hidden — no letter clipping.
 *  • A placeholder <div> is returned into the normal layout so siblings
 *    (subtitle, CTA…) stay positioned correctly.
 *  • A GSAP ticker reads smooth-content's CSS transform every frame and mirrors
 *    the same Y translation to the portal word so it scrolls in perfect sync.
 */
const InteractiveTitleAnimated_SAVED: React.FC = () => {
  const placeholderRef = useRef<HTMLDivElement>(null);
  
  // Detect mobile width immediately
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const placeholderEl = placeholderRef.current;
    if (!placeholderEl) return;

    // ── 1. Inject CSS ─────────────────────────────────────────────────────────
    const styleEl = document.createElement('style');
    styleEl.id = 'mwg-093-style';
    styleEl.textContent = `
      .mwg-093-letter { position: relative; display: inline-block; }
      .mwg-093-letter:has(.created-media) { color: transparent; }
      .created-media {
        position: absolute;
        width: 12vw;
        height: 14vw;
        background: #ffffff;
        border-radius: 1.5vw;
        box-shadow: 0 10px 25px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(0,0,0,0.03);
        top: 50%; left: 50%;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2vw;
      }
      .created-media img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    `;
    document.head.appendChild(styleEl);

    // ── 2. Portal container ───────────────────────────────────────────────────
    const portal = document.createElement('div');
    portal.style.cssText = [
      'position:fixed',
      'top:0', 'left:0',
      'width:100%', 'height:0',
      'overflow:visible',
      'pointer-events:none',
      'z-index:50',
    ].join(';');
    document.body.appendChild(portal);

    // ── 3. Word element ───────────────────────────────────────────────────────
    const wordEl = document.createElement('p');
    wordEl.className = 'mwg-093-word';
    wordEl.style.cssText = [
      'position:absolute',
      'left:50%',
      'transform:translate(-50%,-50%)',
      'display:flex',
      'font-size:clamp(68px,15vw,210px)',
      'font-family:Manrope,sans-serif',
      'font-weight:400',
      'letter-spacing:-0.02em',
      'color:#000',
      'margin:0', 'padding:0',
      'white-space:nowrap',
      'line-height:1',
      'pointer-events:auto',
    ].join(';');

    const text = 'Redefínelo';
    wordEl.innerHTML = text.split('').map(c =>
      `<span class="mwg-093-letter">${c}</span>`
    ).join('');
    portal.appendChild(wordEl);

    // ── 4. Initial Y position from placeholder ────────────────────────────────
    const getPlaceholderCenterY = () => {
      const r = placeholderEl.getBoundingClientRect();
      return r.top + r.height / 2;
    };
    const initialCenterY = getPlaceholderCenterY();
    wordEl.style.top = `${initialCenterY}px`;

    // ── 5. Fade-in ─────────────────────────────────────────────────────────────
    gsap.fromTo(wordEl,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 }
    );

    // ── 6. Interactive effect ──────────────────────────────────────────────────
    const letters = Array.from(
      wordEl.querySelectorAll('.mwg-093-letter')
    ) as HTMLElement[];
    const overflows = new Array(letters.length).fill(0);
    let mediaIndex = 0;

    function applyLetterOffsets() {
      if (!letters.length) return;
      let sumLeft = 0;
      const targets = overflows.map((ov, i) => {
        const sumRight = overflows.slice(i + 1).reduce((a: number, v: number) => a + v, 0);
        const x = sumLeft - sumRight;
        sumLeft += ov;
        return x;
      });
      gsap.to(letters, {
        x: (i: number) => targets[i],
        duration: 0.3,
        ease: 'back.out(3)',
        overwrite: 'auto',
      });
    }

    function createMedia(letter: HTMLElement) {
      // Create a uniform premium card to house the icons
      const card = document.createElement('div');
      card.classList.add('created-media');

      const img = document.createElement('img');
      img.src = mediaSrcs[mediaIndex];
      card.appendChild(img);
      letter.appendChild(card);

      gsap.set(card, { yPercent: -50, xPercent: -50 });
      gsap.from(card, {
        rotation: (Math.random() - 0.5) * 20,
        scale: 1.05,
        duration: 0.3,
        ease: 'back.out(2)',
      });

      mediaIndex = (mediaIndex + 1) % mediaSrcs.length;

      const index = letters.indexOf(letter);
      if (index === -1) return;

      // Card is 12vw wide, use 0.135 to create a 1.5vw gap between them
      const mediaWidth = 0.135 * window.innerWidth;
      const overflowX = Math.max(
        0,
        (mediaWidth - letter.getBoundingClientRect().width) / 2
      );
      overflows[index] = Math.max(overflows[index], overflowX);
      applyLetterOffsets();

      gsap.delayedCall(1.2, () => {
        const parent = card.parentElement as HTMLElement | null;
        const idx = parent ? letters.indexOf(parent) : -1;
        if (idx !== -1) overflows[idx] = 0;
        card.remove();
        applyLetterOffsets();
        if (parent) {
          gsap.from(parent, {
            rotation: (Math.random() - 0.5) * 20,
            scale: 1.05,
            duration: 0.3,
            ease: 'back.out(2)',
          });
        }
      });
    }

    letters.forEach(letter => {
      letter.addEventListener('mouseenter', () => {
        if (letter.children.length === 0) createMedia(letter);
      });
    });

    // ── 7. Scroll sync via GSAP ticker ────────────────────────────────────────
    const smoothContent = document.getElementById('smooth-content');
    const ticker = () => {
      let ty = 0;
      if (smoothContent) {
        const t = smoothContent.style.transform;
        if (t) {
          const m = new DOMMatrix(t);
          ty = m.m42;
        }
      }
      const centerY = initialCenterY + ty;
      wordEl.style.top = `${centerY}px`;

      const halfH = wordEl.offsetHeight / 2;
      const visible = centerY + halfH > 0 && centerY - halfH < window.innerHeight;
      portal.style.pointerEvents = visible ? 'auto' : 'none';
      wordEl.style.visibility = visible ? 'visible' : 'hidden';
    };

    gsap.ticker.add(ticker);

    // ── 8. Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      gsap.ticker.remove(ticker);
      portal.remove();
      styleEl.remove();
      gsap.killTweensOf(letters);
    };
  }, [isMobile]);

  const text = 'Redefínelo';

  if (isMobile) {
    return (
      <h1
        className="font-normal leading-[1] tracking-tighter mb-6 text-black flex justify-center whitespace-nowrap"
        style={{ fontSize: 'clamp(68px, 15vw, 210px)' }}
      >
        {text}
      </h1>
    );
  }

  // Transparent placeholder — keeps layout height for siblings below the title
  return (
    <div
      ref={placeholderRef}
      aria-hidden="true"
      style={{ height: 'clamp(80px, 20vw, 260px)' }}
    />
  );
};

// ==========================================
// NUEVO COMPONENTE: TEXTO NORMAL (ESTÁTICO)
// ==========================================
const InteractiveTitle = () => {
  const text = 'Redefínelo';
  
  return (
    <h1
      className="font-normal leading-[1] tracking-tighter mb-6 text-black flex justify-center whitespace-nowrap"
      style={{ fontSize: 'clamp(68px, 15vw, 210px)' }}
    >
      {text}
    </h1>
  );
};

export default InteractiveTitle;
