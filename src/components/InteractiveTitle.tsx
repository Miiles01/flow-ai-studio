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

    // Initial simple fade in for the whole title
    gsap.fromTo(root, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.1 }
    );

    if (window.matchMedia("(max-width: 768px)").matches) return;

    const word = root.querySelector('.word') as HTMLElement;
    if (!word) return;

    const letters = Array.from(word.querySelectorAll('.letter')) as HTMLElement[];
    if (letters.length === 0) return;

    const overflows = new Array(letters.length).fill(0);
    const mediaWidth = 0.095 * window.innerWidth;
    let mediaIndex = 0;

    const applyLetterOffsets = () => {
      let sumLeft = 0;
      const targets = overflows.map((ov, i) => {
        const sumRight = overflows.slice(i + 1).reduce((a, v) => a + v, 0);
        const x = sumLeft - sumRight;
        sumLeft += ov;
        return x;
      });

      gsap.to(letters, {
        x: (i) => targets[i],
        duration: 0.3,
        ease: 'back.out(3)',
        overwrite: 'auto'
      });
    };

    const createMedia = (letter: HTMLElement) => {
      const img = document.createElement('img');
      img.src = mediaSrcs[mediaIndex];
      img.classList.add('created-media');
      
      // Original CSS logic applied via inline styles
      img.style.position = 'absolute';
      img.style.width = '9vw';
      img.style.height = 'auto';
      img.style.top = '50%';
      img.style.left = '50%';
      img.style.borderRadius = '1vw';
      img.style.pointerEvents = 'none';

      letter.appendChild(img);

      gsap.set(img, {
        yPercent: -50,
        xPercent: -50,
      });
      
      gsap.from(img, {
        rotation: (Math.random() - 0.5) * 20,
        scale: 1.05,
        duration: 0.3,
        ease: 'back.out(2)'
      });

      mediaIndex = (mediaIndex + 1) % mediaSrcs.length;

      const index = letters.indexOf(letter);
      if (index === -1) return;

      const overflowX = Math.max(0, (mediaWidth - letter.getBoundingClientRect().width) / 2);
      overflows[index] = Math.max(overflows[index], overflowX);
      applyLetterOffsets();

      gsap.delayedCall(1.2, () => {
        const idx = letters.indexOf(letter);
        if (idx !== -1) overflows[idx] = 0;

        img.remove();
        applyLetterOffsets();

        gsap.from(letter, {
          rotation: (Math.random() - 0.5) * 20,
          scale: 1.05,
          duration: 0.3,
          ease: 'back.out(2)'
        });
      });
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const letter = e.currentTarget as HTMLElement;
      if (letter.children.length === 0) createMedia(letter);
    };

    letters.forEach(letter => {
      letter.addEventListener('mouseenter', handleMouseEnter);
    });

    return () => {
      letters.forEach(letter => {
        letter.removeEventListener('mouseenter', handleMouseEnter);
      });
      gsap.killTweensOf(letters);
    };
  }, []);

  const text = "Redefínelo";

  return (
    <>
      <style>{`
        .letter {
          position: relative;
        }
        .letter:has(.created-media) {
          color: transparent;
        }
      `}</style>
      <h1
        ref={containerRef}
        className="text-[68px] sm:text-[100px] md:text-[120px] lg:text-[140px] xl:text-[160px] font-normal leading-[1] tracking-tighter mb-6 text-black flex justify-center whitespace-nowrap"
      >
        <span className="word flex justify-center relative">
          {text.split('').map((char, index) => (
            <span key={index} className="letter cursor-default">
              {char}
            </span>
          ))}
        </span>
      </h1>
    </>
  );
};

export default InteractiveTitle;
