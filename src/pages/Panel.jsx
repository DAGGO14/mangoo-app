import React from 'react';
import { useApp, fmtUSD, getStatus } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Panel({ setPage }) {
  const { orders, products, cartCount } = useApp();
  const { me, isAdmin } = useAuth();
  const myOrders = orders.filter(o=>!o.userId||o.userId===me?.id||isAdmin);
  const active = myOrders.filter(o=>o.status!=='delivered').length;
  const delivered = myOrders.filter(o=>o.status==='delivered').length;
  const mktOrds = myOrders.filter(o=>o.type==='marketplace');
  const h = new Date().getHours();
  const greet = h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches';

  return (
    <div className="anim-up">
      <div className="page-head">
        <div>
          <div className="page-title" style={{fontFamily:"'Nunito',sans-serif"}}>{greet}, {me?.name?.split(' ')[0]} 👋</div>
          <div className="page-sub">Resumen de tu cuenta MANGOO</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setPage('casillero')}>+ Nuevo pedido</button>
      </div>
      <div className="stats-grid mb-24">
        {[
          ['Pedidos activos', active, '📦', '#FFF3E0'],
          ['Entregados', delivered, '✅', '#E8F5E9'],
          ['Compras marketplace', mktOrds.length, '🛍️', '#E3F2FD'],
          ['Carrito', cartCount, '🛒', '#F3E5F5'],
        ].map(([l,v,ic,bg])=>(
          <div key={l} className="stat-card anim-up-d1">
            <div className="stat-icon" style={{background:bg}}>{ic}</div>
            <div className="stat-label">{l}</div>
            <div className="stat-val">{v}</div>
          </div>
        ))}
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-head"><div className="card-title">Mis pedidos recientes</div><button className="btn btn-ghost btn-sm" onClick={()=>setPage('tracking')}>Ver todos →</button></div>
          <div style={{padding:'0 24px 24px'}}>
            {myOrders.length===0&&<div style={{padding:'24px 0',textAlign:'center',color:'var(--g400)',fontSize:13}}>Sin pedidos aún</div>}
            {myOrders.slice(0,5).map(o=>{
              const st=getStatus(o.status,o.type);
              const img=o.items?.[0]?.image;
              const emoji=o.items?.[0]?.emoji||'📦';
              return(
                <div key={o.id} style={{display:'flex',alignItems:'center',gap:12,padding:'11px 0',borderBottom:'1px solid var(--g100)',cursor:'pointer'}} onClick={()=>setPage('tracking')}>
                  <div style={{width:40,height:40,borderRadius:10,background:'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,overflow:'hidden'}}>
                    {img?<img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:emoji}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.items?.[0]?.name||'Pedido'}</div>
                    <div style={{fontSize:10,display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                      <span className="mono" style={{color:'var(--g400)'}}>{o.id}</span>
                      <span style={{fontSize:9,padding:'1px 6px',borderRadius:'var(--r-full)',background:o.type==='marketplace'?'var(--o100)':'var(--blue-bg)',color:o.type==='marketplace'?'var(--o700)':'var(--blue)',fontWeight:700}}>{o.type==='marketplace'?'TIENDA':'CASILLERO'}</span>
                    </div>
                  </div>
                  <span className="status-chip" style={{background:st.color,color:st.text,fontSize:10}}>{st.icon} {st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><div className="card-title">Accesos rápidos</div></div>
          <div style={{padding:'16px 24px 24px',display:'flex',flexDirection:'column',gap:10}}>
            {[
              {icon:'📬',label:'Comprar en tienda USA',sub:'Usa tu casillero en Miami',page:'casillero',color:'var(--o100)'},
              {icon:'🛍️',label:'Ver Marketplace',sub:'Productos ya en Colombia',page:'market',color:'#E8F5E9'},
              {icon:'📍',label:'Rastrear pedidos',sub:active+' pedidos activos',page:'tracking',color:'#EFF6FF'},
              {icon:'❓',label:'Centro de Ayuda',sub:'Guías paso a paso',page:'help',color:'#F5F3FF'},
            ].map(item=>(
              <div key={item.page} onClick={()=>setPage(item.page)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:'var(--g50)',borderRadius:12,cursor:'pointer',transition:'all .15s',border:'1px solid var(--g200)'}}
                onMouseOver={e=>{e.currentTarget.style.background=item.color;e.currentTarget.style.borderColor='transparent';}}
                onMouseOut={e=>{e.currentTarget.style.background='var(--g50)';e.currentTarget.style.borderColor='var(--g200)';}}>
                <div style={{width:40,height:40,borderRadius:10,background:item.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{item.icon}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>{item.label}</div>
                  <div style={{fontSize:12,color:'var(--g500)'}}>{item.sub}</div>
                </div>
                <span style={{marginLeft:'auto',color:'var(--g400)',fontSize:16}}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
