import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

// ────────────────────────────────────────────────
// La IA usa un Vercel serverless function (/api/chat)
// Agrega ANTHROPIC_API_KEY en Vercel → Settings → Environment Variables
// ────────────────────────────────────────────────
const AI_PROXY_URL = '/api/chat';

const SYSTEM_PROMPT = `Eres MangooBot, el asistente inteligente de MANGOO, una plataforma colombiana de compras desde USA.

Tus funciones principales:
1. Rastrear pedidos del usuario (tienes acceso a sus órdenes)
2. Recomendar productos del marketplace o tiendas de USA
3. Ayudar a encontrar productos por descripción y presupuesto
4. Explicar cómo funciona el proceso de importación
5. Calcular costos aproximados (precio + envío Miami→Colombia ~$12-15 USD por lb)
6. Responder preguntas sobre tallas, tiendas, marcas

Tiendas populares USA: Nike.com, Adidas.com, Amazon.com, Nordstrom, Zappos, ASOS, Zara USA, H&M USA, Footlocker, Finish Line, StockX.

Formato de respuesta: Usa emojis con moderación. Sé conciso y útil. Cuando recomiendas productos, da nombre, precio aproximado en USD y enlace a la tienda si es posible. Si el usuario quiere pedir algo, guíalo paso a paso.

El usuario habla en español colombiano. Responde siempre en español. Sé amigable pero profesional.`;

export default function MangooAI({ setPage }) {
  const { me } = useAuth();
  const { orders, products } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role:'assistant', content:`¡Hola${me?.name?' '+me.name.split(' ')[0]:''}! 👋 Soy **MangooBot**, tu asistente de compras desde USA.\n\nPuedo ayudarte con:\n• 📦 Rastrear tus pedidos\n• 🛍️ Encontrar productos y tiendas\n• 💰 Calcular costos de importación\n• 🎯 Recomendar productos por tu presupuesto\n\n¿En qué te ayudo hoy?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [proxyError, setProxyError] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const userOrders = orders.filter(o => o.userId === me?.id);

  const buildContext = () => {
    let ctx = SYSTEM_PROMPT;
    if (me) {
      ctx += `\n\nDATOS DEL USUARIO:\nNombre: ${me.name}\nSuite: #${me.suite}\nPaís: ${me.country || 'Colombia'}`;
    }
    if (userOrders.length > 0) {
      ctx += `\n\nPEDIDOS RECIENTES (últimos 5):\n`;
      userOrders.slice(-5).forEach(o => {
        ctx += `- ${o.productName || o.title} | Estado: ${o.status} | ${o.trackingNumber ? 'Tracking: '+o.trackingNumber : 'Sin tracking aún'} | $${o.totalUSD || '?'} USD\n`;
      });
    } else {
      ctx += `\n\nEl usuario no tiene pedidos aún.`;
    }
    if (products.length > 0) {
      ctx += `\n\nPRODUCTOS DISPONIBLES EN MANGOO MARKETPLACE (ya en Colombia):\n`;
      products.slice(0, 15).forEach(p => {
        const stock = p.sizes ? Object.values(p.sizes).reduce((a,b)=>a+b,0) : 0;
        if (stock > 0) ctx += `- ${p.name} (${p.brand}) | $${p.priceUSD} USD | ${p.category}\n`;
      });
    }
    return ctx;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setProxyError(false);
    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const systemCtx = buildContext();
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

      // Llamada al proxy (Cloudflare Worker) en vez de directamente a Anthropic
      const res = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemCtx,
          messages: apiMessages,
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Proxy error ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Lo siento, hubo un error. Intenta de nuevo.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      console.error('MangooAI error:', e);
      setMessages(prev => [...prev, { role: 'assistant', content: '😕 Error de conexión. Verifica tu internet e intenta de nuevo.' }]);
    }
    setLoading(false);
  };

  const formatMsg = (text) => {
    return text.split('\n').map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <div key={i} style={{marginBottom: line===''?6:2}} dangerouslySetInnerHTML={{__html: bold || '&nbsp;'}}/>;
    });
  };

  const quickReplies = [
    '¿Dónde está mi pedido?',
    'Quiero zapatos Nike bajo $150 USD',
    '¿Cuánto cuesta traer 1 libra?',
    'Muéstrame lo que hay en el marketplace',
  ];

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(v => !v)} style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 800,
        width: 56, height: 56, borderRadius: '50%', border: 'none',
        background: open ? '#1a1a1a' : 'linear-gradient(135deg,var(--o700),var(--o500))',
        color: 'white', fontSize: open ? 22 : 24, cursor: 'pointer',
        boxShadow: '0 8px 28px rgba(217,95,2,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .25s',
      }}>
        {open ? '×' : '🤖'}
        {!open && messages.length === 1 && (
          <div style={{position:'absolute',top:-4,right:-4,width:16,height:16,borderRadius:'50%',background:'var(--red)',border:'2px solid white',fontSize:9,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,color:'white'}}>1</div>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 799,
          width: 'min(420px,92vw)', height: 'min(580px,80vh)',
          background: 'white', borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,.2), 0 4px 20px rgba(0,0,0,.1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp .25s cubic-bezier(.34,1.2,.64,1)',
        }}>
          {/* Header */}
          <div style={{background:'linear-gradient(135deg,#1a1a1a,#333)',padding:'16px 20px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
            <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,var(--o600),var(--o400))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>🤖</div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:800,color:'white',letterSpacing:'-.3px'}}>MangooBot</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.6)',display:'flex',alignItems:'center',gap:5}}>
                <div style={{width:6,height:6,borderRadius:'50%',background: proxyError ? '#EF4444' : '#4ADE80'}}/> 
                {'En línea · IA de MANGOO'}
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{background:'rgba(255,255,255,.1)',border:'none',color:'rgba(255,255,255,.7)',width:30,height:30,borderRadius:'50%',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          </div>

          {/* Messages */}
          <div style={{flex:1,overflowY:'auto',padding:'16px 16px 8px',display:'flex',flexDirection:'column',gap:12}}>
            {messages.map((m, i) => (
              <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='user'?'flex-end':'flex-start'}}>
                <div style={{
                  maxWidth:'85%', padding:'10px 14px', borderRadius:m.role==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px',
                  background:m.role==='user'?'linear-gradient(135deg,var(--o700),var(--o500))':'#F4F4F5',
                  color:m.role==='user'?'white':'#1a1a1a',
                  fontSize:13, lineHeight:1.55,
                  boxShadow:m.role==='user'?'0 4px 12px rgba(217,95,2,.3)':'0 1px 4px rgba(0,0,0,.06)',
                }}>
                  {formatMsg(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{display:'flex',alignItems:'flex-start'}}>
                <div style={{background:'#F4F4F5',padding:'12px 16px',borderRadius:'16px 16px 16px 4px',display:'flex',gap:5,alignItems:'center'}}>
                  {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:'50%',background:'#9CA3AF',animation:`bounce .8s ${i*.2}s infinite`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick replies */}
          {messages.length <= 1 && (
            <div style={{padding:'0 12px 8px',display:'flex',flexWrap:'wrap',gap:6}}>
              {quickReplies.map(q=>(
                <button key={q} onClick={()=>{setInput(q);setTimeout(()=>inputRef.current?.focus(),50);}}
                  style={{fontSize:11,padding:'5px 10px',borderRadius:20,border:'1.5px solid var(--o300)',background:'var(--o50)',color:'var(--o700)',cursor:'pointer',fontWeight:500,fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .15s'}}
                  onMouseOver={e=>e.currentTarget.style.background='var(--o100)'}
                  onMouseOut={e=>e.currentTarget.style.background='var(--o50)'}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{padding:'10px 12px 14px',borderTop:'1px solid #F0F0F0',display:'flex',gap:8,flexShrink:0}}>
            <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()}
              placeholder="Pregunta sobre pedidos, productos..."
              style={{flex:1,padding:'10px 14px',borderRadius:12,border:'1.5px solid #E5E7EB',outline:'none',fontSize:13,fontFamily:'Plus Jakarta Sans,sans-serif',background:'#F9FAFB',transition:'border .2s'}}
              onFocus={e=>e.target.style.borderColor='var(--o400)'}
              onBlur={e=>e.target.style.borderColor='#E5E7EB'}
            />
            <button onClick={send} disabled={!input.trim()||loading}
              style={{width:42,height:42,borderRadius:12,border:'none',background:input.trim()&&!loading?'var(--o600)':'#E5E7EB',color:'white',cursor:input.trim()&&!loading?'pointer':'not-allowed',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',flexShrink:0}}>
              {loading ? <div style={{width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> : '↑'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </>
  );
}
