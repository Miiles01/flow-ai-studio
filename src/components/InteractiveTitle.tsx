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

const InteractiveTitle: React.FC = () => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    // Fade in animation for the whole title
    gsap.fromTo(root,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 }
    );

    // Only enable interactive effect on desktop
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const word = root.querySelector('.word') as HTMLElement;
    if (!word) return;

    const letters = Array.from(word.querySelectorAll('.letter')) as HTMLElement[];
    if (letters.length === 0) return;

    let mediaIndex = 0;

    // ─── PORTAL ────────────────────────────────────────────────────────────────
    // Images are rendered in a fixed portal at document.body level so they are
    // NEVER clipped by the ScrollSmoother wrapper's overflow:hidden.
    const portal = document.createElement('div');
    portal.setAttribute('aria-hidden', 'true');
    portal.style.cssText = [
      'position:fixed',
      'top:0',
      'left:0',
      'width:100%',
      'height:100%',
      'pointer-events:none',
      'z-index:9999',
    ].join(';');
    document.body.appendChild(portal);

    const createMedia = (letter: HTMLElement) => {
      const rect = letter.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const img = document.createElement('img');
      img.src = mediaSrcs[mediaIndex];
      img.style.cssText = [
        'position:absolute',
        'width:9vw',
        'height:auto',
        'border-radius:1vw',
        'pointer-events:none',
        `left:${cx}px`,
        `top:${cy}px`,
        'transform:translate(-50%,-50%)',
      ].join(';');
      portal.appendChild(img);

      // Appear with random rotation bounce
      gsap.fromTo(img,
        { scale: 0, rotation: (Math.random() - 0.5) * 20 },
        { scale: 1, rotation: 0, duration: 0.3, ease: 'back.out(2)' }
      );

      // Make letter transparent while image is shown
      letter.style.color = 'transparent';

      mediaIndex = (mediaIndex + 1) % mediaSrcs.length;

      gsap.delayedCall(1.2, () => {
        // Dismiss image
        gsap.to(img, {
          scale: 0,
          rotation: (Math.random() - 0.5) * 20,
          duration: 0.3,
          ease: 'back.in(2)',
          onComplete: () => img.remove(),
        });

        // Restore letter with small bounce
        letter.style.color = '';
        gsap.fromTo(letter,
          { scale: 1.05, rotation: (Math.random() - 0.5) * 10 },
          { scale: 1, rotation: 0, duration: 0.3, ease: 'back.out(2)' }
        );
      });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const letter = e.currentTarget as HTMLElement;
      // Don't spawn another image if one is already visible
      if (letter.style.color === 'transparent') return;
      createMedia(letter);
    };

    letters.forEach(letter => {
      letter.addEventListener('mouseenter', handleMouseEnter);
    });

    return () => {
      letters.forEach(letter => {
        letter.removeEventListener('mouseenter', handleMouseEnter);
      });
      gsap.killTweensOf(letters);
      portal.remove();
    };
  }, []);

  const text = 'Redefínelo';

  return (
    <h1
      ref={containerRef}
      className="font-normal leading-[1] tracking-tighter mb-6 text-black flex justify-center whitespace-nowrap"
      style={{ fontSize: 'clamp(68px, 15vw, 210px)' }}
    >
      <span className="word flex justify-center relative">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="letter cursor-default"
            style={{ position: 'relative', display: 'inline-block', transition: 'color 0.15s ease' }}
          >
            {char}
          </span>
        ))}
      </span>
    </h1>
  );
};

export default InteractiveTitle;
