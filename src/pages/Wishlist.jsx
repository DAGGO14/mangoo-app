import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Todas','Ropa','Calzado','Electrónica','Belleza','Hogar','Deportes','Otros'];

function AdminModal({ item, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(item || {
    name:'', category:'Ropa', emoji:'📦', url:'', notes:'', requests:0, estimatedPrice:'', images:[]
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const isNew = !item;
  const imgRef = React.useRef();

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, images: [...(f.images||[]), ev.target.result] }));
      reader.readAsDataURL(file);
    });
  };
  const removeImg = (idx) => set('images', (form.images||[]).filter((_,i)=>i!==idx));
  const imgs = form.images || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:520,width:'94vw',maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title">{isNew ? '➕ Nuevo producto' : '✏️ Editar producto'}</div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{padding:'0 24px 24px',display:'flex',flexDirection:'column',gap:14}}>

          {/* IMAGE UPLOAD — same as Admin */}
          <div className="form-group">
            <div className="form-label">Fotos del producto</div>
            <input ref={imgRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleImages}/>
            {imgs.length > 0 ? (
              <div>
                <div style={{fontSize:11,color:'var(--g500)',marginBottom:6}}>✋ Arrastrá para cambiar el orden · La primera es la foto principal</div>
                <div className="img-gallery mb-8">
                  {imgs.map((imgSrc,i)=>(
                    <div className="img-thumb" key={i} draggable
                      onDragStart={e=>e.dataTransfer.setData('text/plain',String(i))}
                      onDragOver={e=>e.preventDefault()}
                      onDrop={e=>{
                        e.preventDefault();
                        const from=parseInt(e.dataTransfer.getData('text/plain'));
                        if(from===i) return;
                        const arr=[...imgs];
                        const [moved]=arr.splice(from,1);
                        arr.splice(i,0,moved);
                        set('images',arr);
                      }}
                      style={{cursor:'grab',position:'relative'}}>
                      <img src={imgSrc} alt=""/>
                      {i===0&&<div style={{position:'absolute',top:4,left:4,background:'var(--o600)',color:'white',fontSize:9,fontWeight:800,padding:'2px 5px',borderRadius:4}}>PRINCIPAL</div>}
                      <button className="img-thumb-del" onClick={()=>removeImg(i)}>×</button>
                    </div>
                  ))}
                  <div className="img-thumb" style={{border:'2px dashed var(--g300)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',background:'var(--g50)'}} onClick={()=>imgRef.current?.click()}>
                    <span style={{fontSize:24,color:'var(--g400)'}}>+</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="upload-zone" onClick={()=>imgRef.current?.click()}>
                <div className="upload-zone-icon">📸</div>
                <div className="upload-zone-text">Arrastrá fotos o hacé clic</div>
                <div className="upload-zone-sub">JPG, PNG · Múltiples fotos · Arrastrá para reordenar</div>
              </div>
            )}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <div className="form-label">Nombre *</div>
              <input className="form-input" placeholder="Ej: Stanley Quencher" value={form.name} onChange={e=>set('name',e.target.value)}/>
            </div>
            <div className="form-group">
              <div className="form-label">Categoría</div>
              <select className="form-input" value={form.category} onChange={e=>set('category',e.target.value)}>
                {['Ropa','Calzado','Electrónica','Belleza','Hogar','Deportes','Otros'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <div className="form-label">Precio estimado USD</div>
              <input className="form-input" placeholder="$0 – $0" value={form.estimatedPrice||''} onChange={e=>set('estimatedPrice',e.target.value)}/>
            </div>
            <div className="form-group">
              <div className="form-label">Solicitudes</div>
              <input className="form-input" type="number" min="0" value={form.requests} onChange={e=>set('requests',parseInt(e.target.value)||0)}/>
            </div>
          </div>
          <div className="form-group">
            <div className="form-label">URL tienda USA</div>
            <input className="form-input" placeholder="https://amazon.com/..." value={form.url} onChange={e=>set('url',e.target.value)}/>
          </div>
          <div className="form-group">
            <div className="form-label">Notas (talla, color, especificaciones)</div>
            <textarea className="form-input" rows={2} style={{resize:'vertical'}} placeholder="Ej: Talla S y M, color negro más pedido" value={form.notes} onChange={e=>set('notes',e.target.value)}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <button className="btn btn-primary" style={{flex:1}} onClick={()=>{ if(!form.name) return; onSave(form); onClose(); }}>
              {isNew ? '✅ Agregar' : '✅ Guardar'}
            </button>
            {!isNew && (
              <button className="btn" style={{background:'var(--red)',color:'white'}} onClick={()=>{ onDelete(item.id); onClose(); }}>🗑️</button>
            )}
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Request modal — user fills their info to actually request the import
function RequestModal({ item, me, onClose, onSubmit }) {
  const [notes, setNotes] = useState('');
  const [qty, setQty] = useState(1);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{maxWidth:440,width:'94vw'}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">📦 Solicitar importación</div>
            <div style={{fontSize:12,color:'var(--g500)',marginTop:2}}>{item.emoji} {item.name}</div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div style={{padding:'0 24px 24px',display:'flex',flexDirection:'column',gap:14}}>
          {item.estimatedPrice && (
            <div style={{background:'var(--o50)',border:'1px solid var(--o200)',borderRadius:10,padding:'10px 14px',fontSize:13}}>
              <span style={{color:'var(--o700)',fontWeight:700}}>Precio estimado:</span> <span style={{color:'var(--o800)',fontWeight:800}}>{item.estimatedPrice} USD</span>
              <div style={{fontSize:11,color:'var(--g500)',marginTop:2}}>+ flete Miami → Colombia. MANGOO te cotiza el total.</div>
            </div>
          )}
          {item.images&&item.images.length>0&&(
            <div style={{width:'100%',height:140,borderRadius:10,overflow:'hidden',marginBottom:4}}>
              <img src={item.images[0]} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
          )}
          {item.url && (
            <div style={{display:'flex',alignItems:'center',gap:10,background:'var(--g50)',borderRadius:10,padding:'10px 14px'}}>
              <span style={{fontSize:20}}>{item.emoji||'📦'}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:'var(--g700)',marginBottom:2}}>Ver en tienda USA</div>
                <a href={item.url} target="_blank" rel="noreferrer" style={{fontSize:11,color:'var(--o600)',textDecoration:'none',wordBreak:'break-all'}}>{item.url.slice(0,50)}...</a>
              </div>
            </div>
          )}
          <div className="form-group">
            <div className="form-label">Cantidad</div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:36,height:36,borderRadius:8,border:'1.5px solid var(--g300)',background:'var(--white)',cursor:'pointer',fontSize:18,color:'var(--g700)'}}>−</button>
              <span style={{fontWeight:800,fontSize:18,minWidth:30,textAlign:'center'}}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={{width:36,height:36,borderRadius:8,border:'1.5px solid var(--g300)',background:'var(--white)',cursor:'pointer',fontSize:18,color:'var(--g700)'}}>+</button>
            </div>
          </div>
          <div className="form-group">
            <div className="form-label">Especificaciones (talla, color, modelo)</div>
            <textarea className="form-input" rows={2} style={{resize:'vertical'}} placeholder={item.notes || 'Ej: Talla M, color negro...'} value={notes} onChange={e=>setNotes(e.target.value)}/>
          </div>
          <div style={{background:'var(--g50)',borderRadius:10,padding:'10px 14px',fontSize:12,color:'var(--g600)'}}>
            📱 <strong>¿Qué pasa después?</strong> MANGOO te contacta al WhatsApp <strong>{me?.phone||'registrado'}</strong> con la cotización final (producto + flete + servicio) antes de confirmar.
          </div>
          <button className="btn btn-primary btn-lg" style={{width:'100%'}} onClick={()=>onSubmit({qty,notes})}>
            🚀 Solicitar cotización gratis
          </button>
          <button className="btn btn-ghost" style={{width:'100%'}} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { wishlist, addWishlistItem, updateWishlistItem, deleteWishlistItem, requestWishlistItem, toast } = useApp();
  const { isAdmin, me } = useAuth();
  const [cat, setCat] = useState('Todas');
  const [search, setSearch] = useState('');
  const [adminModal, setAdminModal] = useState(null);
  const [requestModal, setRequestModal] = useState(null);
  const [requested, setRequested] = useState({});

  const filtered = wishlist
    .filter(x => cat==='Todas' || x.category===cat)
    .filter(x => !search || x.name.toLowerCase().includes(search.toLowerCase()) || (x.notes||'').toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => (b.requests||0) - (a.requests||0));

  const handleRequest = (form) => {
    if (!requestModal) return;
    const item = requestModal;
    setRequested(r=>({...r,[item.id]:true}));
    requestWishlistItem(item.id);
    toast(`✅ Solicitud enviada para ${item.name} — MANGOO te contacta al ${me?.phone||'WhatsApp'}`, 'success');
    setRequestModal(null);
  };

  return (
    <div className="anim-up">
      <div className="page-head" style={{marginBottom:20}}>
        <div>
          <div className="page-title">Más Pedidos 🔥</div>
          <div className="page-sub">Productos más solicitados para importar desde USA — pedí cotización gratis</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={()=>setAdminModal('new')}>➕ Agregar producto</button>
        )}
      </div>

      {/* How it works banner */}
      <div style={{background:'linear-gradient(135deg,var(--g900),var(--g800))',borderRadius:16,padding:'18px 24px',marginBottom:20,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:0,color:'white'}}>
        {[['1️⃣','Elegís el producto','De los más pedidos o pedís uno nuevo'],['2️⃣','MANGOO lo cotiza','Te escribimos al WhatsApp con el precio final'],['3️⃣','Confirmás y listo','Compramos, importamos y te lo entregamos']].map(([n,t,d],i)=>(
          <div key={i} style={{textAlign:'center',padding:'0 16px',borderRight:i<2?'1px solid rgba(255,255,255,.1)':'none'}}>
            <div style={{fontSize:24,marginBottom:6}}>{n}</div>
            <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{t}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,.6)',lineHeight:1.4}}>{d}</div>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div style={{display:'flex',gap:10,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
        <div style={{position:'relative',flex:'1',minWidth:200}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'var(--g400)'}}>🔍</span>
          <input className="form-input" style={{paddingLeft:36,width:'100%'}} placeholder="Buscar producto..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCat(c)} style={{padding:'7px 14px',borderRadius:'var(--r-full)',border:'none',background:cat===c?'var(--g900)':'var(--white)',color:cat===c?'white':'var(--g600)',fontSize:12,fontWeight:cat===c?700:500,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .2s',boxShadow:'var(--shadow-xs)'}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length===0 && (
        <div style={{textAlign:'center',padding:'60px 0',color:'var(--g400)'}}>
          <div style={{fontSize:48,marginBottom:12}}>🛍️</div>
          <div style={{fontWeight:600,marginBottom:4}}>No hay productos en esta categoría</div>
          {isAdmin && <button className="btn btn-primary" style={{marginTop:12}} onClick={()=>setAdminModal('new')}>Agregar el primero</button>}
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:16}}>
        {filtered.map((item, idx) => {
          const hasReq = requested[item.id];
          const isHot = (item.requests||0) >= 10;
          const isTrending = (item.requests||0) >= 5;
          return (
            <div key={item.id} style={{background:'var(--white)',borderRadius:16,border:'1px solid var(--g200)',overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,.05)',transition:'transform .2s,box-shadow .2s',display:'flex',flexDirection:'column'}}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,.1)';}}
              onMouseOut={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,.05)';}}>
              {/* Header — show image if available, else emoji */}
              <div style={{background:'linear-gradient(135deg,var(--g100),var(--g50))',height:160,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'}}>
                {item.images&&item.images.length>0
                  ? <img src={item.images[0]} alt={item.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  : <span style={{fontSize:68}}>{item.emoji||'📦'}</span>
                }
                {idx<3&&<div style={{position:'absolute',top:10,left:10,background:idx===0?'#FFD700':idx===1?'#C0C0C0':'#CD7F32',color:idx===0?'#7A6000':'white',fontSize:11,fontWeight:800,padding:'3px 8px',borderRadius:20}}>{idx===0?'🥇':idx===1?'🥈':'🥉'} #{idx+1}</div>}
                {isHot&&<div style={{position:'absolute',top:10,right:10,background:'#EF4444',color:'white',fontSize:10,fontWeight:800,padding:'3px 8px',borderRadius:20}}>🔥 HOT</div>}
                {!isHot&&isTrending&&<div style={{position:'absolute',top:10,right:10,background:'var(--o600)',color:'white',fontSize:10,fontWeight:800,padding:'3px 8px',borderRadius:20}}>📈 Popular</div>}
              </div>
              <div style={{padding:'16px 16px 8px',flex:1,display:'flex',flexDirection:'column',gap:8}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:'var(--g900)',marginBottom:3,lineHeight:1.3}}>{item.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                    <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'var(--g100)',color:'var(--g600)',fontWeight:600}}>{item.category}</span>
                    {item.estimatedPrice&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'var(--o50)',color:'var(--o700)',fontWeight:700}}>~{item.estimatedPrice} USD</span>}
                  </div>
                </div>
                {item.notes&&<div style={{fontSize:12,color:'var(--g500)',lineHeight:1.4}}>{item.notes}</div>}
                <div style={{display:'flex',alignItems:'center',gap:6,marginTop:'auto',paddingTop:4}}>
                  <div style={{display:'flex',alignItems:'center',gap:5,background:'var(--o50)',borderRadius:20,padding:'4px 10px',flex:1}}>
                    <span style={{fontSize:13}}>🙋</span>
                    <span style={{fontSize:12,fontWeight:700,color:'var(--o700)'}}>{item.requests||0} solicitudes</span>
                  </div>
                  {item.url&&<a href={item.url} target="_blank" rel="noreferrer" style={{width:32,height:32,borderRadius:8,background:'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,textDecoration:'none',flexShrink:0}} title="Ver en tienda USA">🔗</a>}
                </div>
              </div>
              <div style={{padding:'0 16px 16px',display:'flex',gap:8}}>
                {!isAdmin ? (
                  <button className="btn" style={{flex:1,background:hasReq?'var(--g100)':'var(--o600)',color:hasReq?'var(--g500)':'white',fontSize:13,fontWeight:700,cursor:hasReq?'default':'pointer',transition:'all .2s'}}
                    onClick={()=>!hasReq&&setRequestModal(item)} disabled={hasReq}>
                    {hasReq ? '✅ Solicitud enviada' : '🚀 Pedir cotización'}
                  </button>
                ) : (
                  <button className="btn btn-ghost" style={{flex:1,fontSize:12}} onClick={()=>setAdminModal(item)}>✏️ Editar</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {adminModal && (
        <AdminModal item={adminModal==='new'?null:adminModal} onClose={()=>setAdminModal(null)}
          onSave={(form)=>{ if(adminModal==='new') addWishlistItem(form); else updateWishlistItem(adminModal.id,form); }}
          onDelete={deleteWishlistItem}/>
      )}
      {requestModal && (
        <RequestModal item={requestModal} me={me} onClose={()=>setRequestModal(null)} onSubmit={handleRequest}/>
      )}
    </div>
  );
}
