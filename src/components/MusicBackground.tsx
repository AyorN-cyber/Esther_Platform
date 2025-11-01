import React, { useEffect, useRef } from 'react';

export const MusicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation variables
    let animationFrameId: number;
    let time = 0;

    // Particle system
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        const colors = ['#9333ea', '#db2777', '#3b82f6'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle());
    }

    // Audio wave bars
    const bars = 64;
    const barHeights: number[] = new Array(bars).fill(0);

    // Animation loop
    const animate = () => {
      time += 0.01;
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(3, 7, 18, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines between nearby particles
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = '#9333ea';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Update and draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw audio visualizer bars at bottom
      const barWidth = canvas.width / bars;
      const centerY = canvas.height - 100;

      for (let i = 0; i < bars; i++) {
        // Simulate audio wave with sine waves
        const targetHeight = 
          Math.abs(Math.sin(time * 2 + i * 0.1) * 50) +
          Math.abs(Math.sin(time * 3 + i * 0.05) * 30) +
          Math.abs(Math.sin(time * 1.5 + i * 0.15) * 20);
        
        // Smooth transition
        barHeights[i] += (targetHeight - barHeights[i]) * 0.1;

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, centerY, 0, centerY - barHeights[i]);
        gradient.addColorStop(0, '#9333ea');
        gradient.addColorStop(0.5, '#db2777');
        gradient.addColorStop(1, '#3b82f6');

        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3;
        
        // Draw bar
        const x = i * barWidth;
        ctx.fillRect(x + 2, centerY, barWidth - 4, -barHeights[i]);
        
        // Draw reflection
        ctx.globalAlpha = 0.1;
        ctx.fillRect(x + 2, centerY, barWidth - 4, barHeights[i] * 0.3);
      }
      ctx.globalAlpha = 1;

      // Draw circular waveform
      const centerX = canvas.width / 2;
      const centerYCircle = canvas.height / 2;
      const radius = 150;

      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.15;
      ctx.beginPath();

      for (let i = 0; i < 360; i += 2) {
        const angle = (i * Math.PI) / 180;
        const wave = Math.sin(time * 3 + i * 0.05) * 20;
        const x = centerX + Math.cos(angle) * (radius + wave);
        const y = centerYCircle + Math.sin(angle) * (radius + wave);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();

      // Draw inner circle
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      const innerRadius = 100;
      for (let i = 0; i < 360; i += 2) {
        const angle = (i * Math.PI) / 180;
        const wave = Math.sin(time * 4 - i * 0.08) * 15;
        const x = centerX + Math.cos(angle) * (innerRadius + wave);
        const y = centerYCircle + Math.sin(angle) * (innerRadius + wave);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw radial lines
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 12; i++) {
        const angle = (i * 30 * Math.PI) / 180;
        const pulse = Math.sin(time * 2 + i) * 20;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX, centerYCircle);
        ctx.lineTo(
          centerX + Math.cos(angle) * (radius + pulse + 50),
          centerYCircle + Math.sin(angle) * (radius + pulse + 50)
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: 'transparent' }}
    />
  );
};
