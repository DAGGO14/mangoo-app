import React, { useState } from 'react';
import { useApp, fmtUSD, getStatus, fmtCOP, MARKETPLACE_STATUSES, CASILLERO_STATUSES } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const MKT_STEPS=['Pago confirmado','Preparando pedido','Listo para despacho','Entregado a transportista','En camino','Entregado'];
const CAS_STEPS=['Pedido registrado','Recibido en bodega USA','Consolidado','En tránsito','En aduana Colombia','Bodega local','En camino','Entregado'];

function getStepIdx(order) {
  if (!order) return 0;
  if (order.type==='marketplace') {
    const idx=MARKETPLACE_STATUSES.findIndex(s=>s.key===order.status);
    return idx>=0?idx:0;
  }
  const map={pending_arrival:0,received_usa:1,in_transit:3,customs:4,local_warehouse:5,out_delivery:6,delivered:7};
  return map[order.status]??0;
}

export default function Tracking() {
  const { orders } = useApp();
  const { me, isAdmin } = useAuth();
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('active'); // active | all

  // ALL orders for this user (never hidden)
  const myOrders = orders.filter(o=>!o.userId||o.userId===me?.id||isAdmin);

  const filtered = myOrders.filter(o=>{
    const name=o.items?.[0]?.name||'';
    const matchSearch=name.toLowerCase().includes(search.toLowerCase())||o.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter=filter==='all'||o.status!=='delivered';
    return matchSearch&&matchFilter;
  });

  const displayId = sel || filtered[0]?.id;
  const displayOrder = myOrders.find(o=>o.id===displayId)||filtered[0];

  // Stats
  const activeCount   = myOrders.filter(o=>o.status!=='delivered').length;
  const deliveredCount= myOrders.filter(o=>o.status==='delivered').length;
  const mktCount      = myOrders.filter(o=>o.type==='marketplace').length;
  const casCount      = myOrders.filter(o=>o.type==='casillero').length;

  return (
    <div className="anim-up">
      <div className="page-head">
        <div><div className="page-title">Rastreo</div><div className="page-sub">{myOrders.length} pedidos en total</div></div>
      </div>

      {/* Mini dashboard */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[['En tránsito',activeCount,'🚀','#FFF3E0'],['Entregados',deliveredCount,'✅','#E8F5E9'],['Marketplace',mktCount,'🛍️','#EFF6FF'],['Casillero',casCount,'📦','#F5F3FF']].map(([l,v,ic,bg])=>(
          <div key={l} style={{background:'var(--white)',borderRadius:'var(--r-xl)',border:'1px solid var(--g200)',padding:'16px 18px',boxShadow:'var(--shadow-xs)'}}>
            <div style={{width:38,height:38,borderRadius:'var(--r-sm)',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,marginBottom:10}}>{ic}</div>
            <div style={{fontSize:10,color:'var(--g500)',fontWeight:700,textTransform:'uppercase',letterSpacing:.6,marginBottom:4}}>{l}</div>
            <div style={{fontSize:26,fontWeight:800,color:'var(--g900)',letterSpacing:'-1px'}}>{v}</div>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            {[['active','Activos'],['all','Todos']].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)} style={{padding:'6px 16px',borderRadius:'var(--r-full)',border:'none',background:filter===v?'var(--g900)':'var(--white)',color:filter===v?'white':'var(--g600)',fontSize:13,fontWeight:filter===v?700:400,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .2s',boxShadow:'var(--shadow-xs)'}}>{l}</button>
            ))}
            <input style={{flex:1,padding:'6px 14px',border:'1.5px solid var(--g300)',borderRadius:'var(--r-full)',fontSize:13,fontFamily:'Plus Jakarta Sans,sans-serif',outline:'none'}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="card">
            <div className="card-body" style={{padding:0}}>
              {filtered.length===0&&<div style={{padding:32,textAlign:'center',color:'var(--g400)',fontSize:13}}>Sin pedidos</div>}
              {filtered.map((o,i)=>{
                const st=getStatus(o.status,o.type);
                const isSelected=displayId===o.id;
                const isDelivered=o.status==='delivered';
                return(
                  <div key={o.id} onClick={()=>setSel(o.id)}
                    style={{display:'flex',alignItems:'center',gap:12,padding:'13px 18px',borderBottom:i<filtered.length-1?'1px solid var(--g100)':'none',cursor:'pointer',background:isSelected?'var(--o50)':'transparent',borderLeft:`3px solid ${isSelected?'var(--o600)':'transparent'}`,transition:'background .15s',opacity:isDelivered?0.7:1}}>
                    <div style={{width:42,height:42,borderRadius:10,background:'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0,overflow:'hidden'}}>
                      {o.items?.[0]?.image?<img src={o.items[0].image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:o.items?.[0]?.emoji||'📦'}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div className="flex-between">
                        <span className="mono" style={{fontSize:11,fontWeight:700,color:o.type==='marketplace'?'var(--o600)':'var(--blue)'}}>{o.id}</span>
                        <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:'var(--r-full)',background:o.type==='marketplace'?'var(--o100)':'var(--blue-bg)',color:o.type==='marketplace'?'var(--o700)':'var(--blue)'}}>{o.type==='marketplace'?'TIENDA':'CASILLERO'}</span>
                      </div>
                      <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginTop:2}}>{o.items?.[0]?.name||'Pedido'}</div>
                    </div>
                    <span className="status-chip" style={{background:st.color,color:st.text,fontSize:10,marginLeft:8}}>{st.icon} {st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {displayOrder?(
          <div>
            <div className="card mb-16">
              <div className="card-head">
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                    <span className="mono" style={{fontSize:12,color:'var(--g500)'}}>{displayOrder.id}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:'var(--r-full)',background:displayOrder.type==='marketplace'?'var(--o100)':'var(--blue-bg)',color:displayOrder.type==='marketplace'?'var(--o700)':'var(--blue)'}}>
                      {displayOrder.type==='marketplace'?'🛍️ MARKETPLACE':'📦 CASILLERO'}
                    </span>
                  </div>
                  <div className="card-title">{displayOrder.items?.[0]?.name}</div>
                </div>
                {(()=>{const st=getStatus(displayOrder.status,displayOrder.type);return <span className="status-chip" style={{background:st.color,color:st.text}}>{st.icon} {st.label}</span>;})()}
              </div>
              <div style={{padding:'16px 24px 24px'}}>
                <div className="tracker" style={{marginTop:8}}>
                  {(displayOrder.type==='marketplace'?MKT_STEPS:CAS_STEPS).map((label,i)=>{
                    const cur=getStepIdx(displayOrder);
                    const done=i<cur; const act=i===cur; const last=i===(displayOrder.type==='marketplace'?MKT_STEPS:CAS_STEPS).length-1;
                    return(
                      <div className="t-step" key={i}>
                        <div className="t-spine">
                          <div className={`t-dot ${done?'done':act?'active':'pending'}`}>{done?'✓':''}</div>
                          {!last&&<div className={`t-line ${done?'done':'pending'}`}/>}
                        </div>
                        <div className="t-body">
                          <div className={`t-title ${done?'done':act?'active':'pending'}`}>{label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Photos from staff */}
                {displayOrder.photos?.length>0&&(
                  <div style={{marginTop:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--g700)',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Fotos del pedido</div>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      {displayOrder.photos.map((ph,i)=>(
                        <img key={i} src={ph} alt="" style={{width:80,height:80,borderRadius:10,objectFit:'cover',border:'1px solid var(--g200)',cursor:'pointer'}} onClick={()=>window.open(ph,'_blank')}/>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {displayOrder.notes?.length>0&&(
                  <div style={{marginTop:16}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--g700)',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Actualizaciones del equipo</div>
                    {displayOrder.notes.map((n,i)=>(
                      <div key={i} style={{background:'var(--g50)',borderRadius:10,padding:'10px 12px',marginBottom:6,border:'1px solid var(--g200)'}}>
                        <div style={{fontSize:13}}>{n.text}</div>
                        <div style={{fontSize:11,color:'var(--g400)',marginTop:4}}>{n.author} · {new Date(n.date).toLocaleString('es')}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="grid-2" style={{gap:10}}>
                  {[['Total',fmtUSD(displayOrder.totalUSD)],['Fecha',new Date(displayOrder.createdAt).toLocaleDateString('es')],
                    displayOrder.trackingUSA?['Tracking USA',displayOrder.trackingUSA]:['Productos',displayOrder.items?.length+' ítem(s)']
                  ].map(([l,v])=>(
                    <div key={l} style={{background:'var(--g50)',borderRadius:10,padding:'10px 14px'}}>
                      <div style={{fontSize:11,color:'var(--g500)',marginBottom:3}}>{l}</div>
                      <div className={l==='Tracking USA'?'mono':''} style={{fontSize:13,fontWeight:600}}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ):(
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 0',color:'var(--g400)',flexDirection:'column',gap:12}}>
            <div style={{fontSize:48}}>📍</div><div style={{fontWeight:600}}>Sin pedidos aún</div>
          </div>
        )}
      </div>
    </div>
  );
}
