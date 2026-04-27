import React, { useState, useRef } from 'react';
import { useApp, fmtCOP, fmtUSD, CATEGORY_MAP, CLOTHING_SIZES, SHOE_SIZES_US, GENERIC_SIZES, GENDERS } from '../context/AppContext';

const EMOJIS = ['👕','👗','👟','💻','📱','🎮','⌚','🧥','👖','💄','🎧','👒','🏠','⚽','🧴'];

export default function Admin() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name:'', brand:'', priceUSD:'', origUSD:'', category:'Ropa', subcategory:'Hoodies', sizeType:'clothing', images:[], emoji:'👕', bgLight:'#F5F0EB', stock:'', desc:'', featured:false, sizes:{} });
  const imgRef = useRef();
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const subcats = CATEGORY_MAP[form.category] || ['General'];
  const getSizeOptions = () => {
    if (form.sizeType === 'clothing') return CLOTHING_SIZES;
    if (form.sizeType === 'shoes') return SHOE_SIZES_US;
    return GENERIC_SIZES;
  };

  const setSizeStock = (sz, val) => {
    const v = parseInt(val);
    set('sizes', { ...form.sizes, [sz]: isNaN(v) ? 0 : Math.max(0, v) });
  };

  const openNew = () => {
    const initialSizes = {};
    CLOTHING_SIZES.forEach(s => initialSizes[s] = 0);
    setForm({ name:'', brand:'', priceUSD:'', origUSD:'', category:'Ropa', subcategory:'Hoodies', sizeType:'clothing', images:[], emoji:'👕', bgLight:'#F5F0EB', stock:'', desc:'', featured:false, sizes:initialSizes });
    setEditId(null); setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({ ...p, priceUSD:String(p.priceUSD), origUSD:String(p.origUSD||''), sizes:p.sizes||{} });
    setEditId(p.id); setShowForm(true);
  };

  const handleCategoryChange = (cat) => {
    const firstSub = CATEGORY_MAP[cat]?.[0] || 'General';
    const sizeType = cat === 'Calzado' ? 'shoes' : (cat === 'Ropa' || cat === 'Deportes') ? 'clothing' : 'generic';
    const sizesArr = sizeType === 'clothing' ? CLOTHING_SIZES : sizeType === 'shoes' ? SHOE_SIZES_US : GENERIC_SIZES;
    const initialSizes = {};
    sizesArr.forEach(s => initialSizes[s] = 0);
    setForm(f => ({ ...f, category: cat, subcategory: firstSub, sizeType, sizes: initialSizes }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setForm(f => ({ ...f, images: [...f.images, ev.target.result] }));
      reader.readAsDataURL(file);
    });
  };

  const removeImg = (idx) => set('images', form.images.filter((_,i)=>i!==idx));

  const handleSave = () => {
    if (!form.name || !form.priceUSD) return;
    const data = { ...form, priceUSD: parseFloat(form.priceUSD), origUSD: parseFloat(form.origUSD)||parseFloat(form.priceUSD)*1.3, bg:'#1C1917', bgLight: form.bgLight||'#F5F0EB' };
    if (editId) updateProduct(editId, data);
    else addProduct(data);
    setShowForm(false); setEditId(null);
  };

  const totalStock = (p) => p.sizes ? Object.values(p.sizes).reduce((a,b)=>a+b,0) : 0;

  return (
    <div className="anim-up">
      <div className="page-head">
        <div><div className="page-title">Panel Vendedor</div><div className="page-sub">Gestiona productos e inventario</div></div>
        <button className="btn btn-primary" onClick={openNew}>+ Nuevo producto</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[['Productos activos', products.filter(p=>totalStock(p)>0).length, '🛍️', 'var(--o100)'],
          ['Agotados', products.filter(p=>totalStock(p)===0).length, '⚠️', 'var(--red-bg)'],
          ['Total unidades', products.reduce((s,p)=>s+totalStock(p),0), '📦', 'var(--green-bg)']].map(([l,v,ic,bg])=>(
          <div className="stat-card" key={l}>
            <div className="stat-icon" style={{background:bg}}>{ic}</div>
            <div className="stat-label">{l}</div>
            <div className="stat-val" style={{fontSize:26}}>{v}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="card mb-24 anim-up">
          <div className="card-head">
            <div><div className="card-title">{editId ? '✏️ Editar' : '🚀 Nuevo producto'}</div></div>
            <button className="btn btn-ghost btn-sm" onClick={()=>setShowForm(false)}>✕</button>
          </div>
          <div style={{padding:'0 24px 24px',marginTop:16}}>
            {/* Images */}
            <div className="form-group mb-16">
              <div className="form-label">Fotos del producto</div>
              <input ref={imgRef} type="file" accept="image/*" multiple style={{display:'none'}} onChange={handleImages}/>
              {form.images.length > 0 ? (
                <div>
                  <div style={{fontSize:11,color:'var(--g500)',marginBottom:6}}>✋ Arrastrá para cambiar el orden · La primera es la foto principal</div>
                  <div className="img-gallery mb-8">
                    {form.images.map((imgSrc,i)=>(
                      <div className="img-thumb" key={i} draggable
                        onDragStart={e=>e.dataTransfer.setData('text/plain',i)}
                        onDragOver={e=>e.preventDefault()}
                        onDrop={e=>{
                          e.preventDefault();
                          const from=parseInt(e.dataTransfer.getData('text/plain'));
                          if(from===i) return;
                          const imgs=[...form.images];
                          const [moved]=imgs.splice(from,1);
                          imgs.splice(i,0,moved);
                          set('images',imgs);
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

            {/* Basic info */}
            <div className="grid-2 mb-12">
              <div className="form-group"><div className="form-label">Nombre *</div><input className="form-input" placeholder="Nike Air Force 1" value={form.name} onChange={e=>set('name',e.target.value)}/></div>
              <div className="form-group"><div className="form-label">Marca</div><input className="form-input" placeholder="Nike USA" value={form.brand} onChange={e=>set('brand',e.target.value)}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:12}}>
              <div className="form-group"><div className="form-label">Precio USD *</div><input className="form-input" type="number" placeholder="89" value={form.priceUSD} onChange={e=>set('priceUSD',e.target.value)}/></div>
              <div className="form-group"><div className="form-label">Precio orig. USD</div><input className="form-input" type="number" placeholder="115" value={form.origUSD} onChange={e=>set('origUSD',e.target.value)}/></div>
              <div className="form-group"><div className="form-label">Categoría</div>
                <select className="form-input" value={form.category} onChange={e=>handleCategoryChange(e.target.value)}>
                  {Object.keys(CATEGORY_MAP).map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><div className="form-label">Subcategoría</div>
                <select className="form-input" value={form.subcategory} onChange={e=>set('subcategory',e.target.value)}>
                  {subcats.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><div className="form-label">Género</div>
                <select className="form-input" value={form.gender||'Unisex'} onChange={e=>set('gender',e.target.value)}>
                  {GENDERS.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Price preview */}
            {form.priceUSD && (
              <div style={{background:'var(--o50)',border:'1px solid var(--o400)',borderRadius:10,padding:'10px 16px',marginBottom:14,fontSize:13,color:'var(--o800)'}}>
                💰 <strong>{fmtCOP(parseFloat(form.priceUSD)||0)}</strong> · {fmtUSD(parseFloat(form.priceUSD)||0)} USD
              </div>
            )}

            <div className="form-group mb-16">
              <div className="form-label">Descripción</div>
              <textarea className="form-input" rows={3} placeholder="Descripción del producto, características, instrucciones de cuidado..." value={form.desc} onChange={e=>set('desc',e.target.value)} style={{resize:'vertical'}}/>
            </div>

            {/* Size type */}
            <div className="form-group mb-12">
              <div className="form-label">Tipo de tallas</div>
              <div className="flex-center gap-8">
                {[['clothing','Ropa (XS-XXL)'],['shoes','Calzado (US)'],['generic','Sin tallas']].map(([t,l])=>(
                  <label key={t} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:14,fontWeight:form.sizeType===t?600:400}}>
                    <input type="radio" name="sizeType" value={t} checked={form.sizeType===t} onChange={()=>{
                      const arr = t==='clothing'?CLOTHING_SIZES:t==='shoes'?SHOE_SIZES_US:GENERIC_SIZES;
                      const sz={};arr.forEach(s=>sz[s]=form.sizes?.[s]||0);
                      setForm(f=>({...f,sizeType:t,sizes:sz}));
                    }} style={{accentColor:'var(--o600)'}}/>
                    {l}
                  </label>
                ))}
              </div>
            </div>

            {/* Size stock grid */}
            {form.sizeType !== 'generic' ? (
              <div className="form-group mb-16">
                <div className="form-label">Stock por talla</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {getSizeOptions().map(sz=>(
                    <div key={sz} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                      <div style={{fontSize:11,fontWeight:700,color:'var(--g600)'}}>{sz}</div>
                      <input type="number" min="0" value={form.sizes?.[sz]||0}
                        onChange={e=>setSizeStock(sz,e.target.value)}
                        style={{width:52,padding:'6px 4px',textAlign:'center',border:'1.5px solid var(--g300)',borderRadius:8,fontSize:14,fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:600,outline:'none'}}
                        onFocus={e=>e.target.style.borderColor='var(--o600)'}
                        onBlur={e=>e.target.style.borderColor='var(--g300)'}
                      />
                    </div>
                  ))}
                </div>
                <div className="form-hint">Pon 0 si no tienes esa talla. Se muestra en gris/tachado en la tienda.</div>
              </div>
            ) : (
              <div className="form-group mb-16">
                <div className="form-label">Stock total</div>
                <input className="form-input" style={{maxWidth:120}} type="number" min="0" value={form.sizes?.['Único']||''} onChange={e=>setSizeStock('Único',e.target.value)} placeholder="0"/>
              </div>
            )}

            {/* Emoji + BG */}
            <div className="grid-2 mb-16">
              <div className="form-group">
                <div className="form-label">Ícono fallback</div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {EMOJIS.map(e=><button key={e} onClick={()=>set('emoji',e)} style={{width:36,height:36,borderRadius:8,border:`2px solid ${form.emoji===e?'var(--o600)':'var(--g300)'}`,background:form.emoji===e?'var(--o50)':'white',fontSize:18,cursor:'pointer',transition:'all .15s'}}>{e}</button>)}
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Color de fondo tarjeta</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {['#F5F0EB','#E3F2FD','#E8F5E9','#FCE4EC','#F3E5F5','#E0F2F1','#FFFBEB','#FEF2F2','#F5F3FF'].map(c=>(
                    <div key={c} onClick={()=>set('bgLight',c)} style={{width:30,height:30,borderRadius:8,background:c,cursor:'pointer',border:`2.5px solid ${form.bgLight===c?'var(--o600)':'var(--g300)'}`,transition:'border .15s'}}/>
                  ))}
                </div>
                <div className="flex-center gap-8" style={{marginTop:8}}>
                  <label className="flex-center gap-8" style={{cursor:'pointer',fontSize:14}}>
                    <input type="checkbox" checked={form.featured||false} onChange={e=>set('featured',e.target.checked)} style={{accentColor:'var(--o600)'}}/>
                    Marcar como destacado ⭐
                  </label>
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-primary" onClick={handleSave}>{editId?'💾 Guardar':'🚀 Publicar'}</button>
              <button className="btn btn-ghost" onClick={()=>{const data={...form,priceUSD:parseFloat(form.priceUSD)||0,origUSD:parseFloat(form.origUSD)||0,stock:parseInt(form.stock)||1,status:'draft'};if(editId)updateProduct(editId,data);else addProduct(data);setShowForm(false);}}>💾 Guardar borrador</button>
              <button className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="card">
        <div className="card-head"><div className="card-title">Inventario</div><span className="badge badge-orange">{products.length} productos</span></div>
        <div style={{padding:'0 0 4px'}}>
          <table className="tbl">
            <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {products.map(p=>{
                const stock=totalStock(p);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex-center gap-8">
                        <div style={{width:42,height:42,borderRadius:10,background:p.bgLight||'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0}}>
                          {p.images?.length>0?<img src={p.images[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:22}}>{p.emoji}</span>}
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:600}}>{p.name}</div>
                          <div style={{fontSize:11,color:'var(--g400)'}}>{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td><div style={{fontSize:12}}><span className="badge badge-gray">{p.category}</span>{p.gender&&p.gender!=='Unisex'&&<span className="badge badge-orange" style={{marginLeft:4}}>{p.gender}</span>}</div><div style={{fontSize:11,color:'var(--g500)',marginTop:3}}>{p.subcategory}</div></td>
                    <td><div style={{fontWeight:700,color:'var(--o600)',fontSize:13}}>{fmtUSD(p.priceUSD)}</div><div style={{fontSize:11,color:'var(--g400)'}}>{fmtCOP(p.priceUSD)}</div></td>
                    <td style={{fontWeight:700}}>{stock} uds.</td>
                    <td>{stock===0?<span className="badge badge-red">Agotado</span>:stock<=3?<span className="badge badge-orange">Pocas</span>:<span className="badge badge-green">Disponible</span>}</td>
                    <td>
                      <div className="flex-center gap-6">
                        <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(p)}>✏️ Editar</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>deleteProduct(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
