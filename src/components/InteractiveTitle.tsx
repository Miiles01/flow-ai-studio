import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const mediaSrcs = [
  "https://wearemiiles.com/wp-content/uploads/2026/01/3232-932x1024.png",
  "https://wearemiiles.com/wp-content/uploads/2026/01/new233-933x1024.png",
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1533227260815-484d6641f1da?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=400&auto=format&fit=crop",
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
const InteractiveTitle: React.FC = () => {
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
        width: 14vw; height: auto;
        top: 50%; left: 50%;
        border-radius: 1.5vw;
        pointer-events: none;
      }
    `;
    document.head.appendChild(styleEl);

    // ── 2. Portal container ───────────────────────────────────────────────────
    // position:fixed / height:0 / overflow:visible so letters are never clipped.
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
    // We read the placeholder's viewport center once.
    // The ticker will keep adjusting based on scroll.
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

    // ── 6. Interactive effect (desktop only) — exact mwg_effect093 JS ─────────
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    if (!isMobile) {
      const letters = Array.from(
        wordEl.querySelectorAll('.mwg-093-letter')
      ) as HTMLElement[];
      const overflows = new Array(letters.length).fill(0);
      // Font is 15vw, images are 14vw — scale mediaWidth proportionally
      // so the spread is as dramatic as the original 10vw/9vw ratio.
      const mediaWidth = 0.14 * window.innerWidth;
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
        const img = document.createElement('img');
        img.src = mediaSrcs[mediaIndex];
        img.classList.add('created-media');
        letter.appendChild(img);

        gsap.set(img, { yPercent: -50, xPercent: -50 });
        gsap.from(img, {
          rotation: (Math.random() - 0.5) * 20,
          scale: 1.05,
          duration: 0.3,
          ease: 'back.out(2)',
        });

        mediaIndex = (mediaIndex + 1) % mediaSrcs.length;

        const index = letters.indexOf(letter);
        if (index === -1) return;

        const overflowX = Math.max(
          0,
          (mediaWidth - letter.getBoundingClientRect().width) / 2
        );
        overflows[index] = Math.max(overflows[index], overflowX);
        applyLetterOffsets();

        gsap.delayedCall(1.2, () => {
          const parent = img.parentElement as HTMLElement | null;
          const idx = parent ? letters.indexOf(parent) : -1;
          if (idx !== -1) overflows[idx] = 0;
          img.remove();
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
    }

    // ── 7. Scroll sync via GSAP ticker ────────────────────────────────────────
    // ScrollSmoother applies a CSS transform to #smooth-content.
    // We read that transform's Y component each frame and mirror it on the portal
    // word, so it scrolls in perfect sync with the page content.
    const smoothContent = document.getElementById('smooth-content');

    const ticker = () => {
      let ty = 0;
      if (smoothContent) {
        const t = smoothContent.style.transform;
        if (t) {
          const m = new DOMMatrix(t);
          ty = m.m42; // negative as page scrolls down
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
    };
  }, []);

  // Transparent placeholder — keeps layout height for siblings below the title
  return (
    <div
      ref={placeholderRef}
      aria-hidden="true"
      style={{ height: 'clamp(80px, 20vw, 260px)' }}
    />
  );
};

export default InteractiveTitle;
