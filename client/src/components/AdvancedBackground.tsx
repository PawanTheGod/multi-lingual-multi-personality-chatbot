import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  type: 'orb' | 'triangle' | 'square' | 'line';
  rotation: number;
  rotationSpeed: number;
}

interface AdvancedBackgroundProps {
  personality?: 'spiderman' | 'ironman' | 'captain' | 'thor' | 'hulk' | 'widow';
  intensity?: number;
  interactive?: boolean;
}

export default function AdvancedBackground({ 
  personality = 'spiderman', 
  intensity = 0.5,
  interactive = true 
}: AdvancedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const personalityConfigs = {
    spiderman: { colors: ['#FF0000', '#0066CC', '#FFFFFF'], particles: 90, speed: 1.2, glow: true },
    ironman: { colors: ['#FFD700', '#DC143C', '#FFA500'], particles: 110, speed: 1.4, glow: true },
    captain: { colors: ['#002868', '#BF0A30', '#FFFFFF'], particles: 80, speed: 1.0, glow: true },
    thor: { colors: ['#4169E1', '#E6E6FA', '#FFFFFF'], particles: 100, speed: 1.5, glow: true },
    hulk: { colors: ['#228B22', '#32CD32', '#9932CC'], particles: 120, speed: 1.3, glow: true },
    widow: { colors: ['#000000', '#DC143C', '#FF69B4'], particles: 95, speed: 1.2, glow: true },
  } as const;

  const config = personalityConfigs[personality];

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    initializeParticles();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, personality, intensity]);

  const initializeParticles = () => {
    const particleCount = Math.floor(config.particles * intensity);
    particlesRef.current = [];

    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle());
    }
  };

  const createParticle = (): Particle => {
    const types: Particle['type'][] = ['orb', 'triangle', 'square', 'line'];
    
    return {
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      size: Math.random() * 4 + 1,
      alpha: Math.random() * 0.6 + 0.2,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      type: types[Math.floor(Math.random() * types.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02
    };
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.globalAlpha = particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = 1;

    if (config.glow) {
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = particle.size * 2;
    }

    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);

    switch (particle.type) {
      case 'orb':
        ctx.beginPath();
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(0, -particle.size);
        ctx.lineTo(-particle.size, particle.size);
        ctx.lineTo(particle.size, particle.size);
        ctx.closePath();
        ctx.fill();
        break;

      case 'square':
        ctx.fillRect(-particle.size/2, -particle.size/2, particle.size, particle.size);
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(-particle.size, 0);
        ctx.lineTo(particle.size, 0);
        ctx.stroke();
        break;
    }

    ctx.restore();
  };

  const updateParticle = (particle: Particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.rotation += particle.rotationSpeed;

    // Mouse interaction
    if (interactive) {
      const dx = mouseRef.current.x - particle.x;
      const dy = mouseRef.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx += (dx / distance) * force * 0.01;
        particle.vy += (dy / distance) * force * 0.01;
      }
    }

    // Boundary wrapping
    if (particle.x < 0) particle.x = dimensions.width;
    if (particle.x > dimensions.width) particle.x = 0;
    if (particle.y < 0) particle.y = dimensions.height;
    if (particle.y > dimensions.height) particle.y = 0;

    // Velocity damping
    particle.vx *= 0.999;
    particle.vy *= 0.999;

    // Alpha pulsing
    particle.alpha += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.01;
    particle.alpha = Math.max(0.1, Math.min(0.8, particle.alpha));
  };

  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = config.colors[0];
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.1;

    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const p1 = particlesRef.current[i];
        const p2 = particlesRef.current[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          ctx.globalAlpha = (120 - distance) / 120 * 0.1;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Draw connections first
    drawConnections(ctx);

    // Update and draw particles
    particlesRef.current.forEach(particle => {
      updateParticle(particle);
      drawParticle(ctx, particle);
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (interactive) {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    }
  };

  return (
    <div className="fixed inset-0 -z-10">
      {/* Gradient Background */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 bg-gradient-to-br ${
          personality === 'spiderman' ? 'from-red-900 via-slate-900 to-blue-900' :
          personality === 'ironman' ? 'from-yellow-900 via-red-900 to-slate-900' :
          personality === 'captain' ? 'from-blue-900 via-slate-900 to-red-900' :
          personality === 'thor' ? 'from-indigo-900 via-slate-900 to-blue-900' :
          personality === 'hulk' ? 'from-green-900 via-slate-900 to-purple-900' :
          'from-black via-slate-900 to-red-900'
        }`}
      />
      
      {/* Animated Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-80"
        onMouseMove={handleMouseMove}
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Overlay Patterns */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%),
              linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.02) 50%, transparent 70%)
            `
          }}
        />
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute animate-float opacity-10 ${
              personality === 'spiderman' ? 'text-red-400' :
              personality === 'ironman' ? 'text-yellow-400' :
              personality === 'captain' ? 'text-blue-400' :
              personality === 'thor' ? 'text-indigo-300' :
              personality === 'hulk' ? 'text-green-400' : 'text-red-500'
            }`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
              fontSize: `${2 + Math.random() * 2}rem`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          >
            {['◆', '●', '▲', '■', '✦', '◇'][i]}
          </div>
        ))}
      </div>
    </div>
  );
}
