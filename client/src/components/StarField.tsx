import React, { useEffect, useRef } from 'react';

interface StarFieldProps {
  className?: string;
}

export const StarField: React.FC<StarFieldProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize: disable alpha if not needed for clear
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Configuration
    const STAR_COUNT = 150; // Optimized count
    const CONNECTION_DISTANCE = 120;
    const MOUSE_DISTANCE = 200;
    const DEPTH_SPEED_MULTIPLIER = 0.5;

    interface Star {
      x: number;
      y: number;
      z: number; // Depth: 0.1 (far) to 2.0 (close)
      vx: number;
      vy: number;
      size: number;
      color: string;
    }

    const stars: Star[] = [];
    
    // Colors for "space" feel
    const colors = ['#3b82f6', '#8b5cf6', '#ffffff', '#6366f1']; // Blue, Purple, White, Indigo

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        const z = Math.random() * 1.5 + 0.5; // Depth factor
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: z, 
          vx: (Math.random() - 0.5) * 0.5 * z, // Move faster if closer
          vy: (Math.random() - 0.5) * 0.5 * z,
          size: Math.random() * 1.5 * z,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }
    };

    let mouse = { x: -1000, y: -1000 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    initStars();

    let animationFrameId: number;

    const animate = () => {
      if (!ctx) return;
      
      // Clear with dark background
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);

      // Update and Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Movement
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around screen with depth conservation
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Interactive mouse parallax/repel for 3d feel
        const dx = mouse.x - star.x;
        const dy = mouse.y - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MOUSE_DISTANCE) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (MOUSE_DISTANCE - distance) / MOUSE_DISTANCE;
          // Subtle repel
          star.x -= forceDirectionX * force * 0.5 * star.z;
          star.y -= forceDirectionY * force * 0.5 * star.z;
        }

        // Draw Star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = 0.8 * (star.z / 2); // Fade further stars
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Draw Connections (Optimized: only connect close stars)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect only if close enough and roughly same depth plane (optional for clean look)
          if (dist < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(148, 163, 184, ${1 - dist / CONNECTION_DISTANCE})`; // Slate-400 fade
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 w-full h-full -z-10 bg-slate-950 ${className}`} 
      style={{ pointerEvents: 'none' }} // Ensure clicks pass through to UI
    />
  );
};
