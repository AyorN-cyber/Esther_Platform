/**
 * Dark Luxury Background - Inspired by Premium Jewelry Store
 * Features: Deep black background with subtle gold accents and elegant animations
 */

export default function DarkLuxuryBackground() {
  return (
    <>
      {/* Deep black gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />

      {/* Subtle gold radial gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top gold glow */}
        <div 
          className="absolute -top-40 left-1/4 w-96 h-96 rounded-full opacity-10 animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)'
          }}
        />
        
        {/* Right side gold glow */}
        <div 
          className="absolute top-1/3 -right-40 w-80 h-80 rounded-full opacity-10 animate-blob animation-delay-2000"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
          }}
        />
        
        {/* Bottom left gold glow */}
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 animate-blob animation-delay-4000"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, transparent 70%)'
          }}
        />

        {/* Center subtle glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 60%)'
          }}
        />
      </div>

      {/* Subtle grid pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Vignette effect */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0, 0, 0, 0.4) 100%)'
        }}
      />

      {/* Animated particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold-500 rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </>
  );
}
