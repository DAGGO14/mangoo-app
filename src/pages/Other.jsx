import React, { useState, useMemo } from 'react';
import { useApp, fmtCOP, fmtUSD, CUSTOMS_LIMIT, CUSTOMS_RATE } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

// Colombia departments + cities
const COLOMBIA_DEPTS = {
  'Amazonas':['Leticia','Puerto Nariño'],
  'Antioquia':['Medellín','Bello','Itagüí','Envigado','Rionegro','Apartadó','Turbo','Caucasia','Sabaneta','La Estrella','Copacabana'],
  'Arauca':['Arauca','Arauquita','Saravena','Tame'],
  'Atlántico':['Barranquilla','Soledad','Malambo','Sabanalarga','Baranoa'],
  'Bogotá D.C.':['Bogotá'],
  'Bolívar':['Cartagena','Magangué','Mompós','El Carmen de Bolívar'],
  'Boyacá':['Tunja','Duitama','Sogamoso','Chiquinquirá','Paipa'],
  'Caldas':['Manizales','La Dorada','Villamaría','Chinchiná','Riosucio'],
  'Caquetá':['Florencia','San Vicente del Caguán'],
  'Casanare':['Yopal','Aguazul','Villanueva'],
  'Cauca':['Popayán','Santander de Quilichao','Patía'],
  'Cesar':['Valledupar','Aguachica','Codazzi'],
  'Chocó':['Quibdó','Istmina','Riosucio'],
  'Córdoba':['Montería','Lorica','Sahagún','Cereté','Montelíbano'],
  'Cundinamarca':['Soacha','Fusagasugá','Zipaquirá','Facatativá','Chía','Mosquera','Madrid','Funza','Girardot','Cajicá'],
  'Guainía':['Inírida'],
  'Guaviare':['San José del Guaviare'],
  'Huila':['Neiva','Pitalito','Garzón','La Plata'],
  'La Guajira':['Riohacha','Maicao','Uribia'],
  'Magdalena':['Santa Marta','Ciénaga','Fundación'],
  'Meta':['Villavicencio','Acacías','Granada'],
  'Nariño':['Pasto','Tumaco','Ipiales','Túquerres'],
  'Norte de Santander':['Cúcuta','Ocaña','Pamplona','Villa del Rosario'],
  'Putumayo':['Mocoa','Puerto Asís'],
  'Quindío':['Armenia','Calarcá','Montenegro','Quimbaya'],
  'Risaralda':['Pereira','Dosquebradas','Santa Rosa de Cabal'],
  'San Andrés y Providencia':['San Andrés'],
  'Santander':['Bucaramanga','Floridablanca','Girón','Piedecuesta','Barrancabermeja','Socorro'],
  'Sucre':['Sincelejo','Corozal','Sampués'],
  'Tolima':['Ibagué','Espinal','Melgar','Honda'],
  'Valle del Cauca':['Cali','Buenaventura','Palmira','Bucaramanga','Tuluá','Buga','Cartago','Jamundí','Yumbo'],
  'Vaupés':['Mitú'],
  'Vichada':['Puerto Carreño'],
};
const DEPT_LIST = Object.keys(COLOMBIA_DEPTS).sort();

// Address helpers — stored per-user with multiple saved addresses
function getAddrKey(userId) { return `mg12_addrs_${userId}`; }
function loadAddresses(userId) {
  try { return JSON.parse(localStorage.getItem(getAddrKey(userId))||'[]'); } catch { return []; }
}
function saveAddresses(userId, list) {
  try { localStorage.setItem(getAddrKey(userId), JSON.stringify(list)); } catch {}
}

/* ─── AddressSelector component ─── */
function AddressSelector({ me, addr, setAddr }) {
  const [saved, setSaved] = useState(() => loadAddresses(me?.id));
  const [showSaved, setShowSaved] = useState(false);
  const dept = addr.dept || '';
  const cities = dept && COLOMBIA_DEPTS[dept] ? COLOMBIA_DEPTS[dept] : [];

  const setA = (k,v) => {
    setAddr(a => {
      const next = {...a,[k]:v};
      if (k === 'dept') next.city = ''; // reset city when dept changes
      return next;
    });
  };

  const handleSave = () => {
    if (!addr.address || !addr.city) return;
    const list = loadAddresses(me?.id);
    const label = `${addr.address}, ${addr.city}`;
    if (!list.find(a => a.address === addr.address && a.city === addr.city)) {
      const updated = [{...addr, label, id: Date.now().toString()}, ...list].slice(0, 5);
      saveAddresses(me?.id, updated);
      setSaved(updated);
    }
  };

  const selectSaved = (a) => { setAddr(a); setShowSaved(false); };

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {saved.length > 0 && (
        <div>
          <button
            type="button"
            onClick={()=>setShowSaved(s=>!s)}
            style={{fontSize:12,color:'var(--o600)',background:'none',border:'none',cursor:'pointer',fontWeight:700,padding:0,fontFamily:'Plus Jakarta Sans,sans-serif',display:'flex',alignItems:'center',gap:6}}
          >
            📋 Usar dirección guardada ({saved.length}) {showSaved?'▲':'▼'}
          </button>
          {showSaved && (
            <div style={{marginTop:8,border:'1px solid var(--g200)',borderRadius:12,overflow:'hidden'}}>
              {saved.map((a,i) => (
                <div key={a.id||i}
                  onClick={()=>selectSaved(a)}
                  style={{padding:'10px 14px',cursor:'pointer',fontSize:13,borderBottom:i<saved.length-1?'1px solid var(--g100)':'none',background:'var(--white)',transition:'background .15s'}}
                  onMouseOver={e=>e.currentTarget.style.background='var(--o50)'}
                  onMouseOut={e=>e.currentTarget.style.background='var(--white)'}
                >
                  <div style={{fontWeight:600,color:'var(--g900)'}}>{a.address}</div>
                  <div style={{color:'var(--g500)',fontSize:12}}>{a.city}{a.dept?`, ${a.dept}`:''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="form-group">
        <div className="form-label">Dirección completa *</div>
        <input className="form-input" placeholder="Calle 123 #45-67, Apt 301" value={addr.address||''} onChange={e=>setA('address',e.target.value)}/>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <div className="form-label">Departamento *</div>
          <select className="form-input" value={addr.dept||''} onChange={e=>setA('dept',e.target.value)}>
            <option value="">Seleccionar...</option>
            {DEPT_LIST.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-label">Ciudad *</div>
          {cities.length > 0 ? (
            <select className="form-input" value={addr.city||''} onChange={e=>setA('city',e.target.value)}>
              <option value="">Seleccionar...</option>
              {cities.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <input className="form-input" placeholder={dept?'Ciudad':'Primero elige depto.'} value={addr.city||''} onChange={e=>setA('city',e.target.value)} disabled={!dept}/>
          )}
        </div>
      </div>

      <div className="form-group">
        <div className="form-label">Teléfono de contacto</div>
        <input className="form-input" placeholder="+57 300 123 4567" value={addr.phone||me?.phone||''} onChange={e=>setA('phone',e.target.value)}/>
      </div>
      <div className="form-group">
        <div className="form-label">Notas de entrega (opcional)</div>
        <input className="form-input" placeholder="Ej: Llamar antes, portería edificio..." value={addr.notes||''} onChange={e=>setA('notes',e.target.value)}/>
      </div>
      {addr.address && addr.city && (
        <button type="button" onClick={handleSave}
          style={{fontSize:12,color:'var(--o700)',background:'var(--o50)',border:'1px solid var(--o200)',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontWeight:600,fontFamily:'Plus Jakarta Sans,sans-serif',width:'fit-content'}}>
          💾 Guardar esta dirección
        </button>
      )}
    </div>
  );
}

/* ─── CART ─── */
export function Cart() {
  const { cart, cartTotalUSD, removeFromCart, updateCartQty, placeMarketOrder } = useApp();
  const { me } = useAuth();
  const [step, setStep] = useState(1);
  const [card, setCard] = useState({ number:'', expiry:'', cvv:'', name:'' });
  const [errors, setErrors] = useState({});
  const [paying, setPaying] = useState(false);
  const [order, setOrder] = useState(null);
  const [addr, setAddr] = useState({
    address: me?.address || '',
    dept: me?.dept || '',
    city: me?.city || '',
    phone: me?.phone || '',
    notes: ''
  });

  const SHIP = 5;
  // MARKETPLACE is already in Colombia — NO customs/DIAN fees apply
  const customs = 0;
  const total   = cartTotalUSD + SHIP + customs;

  const setC=(k,v)=>{setCard(c=>({...c,[k]:v}));setErrors(e=>({...e,[k]:''}));};
  const fmtNum=v=>v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const fmtExp=v=>{const d=v.replace(/\D/g,'').slice(0,4);return d.length>2?d.slice(0,2)+'/'+d.slice(2):d;};

  const validateCard=()=>{
    const e={};
    if(card.number.replace(/\s/g,'').length<16) e.number='16 dígitos requeridos';
    if(card.expiry.length<5) e.expiry='Formato MM/AA';
    if(card.cvv.length<3) e.cvv='CVV inválido';
    if(!card.name.trim()) e.name='Requerido';
    setErrors(e); return Object.keys(e).length===0;
  };

  const handlePay = async () => {
    if (!validateCard()) return;
    setPaying(true);
    await new Promise(r=>setTimeout(r,2200));
    const o = placeMarketOrder(cart, me, total);
    setPaying(false); setOrder(o); setStep(3);
  };

  if (step===3 && order) return (
    <div className="anim-up" style={{textAlign:'center',padding:'80px 20px'}}>
      <div style={{fontSize:72,marginBottom:16,animation:'bounceIn .5s ease'}}>🎉</div>
      <div style={{fontSize:32,fontWeight:800,marginBottom:8,letterSpacing:'-.5px'}}>¡Pedido confirmado!</div>
      <div style={{color:'var(--g500)',fontSize:15,marginBottom:28}}>Recibirás confirmación en tu correo y WhatsApp en breve.</div>
      <div style={{background:'var(--o50)',border:'1px solid var(--o400)',borderRadius:20,padding:24,maxWidth:360,margin:'0 auto',textAlign:'left'}}>
        <div className="mono" style={{fontSize:12,color:'var(--g500)',marginBottom:4}}>Orden #{order.id}</div>
        <div style={{fontSize:24,fontWeight:900,color:'var(--g900)',letterSpacing:'-1px',marginBottom:4}}>{fmtCOP(total)}</div>
        <div style={{fontSize:13,color:'var(--g400)',marginBottom:8}}>{fmtUSD(total)} USD</div>
        {addr.address && <div style={{fontSize:12,color:'var(--g600)',marginTop:6,padding:'8px 12px',background:'var(--g50)',borderRadius:8}}>📍 {addr.address}, {addr.city}</div>}
      </div>
      <div style={{marginTop:16,fontSize:12,color:'var(--g500)'}}>⚠️ Para cobros reales: integra Stripe — ver README</div>
    </div>
  );

  if (cart.length===0) return (
    <div className="anim-up" style={{textAlign:'center',padding:'80px 0'}}>
      <div style={{fontSize:60,marginBottom:16}}>🛒</div>
      <div style={{fontSize:20,fontWeight:700,marginBottom:8}}>Tu carrito está vacío</div>
      <div style={{color:'var(--g500)'}}>Explora el marketplace</div>
    </div>
  );

  return (
    <div className="anim-up">
      <div className="page-head">
        <div><div className="page-title">Mi Carrito</div><div className="page-sub">{cart.reduce((s,x)=>s+x.qty,0)} producto(s)</div></div>
        {step===2 && <button className="btn btn-ghost btn-sm" onClick={()=>setStep(1)}>← Volver</button>}
      </div>

      <div style={{display:'flex',gap:0,marginBottom:24,background:'var(--white)',borderRadius:'var(--r-lg)',padding:4,width:'fit-content',boxShadow:'var(--shadow-xs)'}}>
        {[['1','Productos'],['2','Envío y Pago']].map(([n,l],i)=>(
          <div key={n} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 18px',borderRadius:'var(--r-md)',background:step===i+1?'var(--o600)':step>i+1?'var(--green-bg)':'transparent',cursor:step>i+1?'pointer':'default',transition:'all .2s'}} onClick={()=>step>i+1&&setStep(i+1)}>
            <div style={{width:22,height:22,borderRadius:'50%',background:step===i+1?'rgba(255,255,255,.3)':step>i+1?'var(--green)':'var(--g200)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:step===i+1?'white':step>i+1?'white':'var(--g500)'}}>{step>i+1?'✓':n}</div>
            <span style={{fontSize:13,fontWeight:600,color:step===i+1?'white':step>i+1?'var(--green)':'var(--g500)'}}>{l}</span>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-body">
            {cart.map(item=>(
              <div key={item.cartKey} style={{display:'flex',gap:14,padding:'14px 0',borderBottom:'1px solid var(--g100)'}}>
                <div style={{width:72,height:72,background:item.bgLight||'var(--g100)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,flexShrink:0,overflow:'hidden'}}>
                  {item.images?.length>0?<img src={item.images[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:item.emoji}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,marginBottom:2}}>{item.name}</div>
                  {item.selectedSize && <div style={{fontSize:12,color:'var(--o700)',fontWeight:600,marginBottom:4}}>Talla: {item.selectedSize}</div>}
                  <div style={{fontSize:12,color:'var(--g500)',marginBottom:8}}>{item.brand}</div>
                  <div className="flex-between">
                    <div style={{fontWeight:900,fontSize:16,color:'var(--g900)'}}>{fmtCOP(item.priceUSD*item.qty)}</div>
                    <div className="flex-center gap-8">
                      <div style={{display:'flex',alignItems:'center',gap:4,background:'var(--g100)',borderRadius:8,padding:'4px 10px'}}>
                        <button onClick={()=>updateCartQty(item.cartKey,item.qty-1)} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--g600)',lineHeight:1}}>−</button>
                        <span style={{fontSize:14,fontWeight:700,minWidth:18,textAlign:'center'}}>{item.qty}</span>
                        <button onClick={()=>updateCartQty(item.cartKey,item.qty+1)} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:'var(--g600)',lineHeight:1}}>+</button>
                      </div>
                      <button onClick={()=>removeFromCart(item.cartKey)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--g400)',fontSize:18}}>×</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="card mb-16">
            <div className="card-body">
              {/* Marketplace = national, no DIAN warning */}
              <div style={{background:'var(--g50)',border:'1px solid var(--g200)',borderRadius:10,padding:'10px 14px',marginBottom:14,fontSize:12,color:'var(--g600)',display:'flex',gap:8,alignItems:'center'}}>
                <span>🇨🇴</span>
                <span>Envío nacional — sin aranceles DIAN. Productos ya en Colombia.</span>
              </div>
              <div style={{fontWeight:700,fontSize:15,marginBottom:14}}>Resumen del pedido</div>
              <div className="pay-box">
                <div className="pay-row"><span>Subtotal</span><span>{fmtCOP(cartTotalUSD)}</span></div>
                <div className="pay-row"><span>Envío local</span><span>{fmtCOP(SHIP)}</span></div>
                <div className="pay-row" style={{fontSize:11,color:'var(--g400)',paddingTop:0}}><span>≈ {fmtUSD(total)} USD</span></div>
                <div className="pay-row total"><span>Total</span><span>{fmtCOP(total)}</span></div>
              </div>
            </div>
          </div>

          {step===1 && <button className="btn btn-dark btn-lg" style={{width:'100%'}} onClick={()=>setStep(2)}>Continuar — Dirección y Pago →</button>}

          {step===2 && (
            <div className="card anim-up">
              <div className="card-body">
                <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>📍 Dirección de entrega</div>
                <div style={{fontSize:12,color:'var(--g500)',marginBottom:14}}>¿Dónde enviamos tu pedido en Colombia?</div>
                <div style={{marginBottom:20}}>
                  <AddressSelector me={me} addr={addr} setAddr={setAddr}/>
                </div>
                <div className="divider"/>
                <div style={{fontWeight:700,fontSize:15,marginBottom:16,marginTop:16}}>💳 Datos de pago</div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div className="form-group"><div className="form-label">Nombre en la tarjeta</div><input className="form-input" placeholder="JUAN GARCIA" value={card.name} onChange={e=>setC('name',e.target.value)}/>{errors.name&&<div className="form-error">{errors.name}</div>}</div>
                  <div className="form-group"><div className="form-label">Número de tarjeta</div><input className="form-input mono" placeholder="1234 5678 9012 3456" value={card.number} onChange={e=>setC('number',fmtNum(e.target.value))} maxLength={19}/>{errors.number&&<div className="form-error">{errors.number}</div>}</div>
                  <div className="grid-2">
                    <div className="form-group"><div className="form-label">Vencimiento</div><input className="form-input mono" placeholder="MM/AA" value={card.expiry} onChange={e=>setC('expiry',fmtExp(e.target.value))} maxLength={5}/>{errors.expiry&&<div className="form-error">{errors.expiry}</div>}</div>
                    <div className="form-group"><div className="form-label">CVV</div><input className="form-input mono" placeholder="123" value={card.cvv} onChange={e=>setC('cvv',e.target.value.replace(/\D/g,'').slice(0,4))} maxLength={4}/>{errors.cvv&&<div className="form-error">{errors.cvv}</div>}</div>
                  </div>
                  <div style={{fontSize:12,color:'var(--g400)',display:'flex',alignItems:'center',gap:6}}>🔒 SSL seguro · Para cobros reales integra Stripe</div>
                  <button className="btn btn-dark btn-lg" onClick={handlePay} disabled={paying||!addr.address||!addr.city}>
                    {paying?<><div className="spinner"/>Procesando...</>:(!addr.address||!addr.city?'Completa la dirección primero':`Pagar ${fmtCOP(total)}`)}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── PROFILE ─── */
const COUNTRIES=['Colombia','Guatemala','México','Honduras','El Salvador','Costa Rica','Panamá','Perú','Chile','Argentina','Ecuador'];
export function Profile() {
  const {me,updateProfile,logout}=useAuth();
  const [form,setForm]=useState({name:me.name,email:me.email,phone:me.phone||'',country:me.country||'Colombia',address:me.address||'',city:me.city||'',dept:me.dept||''});
  const [saved,setSaved]=useState(false);
  const [saving,setSaving]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const save=async()=>{
    setSaving(true);
    await updateProfile(form);
    setSaving(false);setSaved(true);setTimeout(()=>setSaved(false),2500);
  };
  const [showAvatarEditor, setShowAvatarEditor] = React.useState(false);
  const [rawImg, setRawImg] = React.useState(null);
  const [imgPos, setImgPos] = React.useState({x:0,y:0,scale:1});
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef(null);

  const handleAvatar=(e)=>{
    const f=e.target.files?.[0];if(!f)return;
    const r=new FileReader();
    r.onload=(ev)=>{setRawImg(ev.target.result);setImgPos({x:0,y:0,scale:1});setShowAvatarEditor(true);};
    r.readAsDataURL(f);
  };

  const handleAvatarSave=()=>{
    const SIZE=400;
    const canvas=document.createElement('canvas');
    canvas.width=SIZE;canvas.height=SIZE;
    const ctx=canvas.getContext('2d');
    ctx.beginPath();ctx.arc(SIZE/2,SIZE/2,SIZE/2,0,Math.PI*2);ctx.clip();
    const img=new Image();
    img.onload=()=>{
      // Scale image to fill the 400x400 circle, then apply user's scale and offset
      const baseScale=Math.max(SIZE/img.width, SIZE/img.height);
      const s=baseScale*imgPos.scale;
      const iw=img.width*s, ih=img.height*s;
      // Center + user pan offset (imgPos.x/y are in preview px, map to canvas px)
      const previewSize=200;
      const ratio=SIZE/previewSize;
      const dx=(SIZE-iw)/2 + imgPos.x*ratio;
      const dy=(SIZE-ih)/2 + imgPos.y*ratio;
      ctx.drawImage(img,dx,dy,iw,ih);
      updateProfile({avatarImg:canvas.toDataURL('image/jpeg',0.9)});
      setShowAvatarEditor(false);
    };
    img.src=rawImg;
  };
  const deptCities = form.dept && COLOMBIA_DEPTS[form.dept] ? COLOMBIA_DEPTS[form.dept] : [];
  return (
    <div className="anim-up">
      <div className="page-head"><div><div className="page-title">Mi Perfil</div><div className="page-sub">Administra tu cuenta</div></div></div>
      <div className="two-col">
        <div>
          <div className="card mb-16">
            <div className="card-body">
              <div className="flex-center gap-16" style={{marginBottom:20}}>
                <div style={{position:'relative',flexShrink:0}}>
                  <div style={{width:80,height:80,borderRadius:'50%',background:me.avatarImg?'none':'linear-gradient(135deg,var(--o900),var(--o500))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:28,color:'white',overflow:'hidden',cursor:'pointer'}}
                    onClick={()=>document.getElementById('av-upload').click()}>
                    {me.avatarImg?<img src={me.avatarImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:me.avatar}
                  </div>
                  <input id="av-upload" type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatar}/>
                  <div style={{position:'absolute',bottom:0,right:0,width:26,height:26,borderRadius:'50%',background:'var(--o600)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:13,color:'white',border:'2px solid white'}}
                    onClick={()=>document.getElementById('av-upload').click()}>📷</div>

                  {/* Avatar editor modal */}
                  {showAvatarEditor&&rawImg&&(
                    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowAvatarEditor(false)}>
                      <div style={{background:'white',borderRadius:20,padding:28,width:'min(400px,94vw)',boxShadow:'0 24px 80px rgba(0,0,0,.3)'}} onClick={e=>e.stopPropagation()}>
                        <div style={{fontSize:17,fontWeight:800,marginBottom:4}}>Ajustar foto de perfil</div>
                        <div style={{fontSize:13,color:'var(--g500)',marginBottom:20}}>Arrastra para reposicionar · Usa el deslizador para hacer zoom</div>
                        <div style={{position:'relative',width:200,height:200,borderRadius:'50%',overflow:'hidden',margin:'0 auto 20px',border:'3px solid var(--o400)',cursor:'grab',userSelect:'none',background:'var(--g100)'}}
                          onMouseDown={e=>{setDragging(true);dragStart.current={mx:e.clientX,my:e.clientY,ox:imgPos.x,oy:imgPos.y};}}
                          onMouseMove={e=>{if(!dragging||!dragStart.current)return;setImgPos(p=>({...p,x:dragStart.current.ox+(e.clientX-dragStart.current.mx),y:dragStart.current.oy+(e.clientY-dragStart.current.my)}));}}
                          onMouseUp={()=>setDragging(false)}
                          onMouseLeave={()=>setDragging(false)}
                          onTouchStart={e=>{const t=e.touches[0];setDragging(true);dragStart.current={mx:t.clientX,my:t.clientY,ox:imgPos.x,oy:imgPos.y};}}
                          onTouchMove={e=>{if(!dragging||!dragStart.current)return;const t=e.touches[0];setImgPos(p=>({...p,x:dragStart.current.ox+(t.clientX-dragStart.current.mx),y:dragStart.current.oy+(t.clientY-dragStart.current.my)}));}}
                          onTouchEnd={()=>setDragging(false)}>
                          <img src={rawImg} alt="preview" style={{position:'absolute',top:'50%',left:'50%',transform:`translate(calc(-50% + ${imgPos.x}px), calc(-50% + ${imgPos.y}px)) scale(${imgPos.scale})`,transformOrigin:'center',maxWidth:'none',pointerEvents:'none',height:`${imgPos.scale*200}px`,width:'auto',objectFit:'contain'}}/>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                          <span style={{fontSize:13,color:'var(--g500)',flexShrink:0}}>🔍 Zoom</span>
                          <input type="range" min={0.5} max={3} step={0.05} value={imgPos.scale}
                            onChange={e=>setImgPos(p=>({...p,scale:parseFloat(e.target.value)}))}
                            style={{flex:1,accentColor:'var(--o600)'}}/>
                          <span style={{fontSize:12,color:'var(--g500)',flexShrink:0,minWidth:32}}>{Math.round(imgPos.scale*100)}%</span>
                        </div>
                        <div style={{display:'flex',gap:10}}>
                          <button onClick={()=>setShowAvatarEditor(false)} style={{flex:1,padding:'11px',borderRadius:10,border:'1.5px solid var(--g200)',background:'transparent',color:'var(--g600)',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif'}}>Cancelar</button>
                          <button onClick={handleAvatarSave} style={{flex:2,padding:'12px',borderRadius:10,border:'none',background:'var(--o600)',color:'white',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',boxShadow:'0 4px 16px rgba(217,95,2,.3)'}}>✅ Guardar foto</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div style={{fontWeight:800,fontSize:20,letterSpacing:'-.3px'}}>{me.name}</div>
                  <div style={{fontSize:14,color:'var(--g500)',marginBottom:6}}>{me.email}</div>
                  <div className="flex-center gap-6">
                    <span className="badge badge-orange mono">Suite #{me.suite}</span>
                    {me.role==='admin'&&<span className="badge badge-dark">Admin</span>}
                    {me.role==='worker'&&<span className="badge badge-purple">Trabajador</span>}
                  </div>
                </div>
              </div>
              <div className="divider"/>
              <div className="grid-2" style={{gap:10,marginTop:14}}>
                {[['País',me.country||'Colombia'],['Teléfono',me.phone||'—'],['Miembro desde',new Date(me.createdAt).toLocaleDateString('es')]].map(([l,v])=>(
                  <div key={l} style={{background:'var(--g50)',borderRadius:10,padding:'10px 14px'}}>
                    <div style={{fontSize:11,color:'var(--g500)',marginBottom:3}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:600}}>{v}</div>
                  </div>
                ))}
                <div style={{background:'var(--o50)',border:'1px solid var(--o400)',borderRadius:10,padding:'10px 14px',gridColumn:'1/-1'}}>
                  <div style={{fontSize:11,color:'var(--o700)',marginBottom:3,fontWeight:700}}>🇺🇸 Dirección USA</div>
                  <div className="mono" style={{fontSize:13,fontWeight:700,color:'var(--o800)'}}>Suite #{me.suite} · Miami FL 33178</div>
                </div>
                {me.city && (
                  <div style={{background:'var(--g50)',borderRadius:10,padding:'10px 14px',gridColumn:'1/-1'}}>
                    <div style={{fontSize:11,color:'var(--g500)',marginBottom:3}}>📍 Dirección Colombia</div>
                    <div style={{fontSize:13,fontWeight:600}}>{me.address}{me.city?`, ${me.city}`:''}{me.dept?`, ${me.dept}`:''}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="card" style={{border:'1px solid var(--red-border)'}}>
            <div className="card-body"><div style={{fontWeight:700,color:'var(--red)',marginBottom:12}}>Cerrar sesión</div><button className="btn btn-danger" style={{width:'100%'}} onClick={logout}>🚪 Salir de mi cuenta</button></div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Editar información</div></div>
          <div style={{padding:'0 24px 24px',display:'flex',flexDirection:'column',gap:14,marginTop:16}}>
            <div className="form-group"><div className="form-label">Nombre</div><input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)}/></div>
            <div className="form-group"><div className="form-label">Correo</div><input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
            <div className="form-group"><div className="form-label">WhatsApp</div><input className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
            <div className="form-group"><div className="form-label">País</div><select className="form-input" value={form.country} onChange={e=>set('country',e.target.value)}>{COUNTRIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><div className="form-label">Dirección de entrega</div><input className="form-input" placeholder="Calle 123 #45-67, Apt 301" value={form.address} onChange={e=>set('address',e.target.value)}/></div>
            {form.country==='Colombia' && (
              <>
                <div className="grid-2">
                  <div className="form-group">
                    <div className="form-label">Departamento</div>
                    <select className="form-input" value={form.dept||''} onChange={e=>{set('dept',e.target.value);set('city','');}}>
                      <option value="">Seleccionar...</option>
                      {DEPT_LIST.map(d=><option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <div className="form-label">Ciudad</div>
                    {deptCities.length>0?(
                      <select className="form-input" value={form.city||''} onChange={e=>set('city',e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {deptCities.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                    ):(
                      <input className="form-input" placeholder={form.dept?'Ciudad':'Elige depto. primero'} value={form.city||''} onChange={e=>set('city',e.target.value)} disabled={!form.dept}/>
                    )}
                  </div>
                </div>
              </>
            )}
            <button className="btn btn-primary" style={{width:'100%'}} onClick={save} disabled={saving}>
              {saving?<><div className="spinner"/>Guardando...</>:saved?'✅ Guardado':'💾 Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── RATES ─── */
export function Rates() {
  const rates=[['0–0.5 lb',14.99,'Sobres'],['0.5–1 lb',17.99,'Ropa ligera'],['1–2 lb',21.99,'Zapatos'],['2–5 lb',29.99,'Medianos'],['5–10 lb',39.99,'Grandes'],['10+ lb',null,'Cotizar']];
  return (
    <div className="anim-up">
      <div className="page-head"><div><div className="page-title">Tarifas</div><div className="page-sub">Miami FL → Colombia · 7–10 días · USD</div></div></div>
      <div className="two-col">
        <div className="card"><div className="card-head"><div className="card-title">Por peso</div></div>
          <table className="tbl"><thead><tr><th>Peso</th><th>USD</th><th>COP</th><th>Tipo</th></tr></thead>
            <tbody>{rates.map(([r,p,d])=>(<tr key={r}><td style={{fontWeight:600}}>{r}</td><td><span className="mono" style={{fontWeight:700,color:'var(--o600)'}}>{p?fmtUSD(p):'Cotizar'}</span></td><td style={{fontSize:12,color:'var(--g500)'}}>{p?fmtCOP(p):'—'}</td><td style={{fontSize:13,color:'var(--g500)'}}>{d}</td></tr>))}</tbody>
          </table>
        </div>
        <div>
          <div className="card mb-16"><div className="card-body">
            <div style={{fontWeight:700,marginBottom:12}}>✅ Siempre incluido</div>
            {['Seguro hasta $100 USD','Rastreo 24/7','Bodega Miami 30 días','Consolidación','Soporte WhatsApp'].map(i=>(
              <div key={i} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid var(--g100)',fontSize:14}}><span style={{color:'var(--green)'}}>✓</span>{i}</div>
            ))}
          </div></div>
          <div className="card"><div className="card-body">
            <div style={{fontWeight:700,marginBottom:8}}>⚠️ Aduana Colombia (solo Casillero)</div>
            <div style={{fontSize:14,color:'var(--g600)',lineHeight:1.6}}>Importaciones por casillero mayores a <strong style={{color:'var(--o600)'}}>$200 USD</strong> generan aranceles (~19% DIAN). Las compras del Marketplace son nacionales y <strong>no aplica aduana</strong>.</div>
          </div></div>
        </div>
      </div>
    </div>
  );
}
