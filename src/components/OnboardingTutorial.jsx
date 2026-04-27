import React, { useState, useEffect, useRef } from 'react';

const STEPS = [
  {
    tab: 'panel',
    selector: null,
    title: '¡Bienvenido a MANGOO! 🥭',
    desc: 'En segundos te mostramos cómo funciona tu plataforma. Es súper fácil.',
    emoji: '👋',
    highlight: null,
    pulse: null,
    action: 'Empezar tour',
  },
  {
    tab: 'panel',
    title: 'Tu panel de inicio 🏠',
    desc: 'Desde aquí ves el resumen de tus pedidos, tu dirección en Miami y el estado de tus envíos.',
    emoji: '🏠',
    highlight: '.nav-link.active',
    pulse: 'panel',
    action: 'Siguiente →',
  },
  {
    tab: 'casillero',
    title: 'Tu casillero en Miami 📬',
    desc: 'Esta es tu dirección personal en Miami. Úsala cuando compres en Amazon, Nike, o cualquier tienda de USA.',
    emoji: '📬',
    highlight: null,
    pulse: 'casillero',
    action: 'Siguiente →',
  },
  {
    tab: 'tracking',
    title: 'Rastreo en tiempo real 📍',
    desc: 'Sigue cada paso de tu pedido: desde que llega a Miami hasta que toca tu puerta en Colombia.',
    emoji: '📍',
    highlight: null,
    pulse: 'tracking',
    action: 'Siguiente →',
  },
  {
    tab: 'market',
    title: 'Marketplace MANGOO 🛍️',
    desc: 'Compra productos que ya están en Miami y llegan mucho más rápido. También puedes vender lo que traes.',
    emoji: '🛍️',
    highlight: null,
    pulse: 'market',
    action: 'Siguiente →',
  },
  {
    tab: 'help',
    title: '¿Tienes dudas? ❓',
    desc: 'En Ayuda encuentras respuestas a todo: tarifas, tiempos, cómo declarar productos y más.',
    emoji: '❓',
    highlight: null,
    pulse: 'help',
    action: 'Siguiente →',
  },
  {
    tab: 'panel',
    title: '¡Listo! Ya eres parte de MANGOO 🎉',
    desc: 'Ahora sí, comienza tu primera compra. Tu casillero en Miami ya está activo y esperándote.',
    emoji: '🎉',
    highlight: null,
    pulse: null,
    action: '¡Comenzar!',
    last: true,
  },
];

export default function OnboardingTutorial({ onFinish, setPage }) {
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
  }, []);

  const current = STEPS[step];

  const goNext = () => {
    if (animating) return;
    if (current.last) {
      setVisible(false);
      setTimeout(() => onFinish(), 350);
      return;
    }
    setAnimating(true);
    const next = STEPS[step + 1];
    if (next.tab && setPage) setPage(next.tab);
    setTimeout(() => {
      setStep(s => s + 1);
      setAnimating(false);
    }, 280);
  };

  const skip = () => {
    setVisible(false);
    setTimeout(() => onFinish(), 350);
  };

  const progress = ((step) / (STEPS.length - 1)) * 100;

  return (
    <>
      {/* Overlay dim */}
      <div style={{
        position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:9998,
        opacity:visible?1:0,transition:'opacity .35s',pointerEvents:visible?'auto':'none'
      }} onClick={skip}/>

      {/* Sidebar pulse highlight */}
      {current.pulse && (
        <style>{`
          .nav-link[data-id="${current.pulse}"] {
            position: relative;
            z-index: 9999 !important;
            background: rgba(244,135,75,0.18) !important;
            box-shadow: 0 0 0 3px var(--o400), 0 0 24px rgba(244,135,75,0.5) !important;
            border-radius: 10px !important;
          }
        `}</style>
      )}

      {/* Main card */}
      <div style={{
        position:'fixed',
        bottom: 40,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible?0:40}px)`,
        opacity: visible ? 1 : 0,
        transition: 'all .35s cubic-bezier(.34,1.56,.64,1)',
        zIndex: 9999,
        width: 'min(440px, 92vw)',
        background: 'white',
        borderRadius: 20,
        boxShadow: '0 24px 80px rgba(0,0,0,0.28), 0 4px 20px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}>
        {/* Progress bar */}
        <div style={{height:4,background:'var(--g100)'}}>
          <div style={{
            height:'100%',
            width:`${progress}%`,
            background:'linear-gradient(90deg,var(--o600),var(--o400))',
            transition:'width .5s ease',
            borderRadius:2,
          }}/>
        </div>

        <div style={{padding:'24px 28px 20px'}}>
          {/* Emoji + step counter */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{
              width:56,height:56,borderRadius:16,
              background:'linear-gradient(135deg,#FFF3E0,#FFE0B2)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:28,
              boxShadow:'0 4px 16px rgba(244,135,75,0.2)',
              animation: animating?'none':'bounceIn .4s ease',
            }}>
              {current.emoji}
            </div>
            <div style={{fontSize:12,color:'var(--g400)',fontWeight:600}}>
              {step === 0 ? 'Tour rápido' : `${step} de ${STEPS.length - 1}`}
            </div>
          </div>

          {/* Title */}
          <div style={{
            fontSize:20,fontWeight:800,color:'var(--g900)',
            marginBottom:8,letterSpacing:'-.3px',
            opacity:animating?0:1,transform:animating?'translateY(8px)':'none',
            transition:'all .25s',
          }}>
            {current.title}
          </div>

          {/* Description */}
          <div style={{
            fontSize:14,color:'var(--g600)',lineHeight:1.65,marginBottom:24,
            opacity:animating?0:1,transform:animating?'translateY(8px)':'none',
            transition:'all .25s .05s',
          }}>
            {current.desc}
          </div>

          {/* Step dots */}
          <div style={{display:'flex',alignItems:'center',gap:5,marginBottom:20}}>
            {STEPS.map((_,i)=>(
              <div key={i} style={{
                width:i===step?20:6,height:6,borderRadius:3,
                background:i===step?'var(--o600)':i<step?'var(--o300)':'var(--g200)',
                transition:'all .3s ease',
              }}/>
            ))}
          </div>

          {/* Buttons */}
          <div style={{display:'flex',gap:10}}>
            {!current.last && (
              <button onClick={skip} style={{
                flex:1,padding:'11px',borderRadius:12,border:'1.5px solid var(--g200)',
                background:'transparent',color:'var(--g500)',fontSize:13,fontWeight:500,
                cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .2s',
              }}
              onMouseOver={e=>e.currentTarget.style.borderColor='var(--g400)'}
              onMouseOut={e=>e.currentTarget.style.borderColor='var(--g200)'}>
                Saltar tour
              </button>
            )}
            <button onClick={goNext} style={{
              flex:2,padding:'12px',borderRadius:12,border:'none',
              background:'linear-gradient(135deg,var(--o700),var(--o500))',
              color:'white',fontSize:14,fontWeight:700,
              cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',
              boxShadow:'0 4px 16px rgba(217,95,2,.35)',
              transition:'all .2s',transform:'scale(1)',
            }}
            onMouseOver={e=>e.currentTarget.style.transform='scale(1.02)'}
            onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
              {current.action}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounceIn {
          0%{transform:scale(.6);opacity:0}
          60%{transform:scale(1.15)}
          100%{transform:scale(1);opacity:1}
        }
      `}</style>
    </>
  );
}
