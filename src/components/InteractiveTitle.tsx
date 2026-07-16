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
 * The entire visual word lives in a portal appended directly to document.body
 * so it is NEVER inside smooth-wrapper's overflow:hidden.
 * Letters can spread freely without clipping.
 *
 * A transparent placeholder <div> is returned into the normal layout flow
 * so sibling elements (subtitle, CTA…) keep their correct positions.
 */
const InteractiveTitle: React.FC = () => {
  const placeholderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── 1. Inject global CSS for the effect ──────────────────────────────────
    const styleEl = document.createElement('style');
    styleEl.id = 'mwg-effect093-styles';
    styleEl.textContent = `
      .mwg_effect093 {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100dvh;
        display: grid;
        place-items: center;
        pointer-events: none;
        z-index: 50;
      }
      .mwg_effect093 .word {
        display: flex;
        font-size: clamp(68px, 15vw, 210px);
        font-family: 'Manrope', sans-serif;
        font-weight: 400;
        letter-spacing: -0.02em;
        color: #000;
        pointer-events: auto;
        margin: 0;
        padding: 0;
        white-space: nowrap;
        line-height: 1;
      }
      .mwg_effect093 .letter {
        position: relative;
        display: inline-block;
      }
      .mwg_effect093 .letter:has(.created-media) {
        color: transparent;
      }
      .mwg_effect093 .created-media {
        position: absolute;
        width: 9vw;
        height: auto;
        top: 50%;
        left: 50%;
        border-radius: 1vw;
        pointer-events: none;
      }
    `;
    document.head.appendChild(styleEl);

    // ── 2. Create the portal section at document.body level ──────────────────
    const section = document.createElement('section');
    section.className = 'mwg_effect093';
    document.body.appendChild(section);

    // ── 3. Build the word + letters ──────────────────────────────────────────
    const wordEl = document.createElement('p');
    wordEl.className = 'word';
    const text = 'Redefínelo';
    wordEl.innerHTML = text
      .split('')
      .map(char => `<span class="letter">${char}</span>`)
      .join('');
    section.appendChild(wordEl);

    // ── 4. Fade in ───────────────────────────────────────────────────────────
    gsap.fromTo(section,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 }
    );

    // ── 5. Interactive effect — EXACT port of mwg_effect093 JS ───────────────
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    let ticker: (() => void) | null = null;

    if (!isMobile) {
      const letters = [...wordEl.querySelectorAll('.letter')] as HTMLElement[];
      const overflows = new Array(letters.length).fill(0);
      const mediaWidth = 0.095 * window.innerWidth;
      let mediaIndex = 0;

      function applyLetterOffsets() {
        if (letters.length === 0) return;
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

        const overflowX = Math.max(0, (mediaWidth - letter.getBoundingClientRect().width) / 2);
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

    // ── 6. Scroll-based visibility ────────────────────────────────────────────
    // Read smooth-content's GSAP translateY to fade the portal as user scrolls.
    const smoothContent = document.querySelector('#smooth-content') as HTMLElement | null;
    const heroHeight = window.innerHeight;

    if (smoothContent) {
      ticker = () => {
        const matrix = new DOMMatrix(window.getComputedStyle(smoothContent).transform);
        const scrolled = -matrix.m42; // translateY is negative as page scrolls down
        const progress = Math.max(0, Math.min(1, scrolled / heroHeight));
        section.style.opacity = String(1 - progress);
        section.style.pointerEvents = progress > 0.5 ? 'none' : 'auto';
      };
      gsap.ticker.add(ticker);
    }

    // ── 7. Cleanup ────────────────────────────────────────────────────────────
    return () => {
      if (ticker) gsap.ticker.remove(ticker);
      section.remove();
      styleEl.remove();
    };
  }, []);

  // Transparent placeholder — keeps layout space for CTA/subtitle below the title
  return (
    <div
      ref={placeholderRef}
      aria-hidden="true"
      style={{ height: 'clamp(80px, 20vw, 260px)' }}
    />
  );
};

export default InteractiveTitle;
