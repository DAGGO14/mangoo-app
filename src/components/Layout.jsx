import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
const NAV_BUYER=[
  {id:'panel',label:'Inicio',icon:'🏠',group:'p'},
  {id:'casillero',label:'Mi Casillero',icon:'📬',group:'p'},
  {id:'tracking',label:'Rastreo',icon:'📍',group:'p',badge:true},
  {id:'market',label:'Marketplace',icon:'🛍️',group:'c'},
  {id:'cart',label:'Mi Carrito',icon:'🛒',group:'c',cartBadge:true},
  {id:'help',label:'Ayuda',icon:'❓',group:'c'},
  {id:'rates',label:'Tarifas',icon:'💵',group:'n'},
  {id:'profile',label:'Mi Perfil',icon:'👤',group:'n'},
];
const NAV_WORKER=[
  {id:'panel',label:'Inicio',icon:'🏠',group:'p'},
  {id:'tracking',label:'Rastreo',icon:'📍',group:'p'},
  {id:'market',label:'Marketplace',icon:'🛍️',group:'c'},
  {id:'cart',label:'Mi Carrito',icon:'🛒',group:'c',cartBadge:true},
  {id:'help',label:'Ayuda',icon:'❓',group:'c'},
  {id:'orders',label:'Órdenes',icon:'📋',group:'n',badge:true},
  {id:'rates',label:'Tarifas',icon:'💵',group:'n'},
  {id:'profile',label:'Mi Perfil',icon:'👤',group:'n'},
];
const NAV_ADMIN=[
  {id:'panel',label:'Inicio',icon:'🏠',group:'p'},
  {id:'casillero',label:'Mi Casillero',icon:'📬',group:'p'},
  {id:'tracking',label:'Rastreo',icon:'📍',group:'p'},
  {id:'market',label:'Marketplace',icon:'🛍️',group:'c'},
  {id:'cart',label:'Mi Carrito',icon:'🛒',group:'c',cartBadge:true},
  {id:'help',label:'Ayuda',icon:'❓',group:'c'},
  {id:'admin',label:'Panel Vendedor',icon:'⚙️',group:'n'},
  {id:'orders',label:'Órdenes',icon:'📋',group:'n',badge:true},
  {id:'dev',label:'Dev Analytics',icon:'📊',group:'n'},
  {id:'rates',label:'Tarifas',icon:'💵',group:'n'},
  {id:'profile',label:'Mi Perfil',icon:'👤',group:'n'},
];
export default function Layout({page,setPage,children}){
  const {cartCount,orders,notifs,unreadCount,markAllRead,refresh}=useApp();
  const {me,logout,isAdmin,isWorker}=useAuth();
  const [showDD,setShowDD]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [showNotifs,setShowNotifs]=useState(false);
  const [copied,setCopied]=useState(false);
  const NAV=isAdmin?NAV_ADMIN:isWorker?NAV_WORKER:NAV_BUYER;
  const pendingOrders=orders.filter(o=>(o.status==='pending_arrival'||o.status==='paid'||o.status==='preparing')&&(!o.userId||o.userId===me?.id||isAdmin||isWorker)).length;
  const close=()=>{setShowDD(false);setShowNotifs(false);};
  const handleCopy=()=>{navigator.clipboard.writeText(`${me.name} — Suite #${me.suite}, 8751 NW 93rd Street Warehouse D, Miami FL 33178 USA`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2200);};
  return(
    <div className={`shell${sidebarOpen?'':' sidebar-collapsed'}`}>
      <div className="topbar">
        <div className="topbar-logo-area" style={{display:'flex',alignItems:'center',gap:0,padding:0}}>
          <button onClick={(e)=>{e.stopPropagation();setSidebarOpen(v=>!v);}} title="Menú"
            style={{width:44,height:64,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:5,flexShrink:0,padding:'0 12px'}}>
            <div style={{width:18,height:2,background:'white',borderRadius:2}}/>
            <div style={{width:18,height:2,background:'white',borderRadius:2}}/>
            <div style={{width:18,height:2,background:'white',borderRadius:2}}/>
          </button>
          <div onClick={()=>setPage('panel')} style={{cursor:'pointer',display:'flex',alignItems:'center',gap:7,userSelect:'none'}}>
            <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:'-1px',fontFamily:'Plus Jakarta Sans,sans-serif'}}>MANG<span style={{color:'var(--o500)'}}>OO</span></div>
            <span style={{background:'rgba(217,95,2,.9)',color:'white',fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:4,letterSpacing:1,textTransform:'uppercase'}}>USA</span>
          </div>
        </div>
        <div className="topbar-center">
          <div className="topbar-search-wrap">
            <span className="topbar-search-icon">🔍</span>
            <input className="topbar-search" placeholder="Buscar pedidos, productos..."/>
          </div>
        </div>
        <div className="topbar-right">
          <button className="refresh-btn" title="Actualizar datos" onClick={refresh}>↻</button>
          <div style={{position:'relative'}}>
            <button className="notif-btn" onClick={()=>{setShowNotifs(v=>!v);setShowDD(false);}}>
              🔔{unreadCount>0&&<span className="notif-badge">{unreadCount}</span>}
            </button>
            {showNotifs&&(
              <div className="notif-panel">
                <div className="notif-header"><div className="notif-title">Notificaciones</div><span className="notif-mark" onClick={markAllRead}>Marcar leídas</span></div>
                {notifs.length===0&&<div style={{padding:28,textAlign:'center',color:'var(--g400)',fontSize:13}}>Sin notificaciones</div>}
                {notifs.slice(0,8).map(n=>(
                  <div key={n.id} className={`notif-item ${n.read?'':'unread'}`}>
                    <div className="notif-item-title">{!n.read&&<span className="notif-dot-live"/>}{n.title}</div>
                    <div className="notif-item-body">{n.body}</div>
                    <div className="notif-item-time">{n.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{position:'relative'}}>
            <div className="user-btn" onClick={()=>{setShowDD(v=>!v);setShowNotifs(false);}}>
              <div className="user-av" style={{overflow:'hidden'}}>
                {me?.avatarImg?<img src={me.avatarImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:me?.avatar||'U'}
              </div>
              <div className="user-btn-info">
                <span className="user-btn-name">{me?.name?.split(' ')[0]}</span>
                <span className="user-btn-role">{me?.role==='admin'?'Administrador':me?.role==='worker'?'Trabajador':'Cliente'}</span>
              </div>
              {me?.role==='admin'&&<span className="role-tag role-admin">Admin</span>}
              {me?.role==='worker'&&<span className="role-tag role-worker">Staff</span>}
            </div>
            {showDD&&(
              <div className="dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-av" style={{overflow:'hidden'}}>{me?.avatarImg?<img src={me.avatarImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:me?.avatar}</div>
                  <div className="dropdown-name">{me?.name}</div>
                  <div className="dropdown-email">{me?.email}</div>
                </div>
                <button className="dropdown-item" onClick={()=>{setPage('profile');close();}}><span className="di-icon">👤</span>Mi perfil</button>
                {isWorker&&<button className="dropdown-item" onClick={()=>{setPage('orders');close();}}><span className="di-icon">📋</span>Órdenes</button>}
                {isAdmin&&<button className="dropdown-item" onClick={()=>{setPage('dev');close();}}><span className="di-icon">📊</span>Dev Panel</button>}
                <div className="dropdown-divider"/>
                <button className="dropdown-item red" onClick={()=>{logout();close();}}><span className="di-icon">🚪</span>Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="sidebar">
        {[['p','Principal'],['c','Compras'],['n',isAdmin?'Administración':'Mi Cuenta']].map(([g,label])=>(
          <div key={g}>
            <div className="sidebar-section">{label}</div>
            {NAV.filter(n=>n.group===g).map(n=>(
              <div key={n.id} data-id={n.id} className={`nav-link ${page===n.id?'active':''}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span><span>{n.label}</span>
                {n.badge&&pendingOrders>0&&<span className="nav-badge-pill">{pendingOrders}</span>}
                {n.cartBadge&&cartCount>0&&<span className="nav-badge-pill">{cartCount}</span>}
              </div>
            ))}
          </div>
        ))}
        <div className="sidebar-bottom">
          <div className="sidebar-suite">
            <div className="sc-label">Dirección USA</div>
            <div className="sc-suite">Suite #{me?.suite}</div>
            <div className="sc-city">Miami, FL 33178</div>
            <button className={`sc-copy ${copied?'copied':''}`} onClick={handleCopy}>{copied?'✅ Copiado':'📋 Copiar dirección'}</button>
          </div>
        </div>
      </div>
      <div className="main" onClick={close}>{children}</div>
    </div>
  );
}
