import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'spark' | 'energy' | 'web' | 'lightning' | 'cosmic';
  trail: { x: number; y: number; opacity: number }[];
}

interface MarvelParticleSystemProps {
  personality: 'spiderman' | 'ironman' | 'captain' | 'thor' | 'hulk' | 'widow';
  isActive?: boolean;
  cursorInteraction?: boolean;
}

export default function MarvelParticleSystem({ 
  personality, 
  isActive = true, 
  cursorInteraction = true 
}: MarvelParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isMoving: false });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [cursorPulse, setCursorPulse] = useState(false);

  const personalityConfigs = {
    spiderman: {
      colors: ['#FF0000', '#0066CC', '#FFFFFF', '#FF6B6B', '#4ECDC4'],
      particleCount: 150,
      energyIntensity: 1.2,
      trailLength: 8,
      glowIntensity: 15,
      background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255, 0, 0, 0.3) 0%, rgba(0, 102, 204, 0.2) 35%, rgba(15, 23, 42, 0.8) 70%)',
      particleTypes: ['web', 'spark', 'energy'] as const
    },
    ironman: {
      colors: ['#FFD700', '#DC143C', '#FFA500', '#FF4500', '#FFFFFF'],
      particleCount: 200,
      energyIntensity: 1.5,
      trailLength: 12,
      glowIntensity: 20,
      background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255, 215, 0, 0.4) 0%, rgba(220, 20, 60, 0.3) 35%, rgba(15, 23, 42, 0.8) 70%)',
      particleTypes: ['energy', 'spark', 'lightning'] as const
    },
    captain: {
      colors: ['#002868', '#BF0A30', '#FFFFFF', '#87CEEB', '#4682B4'],
      particleCount: 120,
      energyIntensity: 1.0,
      trailLength: 6,
      glowIntensity: 12,
      background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(0, 40, 104, 0.3) 0%, rgba(191, 10, 48, 0.2) 35%, rgba(15, 23, 42, 0.8) 70%)',
      particleTypes: ['spark', 'energy'] as const
    },
    thor: {
      colors: ['#FFD700', '#4169E1', '#00BFFF', '#FFFFFF', '#E6E6FA'],
      particleCount: 180,
      energyIntensity: 2.0,
      trailLength: 15,
      glowIntensity: 25,
      background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255, 215, 0, 0.4) 0%, rgba(65, 105, 225, 0.3) 35%, rgba(15, 23, 42, 0.8) 70%)',
      particleTypes: ['lightning', 'energy', 'cosmic'] as const
    },
    hulk: {
      colors: ['#228B22', '#32CD32', '#9932CC', '#FFFFFF', '#98FB98'],
      particleCount: 250,
      energyIntensity: 1.8,
      trailLength: 10,
      glowIntensity: 18,
      background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(34, 139, 34, 0.4) 0%, rgba(153, 50, 204, 0.3) 35%, rgba(15, 23, 42, 0.8) 70%)',
      particleTypes: ['energy', 'spark', 'cosmic'] as const
    },
    widow: {
      colors: ['#000000', '#DC143C', '#FF69B4', '#FFFFFF', '#8B0000'],
      particleCount: 160,
      energyIntensity: 1.3,
      trailLength: 20,
      glowIntensity: 22,
      background: 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(0, 0, 0, 0.5) 0%, rgba(220, 20, 60, 0.3) 35%, rgba(15, 23, 42, 0.8) 70%)',
      particleTypes: ['web', 'energy', 'spark'] as const
    }
  };

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
    if (!dimensions.width || !dimensions.height || !isActive) return;

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
  }, [dimensions, personality, isActive]);

  const createParticle = useCallback((x?: number, y?: number): Particle => {
    const types = config.particleTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      x: x ?? Math.random() * dimensions.width,
      y: y ?? Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      life: 1,
      maxLife: Math.random() * 200 + 50,
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      type,
      trail: []
    };
  }, [config, dimensions]);

  const initializeParticles = useCallback(() => {
    particlesRef.current = [];
    for (let i = 0; i < config.particleCount; i++) {
      particlesRef.current.push(createParticle());
    }
  }, [config.particleCount, createParticle]);

  const updateParticle = useCallback((particle: Particle, index: number) => {
    // Update trail
    particle.trail.unshift({ x: particle.x, y: particle.y, opacity: particle.life });
    if (particle.trail.length > config.trailLength) {
      particle.trail.pop();
    }

    // Mouse interaction with magnetic effect
    if (cursorInteraction && mouseRef.current.isMoving) {
      const dx = mouseRef.current.x - particle.x;
      const dy = mouseRef.current.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        const force = (150 - distance) / 150;
        const attraction = force * config.energyIntensity * 0.02;
        particle.vx += (dx / distance) * attraction;
        particle.vy += (dy / distance) * attraction;
        
        // Create burst effect on close interaction
        if (distance < 50 && Math.random() < 0.3) {
          for (let i = 0; i < 3; i++) {
            particlesRef.current.push(createParticle(particle.x, particle.y));
          }
          setCursorPulse(true);
          setTimeout(() => setCursorPulse(false), 200);
        }
      }
    }

    // Update position with physics
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Apply drag
    particle.vx *= 0.995;
    particle.vy *= 0.995;

    // Boundary conditions with wrapping
    if (particle.x < 0 || particle.x > dimensions.width) {
      particle.vx *= -1;
      particle.x = Math.max(0, Math.min(dimensions.width, particle.x));
    }
    if (particle.y < 0 || particle.y > dimensions.height) {
      particle.vy *= -1;
      particle.y = Math.max(0, Math.min(dimensions.height, particle.y));
    }

    // Update life
    particle.life = Math.max(0, particle.life - 1 / particle.maxLife);

    // Regenerate dead particles
    if (particle.life <= 0) {
      Object.assign(particle, createParticle());
    }
  }, [config, cursorInteraction, createParticle, dimensions]);

  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    const alpha = particle.life;
    
    // Draw trail
    particle.trail.forEach((point, i) => {
      const trailAlpha = (point.opacity * (particle.trail.length - i)) / particle.trail.length;
      const size = particle.size * (trailAlpha * 0.5);
      
      ctx.globalAlpha = trailAlpha * 0.3;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = config.glowIntensity * trailAlpha;
      
      ctx.beginPath();
      ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw main particle with type-specific effects
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = config.glowIntensity;

    switch (particle.type) {
      case 'lightning':
        // Jagged lightning bolt effect
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.x - particle.size * 2, particle.y);
        ctx.lineTo(particle.x + particle.size, particle.y - particle.size);
        ctx.lineTo(particle.x - particle.size, particle.y + particle.size);
        ctx.lineTo(particle.x + particle.size * 2, particle.y);
        ctx.stroke();
        break;

      case 'web':
        // Web pattern
        ctx.strokeStyle = particle.color;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(
            particle.x + Math.cos(angle) * particle.size * 3,
            particle.y + Math.sin(angle) * particle.size * 3
          );
          ctx.stroke();
        }
        break;

      case 'cosmic':
        // Pulsing cosmic energy
        const pulseSize = particle.size * (1 + Math.sin(Date.now() * 0.01) * 0.3);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright core
        ctx.globalAlpha = alpha * 1.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, pulseSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      default:
        // Standard energy particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.shadowBlur = 0;
  }, [config.glowIntensity]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Clear with fade effect
    ctx.fillStyle = 'rgba(15, 23, 42, 0.05)';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter((particle, index) => {
      updateParticle(particle, index);
      drawParticle(ctx, particle);
      return true;
    });

    // Maintain particle count
    while (particlesRef.current.length < config.particleCount) {
      particlesRef.current.push(createParticle());
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [dimensions, updateParticle, drawParticle, config.particleCount, createParticle]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cursorInteraction) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        isMoving: true
      };

      // Update CSS custom properties for background gradient
      if (canvasRef.current) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        canvasRef.current.style.setProperty('--x', `${x}%`);
        canvasRef.current.style.setProperty('--y', `${y}%`);
      }
    }
  }, [cursorInteraction]);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.isMoving = false;
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Dynamic Aurora Background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{ background: config.background }}
      />
      
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-90"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Cursor Effect */}
      <AnimatePresence>
        {cursorPulse && cursorInteraction && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            className="fixed pointer-events-none z-10"
            style={{
              left: mouseRef.current.x - 20,
              top: mouseRef.current.y - 20,
              width: 40,
              height: 40,
              background: `radial-gradient(circle, ${config.colors[0]}40 0%, transparent 70%)`,
              borderRadius: '50%'
            }}
          />
        )}
      </AnimatePresence>

      {/* Marvel Energy Waves */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 70%, ${config.colors[0]}20 0%, transparent 60%)`
          }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 70% 30%, ${config.colors[1]}20 0%, transparent 60%)`
          }}
        />
      </div>
    </div>
  );
}
