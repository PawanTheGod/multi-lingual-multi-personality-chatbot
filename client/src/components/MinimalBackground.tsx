import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

type MarvelPersonality = 'spiderman' | 'ironman' | 'captain' | 'thor' | 'hulk' | 'widow';

interface MinimalBackgroundProps {
  personality: MarvelPersonality;
}

export default function MinimalBackground({ personality }: MinimalBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);
  
  const personalityThemes = {
    spiderman: {
      primary: 'from-red-500/20 via-blue-500/10 to-slate-900',
      secondary: 'from-red-600/10 via-transparent to-blue-600/10',
      accent: '#FF0000'
    },
    ironman: {
      primary: 'from-yellow-500/20 via-red-500/10 to-slate-900',
      secondary: 'from-yellow-600/10 via-transparent to-red-600/10',
      accent: '#FFD700'
    },
    captain: {
      primary: 'from-blue-600/20 via-red-600/10 to-slate-900',
      secondary: 'from-blue-700/10 via-transparent to-red-700/10',
      accent: '#002868'
    },
    thor: {
      primary: 'from-blue-400/20 via-yellow-400/10 to-slate-900',
      secondary: 'from-blue-500/10 via-transparent to-yellow-500/10',
      accent: '#4169E1'
    },
    hulk: {
      primary: 'from-green-500/20 via-purple-500/10 to-slate-900',
      secondary: 'from-green-600/10 via-transparent to-purple-600/10',
      accent: '#228B22'
    },
    widow: {
      primary: 'from-red-400/20 via-gray-600/10 to-slate-900',
      secondary: 'from-red-500/10 via-transparent to-gray-700/10',
      accent: '#DC143C'
    }
  };

  const theme = personalityThemes[personality];

  // Simple particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create simple particles
    const createParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 30; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          color: theme.accent
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
        
        // Add subtle glow
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 2;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };

    createParticles();
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [personality, theme]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Main Gradient Background */}
      <motion.div
        key={personality}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`absolute inset-0 bg-gradient-to-br ${theme.primary}`}
      />
      
      {/* Subtle Overlay Pattern */}
      <motion.div
        key={`${personality}-overlay`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className={`absolute inset-0 bg-gradient-radial ${theme.secondary} opacity-50`}
      />
      
      {/* Simple Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Minimal Accent Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left accent */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute top-20 left-20 w-32 h-32 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${theme.accent}40 0%, transparent 70%)` 
          }}
        />
        
        {/* Bottom-right accent */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full"
          style={{ 
            background: `radial-gradient(circle, ${theme.accent}30 0%, transparent 70%)` 
          }}
        />
      </div>

      {/* Simple Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`${personality}-float-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              scale: [0.5, 1, 0.5],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 8 + (i * 2),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: theme.accent,
              top: `${20 + (i * 12)}%`,
              left: `${15 + (i * 15)}%`,
              boxShadow: `0 0 10px ${theme.accent}40`
            }}
          />
        ))}
      </div>

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
}
