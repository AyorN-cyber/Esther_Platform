export default function ModernPurpleBackground() {
  return (
    <>
      {/* Light gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-purple-100" />

      {/* Animated floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large purple orb - top left */}
        <div 
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-30 animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.1) 50%, transparent 100%)'
          }}
        />
        
        {/* Medium purple orb - top right */}
        <div 
          className="absolute -top-20 right-20 w-80 h-80 rounded-full opacity-25 animate-blob animation-delay-2000"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(147, 51, 234, 0.08) 50%, transparent 100%)'
          }}
        />
        
        {/* Small purple orb - middle */}
        <div 
          className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full opacity-20 animate-blob animation-delay-4000"
          style={{
            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.3) 0%, rgba(192, 132, 252, 0.05) 50%, transparent 100%)'
          }}
        />

        {/* Bottom right orb */}
        <div 
          className="absolute bottom-20 right-40 w-72 h-72 rounded-full opacity-25 animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 100%)',
            animationDelay: '1s'
          }}
        />

        {/* Bottom left orb */}
        <div 
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20 animate-blob animation-delay-2000"
          style={{
            background: 'radial-gradient(circle, rgba(216, 180, 254, 0.4) 0%, rgba(216, 180, 254, 0.1) 50%, transparent 100%)'
          }}
        />
      </div>

      {/* Subtle grid pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(168, 85, 247, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(168, 85, 247, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Radial gradient overlay for depth */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(250, 245, 255, 0.5) 100%)'
        }}
      />
    </>
  );
}
