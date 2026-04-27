import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const COLOMBIA_DEPTS = {
  'Antioquia':['Medellín','Bello','Itagüí','Envigado','Rionegro','Apartadó','Sabaneta','La Estrella','Copacabana'],
  'Atlántico':['Barranquilla','Soledad','Malambo','Sabanalarga'],
  'Bogotá D.C.':['Bogotá'],
  'Bolívar':['Cartagena','Magangué','El Carmen de Bolívar'],
  'Boyacá':['Tunja','Duitama','Sogamoso','Chiquinquirá'],
  'Caldas':['Manizales','La Dorada','Villamaría'],
  'Caquetá':['Florencia'],
  'Casanare':['Yopal','Aguazul'],
  'Cauca':['Popayán','Santander de Quilichao'],
  'Cesar':['Valledupar','Aguachica'],
  'Córdoba':['Montería','Lorica','Sahagún'],
  'Cundinamarca':['Soacha','Fusagasugá','Zipaquirá','Facatativá','Chía','Mosquera','Madrid','Funza','Girardot','Cajicá'],
  'Huila':['Neiva','Pitalito','Garzón'],
  'La Guajira':['Riohacha','Maicao'],
  'Magdalena':['Santa Marta','Ciénaga'],
  'Meta':['Villavicencio','Acacías'],
  'Nariño':['Pasto','Tumaco','Ipiales'],
  'Norte de Santander':['Cúcuta','Ocaña','Pamplona'],
  'Quindío':['Armenia','Calarcá','Montenegro'],
  'Risaralda':['Pereira','Dosquebradas','Santa Rosa de Cabal'],
  'San Andrés y Providencia':['San Andrés'],
  'Santander':['Bucaramanga','Floridablanca','Girón','Piedecuesta','Barrancabermeja'],
  'Sucre':['Sincelejo','Corozal'],
  'Tolima':['Ibagué','Espinal','Melgar'],
  'Valle del Cauca':['Cali','Buenaventura','Palmira','Tuluá','Buga','Cartago','Jamundí','Yumbo'],
};
const DEPT_LIST = Object.keys(COLOMBIA_DEPTS).sort();


const COUNTRIES = [
  {name:'Colombia',code:'CO',prefix:'+57'},{name:'Guatemala',code:'GT',prefix:'+502'},
  {name:'México',code:'MX',prefix:'+52'},{name:'Honduras',code:'HN',prefix:'+504'},
  {name:'El Salvador',code:'SV',prefix:'+503'},{name:'Costa Rica',code:'CR',prefix:'+506'},
  {name:'Panamá',code:'PA',prefix:'+507'},{name:'Perú',code:'PE',prefix:'+51'},
  {name:'Chile',code:'CL',prefix:'+56'},{name:'Argentina',code:'AR',prefix:'+54'},
  {name:'Ecuador',code:'EC',prefix:'+593'},
];

function PwInput({ value, onChange, required, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{position:'relative'}}>
      <input className="form-input" type={show?'text':'password'} placeholder={placeholder||'••••••••'}
        value={value} onChange={onChange} required={required} style={{width:'100%',paddingRight:46}}/>
      <button type="button" onClick={()=>setShow(v=>!v)}
        style={{position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--g400)',display:'flex',alignItems:'center',padding:4,borderRadius:4,transition:'color .15s'}}
        title={show?'Ocultar':'Ver contraseña'}>
        {show
          ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  );
}

function OTPScreen({ onBack }) {
  const { confirmOTP, err, setErr, pendingOTP, resendOTP, clearOTP } = useAuth();
  const [digits, setDigits] = useState(['','','','','','']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(30);
  const [resendDone, setResendDone] = useState(false);
  const refs = useRef([]);
  useEffect(()=>{ if(pendingOTP) console.log('%c🔑 OTP DEMO: '+pendingOTP.code,'color:orange;font-size:20px;font-weight:bold'); },[pendingOTP]);
  useEffect(()=>{
    if(resendCountdown<=0)return;
    const t=setTimeout(()=>setResendCountdown(c=>c-1),1000);
    return()=>clearTimeout(t);
  },[resendCountdown]);
  const handleDigit=(i,val)=>{if(!/^\d?$/.test(val))return;const n=[...digits];n[i]=val;setDigits(n);setErr('');if(val&&i<5)refs.current[i+1]?.focus();if(!val&&i>0)refs.current[i-1]?.focus();};
  const handlePaste=(e)=>{const t=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);if(t.length===6){setDigits(t.split(''));refs.current[5]?.focus();}};
  const handleSubmit=async()=>{const c=digits.join('');if(c.length<6)return;setLoading(true);const ok=await confirmOTP(c);setLoading(false);if(!ok)setDigits(['','','','','','']);};
  const handleResend=async()=>{
    setResending(true);
    await resendOTP();
    setResending(false);
    setResendDone(true);
    setResendCountdown(60);
    setDigits(['','','','','','']);
    setErr('');
    setTimeout(()=>setResendDone(false),3000);
  };
  return (
    <div style={{textAlign:'center'}}>
      <div style={{fontSize:52,marginBottom:14}}>📱</div>
      <div style={{fontSize:24,fontWeight:800,letterSpacing:'-.5px',marginBottom:8}}>Verifica tu correo</div>
      <div style={{fontSize:14,color:'var(--g500)',marginBottom:6,lineHeight:1.6}}>Enviamos un código de 6 dígitos a <strong>{pendingOTP?.sentTo||'tu correo'}</strong>. Revisá spam si no llega.</div>
      <div style={{fontSize:12,background:'var(--o50)',border:'1px solid var(--o200)',borderRadius:8,padding:'7px 12px',color:'var(--o700)',fontWeight:500,marginBottom:24}}>
        💡 ¿No llegó? Revisá tu carpeta de spam o esperá unos segundos.
      </div>
      <div className="otp-wrap" onPaste={handlePaste}>
        {digits.map((d,i)=>(
          <input key={i} ref={el=>refs.current[i]=el} className={`otp-input ${d?'filled':''}`}
            type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={e=>handleDigit(i,e.target.value)}
            onKeyDown={e=>{if(e.key==='Backspace'&&!d&&i>0)refs.current[i-1]?.focus();}}/>
        ))}
      </div>
      {err&&<div style={{color:'var(--red)',fontSize:13,marginBottom:12,background:'var(--red-bg)',padding:'8px 12px',borderRadius:8,fontWeight:500}}>{err}</div>}
      {resendDone&&<div style={{color:'var(--green)',fontSize:13,marginBottom:12,background:'#F0FDF4',padding:'8px 12px',borderRadius:8,fontWeight:500}}>✅ Código reenviado, revisa tu correo</div>}
      <button className="btn btn-primary btn-lg" style={{width:'100%',marginBottom:10}} onClick={handleSubmit} disabled={loading||digits.join('').length<6}>
        {loading?<><div className="spinner"/>Verificando...</>:'Confirmar código →'}
      </button>
      <button onClick={handleResend} disabled={resending||resendCountdown>0}
        style={{width:'100%',marginBottom:8,padding:'10px',borderRadius:'var(--r-md)',border:'1.5px solid var(--g200)',background:'transparent',color:resendCountdown>0?'var(--g400)':'var(--g700)',fontSize:13,fontWeight:500,cursor:resendCountdown>0?'not-allowed':'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .2s'}}>
        {resending?<><div className="spinner" style={{display:'inline-block',marginRight:6}}/>Reenviando...</>:resendCountdown>0?`⏱ Reenviar código (${resendCountdown}s)`:'↺ Reenviar código'}
      </button>
      <button onClick={()=>{clearOTP();onBack();}} style={{background:'none',border:'none',color:'var(--g500)',fontSize:13,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif'}}>← Volver a crear cuenta</button>
    </div>
  );
}

function ForgotPassword({ onBack }) {
  const { resetPassword, confirmReset } = useAuth();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [userId, setUserId] = useState(null);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  useEffect(()=>{if(resendCountdown<=0)return;const t=setTimeout(()=>setResendCountdown(c=>c-1),1000);return()=>clearTimeout(t);},[resendCountdown]);

  const handleSendCode=async()=>{if(!email)return;setLoading(true);setErrMsg('');const res=await resetPassword(email);setLoading(false);if(res.ok){setCode(res.resetCode||'');setUserId(res.userId||null);setStep('code');setResendCountdown(60);}};
  const handleResend=async()=>{setLoading(true);setErrMsg('');const res=await resetPassword(email);setLoading(false);if(res.ok){setCode(res.resetCode||'');setUserId(res.userId||null);setResendCountdown(60);}};
  const handleVerifyCode=()=>{if(!userId){setErrMsg('Este correo no está registrado.');return;}if(codeInput!==code){setErrMsg('Código incorrecto, inténtalo de nuevo.');return;}setErrMsg('');setStep('newpw');};
  const handleNewPw=async()=>{if(newPw.length<6){setErrMsg('Mínimo 6 caracteres.');return;}if(newPw!==confirmPw){setErrMsg('Las contraseñas no coinciden.');return;}setLoading(true);setErrMsg('');await confirmReset(userId,newPw);setLoading(false);setStep('done');};

  if(step==='done') return (
    <div style={{textAlign:'center'}}>
      <div style={{fontSize:52,marginBottom:14}}>✅</div>
      <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>¡Contraseña actualizada!</div>
      <div style={{fontSize:14,color:'var(--g500)',marginBottom:24,lineHeight:1.6}}>Ya puedes iniciar sesión con tu nueva contraseña.</div>
      <button className="btn btn-primary btn-lg" style={{width:'100%'}} onClick={onBack}>← Ir a iniciar sesión</button>
    </div>
  );
  if(step==='newpw') return (
    <div>
      <div style={{fontSize:48,textAlign:'center',marginBottom:14}}>🔐</div>
      <div style={{fontSize:24,fontWeight:800,marginBottom:6}}>Nueva contraseña</div>
      <div style={{fontSize:14,color:'var(--g500)',marginBottom:24,lineHeight:1.5}}>Elige una contraseña segura para tu cuenta.</div>
      <div className="form-group" style={{marginBottom:14}}><div className="form-label">Nueva contraseña</div><PwInput value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="Mínimo 6 caracteres"/></div>
      <div className="form-group" style={{marginBottom:16}}><div className="form-label">Confirmar contraseña</div><PwInput value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="Repite tu contraseña"/>{confirmPw&&newPw&&newPw===confirmPw&&<div style={{fontSize:12,color:'var(--green)',fontWeight:600,marginTop:4}}>✓ Coinciden</div>}</div>
      {errMsg&&<div style={{background:'var(--red-bg)',color:'var(--red)',padding:'10px 14px',borderRadius:10,fontSize:13,fontWeight:500,marginBottom:12}}>{errMsg}</div>}
      <button className="btn btn-primary btn-lg" style={{width:'100%',marginBottom:12}} onClick={handleNewPw} disabled={loading}>{loading?<><div className="spinner"/>Guardando...</>:'✅ Guardar nueva contraseña'}</button>
    </div>
  );
  if(step==='code') return (
    <div style={{textAlign:'center'}}>
      <div style={{fontSize:48,marginBottom:14}}>📧</div>
      <div style={{fontSize:22,fontWeight:800,marginBottom:8}}>Revisa tu correo</div>
      <div style={{fontSize:14,color:'var(--g500)',marginBottom:6,lineHeight:1.6}}>Enviamos un código de 6 dígitos a <strong>{email}</strong>.</div>
      <div style={{fontSize:12,background:'var(--o50)',border:'1px solid var(--o200)',borderRadius:8,padding:'7px 12px',color:'var(--o700)',fontWeight:500,marginBottom:20}}>💡 Revisa tu carpeta de spam si no lo ves.</div>
      <div className="form-group" style={{marginBottom:14,textAlign:'left'}}>
        <div className="form-label">Código de verificación</div>
        <input className="form-input" placeholder="000000" maxLength={6} value={codeInput} onChange={e=>setCodeInput(e.target.value.replace(/\D/g,'').slice(0,6))} style={{textAlign:'center',fontSize:22,fontWeight:800,letterSpacing:8}}/>
      </div>
      {errMsg&&<div style={{background:'var(--red-bg)',color:'var(--red)',padding:'10px 14px',borderRadius:10,fontSize:13,fontWeight:500,marginBottom:12}}>{errMsg}</div>}
      <button className="btn btn-primary btn-lg" style={{width:'100%',marginBottom:10}} onClick={handleVerifyCode} disabled={codeInput.length<6}>Verificar código →</button>
      <button onClick={handleResend} disabled={loading||resendCountdown>0} style={{width:'100%',marginBottom:8,padding:'10px',borderRadius:'var(--r-md)',border:'1.5px solid var(--g200)',background:'transparent',color:resendCountdown>0?'var(--g400)':'var(--g700)',fontSize:13,fontWeight:500,cursor:resendCountdown>0?'not-allowed':'pointer',fontFamily:'Plus Jakarta Sans,sans-serif'}}>
        {resendCountdown>0?`⏱ Reenviar código (${resendCountdown}s)`:'↺ Reenviar código'}
      </button>
      <button onClick={onBack} style={{background:'none',border:'none',color:'var(--g500)',fontSize:13,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif'}}>← Volver</button>
    </div>
  );
  return (
    <div>
      <div style={{fontSize:48,textAlign:'center',marginBottom:14}}>🔑</div>
      <div style={{fontSize:24,fontWeight:800,letterSpacing:'-.5px',marginBottom:6}}>¿Olvidaste tu contraseña?</div>
      <div style={{fontSize:14,color:'var(--g500)',marginBottom:24,lineHeight:1.5}}>Ingresa tu correo y te enviaremos un código para restablecerla.</div>
      <div className="form-group" style={{marginBottom:16}}><div className="form-label">Correo electrónico</div><input className="form-input" type="email" placeholder="tu@correo.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
      {errMsg&&<div style={{background:'var(--red-bg)',color:'var(--red)',padding:'10px 14px',borderRadius:10,fontSize:13,fontWeight:500,marginBottom:12}}>{errMsg}</div>}
      <button className="btn btn-primary btn-lg" style={{width:'100%',marginBottom:12}} onClick={handleSendCode} disabled={loading||!email}>{loading?<><div className="spinner"/>Enviando...</>:'Enviar código de recuperación'}</button>
      <button onClick={onBack} style={{background:'none',border:'none',color:'var(--g500)',fontSize:13,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',width:'100%',textAlign:'center'}}>← Volver</button>
    </div>
  );
}


export default function AuthScreen({ defaultTab='login' }) {
  const { login, register, err, loading, setErr, pendingOTP } = useAuth();
  const [tab, setTab] = useState(defaultTab);
  const [showForgot, setShowForgot] = useState(false);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [form, setForm] = useState({name:'',email:'',password:'',confirmPw:'',address:'',dept:'',city:''});
  const [regDept, setRegDept] = useState('');
  const [regCity, setRegCity] = useState('');
  const [pwMismatch, setPwMismatch] = useState(false);
  const set=(k,v)=>{setForm(f=>({...f,[k]:v}));setErr('');setPwMismatch(false);};

  const handleLogin=async(e)=>{e.preventDefault();await login({email:form.email,password:form.password});};
  const handleRegister=async(e)=>{
    e.preventDefault();
    if(form.password!==form.confirmPw){setPwMismatch(true);return;}
    await register({...form,phone:country.prefix+' '+phone,country:country.name,dept:regDept,city:regCity});
  };

  const features=[
    {icon:'📬',title:'Dirección en Miami, FL',desc:'Casillero personal con tu nombre'},
    {icon:'📍',title:'Rastreo completo',desc:'8 etapas desde USA hasta tu puerta'},
    {icon:'🛍️',title:'Marketplace propio',desc:'Vende lo que traes de USA en COP'},
    {icon:'💳',title:'Pagos seguros',desc:'Tarjeta débito/crédito o transferencia'},
  ];

  const LeftPanel=()=>(
    <div className="auth-left">
      <div className="auth-left-glow"/><div className="auth-left-dots"/>
      <div className="auth-brand" style={{position:'relative',zIndex:1,fontSize:30,fontWeight:900,color:'white',letterSpacing:-1}}>
        MANG<span style={{color:'var(--o500)'}}>OO</span>
      </div>
      <div className="auth-hero" style={{position:'relative',zIndex:1}}>
        <div className="auth-hero-eyebrow">Casillero USA</div>
        <div className="auth-hero-title">Compra en<br/><em>cualquier tienda</em><br/>de USA</div>
        <div className="auth-hero-sub">Tu dirección en Miami. Tus productos en Colombia en 7–10 días.</div>
        <div className="auth-features">
          {features.map(f=>(
            <div className="auth-feature-card" key={f.title}>
              <div className="auth-feature-icon">{f.icon}</div>
              <div className="auth-feature-title">{f.title}</div>
              <div className="auth-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-social-proof">
        <div className="auth-avatars">
          {['D','M','S','J'].map((l,i)=>(
            <div key={i} className="auth-av" style={{marginLeft:i>0?-8:0,zIndex:4-i,background:['linear-gradient(135deg,#B04A00,#F4874B)','linear-gradient(135deg,#1565C0,#42A5F5)','linear-gradient(135deg,#2E7D32,#66BB6A)','linear-gradient(135deg,#6D28D9,#A78BFA)'][i]}}>{l}</div>
          ))}
        </div>
        <div className="auth-social-text"><strong>+200 clientes</strong> ya usan MANGOO</div>
      </div>
    </div>
  );

  if(pendingOTP) return <div className="auth-wrap"><LeftPanel/><div className="auth-right"><div className="auth-form-box anim-up"><OTPScreen onBack={()=>{setTab('register');setErr('');}}/></div></div></div>;
  if(showForgot) return <div className="auth-wrap"><LeftPanel/><div className="auth-right"><div className="auth-form-box anim-up"><ForgotPassword onBack={()=>setShowForgot(false)}/></div></div></div>;

  return (
    <div className="auth-wrap">
      <LeftPanel/>
      <div className="auth-right">
        <div className="auth-form-box anim-up">
          <div className="auth-tab-row">
            <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={()=>{setTab('login');setErr('');}}>Iniciar sesión</button>
            <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={()=>{setTab('register');setErr('');}}>Crear cuenta</button>
          </div>
          {tab==='login'?(
            <>
              <div className="auth-form-title">Bienvenido de nuevo</div>
              <div className="auth-form-sub">Ingresa a tu cuenta MANGOO</div>
              <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:14}}>
                <div className="form-group">
                  <div className="form-label">Correo electrónico</div>
                  <input className="form-input" type="email" placeholder="tu@correo.com" value={form.email} onChange={e=>set('email',e.target.value)} required/>
                </div>
                <div className="form-group">
                  <div className="form-label">Contraseña</div>
                  <PwInput value={form.password} onChange={e=>set('password',e.target.value)} required/>
                  <div style={{textAlign:'right',marginTop:4}}>
                    <button type="button" onClick={()=>setShowForgot(true)} style={{background:'none',border:'none',color:'var(--o600)',fontSize:12,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:500}}>¿Olvidaste tu contraseña?</button>
                  </div>
                </div>
                {err&&<div style={{background:'var(--red-bg)',color:'var(--red)',padding:'10px 14px',borderRadius:10,fontSize:13,fontWeight:500}}>{err}</div>}
                <button className="btn btn-primary btn-lg" type="submit" style={{width:'100%'}} disabled={loading}>
                  {loading?<><div className="spinner"/>Ingresando...</>:'Ingresar →'}
                </button>
              </form>
            </>
          ):(
            <>
              <div className="auth-form-title">Crea tu cuenta</div>
              <div className="auth-form-sub">Obtén tu casillero en Miami gratis</div>
              <form onSubmit={handleRegister} style={{display:'flex',flexDirection:'column',gap:13}}>
                <div className="form-group"><div className="form-label">Nombre completo</div><input className="form-input" placeholder="Juan García López" value={form.name} onChange={e=>set('name',e.target.value)} required/></div>
                <div className="form-group"><div className="form-label">Correo electrónico</div><input className="form-input" type="email" placeholder="tu@correo.com" value={form.email} onChange={e=>set('email',e.target.value)} required/></div>
                <div className="form-group">
                  <div className="form-label">País y teléfono</div>
                  <div style={{display:'flex',gap:8}}>
                    <select className="form-input" style={{width:150,flexShrink:0}} value={country.code} onChange={e=>{const c=COUNTRIES.find(x=>x.code===e.target.value)||COUNTRIES[0];setCountry(c);setPhone('');}}>
                      {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                    <div style={{flex:1,position:'relative'}}>
                      <div style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:13,color:'var(--o600)',fontWeight:700,pointerEvents:'none',fontFamily:'JetBrains Mono,monospace'}}>{country.prefix}</div>
                      <input className="form-input" style={{paddingLeft:country.prefix.length>3?52:44}} placeholder="3001234567" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} required/>
                    </div>
                  </div>
                  <div className="form-hint">Recibirás el código de verificación por correo</div>
                </div>
                <div className="form-group"><div className="form-label">Contraseña</div><PwInput value={form.password} onChange={e=>set('password',e.target.value)} required placeholder="Mínimo 6 caracteres"/></div>
                <div className="form-group">
                  <div className="form-label">Confirmar contraseña</div>
                  <PwInput value={form.confirmPw} onChange={e=>set('confirmPw',e.target.value)} required placeholder="Repite tu contraseña"/>
                  {pwMismatch&&<div className="form-error">Las contraseñas no coinciden</div>}
                  {form.confirmPw&&form.password&&form.password===form.confirmPw&&<div style={{fontSize:12,color:'var(--green)',fontWeight:600}}>✓ Las contraseñas coinciden</div>}
                </div>
                <div className="form-group"><div className="form-label">Dirección de entrega</div><input className="form-input" placeholder="Calle 123 #45-67, Apt 301" value={form.address} onChange={e=>set('address',e.target.value)}/></div>
                {country.name==='Colombia'&&(
                  <div className="grid-2">
                    <div className="form-group">
                      <div className="form-label">Departamento</div>
                      <select className="form-input" value={regDept} onChange={e=>{setRegDept(e.target.value);setRegCity('');}}>
                        <option value="">Seleccionar...</option>
                        {DEPT_LIST.map(d=><option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <div className="form-label">Ciudad</div>
                      {regDept&&COLOMBIA_DEPTS[regDept]?(
                        <select className="form-input" value={regCity} onChange={e=>setRegCity(e.target.value)}>
                          <option value="">Seleccionar...</option>
                          {COLOMBIA_DEPTS[regDept].map(c=><option key={c} value={c}>{c}</option>)}
                        </select>
                      ):(
                        <input className="form-input" placeholder="Primero elige depto." disabled/>
                      )}
                    </div>
                  </div>
                )}
                {err&&<div style={{background:'var(--red-bg)',color:'var(--red)',padding:'10px 14px',borderRadius:10,fontSize:13,fontWeight:500}}>{err}</div>}
                <button className="btn btn-primary btn-lg" type="submit" style={{width:'100%'}} disabled={loading}>
                  {loading?<><div className="spinner"/>Enviando código...</>:'🚀 Crear cuenta y verificar'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
