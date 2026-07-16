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

    // Only run on non-mobile screens for the interactive effect
    if (window.matchMedia("(max-width: 768px)").matches) return;

    const word = root.querySelector('.word') as HTMLElement;
    if (!word) return;

    const letters = Array.from(word.querySelectorAll('.letter')) as HTMLElement[];
    if (letters.length === 0) return;

    const overflows = new Array(letters.length).fill(0);
    const mediaWidth = 0.075 * window.innerWidth;
    let mediaIndex = 0;
    let activeImages = 0;

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

    const updateContainerScale = () => {
      if (!root) return;
      // Shrink the whole word container when images appear so they don't overflow the screen edges
      const scaleValue = activeImages > 0 ? Math.max(0.7, 1 - (activeImages * 0.08)) : 1;
      gsap.to(root, {
        scale: scaleValue,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    };

    const createMedia = (letter: HTMLElement) => {
      const img = document.createElement('img');
      img.src = mediaSrcs[mediaIndex];
      img.classList.add('created-media');
      
      // Inline styles based on CSS requirement
      img.style.position = 'absolute';
      img.style.width = '7vw';
      img.style.height = 'auto';
      img.style.top = '50%';
      img.style.left = '50%';
      img.style.transform = 'translate(-50%, -50%) scale(0)';
      img.style.borderRadius = '1.5vw';
      img.style.zIndex = '0';
      img.style.pointerEvents = 'none'; // so it doesn't interfere with letter hovers

      letter.appendChild(img);
      activeImages++;
      updateContainerScale();

      gsap.to(img, {
        scale: 1.05,
        duration: 0.4,
        ease: 'back.out(1.5)',
      });

      mediaIndex = (mediaIndex + 1) % mediaSrcs.length;
      return img;
    };

    const handleMouseEnter = (e: MouseEvent) => {
      const letter = e.currentTarget as HTMLElement;
      const index = letters.indexOf(letter);
      if (index === -1) return;
      if (letter.querySelector('.created-media')) return; // Already has media

      const img = createMedia(letter);
      
      // Calculate overflow width for surrounding letters
      const overflowX = Math.max(0, (mediaWidth - letter.getBoundingClientRect().width) / 2);
      overflows[index] = overflowX;
      applyLetterOffsets();

      // Make letter transparent
      gsap.to(letter, { color: 'transparent', duration: 0.2 });

      // Clean up after some time
      gsap.delayedCall(2, () => {
        // Remove image
        gsap.to(img, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            img.remove();
            activeImages = Math.max(0, activeImages - 1);
            updateContainerScale();
          }
        });

        // Reset text color
        gsap.to(letter, { color: '#000', duration: 0.3 });

        // Reset offset
        overflows[index] = 0;
        applyLetterOffsets();
      });
    };

    letters.forEach(letter => {
      letter.addEventListener('mouseenter', handleMouseEnter);
    });

    return () => {
      letters.forEach(letter => {
        letter.removeEventListener('mouseenter', handleMouseEnter);
      });
      // Kill all ongoing delayed calls for this component
      gsap.killTweensOf(letters);
    };
  }, []);

  const text = "Redefínelo";

  return (
    <>
      <style>{`
        .letter {
          position: relative;
          display: inline-block;
          transition: color 0.1s ease;
        }
        /* When letter has-media, hide the text by making it transparent */
        .letter.has-media {
          color: transparent;
        }
      `}</style>
      <h1
        ref={containerRef}
        className="text-[68px] sm:text-[100px] md:text-[120px] lg:text-[140px] xl:text-[160px] font-normal leading-[1] tracking-tighter mb-6 text-black flex justify-center whitespace-nowrap"
      >
        <span className="word inline-flex justify-center relative">
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
