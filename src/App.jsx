import React, { useState, useEffect } from 'react';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Toasts from './components/Toasts';
import AuthScreen from './pages/AuthScreen';
import Panel from './pages/Panel';
import Casillero from './pages/Casillero';
import Tracking from './pages/Tracking';
import Market from './pages/Market';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import DevPanel from './pages/DevPanel';
import Help from './pages/Help';
import OnboardingTutorial from './components/OnboardingTutorial';
import MangooAI from './components/MangooAI';
import { Cart, Profile, Rates } from './pages/Other';

function GuestPromptModal({ onClose, onLogin }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="guest-prompt" onClick={e=>e.stopPropagation()}>
        <div className="guest-prompt-icon">🔐</div>
        <div className="guest-prompt-title">Crea tu cuenta gratis</div>
        <div className="guest-prompt-sub">Para acceder a esta sección necesitas una cuenta MANGOO. ¡Es gratis y tarda 1 minuto!</div>
        <button className="btn btn-primary btn-lg" style={{width:'100%',marginBottom:10}} onClick={()=>onLogin('register')}>🚀 Crear cuenta gratis</button>
        <button className="btn btn-ghost" style={{width:'100%'}} onClick={()=>onLogin('login')}>Ya tengo cuenta — Iniciar sesión</button>
      </div>
    </div>
  );
}

function GuestLockedPage({ tabLabel, onLogin }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',padding:'40px 20px'}}>
      <div style={{fontSize:64,marginBottom:20}}>🔒</div>
      <div style={{fontSize:22,fontWeight:800,marginBottom:8,color:'var(--g900)'}}>Crea una cuenta para acceder</div>
      <div style={{fontSize:15,color:'var(--g500)',marginBottom:32,maxWidth:360,lineHeight:1.6}}>
        La sección <strong>{tabLabel}</strong> requiere una cuenta MANGOO. ¡Es gratis y te damos un casillero en Miami!
      </div>
      <button className="btn btn-primary btn-lg" style={{marginBottom:12,minWidth:220}} onClick={()=>onLogin('register')}>
        🚀 Crear cuenta gratis
      </button>
      <button className="btn btn-ghost" style={{minWidth:220}} onClick={()=>onLogin('login')}>
        Ya tengo cuenta — Iniciar sesión
      </button>
    </div>
  );
}

function AppContent() {
  const { me, isAdmin, isWorker } = useAuth();
  const [page, setPage] = useState('panel');
  const [authTab, setAuthTab] = useState('login');
  const [showAuth, setShowAuth] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleLogin = (tab) => { setAuthTab(tab); setShowAuth(true); };

  // Show tutorial once for brand new users
  useEffect(() => {
    if (me && !isAdmin && !isWorker) {
      const key = 'mg9_tutorial_done_' + me.id;
      if (!localStorage.getItem(key)) {
        setTimeout(() => setShowTutorial(true), 800);
      }
    }
  }, [me?.id]);

  const finishTutorial = () => {
    setShowTutorial(false);
    if (me) localStorage.setItem('mg9_tutorial_done_' + me.id, '1');
  };

  if (!me) {
    if (showAuth) return <AuthScreen defaultTab={authTab}/>;

    // Guest mode: full layout but locked tabs
    const GUEST_NAV = [
      {id:'panel',label:'Inicio',icon:'🏠',group:'p'},
      {id:'casillero',label:'Mi Casillero',icon:'📬',group:'p'},
      {id:'tracking',label:'Rastreo',icon:'📍',group:'p'},
      {id:'market',label:'Marketplace',icon:'🛍️',group:'c'},
      {id:'help',label:'Ayuda',icon:'❓',group:'c'},
      {id:'rates',label:'Tarifas',icon:'💵',group:'n'},
      {id:'profile',label:'Mi Perfil',icon:'👤',group:'n'},
    ];
    const LOCKED_TABS = ['casillero','tracking','cart','rates','profile'];
    const LOCKED_LABELS = {casillero:'Mi Casillero',tracking:'Rastreo',cart:'Mi Carrito',rates:'Tarifas',profile:'Mi Perfil'};

    const guestContent = () => {
      if(page==='market') return <Market setPage={setPage} onNeedAuth={()=>setShowPrompt(true)}/>;
      if(page==='help') return <Help/>;
      if(LOCKED_TABS.includes(page)) return <GuestLockedPage tabLabel={LOCKED_LABELS[page]||page} onLogin={handleLogin}/>;
      return <Market setPage={setPage} onNeedAuth={()=>setShowPrompt(true)}/>;
    };

    return (
      <GuestLayout page={page} setPage={setPage} nav={GUEST_NAV} onLogin={handleLogin} lockedTabs={LOCKED_TABS}>
        {guestContent()}
        {showPrompt&&<GuestPromptModal onClose={()=>setShowPrompt(false)} onLogin={(t)=>{setShowPrompt(false);handleLogin(t);}}/>}
        <Toasts/>
      </GuestLayout>
    );
  }

  const pages = {
    panel:    <Panel setPage={setPage}/>,
    casillero:<Casillero/>,
    tracking: <Tracking/>,
    market:   <Market setPage={setPage}/>,
    cart:     <Cart/>,
    help:     <Help/>,
    rates:    <Rates/>,
    profile:  <Profile/>,
    orders:   (isAdmin||isWorker)?<Orders/>:<Market setPage={setPage}/>,
    admin:    isAdmin?<Admin/>:<Market setPage={setPage}/>,
    dev:      isAdmin?<DevPanel/>:<Market setPage={setPage}/>,
  };

  return (<><Layout page={page} setPage={setPage}>{pages[page]||pages.panel}</Layout><Toasts/>{showTutorial&&<OnboardingTutorial onFinish={finishTutorial} setPage={setPage}/>}<MangooAI setPage={setPage}/></>);
}

function GuestLayout({ page, setPage, nav, onLogin, lockedTabs, children }) {
  const LOCKED_TABS = lockedTabs || [];
  return (
    <div className="shell">
      <div className="topbar">
        <div className="topbar-logo-area" onClick={()=>setPage('panel')}>
          <div style={{display:'flex',alignItems:'center',gap:7,userSelect:'none'}}>
            <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:'-1px',fontFamily:'Plus Jakarta Sans,sans-serif'}}>MANG<span style={{color:'var(--o500)'}}>OO</span></div>
            <span style={{background:'rgba(217,95,2,.9)',color:'white',fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:4,letterSpacing:1,textTransform:'uppercase'}}>USA</span>
          </div>
        </div>
        <div className="topbar-center">
          <div className="topbar-search-wrap">
            <span className="topbar-search-icon">🔍</span>
            <input className="topbar-search" placeholder="Buscar productos..."/>
          </div>
        </div>
        <div className="topbar-right">
          <button onClick={()=>onLogin('login')} style={{padding:'8px 16px',borderRadius:'var(--r-md)',border:'1.5px solid rgba(255,255,255,.2)',background:'transparent',color:'rgba(255,255,255,.85)',fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .2s'}}>
            Iniciar sesión
          </button>
          <button onClick={()=>onLogin('register')} style={{padding:'8px 16px',borderRadius:'var(--r-md)',border:'none',background:'var(--o600)',color:'white',fontSize:13,fontWeight:700,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',boxShadow:'0 2px 12px rgba(217,95,2,.4)'}}>
            Crear cuenta
          </button>
        </div>
      </div>
      <div className="sidebar">
        {[['p','Principal'],['c','Compras'],['n','Mi Cuenta']].map(([g,label])=>(
          <div key={g}>
            <div className="sidebar-section">{label}</div>
            {nav.filter(n=>n.group===g).map(n=>{
              const isLocked = LOCKED_TABS.includes(n.id);
              const isMkt = n.id==='market';
              return (
                <div key={n.id}
                  className={`nav-link ${page===n.id?'active':''} ${isMkt?'':''}` }
                  style={{opacity:isLocked?0.6:1}}
                  onClick={()=>setPage(n.id)}>
                  <span className="nav-icon">{n.icon}</span>
                  <span style={{flex:1}}>{n.label}</span>

                </div>
              );
            })}
          </div>
        ))}
        <div className="sidebar-bottom">
          <div style={{padding:'14px 16px',background:'var(--o50)',borderRadius:12,border:'1px solid var(--o200)',margin:'0 8px'}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--o700)',marginBottom:4}}>¡Únete a MANGOO!</div>
            <div style={{fontSize:11,color:'var(--o600)',marginBottom:10,lineHeight:1.5}}>Obtén tu casillero en Miami gratis y compra en cualquier tienda de USA.</div>
            <button className="btn btn-primary" style={{width:'100%',fontSize:12,padding:'8px'}} onClick={()=>onLogin('register')}>Crear cuenta gratis 🚀</button>
          </div>
        </div>
      </div>
      <div className="main">{children}</div>
    </div>
  );
}

export default function App() {
  return (<AppProvider><AuthProvider><AppContent/></AuthProvider></AppProvider>);
}
