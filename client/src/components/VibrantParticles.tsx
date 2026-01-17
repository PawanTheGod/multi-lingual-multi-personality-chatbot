
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number }[];
}

const VibrantParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -200, y: -200, isDown: false });
  const animationFrameId = useRef<number>();

  const colorPalette = [
    '#00ff9f', // Vibrant Green
    '#00aaff', // Bright Blue
    '#ff00ff', // Magenta
    '#ffc800', // Gold
    '#ff2d55', // Hot Pink
    '#ffffff', // White
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (x?: number, y?: number): Particle => {
      const isAtEdge = Math.random() > 0.8;
      let px, py;

      if (isAtEdge) {
        if (Math.random() > 0.5) {
          px = Math.random() > 0.5 ? 0 : canvas.width;
          py = Math.random() * canvas.height;
        } else {
          px = Math.random() * canvas.width;
          py = Math.random() > 0.5 ? 0 : canvas.height;
        }
      } else {
        px = x ?? Math.random() * canvas.width;
        py = y ?? Math.random() * canvas.height;
      }

      return {
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2.5 + 1,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        opacity: Math.random() * 0.5 + 0.5,
        life: 0,
        maxLife: Math.random() * 200 + 150,
        trail: [],
      };
    };

    const updateParticles = () => {
      const particles = particlesRef.current;
      if (particles.length < 150 && Math.random() < 0.5) {
        particles.push(createParticle());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 5) {
          p.trail.shift();
        }

        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const warpDist = 200;

        if (dist < warpDist) {
          const force = (warpDist - dist) / warpDist;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 0.5;
          p.vy += Math.sin(angle) * force * 0.5;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;
        p.x += p.vx;
        p.y += p.vy;

        const lifeRatio = p.life / p.maxLife;
        p.opacity = Math.max(0, (1 - lifeRatio) * 0.9);

        if (
          p.life >= p.maxLife ||
          p.opacity <= 0 ||
          p.x < -p.size ||
          p.x > canvas.width + p.size ||
          p.y < -p.size ||
          p.y > canvas.height + p.size
        ) {
          particles.splice(i, 1);
        }
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'lighter';

      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const opacity = (100 - dist) / 100;
            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.1})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        // Draw trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = `${p.color}${Math.round(p.opacity * 100).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = p.size / 2;
          ctx.stroke();
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.round(p.opacity * 200).toString(16).padStart(2, '0')}`;
        
        // Glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        
        ctx.fill();
        
        // Reset shadow for next particle
        ctx.shadowBlur = 0;
      });
      
      ctx.globalCompositeOperation = 'source-over';
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouseRef.current.x = -200;
      mouseRef.current.y = -200;
    }

    const handleResize = () => {
      resizeCanvas();
      particlesRef.current = [];
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    resizeCanvas();
    for (let i = 0; i < 100; i++) {
      particlesRef.current.push(createParticle());
    }
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ backgroundColor: '#0a0a0a' }}
    />
  );
};

export default VibrantParticles;
