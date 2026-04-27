import React, { useState } from 'react';
import { useApp, fmtUSD, fmtCOP, getStatuses, getStatus } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

function MiniLine({ data, color }) {
  if (!data||data.length<2) return <div style={{height:60,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--g400)',fontSize:12}}>Sin datos</div>;
  const max=Math.max(...data.map(d=>d.v),1);
  const W=380,H=60,p=6;
  const pts=data.map((d,i)=>{const x=p+(i/(data.length-1))*(W-p*2);const y=H-p-((d.v/max)*(H-p*2));return`${x},${y}`;}).join(' ');
  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',height:60}}>
      <polyline points={pts} fill="none" stroke={color||'var(--o600)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d,i)=>{const x=p+(i/(data.length-1))*(W-p*2);const y=H-p-((d.v/max)*(H-p*2));return<circle key={i} cx={x} cy={y} r="3.5" fill={color||'var(--o600)'}/>;})}
    </svg>
  );
}

function StatusPipeline({ orders, type, color, onStatusClick }) {
  const statuses = getStatuses(type).filter(s=>s.key!=='cancelled');
  const total = orders.length || 1;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:6}}>
      {statuses.map(s => {
        const count = orders.filter(o=>o.status===s.key).length;
        return (
          <div key={s.key} onClick={()=>count>0&&onStatusClick(s.key,type)}
            style={{display:'flex',alignItems:'center',gap:10,padding:'6px 8px',borderRadius:10,cursor:count>0?'pointer':'default',transition:'background .15s'}}
            onMouseOver={e=>{if(count>0)e.currentTarget.style.background='var(--g50)';}}
            onMouseOut={e=>{e.currentTarget.style.background='transparent';}}>
            <div style={{width:28,height:28,borderRadius:8,background:s.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{s.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:3,alignItems:'center'}}>
                <span style={{fontSize:12,fontWeight:600,color:'var(--g700)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.label}</span>
                <div style={{display:'flex',alignItems:'center',gap:6,marginLeft:8,flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:800,color:count>0?color:'var(--g400)'}}>{count}</span>
                  {count>0&&<span style={{fontSize:10,color:'var(--o600)',fontWeight:600}}>ver →</span>}
                </div>
              </div>
              <div style={{height:4,background:'var(--g100)',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${(count/total)*100}%`,background:color,borderRadius:3,transition:'width .6s ease',minWidth:count>0?4:0}}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderTrackingMap({ order, onClose, onCancel, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const statuses = getStatuses(order.type);
  const currentIdx = statuses.findIndex(s=>s.key===order.status);
  const isCancelled = order.status==='cancelled';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:560,width:'94vw'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">📍 {order.id}</div>
            <div style={{fontSize:12,color:'var(--g500)',marginTop:2}}>{order.userName} · {order.type==='marketplace'?'Marketplace':'Casillero'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{padding:'0 24px 24px'}}>
          <div style={{background:'var(--g50)',borderRadius:12,padding:'12px 14px',marginBottom:16,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:13,fontWeight:600}}>{order.items?.map(x=>x.name).join(', ').slice(0,60)}</div>
              <div style={{fontSize:11,color:'var(--g500)',marginTop:2}}>{new Date(order.createdAt).toLocaleDateString('es',{day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
            <span style={{fontSize:16,fontWeight:800,color:'var(--green)'}}>{fmtUSD(order.totalUSD)}</span>
          </div>

          {/* Cancel / Delete buttons */}
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            {!isCancelled && (
              <button className="btn" style={{background:'#FFF7ED',color:'#B45309',border:'1px solid #FDE68A',fontSize:12,fontWeight:700,flex:1}}
                onClick={()=>{onCancel(order.id);onClose();}}>
                🚫 Marcar cancelado
              </button>
            )}
            {!confirmDelete ? (
              <button className="btn" style={{background:'#FEF2F2',color:'#DC2626',border:'1px solid #FCA5A5',fontSize:12,fontWeight:700,flex:1}}
                onClick={()=>setConfirmDelete(true)}>
                🗑️ Eliminar orden
              </button>
            ) : (
              <div style={{flex:1,display:'flex',gap:6}}>
                <button className="btn" style={{background:'#DC2626',color:'white',fontSize:12,fontWeight:700,flex:1}}
                  onClick={()=>{onDelete(order.id);onClose();}}>
                  ⚠️ Confirmar eliminación
                </button>
                <button className="btn btn-ghost" style={{fontSize:12}} onClick={()=>setConfirmDelete(false)}>No</button>
              </div>
            )}
          </div>

          {isCancelled && (
            <div style={{background:'#FEF2F2',border:'1px solid #FCA5A5',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#DC2626',fontWeight:600}}>
              🚫 Esta orden fue cancelada {order.cancelledAt ? `el ${new Date(order.cancelledAt).toLocaleDateString('es')}` : ''}
            </div>
          )}

          <div style={{display:'flex',flexDirection:'column',gap:0,maxHeight:340,overflowY:'auto'}}>
            {statuses.filter(s=>s.key!=='cancelled').map((s,idx)=>{
              const isDone=idx<currentIdx&&!isCancelled, isActive=idx===currentIdx&&!isCancelled;
              return (
                <div key={s.key} style={{display:'flex',gap:14,alignItems:'flex-start',paddingBottom:idx<statuses.length-2?14:0}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',width:28,flexShrink:0}}>
                    <div style={{width:26,height:26,borderRadius:'50%',background:isDone?'var(--green)':isActive?'var(--o600)':'var(--g200)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:isDone?12:13,fontWeight:700,color:'white',boxShadow:isActive?'0 0 0 4px rgba(217,95,2,.2)':'none',zIndex:1,position:'relative'}}>
                      {isDone?'✓':s.icon}
                    </div>
                    {idx<statuses.length-2&&<div style={{width:2,flex:1,minHeight:18,marginTop:4,background:isDone?'var(--green)':'var(--g200)',borderRadius:2}}/>}
                  </div>
                  <div style={{flex:1,paddingTop:3}}>
                    <div style={{fontSize:13,fontWeight:isActive?700:isDone?600:400,color:isActive?'var(--o700)':isDone?'var(--g700)':'var(--g400)'}}>{s.label}</div>
                    {isActive&&<div style={{fontSize:11,color:'var(--o600)',fontWeight:600,marginTop:2,display:'flex',alignItems:'center',gap:4}}><span style={{width:5,height:5,borderRadius:'50%',background:'var(--o600)',display:'inline-block',animation:'glowPulse 2s infinite'}}/>Estado actual</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {order.notes?.length>0&&(
            <div style={{marginTop:16,borderTop:'1px solid var(--g100)',paddingTop:14}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--g600)',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Notas</div>
              {order.notes.map((n,i)=>(
                <div key={i} style={{background:'var(--g50)',borderRadius:8,padding:'7px 12px',marginBottom:5,fontSize:12}}>
                  <div style={{color:'var(--g700)'}}>{n.text}</div>
                  <div style={{color:'var(--g400)',marginTop:2}}>{n.author} · {new Date(n.date).toLocaleDateString('es')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusOrdersModal({ orders, statusKey, type, onSelectOrder, onClose }) {
  const st = getStatus(statusKey, type);
  const filtered = orders.filter(o=>o.status===statusKey&&o.type===type);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:560,width:'94vw'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><div className="modal-title">{st.icon} {st.label}</div><div style={{fontSize:12,color:'var(--g500)',marginTop:2}}>{filtered.length} orden{filtered.length!==1?'es':''}</div></div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{padding:'0 0 8px',maxHeight:'60vh',overflowY:'auto'}}>
          {filtered.map((o,i)=>(
            <div key={o.id} onClick={()=>{onSelectOrder(o);onClose();}}
              style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 24px',borderBottom:i<filtered.length-1?'1px solid var(--g100)':'none',cursor:'pointer',transition:'background .15s'}}
              onMouseOver={e=>e.currentTarget.style.background='var(--o50)'}
              onMouseOut={e=>e.currentTarget.style.background=''}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                  <span className="mono" style={{fontSize:12,fontWeight:700,color:type==='marketplace'?'var(--o600)':'var(--blue)'}}>{o.id}</span>
                </div>
                <div style={{fontSize:13,fontWeight:600}}>{o.userName}</div>
                <div style={{fontSize:11,color:'var(--g400)'}}>{o.items?.map(x=>x.name).join(', ').slice(0,50)}</div>
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                <span style={{fontSize:14,fontWeight:800,color:'var(--green)'}}>{fmtUSD(o.totalUSD)}</span>
                <span style={{fontSize:11,color:'var(--o600)',fontWeight:600}}>Ver →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PERMS_DEF = [
  {key:'orders',label:'Gestionar órdenes',desc:'Ver y actualizar estado de órdenes',icon:'📋',default:true},
  {key:'products',label:'Editar productos',desc:'Agregar, editar y eliminar productos del marketplace',icon:'🛍️',default:true},
  {key:'data',label:'Ver datos de clientes',desc:'Acceso a información de usuarios y sus perfiles',icon:'👥',default:false},
  {key:'analytics',label:'Analytics',desc:'Ver reportes, estadísticas y métricas',icon:'📊',default:false},
  {key:'financial',label:'Datos financieros',desc:'Ver valores en USD, ingresos y reportes de dinero',icon:'💰',default:false},
  {key:'manipulation',label:'Manipulación avanzada',desc:'Cancelar, eliminar órdenes y acciones críticas',icon:'⚙️',default:false},
];

function PermToggle({ perm, value, onChange }) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:'1px solid var(--g100)'}}>
      <div style={{width:34,height:34,borderRadius:10,background:value?'var(--o50)':'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,transition:'background .2s'}}>{perm.icon}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:value?'var(--g900)':'var(--g400)'}}>{perm.label}</div>
        <div style={{fontSize:11,color:'var(--g400)',lineHeight:1.4}}>{perm.desc}</div>
      </div>
      <button onClick={()=>onChange(!value)}
        style={{width:44,height:24,borderRadius:12,border:'none',background:value?'var(--o600)':'var(--g300)',cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0}}>
        <div style={{width:20,height:20,borderRadius:'50%',background:'white',position:'absolute',top:2,left:value?22:2,transition:'left .2s',boxShadow:'0 1px 4px rgba(0,0,0,.2)'}}/>
      </button>
    </div>
  );
}

function CreateWorkerModal({ onClose, onSave }) {
  const [form, setForm] = useState({name:'',email:'',password:'',phone:''});
  const [perms, setPerms] = useState(()=>Object.fromEntries(PERMS_DEF.map(p=>[p.key,p.default])));
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const setPerm = (k,v) => setPerms(p=>({...p,[k]:v}));
  const handle = async () => {
    if (!form.name||!form.email||!form.password) { setErr('Nombre, correo y contraseña son requeridos.'); return; }
    if (form.password.length < 6) { setErr('Contraseña mínimo 6 caracteres.'); return; }
    setLoading(true);
    try {
      const res = await onSave({...form, permissions: perms});
      setLoading(false);
      if (!res || !res.ok) { setErr((res&&res.error)||'Error al crear el trabajador.'); return; }
      onClose();
    } catch(e) {
      setLoading(false);
      setErr('Error inesperado: ' + e.message);
    }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:480,width:'94vw',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head" style={{position:'sticky',top:0,background:'white',zIndex:10}}>
          <div className="modal-title">👷 Crear cuenta trabajador</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{padding:'0 24px 24px',display:'flex',flexDirection:'column',gap:14}}>
          <div className="form-group"><div className="form-label">Nombre completo *</div><input className="form-input" placeholder="Juan García" value={form.name} onChange={e=>set('name',e.target.value)}/></div>
          <div className="form-group"><div className="form-label">Correo *</div><input className="form-input" type="email" placeholder="trabajador@mangoo.co" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
          <div className="form-group"><div className="form-label">Contraseña *</div><input className="form-input" type="password" placeholder="Mín. 6 caracteres" value={form.password} onChange={e=>set('password',e.target.value)}/></div>
          <div className="form-group"><div className="form-label">WhatsApp</div><input className="form-input" placeholder="+57 300..." value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
          
          <div style={{borderTop:'1px solid var(--g200)',paddingTop:14}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--g700)',marginBottom:4}}>🔐 Permisos del trabajador</div>
            <div style={{fontSize:12,color:'var(--g500)',marginBottom:12}}>Activa o desactiva las funciones a las que tendrá acceso este trabajador.</div>
            {PERMS_DEF.map(p=><PermToggle key={p.key} perm={p} value={perms[p.key]} onChange={v=>setPerm(p.key,v)}/>)}
          </div>
          
          {err&&<div style={{background:'var(--red-bg)',color:'var(--red)',padding:'10px 14px',borderRadius:10,fontSize:13}}>{err}</div>}
          <button className="btn btn-primary" style={{width:'100%'}} onClick={handle} disabled={loading}>
            {loading?<><div className="spinner"/>Creando...</>:'✅ Crear trabajador'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserDetailModal({ user, onClose, onToggleAccess, onDelete }) {
  const [showPw, setShowPw] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:480,width:'94vw'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">👤 Detalles del usuario</div>
            <div style={{fontSize:12,color:'var(--g500)',marginTop:2}}>{user.role==='worker'?'Trabajador':'Cliente'}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{padding:'0 24px 24px',display:'flex',flexDirection:'column',gap:14}}>
          {/* Avatar + name */}
          <div style={{display:'flex',alignItems:'center',gap:14,padding:'14px',background:'var(--g50)',borderRadius:12}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:user.avatarImg?'none':'linear-gradient(135deg,var(--o700),var(--o500))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:18,color:'white',flexShrink:0,overflow:'hidden'}}>
              {user.avatarImg?<img src={user.avatarImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:user.avatar}
            </div>
            <div>
              <div style={{fontSize:16,fontWeight:800}}>{user.name}</div>
              <div style={{fontSize:12,color:'var(--g500)'}}>{user.email}</div>
              {user.disabled&&<span style={{fontSize:10,background:'#FEF2F2',color:'#DC2626',border:'1px solid #FCA5A5',borderRadius:4,padding:'2px 8px',fontWeight:700,display:'inline-block',marginTop:4}}>CUENTA DESACTIVADA</span>}
            </div>
          </div>

          {/* Info grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[
              {label:'Suite',val:`#${user.suite}`},
              {label:'País',val:user.country||'—'},
              {label:'Teléfono',val:user.phone||'—'},
              {label:'Registro',val:new Date(user.createdAt).toLocaleDateString('es')},
              {label:'Dirección',val:user.address||'—'},
              {label:'Departamento',val:user.dept||'—'},
            ].map(({label,val})=>(
              <div key={label} style={{background:'var(--g50)',borderRadius:10,padding:'10px 14px'}}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--g500)',textTransform:'uppercase',letterSpacing:.5,marginBottom:3}}>{label}</div>
                <div style={{fontSize:13,fontWeight:600,color:'var(--g800)'}}>{val}</div>
              </div>
            ))}
          </div>

          {/* Password — admin only sensitive field */}
          <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:10,padding:'12px 14px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4}}>
              <div style={{fontSize:10,fontWeight:700,color:'#92400E',textTransform:'uppercase',letterSpacing:.5}}>⚠️ Contraseña (solo visible para admin)</div>
              <button onClick={()=>setShowPw(v=>!v)} style={{background:'none',border:'none',color:'#B45309',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif'}}>
                {showPw?'🙈 Ocultar':'👁 Ver'}
              </button>
            </div>
            <div style={{fontSize:14,fontFamily:'JetBrains Mono,monospace',fontWeight:600,color:'#78350F',letterSpacing:showPw?1:3}}>
              {showPw ? user.password : '••••••••••'}
            </div>
          </div>

          {/* Actions */}
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <button className="btn" style={{flex:1,background:user.disabled?'#F0FDF4':'#FFF7ED',color:user.disabled?'#15803D':'#B45309',border:user.disabled?'1px solid #BBF7D0':'1px solid #FDE68A',fontWeight:700}}
              onClick={()=>{onToggleAccess(user.id,!user.disabled);onClose();}}>
              {user.disabled?'✅ Activar cuenta':'🚫 Desactivar cuenta'}
            </button>
            {!confirmDelete?(
              <button className="btn" style={{flex:1,background:'#FEF2F2',color:'#DC2626',border:'1px solid #FCA5A5',fontWeight:700}}
                onClick={()=>setConfirmDelete(true)}>
                🗑️ Eliminar usuario
              </button>
            ):(
              <div style={{flex:1,display:'flex',gap:6}}>
                <button className="btn" style={{flex:1,background:'#DC2626',color:'white',fontWeight:700,fontSize:12}}
                  onClick={()=>{onDelete(user.id);onClose();}}>
                  ⚠️ Confirmar
                </button>
                <button className="btn btn-ghost" style={{fontSize:12}} onClick={()=>setConfirmDelete(false)}>No</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DevPanel() {
  const { orders, products, wishlist, cancelOrder, deleteOrder } = useApp();
  const { users, createWorker, deleteWorker, deleteUser, updateUserAccess } = useAuth();
  const [tab, setTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [ordersFilter, setOrdersFilter] = useState('all');
  const [showCreateWorker, setShowCreateWorker] = useState(false);
  const [managingUser, setManagingUser] = useState(null); // user object being managed
  const [showPw, setShowPw] = useState({}); // {userId: bool}
  const [selectedUser, setSelectedUser] = useState(null);
  const [userConfirmDelete, setUserConfirmDelete] = useState(null);
  const [workerConfirmDelete, setWorkerConfirmDelete] = useState(null);

  const mktOrders  = orders.filter(o=>o.type==='marketplace');
  const casilOrds  = orders.filter(o=>o.type==='casillero');
  const totalRev   = mktOrders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.totalUSD,0);
  const casilFee   = parseFloat((casilOrds.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+o.totalUSD*0.07,0)).toFixed(2));
  const realUsers  = users.filter(u=>u.role!=='admin'&&u.role!=='worker');
  const workerUsers = users.filter(u=>u.role==='worker');
  const publishedP = products.filter(p=>p.status!=='draft');
  const drafts     = products.filter(p=>p.status==='draft');

  const totalMktItems = mktOrders.reduce((s,o)=>s+(o.items?.length||0),0);
  const avgOrderVal   = mktOrders.filter(o=>o.status!=='cancelled').length ? (totalRev/mktOrders.filter(o=>o.status!=='cancelled').length).toFixed(0) : 0;
  const topProducts   = (() => {
    const map={};
    mktOrders.filter(o=>o.status!=='cancelled').forEach(o=>o.items?.forEach(item=>{map[item.name]=(map[item.name]||0)+item.qty;}));
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,5);
  })();
  const topCustomers  = (() => {
    const map={};
    mktOrders.filter(o=>o.status!=='cancelled').forEach(o=>{if(!map[o.userId]){map[o.userId]={name:o.userName,total:0,count:0};}map[o.userId].total+=o.totalUSD;map[o.userId].count+=1;});
    return Object.values(map).sort((a,b)=>b.total-a.total).slice(0,5);
  })();
  const deliveredMkt  = mktOrders.filter(o=>o.status==='delivered').length;
  const cancelledOrds = orders.filter(o=>o.status==='cancelled').length;
  const wishlistReqs  = (wishlist||[]).reduce((s,x)=>s+(x.requests||0),0);

  const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));const label=d.toLocaleDateString('es',{weekday:'short'});const v=orders.filter(o=>new Date(o.createdAt).toDateString()===d.toDateString()&&o.status!=='cancelled').length;return{label,v};});

  const TABS=[['overview','Overview'],['orders','Órdenes'],['marketplace','🛍️ Mkt USA'],['staff','👷 Staff'],['users','Usuarios'],['products','Productos']];
  const filteredOrders = ordersFilter==='all' ? orders : orders.filter(o=>o.type===ordersFilter);

  const KPIs=[
    {label:'Órdenes activas', val:orders.filter(o=>o.status!=='cancelled').length, icon:'📋', color:'#FFF3E0', tab:'orders'},
    {label:'Ingresos marketplace', val:fmtUSD(totalRev), icon:'💰', color:'#E8F5E9', tab:'marketplace'},
    {label:'Ganancia casillero', val:fmtUSD(casilFee), icon:'📈', color:'#E3F2FD', tab:'orders'},
    {label:'Usuarios registrados', val:realUsers.length, icon:'👤', color:'#F3E5F5', tab:'users'},
  ];

  return(
    <div className="anim-up">
      <div className="page-head">
        <div><div className="page-title">Dev Panel</div><div className="page-sub">Analytics · Solo administradores</div></div>
        <span className="badge badge-dark">🔒 Admin</span>
      </div>

      <div style={{display:'flex',gap:4,background:'var(--white)',padding:4,borderRadius:'var(--r-lg)',marginBottom:24,width:'fit-content',boxShadow:'var(--shadow-xs)',flexWrap:'wrap'}}>
        {TABS.map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{padding:'8px 14px',borderRadius:'var(--r-md)',border:'none',background:tab===v?'var(--o600)':'transparent',color:tab===v?'white':'var(--g600)',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .2s'}}>{l}</button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab==='overview'&&(
        <div className="anim-up">
          <div className="stats-grid mb-24">
            {KPIs.map(k=>(
              <div key={k.label} className="stat-card" style={{cursor:'pointer',transition:'all .2s'}} onClick={()=>setTab(k.tab)}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='var(--shadow-lg)';}}
                onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='';}}>
                <div className="stat-icon" style={{background:k.color}}>{k.icon}</div>
                <div className="stat-label">{k.label}</div>
                <div className="stat-val" style={{fontSize:typeof k.val==='string'&&k.val.length>8?18:30}}>{k.val}</div>
                <div style={{fontSize:11,color:'var(--o600)',marginTop:6,fontWeight:500}}>Ver detalle →</div>
              </div>
            ))}
          </div>
          <div className="two-col">
            <div className="card">
              <div className="card-head"><div className="card-title">Órdenes — últimos 7 días</div></div>
              <div style={{padding:'8px 24px 20px'}}>
                <MiniLine data={last7} color="var(--o600)"/>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                  {last7.map((d,i)=><span key={i} style={{fontSize:10,color:'var(--g400)'}}>{d.label}</span>)}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">Resumen de stock</div></div>
              <div style={{padding:'12px 24px 20px',display:'flex',flexDirection:'column',gap:12}}>
                {[['Publicados',publishedP.length,'var(--green)'],['Borradores',drafts.length,'var(--o600)'],['Agotados',products.filter(p=>p.sizes&&Object.values(p.sizes).every(v=>v===0)).length,'var(--red)'],['Canceladas',cancelledOrds,'#DC2626']].map(([l,v,c])=>(
                  <div key={l} className="flex-between">
                    <span style={{fontSize:14}}>{l}</span>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div style={{width:100,height:6,background:'var(--g200)',borderRadius:3,overflow:'hidden'}}>
                        <div style={{height:'100%',width:(v/Math.max(orders.length,products.length,1)*100)+'%',background:c,borderRadius:3,transition:'width .8s ease'}}/>
                      </div>
                      <span style={{fontWeight:700,minWidth:20,textAlign:'right'}}>{v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab==='orders'&&(
        <div className="anim-up">
          <div className="two-col mb-24">
            <div className="card">
              <div className="card-head"><div><div className="card-title">🛍️ Pipeline Marketplace</div><div className="card-sub">{mktOrders.length} órdenes · click para ver</div></div></div>
              <div style={{padding:'4px 16px 20px'}}>
                <StatusPipeline orders={mktOrders} type="marketplace" color="var(--o600)" onStatusClick={(k,t)=>setStatusFilter({key:k,type:t})}/>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div><div className="card-title">📦 Pipeline Casillero</div><div className="card-sub">{casilOrds.length} órdenes · click para ver</div></div></div>
              <div style={{padding:'4px 16px 20px'}}>
                <StatusPipeline orders={casilOrds} type="casillero" color="var(--blue)" onStatusClick={(k,t)=>setStatusFilter({key:k,type:t})}/>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <div className="card-title">Todas las órdenes</div>
              <div style={{display:'flex',gap:4}}>
                {[['all','Todas'],['marketplace','🛍️'],['casillero','📦']].map(([v,l])=>(
                  <button key={v} onClick={()=>setOrdersFilter(v)} style={{padding:'5px 12px',borderRadius:'var(--r-md)',border:'none',background:ordersFilter===v?'var(--o600)':'var(--g100)',color:ordersFilter===v?'white':'var(--g600)',fontWeight:600,fontSize:12,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .2s'}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{padding:'0 0 4px'}}>
              {filteredOrders.length===0&&<div style={{padding:32,textAlign:'center',color:'var(--g400)',fontSize:13}}>Sin órdenes</div>}
              {filteredOrders.map((o,i)=>{
                const st=getStatus(o.status,o.type);
                return (
                  <div key={o.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 18px',borderBottom:i<filteredOrders.length-1?'1px solid var(--g100)':'none',cursor:'pointer',transition:'background .15s',opacity:o.status==='cancelled'?.5:1}}
                    onMouseOver={e=>e.currentTarget.style.background='var(--o50)'}
                    onMouseOut={e=>e.currentTarget.style.background=''}
                    onClick={()=>setSelectedOrder(o)}>
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                        <span className="mono" style={{fontSize:12,fontWeight:700,color:o.type==='marketplace'?'var(--o600)':'var(--blue)'}}>{o.id}</span>
                        <span style={{fontSize:9,padding:'2px 6px',borderRadius:20,background:o.type==='marketplace'?'var(--o100)':'var(--blue-bg)',color:o.type==='marketplace'?'var(--o700)':'var(--blue)',fontWeight:700}}>{o.type==='marketplace'?'TIENDA':'CASILLERO'}</span>
                      </div>
                      <div style={{fontSize:13,fontWeight:500}}>{o.userName}</div>
                      <div style={{fontSize:11,color:'var(--g400)'}}>{new Date(o.createdAt).toLocaleDateString('es')}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <span className="status-chip" style={{background:st.color,color:st.text,fontSize:11}}>{st.icon} {st.label}</span>
                      <span style={{fontSize:14,fontWeight:700,color:'var(--green)'}}>{fmtUSD(o.totalUSD)}</span>
                      <span style={{fontSize:11,color:'var(--o600)',fontWeight:600}}>Ver →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MARKETPLACE USA */}
      {tab==='marketplace'&&(
        <div className="anim-up">
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Ventas totales',val:fmtUSD(totalRev),icon:'💰',bg:'#E8F5E9'},
              {label:'Órdenes Mkt',val:mktOrders.filter(o=>o.status!=='cancelled').length,icon:'🛍️',bg:'#FFF3E0'},
              {label:'Valor promedio',val:`$${avgOrderVal}`,icon:'📊',bg:'#EFF6FF'},
              {label:'Entregadas',val:deliveredMkt,icon:'✅',bg:'#F0FDF4'},
            ].map(k=>(
              <div key={k.label} className="stat-card">
                <div className="stat-icon" style={{background:k.bg}}>{k.icon}</div>
                <div className="stat-label">{k.label}</div>
                <div className="stat-val" style={{fontSize:typeof k.val==='string'&&k.val.length>7?20:30}}>{k.val}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>
            <div className="card">
              <div className="card-head"><div className="card-title">🏆 Productos más vendidos</div></div>
              <div style={{padding:'0 0 8px'}}>
                {topProducts.length===0&&<div style={{padding:24,textAlign:'center',color:'var(--g400)',fontSize:13}}>Sin ventas aún</div>}
                {topProducts.map(([name,qty],i)=>(
                  <div key={name} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 20px',borderBottom:i<topProducts.length-1?'1px solid var(--g100)':'none'}}>
                    <div style={{width:28,height:28,borderRadius:8,background:i===0?'#FFD700':i===1?'#E8E8E8':i===2?'#F4A460':'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,flexShrink:0}}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`}</div>
                    <span style={{flex:1,fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</span>
                    <span style={{fontSize:13,fontWeight:800,color:'var(--o600)',flexShrink:0}}>{qty} uds.</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">⭐ Mejores clientes</div></div>
              <div style={{padding:'0 0 8px'}}>
                {topCustomers.length===0&&<div style={{padding:24,textAlign:'center',color:'var(--g400)',fontSize:13}}>Sin clientes aún</div>}
                {topCustomers.map((c,i)=>(
                  <div key={c.name} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 20px',borderBottom:i<topCustomers.length-1?'1px solid var(--g100)':'none'}}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,var(--o700),var(--o400))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'white',flexShrink:0}}>{c.name.slice(0,2).toUpperCase()}</div>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div><div style={{fontSize:11,color:'var(--g500)'}}>{c.count} orden{c.count!==1?'es':''}</div></div>
                    <span style={{fontSize:13,fontWeight:800,color:'var(--green)',flexShrink:0}}>{fmtUSD(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div className="card">
              <div className="card-head"><div className="card-title">📦 Ventas por categoría</div></div>
              <div style={{padding:'12px 20px 16px',display:'flex',flexDirection:'column',gap:10}}>
                {(()=>{
                  const cats={};
                  mktOrders.filter(o=>o.status!=='cancelled').forEach(o=>o.items?.forEach(item=>{const p=products.find(x=>x.name===item.name);const cat=p?.category||'Otros';cats[cat]=(cats[cat]||0)+item.qty;}));
                  const total=Object.values(cats).reduce((a,b)=>a+b,0)||1;
                  const entries=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
                  return entries.length===0?<div style={{textAlign:'center',color:'var(--g400)',fontSize:13}}>Sin ventas</div>:entries.map(([cat,qty])=>(
                    <div key={cat} className="flex-between"><span style={{fontSize:13}}>{cat}</span><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:80,height:5,background:'var(--g200)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${(qty/total)*100}%`,background:'var(--o600)',borderRadius:3}}/></div><span style={{fontSize:12,fontWeight:700,minWidth:24,textAlign:'right'}}>{qty}</span></div></div>
                  ));
                })()}
              </div>
            </div>
            <div className="card">
              <div className="card-head"><div className="card-title">🔥 Más Pedidos — solicitudes</div><span className="badge badge-orange">{wishlistReqs}</span></div>
              <div style={{padding:'0 0 8px'}}>
                {(wishlist||[]).sort((a,b)=>(b.requests||0)-(a.requests||0)).slice(0,6).map((item,i)=>(
                  <div key={item.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 20px',borderBottom:i<5?'1px solid var(--g100)':'none'}}>
                    <span style={{fontSize:20,flexShrink:0}}>{item.emoji}</span>
                    <span style={{flex:1,fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.name}</span>
                    <span style={{fontSize:12,fontWeight:800,color:'var(--o600)',flexShrink:0}}>{item.requests||0} sol.</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAFF */}
      {tab==='staff'&&(
        <div className="anim-up">
          <div className="page-head" style={{marginBottom:20}}>
            <div><div style={{fontSize:18,fontWeight:700}}>Equipo de trabajo</div><div style={{fontSize:13,color:'var(--g500)',marginTop:2}}>{workerUsers.length} trabajador{workerUsers.length!==1?'es':''} activo{workerUsers.length!==1?'s':''}</div></div>
            <button className="btn btn-primary" onClick={()=>setShowCreateWorker(true)}>👷 Crear trabajador</button>
          </div>
          <div style={{background:'var(--o50)',border:'1px solid var(--o200)',borderRadius:12,padding:'12px 18px',marginBottom:20,fontSize:13,color:'var(--o800)'}}>
            <strong style={{marginRight:8}}>Permisos de trabajador:</strong>
            {[{l:'Gestionar órdenes',on:true},{l:'Agregar/editar productos',on:true},{l:'Analytics',on:false},{l:'Datos financieros',on:false},{l:'Crear/eliminar usuarios',on:false}].map(p=>(
              <span key={p.l} style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:p.on?'#DCFCE7':'#FEF2F2',color:p.on?'#15803D':'#DC2626',border:`1px solid ${p.on?'#86EFAC':'#FCA5A5'}`,marginRight:4}}>
                <span style={{fontSize:10,fontWeight:900}}>{p.on?'✓':'✕'}</span>{p.l}
              </span>
            ))}
          </div>
          {workerUsers.length===0 ? (
            <div style={{textAlign:'center',padding:'60px 0',color:'var(--g400)'}}>
              <div style={{fontSize:48,marginBottom:12}}>👷</div>
              <div style={{fontWeight:600,marginBottom:4}}>No hay trabajadores aún</div>
              <button className="btn btn-primary" style={{marginTop:12}} onClick={()=>setShowCreateWorker(true)}>Crear el primero</button>
            </div>
          ) : (
            <div className="card">
              <div style={{padding:'0 0 4px'}}>
                {workerUsers.map((w,i)=>(
                  <div key={w.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderBottom:i<workerUsers.length-1?'1px solid var(--g100)':'none'}}>
                    <div style={{width:42,height:42,borderRadius:'50%',background:w.avatarImg?'none':'linear-gradient(135deg,#1565C0,#42A5F5)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'white',flexShrink:0,overflow:'hidden'}}>
                      {w.avatarImg?<img src={w.avatarImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:w.avatar}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700}}>{w.name}</div>
                      <div style={{fontSize:12,color:'var(--g500)'}}>{w.email}</div>
                      <div style={{fontSize:11,color:'var(--g400)',marginTop:2}}>Desde {new Date(w.createdAt).toLocaleDateString('es')} · {orders.filter(o=>o.userId===w.id).length} acciones</div>
                      {w.permissions&&<div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:6}}>{Object.entries(w.permissions).filter(([,v])=>v).map(([k])=>{const p=PERMS_DEF.find(x=>x.key===k);return p?<span key={k} style={{fontSize:10,background:'var(--o50)',color:'var(--o700)',border:'1px solid var(--o200)',borderRadius:4,padding:'1px 6px',fontWeight:600}}>{p.icon} {p.label}</span>:null;})}</div>}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <span className="badge badge-purple">Staff</span>
                      {workerConfirmDelete===w.id ? (
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn" style={{background:'#DC2626',color:'white',fontSize:11,padding:'4px 10px'}} onClick={()=>{deleteWorker(w.id);setWorkerConfirmDelete(null);}}>Eliminar</button>
                          <button className="btn btn-ghost" style={{fontSize:11,padding:'4px 10px'}} onClick={()=>setWorkerConfirmDelete(null)}>No</button>
                        </div>
                      ) : (
                        <button className="btn" style={{background:'#FEF2F2',color:'#DC2626',border:'1px solid #FCA5A5',fontSize:11,padding:'4px 10px'}} onClick={()=>setWorkerConfirmDelete(w.id)}>🗑️ Eliminar</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* USERS */}
      {tab==='users'&&(
        <div className="anim-up">
          <div className="page-head" style={{marginBottom:20}}>
            <div><div style={{fontSize:18,fontWeight:700}}>Usuarios registrados</div><div style={{fontSize:13,color:'var(--g500)',marginTop:2}}>{realUsers.length} cliente{realUsers.length!==1?'s':''}</div></div>
          </div>
          {realUsers.length===0?(
            <div style={{textAlign:'center',padding:'60px 0',color:'var(--g400)'}}>
              <div style={{fontSize:48,marginBottom:12}}>👤</div>
              <div style={{fontWeight:600}}>Ningún usuario aún</div>
            </div>
          ):(
            <div className="card">
              {realUsers.map((u,i)=>{
                const userOrds=orders.filter(o=>o.userId===u.id).length;
                return(
                  <div key={u.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 20px',borderBottom:i<realUsers.length-1?'1px solid var(--g100)':'none',opacity:u.disabled?0.55:1,transition:'opacity .2s'}}>
                    {/* Avatar */}
                    <div style={{width:42,height:42,borderRadius:'50%',background:u.avatarImg?'none':'linear-gradient(135deg,var(--o700),var(--o500))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'white',flexShrink:0,overflow:'hidden',position:'relative'}}>
                      {u.avatarImg?<img src={u.avatarImg} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:u.avatar}
                      {u.disabled&&<div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🚫</div>}
                    </div>
                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{fontSize:14,fontWeight:700}}>{u.name}</div>
                        {u.disabled&&<span style={{fontSize:10,background:'#FEF2F2',color:'#DC2626',border:'1px solid #FCA5A5',borderRadius:4,padding:'1px 6px',fontWeight:700}}>DESACTIVADO</span>}
                      </div>
                      <div style={{fontSize:12,color:'var(--g500)'}}>{u.email}</div>
                      <div style={{fontSize:11,color:'var(--g400)',marginTop:2}}>
                        {u.country||'—'} · {u.phone||'—'} · Suite <span style={{fontWeight:600,color:'var(--o600)'}}>#{u.suite}</span> · {userOrds} orden{userOrds!==1?'es':''}
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <button className="btn" style={{fontSize:11,padding:'5px 12px',background:'var(--g50)',color:'var(--g700)',border:'1px solid var(--g200)'}}
                        onClick={()=>setSelectedUser(u)}>
                        👁 Ver detalles
                      </button>
                      <button className="btn" style={{fontSize:11,padding:'5px 12px',background:u.disabled?'#F0FDF4':'#FFF7ED',color:u.disabled?'#15803D':'#B45309',border:u.disabled?'1px solid #BBF7D0':'1px solid #FDE68A'}}
                        onClick={()=>updateUserAccess(u.id,{disabled:!u.disabled})}>
                        {u.disabled?'✅ Activar':'🚫 Desactivar'}
                      </button>
                      {userConfirmDelete===u.id?(
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn" style={{background:'#DC2626',color:'white',fontSize:11,padding:'5px 10px'}} onClick={()=>{deleteUser(u.id);setUserConfirmDelete(null);}}>Eliminar</button>
                          <button className="btn btn-ghost" style={{fontSize:11,padding:'5px 10px'}} onClick={()=>setUserConfirmDelete(null)}>No</button>
                        </div>
                      ):(
                        <button className="btn" style={{background:'#FEF2F2',color:'#DC2626',border:'1px solid #FCA5A5',fontSize:11,padding:'5px 12px'}}
                          onClick={()=>setUserConfirmDelete(u.id)}>
                          🗑️ Eliminar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS */}
      {tab==='products'&&(
        <div className="card anim-up">
          <div className="card-head"><div className="card-title">Todos los productos</div><span className="badge badge-orange">{products.length} total</span></div>
          <div style={{padding:'0 0 4px'}}>
            <table className="tbl">
              <thead><tr><th>Producto</th><th>Precio</th><th>Estado</th><th>Stock</th><th>Vendidos</th></tr></thead>
              <tbody>
                {products.map(p=>{
                  const stock=p.sizes?Object.values(p.sizes).reduce((a,b)=>a+b,0):0;
                  const sold=mktOrders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+(o.items?.find(x=>x.name===p.name)?.qty||0),0);
                  return(
                    <tr key={p.id}>
                      <td><div className="flex-center gap-8"><div style={{width:36,height:36,borderRadius:8,background:p.bgLight||'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0}}>{p.images?.length>0?<img src={p.images[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:18}}>{p.emoji}</span>}</div><span style={{fontSize:13,fontWeight:600}}>{p.name}</span></div></td>
                      <td style={{fontWeight:700,color:'var(--o600)'}}>{fmtUSD(p.priceUSD)}</td>
                      <td>{p.status==='draft'?<span className="badge badge-gray">Borrador</span>:stock===0?<span className="badge badge-red">Agotado</span>:<span className="badge badge-green">Publicado</span>}</td>
                      <td>{stock}</td><td>{sold} uds.</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedOrder&&<OrderTrackingMap order={selectedOrder} onClose={()=>setSelectedOrder(null)} onCancel={cancelOrder} onDelete={deleteOrder}/>}
      {statusFilter&&<StatusOrdersModal orders={orders} statusKey={statusFilter.key} type={statusFilter.type} onSelectOrder={setSelectedOrder} onClose={()=>setStatusFilter(null)}/>}
      {showCreateWorker&&<CreateWorkerModal onClose={()=>setShowCreateWorker(false)} onSave={createWorker}/>}
      {selectedUser&&<UserDetailModal user={selectedUser} onClose={()=>setSelectedUser(null)} onToggleAccess={(id,disabled)=>updateUserAccess(id,{disabled})} onDelete={(id)=>{deleteUser(id);setSelectedUser(null);}}/>}
    </div>
  );
}
