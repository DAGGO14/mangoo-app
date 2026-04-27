import React, { useState, useRef } from 'react';
import { useApp, fmtUSD, getStatus, getStatuses } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { orders, updateOrderStatus, addNoteToOrder, toast } = useApp();
  const { isAdmin, isWorker } = useAuth();
  const [filter, setFilter] = useState('all');
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState('');
  const fileRef = useRef();

  const filtered = filter==='all' ? orders : orders.filter(o=>o.type===filter);
  const selOrder = orders.find(o=>o.id===sel);
  const statusOptions = selOrder ? getStatuses(selOrder.type) : [];

  const handlePhoto=(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{setPhotoPreview(ev.target.result);setPhotoBase64(ev.target.result);};
    reader.readAsDataURL(file);
  };

  const handleUpdate=()=>{
    if(!sel){return;}
    if(newStatus||note||photoBase64){
      if(newStatus) updateOrderStatus(sel,newStatus,note,photoBase64);
      else if(note||photoBase64) addNoteToOrder(sel,note,photoBase64);
    } else { toast('Ingresa estado, nota o foto','warn'); return; }
    setNote('');setNewStatus('');setPhotoPreview(null);setPhotoBase64('');
  };

  return (
    <div className="anim-up">
      <div className="page-head">
        <div><div className="page-title">Gestión de Órdenes</div><div className="page-sub">Actualiza estados, notas y fotos del pedido</div></div>
      </div>
      <div style={{display:'flex',gap:4,background:'var(--white)',padding:4,borderRadius:'var(--r-lg)',marginBottom:24,width:'fit-content',boxShadow:'var(--shadow-xs)'}}>
        {[['all','Todas'],['marketplace','🛍️ Marketplace'],['casillero','📦 Casillero']].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{padding:'8px 18px',borderRadius:'var(--r-md)',border:'none',background:filter===v?'var(--o600)':'transparent',color:filter===v?'white':'var(--g600)',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .2s'}}>{l}</button>
        ))}
      </div>
      <div className="two-col">
        <div className="card">
          <div className="card-body" style={{padding:0}}>
            {filtered.length===0&&<div style={{padding:40,textAlign:'center',color:'var(--g400)'}}><div style={{fontSize:40,marginBottom:12}}>📋</div><div>Sin órdenes</div></div>}
            {filtered.map((o,i)=>{
              const st=getStatus(o.status,o.type);
              return(
                <div key={o.id} onClick={()=>{setSel(o.id);setNewStatus('');}}
                  style={{padding:'14px 18px',borderBottom:i<filtered.length-1?'1px solid var(--g100)':'none',cursor:'pointer',background:sel===o.id?'var(--o50)':'transparent',borderLeft:`3px solid ${sel===o.id?'var(--o600)':'transparent'}`,transition:'all .15s'}}>
                  <div className="flex-between mb-4">
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span className="mono" style={{fontSize:12,fontWeight:700,color:o.type==='marketplace'?'var(--o600)':'var(--blue)'}}>{o.id}</span>
                      <span style={{fontSize:9,padding:'2px 7px',borderRadius:'var(--r-full)',background:o.type==='marketplace'?'var(--o100)':'var(--blue-bg)',color:o.type==='marketplace'?'var(--o700)':'var(--blue)',fontWeight:700}}>{o.type==='marketplace'?'TIENDA':'CASILLERO'}</span>
                    </div>
                    <span className="status-chip" style={{background:st.color,color:st.text,fontSize:10}}>{st.icon} {st.label}</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{o.userName}</div>
                  <div style={{fontSize:12,color:'var(--g500)',marginBottom:4}}>{o.items?.map(x=>x.name).join(', ').slice(0,50)}</div>
                  <div className="flex-between">
                    <span style={{fontSize:12,color:'var(--g400)'}}>{new Date(o.createdAt).toLocaleDateString('es')}</span>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--green)'}}>{fmtUSD(o.totalUSD)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selOrder ? (
          <div>
            <div className="card mb-16">
              <div className="card-body">
                <div className="flex-between mb-16">
                  <div>
                    <div className="mono" style={{fontSize:12,color:'var(--g500)'}}>{selOrder.id}</div>
                    <div style={{fontSize:18,fontWeight:800,marginTop:2}}>{selOrder.userName}</div>
                    <div style={{fontSize:13,color:'var(--g500)'}}>{selOrder.userEmail} · {selOrder.userPhone}</div>
                  </div>
                  {(()=>{const st=getStatus(selOrder.status,selOrder.type);return <span className="status-chip" style={{background:st.color,color:st.text}}>{st.icon} {st.label}</span>;})()}
                </div>
                <div style={{background:'var(--g50)',borderRadius:'var(--r-md)',padding:'12px 14px',marginBottom:14}}>
                  {selOrder.items?.map((item,i)=>(
                    <div key={i} className="flex-between" style={{padding:'6px 0',fontSize:13,borderBottom:i<selOrder.items.length-1?'1px solid var(--g200)':'none'}}>
                      <div className="flex-center gap-8">
                        <div style={{width:36,height:36,borderRadius:8,overflow:'hidden',background:'var(--g100)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                          {item.image?<img src={item.image} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:18}}>{item.emoji||'📦'}</span>}
                        </div>
                        <span style={{fontWeight:500}}>{item.name}{item.size?` (${item.size})`:''} × {item.qty}</span>
                      </div>
                      <span style={{fontWeight:700}}>{fmtUSD(item.priceUSD*item.qty)}</span>
                    </div>
                  ))}
                  <div className="flex-between" style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--g200)',fontWeight:800,fontSize:15}}>
                    <span>Total</span><span style={{color:'var(--green)'}}>{fmtUSD(selOrder.totalUSD)}</span>
                  </div>
                </div>
                {selOrder.photos?.length>0&&(
                  <div className="mb-12">
                    <div style={{fontSize:12,fontWeight:700,color:'var(--g700)',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Fotos del pedido</div>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                      {selOrder.photos.map((ph,i)=><img key={i} src={ph} alt="" style={{width:80,height:80,borderRadius:10,objectFit:'cover',border:'1px solid var(--g200)',cursor:'pointer'}} onClick={()=>window.open(ph,'_blank')}/>)}
                    </div>
                  </div>
                )}
                {selOrder.notes?.length>0&&(
                  <div className="mb-12">
                    <div style={{fontSize:12,fontWeight:700,color:'var(--g700)',marginBottom:8,textTransform:'uppercase',letterSpacing:.5}}>Notas</div>
                    {selOrder.notes.map((n,i)=>(
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
                <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Actualizar orden</div>
                <div className="form-group mb-12">
                  <div className="form-label">Nuevo estado</div>
                  <select className="form-input" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
                    <option value="">— Solo agregar nota/foto —</option>
                    {statusOptions.map(s=><option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
                  </select>
                </div>
                <div className="form-group mb-12">
                  <div className="form-label">Nota para el cliente</div>
                  <textarea className="form-input" rows={3} placeholder="Ej: Tu pedido fue empacado y está listo para despacho..." value={note} onChange={e=>setNote(e.target.value)} style={{resize:'vertical'}}/>
                </div>
                <div className="form-group mb-16">
                  <div className="form-label">Foto del pedido</div>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhoto}/>
                  {photoPreview?(
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <img src={photoPreview} alt="" style={{width:80,height:80,borderRadius:10,objectFit:'cover',border:'1px solid var(--g200)'}}/>
                      <button className="btn btn-ghost btn-sm" onClick={()=>{setPhotoPreview(null);setPhotoBase64('');}}>Eliminar</button>
                    </div>
                  ):(
                    <button className="btn btn-ghost" onClick={()=>fileRef.current?.click()}>📷 Subir foto</button>
                  )}
                </div>
                <button className="btn btn-primary" style={{width:'100%'}} onClick={handleUpdate}>Guardar actualización</button>
              </div>
            </div>
          </div>
        ):(
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'80px 0',color:'var(--g400)',flexDirection:'column',gap:12}}>
            <div style={{fontSize:48}}>📋</div><div style={{fontWeight:600}}>Selecciona una orden</div>
          </div>
        )}
      </div>
    </div>
  );
}
