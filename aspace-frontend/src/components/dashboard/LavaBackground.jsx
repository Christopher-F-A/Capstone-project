import React from 'react';

export default function LavaBackground({ isDarkMode, lavaColor }) {
  // Verifica se viene fornito un codice colore Hex diretto (es. "#6366f1")
  const isHexColor = lavaColor?.startsWith('#');

  // Metodo alternativo per mappare stringhe letterali di fallback alle classi Tailwind
  const getLavaClass = () => {
    if (isHexColor) return ''; // Non servono classi se usiamo lo stile inline esadecimale

    if (isDarkMode) {
      switch (lavaColor) {
        case 'fuchsia': return 'bg-fuchsia-600';
        case 'emerald': return 'bg-emerald-600';
        case 'amber': return 'bg-amber-600';
        default: return 'bg-indigo-600';
      }
    } else {
      switch (lavaColor) {
        case 'fuchsia': return 'bg-fuchsia-300';
        case 'emerald': return 'bg-emerald-300';
        case 'amber': return 'bg-amber-300';
        default: return 'bg-indigo-300';
      }
    }
  };

  return (
    <>
      {/* ANIMAZIONI PURE CSS */}
      <style>{`
        @keyframes lava1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, 60px) scale(1.15); }
          66% { transform: translate(-20px, 120px) scale(0.9); }
        }
        @keyframes lava2 {
          0%, 100% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-60px, -80px) scale(0.85); }
        }
        @keyframes lava3 {
          0%, 100% { transform: translate(0px, 0px) scale(0.9); }
          40% { transform: translate(70px, -40px) scale(1.1); }
          80% { transform: translate(-30px, 30px) scale(0.95); }
        }
        .animate-lava-slow-1 { animation: lava1 16s infinite ease-in-out; }
        .animate-lava-slow-2 { animation: lava2 22s infinite ease-in-out; }
        .animate-lava-slow-3 { animation: lava3 19s infinite ease-in-out; }
      `}</style>

      {/* STRUTTURA DELLE SFERE FLUIDE */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute w-[500px] h-[500px] rounded-full blur-[110px] mix-blend-screen opacity-45 animate-lava-slow-1 -top-20 -left-10 transition-all duration-1000 ${getLavaClass()}`}
          style={isHexColor ? { backgroundColor: lavaColor } : {}}
        />
        <div
          className={`absolute w-[550px] h-[550px] rounded-full blur-[130px] mix-blend-screen opacity-35 animate-lava-slow-2 top-1/4 -right-20 transition-all duration-1000 ${getLavaClass()}`}
          style={isHexColor ? { backgroundColor: lavaColor } : {}}
        />
        <div
          className={`absolute w-[450px] h-[450px] rounded-full blur-[100px] mix-blend-screen opacity-30 animate-lava-slow-3 bottom-0 left-1/4 transition-all duration-1000 ${getLavaClass()}`}
          style={isHexColor ? { backgroundColor: lavaColor } : {}}
        />
      </div>
    </>
  );
}