import React, { useState } from 'react';
import { useApp, fmtCOP, fmtUSD, CATEGORY_MAP, GENDERS } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

function SizePicker({ product, selected, onSelect }) {
  if (!product.sizes || !Object.keys(product.sizes).length) return null;
  return (
    <div className="size-grid">
      {Object.entries(product.sizes).map(([sz, st]) => (
        <button key={sz} className={`size-btn ${selected===sz?'selected':''} ${st===0?'out':''}`}
          disabled={st===0} onClick={()=>onSelect(sz)} title={st===0?'Sin stock':`${st} disponibles`}>
          {sz}
        </button>
      ))}
    </div>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const totalStock = product.sizes ? Object.values(product.sizes).reduce((a,b)=>a+b,0) : 1;
  const hasSizes = product.sizes && Object.keys(product.sizes).length>0 && !(Object.keys(product.sizes).length===1&&Object.keys(product.sizes)[0]==='Unico');
  const canAdd = (!hasSizes || size) && totalStock>0;
  const images = product.images||[];
  const cur = images[imgIdx];
  const hasMultiple = images.length > 1;

  const prevImg = (e) => { e.stopPropagation(); setImgIdx(i=>(i-1+images.length)%images.length); };
  const nextImg = (e) => { e.stopPropagation(); setImgIdx(i=>(i+1)%images.length); };

  React.useEffect(()=>{
    const h=(e)=>{
      if(e.key==='Escape') onClose();
      if(e.key==='ArrowRight'&&hasMultiple) setImgIdx(i=>(i+1)%images.length);
      if(e.key==='ArrowLeft'&&hasMultiple) setImgIdx(i=>(i-1+images.length)%images.length);
    };
    window.addEventListener('keydown',h);
    return ()=>window.removeEventListener('keydown',h);
  },[hasMultiple, onClose]);

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:20,backdropFilter:'blur(6px)',animation:'fadeIn .2s'}} onClick={onClose}>
      {zoom&&cur&&(
        <div className="zoom-overlay" onClick={()=>setZoom(false)}>
          <img src={cur} alt="" onClick={e=>e.stopPropagation()}/>
          <button onClick={()=>setZoom(false)} style={{position:'absolute',top:20,right:24,background:'rgba(255,255,255,.15)',border:'none',color:'white',width:40,height:40,borderRadius:'50%',cursor:'pointer',fontSize:22,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}}>×</button>
        </div>
      )}

      {/* Modal container — Monastery style */}
      <div onClick={e=>e.stopPropagation()} style={{
        width:'min(1080px,96vw)',
        height:'min(90vh,680px)',
        background:'white',
        borderRadius:4,
        overflow:'hidden',
        display:'grid',
        gridTemplateColumns:'55% 45%',
        boxShadow:'0 40px 120px rgba(0,0,0,.35)',
        animation:'slideUp .28s cubic-bezier(.34,1.2,.64,1)',
      }}>

        {/* LEFT — Gallery */}
        <div style={{position:'relative',background:'#F7F5F2',height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* Close */}
          <button onClick={onClose} style={{position:'absolute',top:16,right:16,zIndex:20,background:'rgba(255,255,255,.8)',border:'none',width:36,height:36,borderRadius:'50%',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)',boxShadow:'0 2px 8px rgba(0,0,0,.12)'}}>×</button>

          {/* Main image */}
          <div style={{flex:1,position:'relative',overflow:'hidden',minHeight:0}} onMouseLeave={()=>{}}>
            {cur
              ? <img src={cur} alt={product.name} style={{width:'100%',height:'100%',objectFit:'contain',padding:32,boxSizing:'border-box',cursor:'zoom-in',transition:'transform .4s ease'}}
                  onClick={()=>setZoom(true)}
                  onMouseOver={e=>e.currentTarget.style.transform='scale(1.03)'}
                  onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}/>
              : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:120}}>{product.emoji}</div>
            }
            {/* Side arrows */}
            {hasMultiple&&(
              <>
                <button onClick={prevImg} style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',background:'white',border:'none',width:40,height:40,borderRadius:'50%',cursor:'pointer',fontSize:22,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 12px rgba(0,0,0,.15)',transition:'all .2s',zIndex:5}}
                  onMouseOver={e=>e.currentTarget.style.transform='translateY(-50%) scale(1.1)'}
                  onMouseOut={e=>e.currentTarget.style.transform='translateY(-50%)'}>‹</button>
                <button onClick={nextImg} style={{position:'absolute',right:16,top:'50%',transform:'translateY(-50%)',background:'white',border:'none',width:40,height:40,borderRadius:'50%',cursor:'pointer',fontSize:22,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 12px rgba(0,0,0,.15)',transition:'all .2s',zIndex:5}}
                  onMouseOver={e=>e.currentTarget.style.transform='translateY(-50%) scale(1.1)'}
                  onMouseOut={e=>e.currentTarget.style.transform='translateY(-50%)'}>›</button>
              </>
            )}
            {/* Zoom hint */}
            {cur&&<div style={{position:'absolute',bottom:hasMultiple?72:16,left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,.45)',color:'white',fontSize:11,padding:'4px 12px',borderRadius:20,cursor:'pointer',backdropFilter:'blur(4px)',whiteSpace:'nowrap',letterSpacing:.5}} onClick={(e)=>{e.stopPropagation();setZoom(true);}}>+ VER DETALLE</div>}
          </div>

          {/* Thumbnails vertical left strip if multiple */}
          {hasMultiple&&(
            <div style={{display:'flex',gap:6,padding:'10px 16px',background:'rgba(255,255,255,.7)',borderTop:'1px solid rgba(0,0,0,.06)',flexWrap:'nowrap',overflowX:'auto'}}>
              {images.map((img,i)=>(
                <div key={i} onClick={()=>setImgIdx(i)} onMouseEnter={()=>setImgIdx(i)}
                  style={{width:52,height:52,borderRadius:3,overflow:'hidden',cursor:'pointer',flexShrink:0,border:`2px solid ${i===imgIdx?'#1a1a1a':'transparent'}`,transition:'border .15s',background:'white'}}>
                  <img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Info */}
        <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
          {/* Scrollable content */}
          <div style={{flex:1,overflowY:'auto',padding:'36px 36px 0'}}>
            {/* Breadcrumb */}
            <div style={{fontSize:11,color:'#999',fontWeight:600,textTransform:'uppercase',letterSpacing:1.5,marginBottom:12}}>
              {product.category}{product.subcategory?` / ${product.subcategory}`:''} / <span style={{color:'#1a1a1a'}}>{product.brand}</span>
            </div>

            {/* Name */}
            <div style={{fontSize:24,fontWeight:400,letterSpacing:'-.3px',lineHeight:1.2,marginBottom:16,color:'#1a1a1a',textTransform:'uppercase',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{product.name}</div>

            {/* Price */}
            <div style={{marginBottom:20,display:'flex',alignItems:'baseline',gap:12,flexWrap:'wrap'}}>
              {product.origUSD>product.priceUSD&&<span style={{fontSize:16,color:'#aaa',textDecoration:'line-through'}}>{fmtCOP(product.origUSD)}</span>}
              <span style={{fontSize:26,fontWeight:900,color:product.origUSD>product.priceUSD?'#C0392B':'#1a1a1a',letterSpacing:'-1px'}}>{fmtCOP(product.priceUSD)}</span>
              {product.origUSD>product.priceUSD&&<span style={{fontSize:12,background:'#FDECEA',color:'#C0392B',fontWeight:800,padding:'3px 10px',borderRadius:3,letterSpacing:.5}}>SALE</span>}
            </div>
            <div style={{fontSize:12,color:'#999',marginBottom:20}}>{fmtUSD(product.priceUSD)} USD · Precio en Colombia con envío incluido</div>

            {/* Divider */}
            <div style={{height:1,background:'#F0F0F0',marginBottom:20}}/>

            {totalStock===0 ? (
              <div style={{border:'1px solid #e0e0e0',borderRadius:3,padding:'14px 18px',textAlign:'center',fontWeight:700,color:'#999',fontSize:13,letterSpacing:.5,marginBottom:20,textTransform:'uppercase'}}>Agotado</div>
            ) : (
              <>
                {/* Sizes */}
                {hasSizes&&(
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase',color:'#666',marginBottom:10,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span>Talla {size&&<span style={{color:'var(--o600)'}}>— {size}</span>}</span>
                      {!size&&<span style={{color:'#C0392B',fontWeight:500,letterSpacing:0,textTransform:'none',fontSize:11}}>Selecciona una talla</span>}
                    </div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {Object.entries(product.sizes).map(([sz,st])=>(
                        <button key={sz} onClick={()=>st>0&&setSize(sz)} disabled={st===0}
                          style={{minWidth:46,height:46,borderRadius:3,border:`1.5px solid ${size===sz?'#1a1a1a':st===0?'#E8E8E8':'#DDDDDD'}`,background:size===sz?'#1a1a1a':st===0?'#F9F9F9':'white',color:size===sz?'white':st===0?'#ccc':'#1a1a1a',fontSize:13,fontWeight:600,cursor:st===0?'not-allowed':'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .15s',position:'relative',textDecoration:st===0?'line-through':'none'}}>
                          {sz}
                          {st>0&&st<=2&&<div style={{position:'absolute',top:-4,right:-4,width:8,height:8,borderRadius:'50%',background:'#F39C12',border:'1.5px solid white'}}/>}
                        </button>
                      ))}
                    </div>
                    {size&&(product.sizes[size]||0)<=2&&(product.sizes[size]||0)>0&&<div style={{fontSize:11,color:'#E67E22',fontWeight:600,marginTop:8,letterSpacing:.3}}>⚠ Solo {product.sizes[size]} disponible{product.sizes[size]>1?'s':''} en talla {size}</div>}
                  </div>
                )}

                {/* Qty */}
                <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
                  <div style={{display:'flex',alignItems:'center',border:'1px solid #DDDDDD',borderRadius:3,overflow:'hidden'}}>
                    <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{width:44,height:44,background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#666',fontFamily:'Plus Jakarta Sans,sans-serif'}}>−</button>
                    <span style={{width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:16,borderLeft:'1px solid #eee',borderRight:'1px solid #eee'}}>{qty}</span>
                    <button onClick={()=>setQty(q=>q+1)} style={{width:44,height:44,background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#666',fontFamily:'Plus Jakarta Sans,sans-serif'}}>+</button>
                  </div>
                  <div style={{fontSize:12,color:'#888',lineHeight:1.6}}>🇨🇴 Ya en Colombia · <span style={{color:'#27AE60',fontWeight:600}}>Envío 1–3 días</span></div>
                </div>
              </>
            )}

            {/* Description */}
            {product.desc&&<div style={{fontSize:13,color:'#666',lineHeight:1.75,marginBottom:20,borderTop:'1px solid #F0F0F0',paddingTop:16}}>{product.desc}</div>}

            {/* Trust badges */}
            <div style={{fontSize:12,color:'#888',lineHeight:2,marginBottom:20,borderTop:'1px solid #F0F0F0',paddingTop:16}}>
              <div>✓ Envío gratis a toda Colombia</div>
              <div>✓ Producto 100% auténtico</div>
              <div>✓ Pago seguro</div>
            </div>
          </div>

          {/* FIXED CTA at bottom */}
          {totalStock>0&&<div style={{padding:'20px 36px 28px',borderTop:'1px solid #F0F0F0',background:'white',flexShrink:0}}>
            <button
              onClick={()=>{onAdd(product,qty,size);onClose();}}
              disabled={!canAdd}
              style={{width:'100%',padding:'16px 0',background:canAdd?'#1a1a1a':'#D0D0D0',color:'white',border:'none',borderRadius:3,fontSize:14,fontWeight:700,cursor:canAdd?'pointer':'not-allowed',fontFamily:'Plus Jakarta Sans,sans-serif',letterSpacing:1.5,textTransform:'uppercase',transition:'background .2s'}}
              onMouseOver={e=>{if(canAdd)e.currentTarget.style.background='#333';}}
              onMouseOut={e=>{if(canAdd)e.currentTarget.style.background='#1a1a1a';}}>
              {!canAdd&&hasSizes?'Selecciona una talla':`Agregar al carrito — ${fmtCOP(product.priceUSD*qty)}`}
            </button>
          </div>}
        </div>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px) scale(.98)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}


export default function Market({ setPage, onNeedAuth }) {
  const { products, addToCart } = useApp();
  const { me } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [subcat, setSubcat] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [view, setView] = useState('grid');
  const [gender, setGender] = useState('Todos');

  const cats = ['Todos', ...Object.keys(CATEGORY_MAP)];
  // Only show subcats for current category, never crash
  const subcats = category!=='Todos' ? (CATEGORY_MAP[category]||[]) : [];

  const pubProducts = products.filter(p => p.status !== 'draft');
  let filtered = pubProducts.filter(p => {
    const mc = category==='Todos'||p.category===category;
    const ms = !subcat||p.subcategory===subcat;
    const mgender = gender==='Todos' || (p.gender||'Unisex')===gender || p.gender==='Unisex';
    const mq = !search||p.name.toLowerCase().includes(search.toLowerCase())||p.brand.toLowerCase().includes(search.toLowerCase());
    return mc&&ms&&mgender&&mq;
  });
  if(sortBy==='price_asc') filtered=[...filtered].sort((a,b)=>a.priceUSD-b.priceUSD);
  if(sortBy==='price_desc') filtered=[...filtered].sort((a,b)=>b.priceUSD-a.priceUSD);
  if(sortBy==='discount') filtered=[...filtered].sort((a,b)=>(b.origUSD-b.priceUSD)-(a.origUSD-a.priceUSD));
  if(sortBy==='new') filtered=[...filtered].sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));

  const totalStock = p => p.sizes ? Object.values(p.sizes).reduce((a,b)=>a+b,0) : 1;

  const handleAddToCart = (product, qty, size) => {
    if (!me && onNeedAuth) { onNeedAuth(); return; }
    addToCart(product, qty, size);
  };

  return (
    <div className="anim-up">
      {selected&&<ProductModal product={selected} onClose={()=>setSelected(null)} onAdd={(p,q,s)=>{handleAddToCart(p,q,s);if(me&&setPage)setPage('cart');}}/>}

      {/* Hero */}
      <div style={{background:'var(--g950)',borderRadius:24,padding:'36px 40px',marginBottom:32,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(255,255,255,.025) 1px,transparent 1px)',backgroundSize:'24px 24px'}}/>
        <div style={{position:'absolute',right:-40,top:-40,width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(217,95,2,.3),transparent 70%)'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{fontSize:11,color:'var(--o400)',fontWeight:700,textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>Marketplace</div>
          <div style={{fontSize:36,fontWeight:900,color:'white',letterSpacing:'-1.5px',marginBottom:8,lineHeight:1.1}}>
            Productos de USA<br/><span style={{color:'var(--o500)'}}>ya en Colombia</span>
          </div>
          <div style={{fontSize:14,color:'rgba(255,255,255,.5)',marginBottom:24,maxWidth:400}}>Importados directamente. Envio 1-3 dias habiles a todo el pais.</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {[['Colombia','ya aqui'],['Autenticados','garantizados'],['Envio','incluido'],['Pago','seguro']].map(([t,s])=>(
              <div key={t} style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.12)',borderRadius:8,padding:'6px 14px',fontSize:12,color:'rgba(255,255,255,.75)'}}>
                <span style={{fontWeight:700}}>{t}</span> {s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:200,position:'relative'}}>
          <input className="form-input" style={{width:'100%',paddingLeft:40}} placeholder="Buscar productos, marcas..." value={search} onChange={e=>setSearch(e.target.value)}/>
          <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--g400)',pointerEvents:'none',fontSize:14}}>o</span>
        </div>
        <select className="form-input" style={{width:'auto'}} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
          <option value="default">Ordenar</option>
          <option value="price_asc">Precio menor</option>
          <option value="price_desc">Precio mayor</option>
          <option value="discount">Mayor descuento</option>
          <option value="new">Mas recientes</option>
        </select>
        <div style={{display:'flex',gap:2,background:'var(--white)',borderRadius:10,padding:3,border:'1px solid var(--g200)'}}>
          {[['grid','4x'],['list','=']].map(([v,ic])=>(
            <button key={v} onClick={()=>setView(v)} style={{width:36,height:36,borderRadius:8,border:'none',background:view===v?'var(--g900)':'transparent',color:view===v?'white':'var(--g500)',cursor:'pointer',fontSize:12,fontWeight:700,fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .15s'}}>{ic}</button>
          ))}
        </div>
      </div>

      {/* Gender filter */}
      <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:11,fontWeight:700,color:'var(--g500)',textTransform:'uppercase',letterSpacing:1,marginRight:4}}>Género:</span>
        {['Todos','Hombre','Mujer','Unisex'].map(g=>(
          <button key={g} onClick={()=>setGender(g)}
            style={{padding:'5px 14px',borderRadius:'var(--r-full)',border:`1.5px solid ${gender===g?'var(--o600)':'var(--g200)'}`,background:gender===g?'var(--o600)':'var(--white)',color:gender===g?'white':'var(--g600)',fontSize:12,fontWeight:gender===g?700:500,cursor:'pointer',transition:'all .15s',fontFamily:'Plus Jakarta Sans,sans-serif'}}>
            {g==='Hombre'?'👨 Hombre':g==='Mujer'?'👩 Mujer':g==='Unisex'?'🧑 Unisex':'Todos'}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div style={{display:'flex',gap:6,marginBottom:subcats.length?12:24,flexWrap:'wrap'}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>{setCategory(c);setSubcat(null);}}
            style={{padding:'8px 18px',borderRadius:'var(--r-full)',border:`1.5px solid ${category===c?'var(--g900)':'var(--g200)'}`,background:category===c?'var(--g900)':'var(--white)',color:category===c?'white':'var(--g700)',fontSize:13,fontWeight:category===c?700:500,cursor:'pointer',transition:'all .2s',fontFamily:'Plus Jakarta Sans,sans-serif',boxShadow:'var(--shadow-xs)'}}>
            {c}
          </button>
        ))}
      </div>

      {/* Sub-cats */}
      {subcats.length>0&&(
        <div style={{display:'flex',gap:6,marginBottom:24,flexWrap:'wrap',paddingLeft:4}}>
          {[null,...subcats].map(s=>(
            <button key={s||'all'} onClick={()=>setSubcat(s)}
              style={{padding:'5px 14px',borderRadius:'var(--r-full)',border:`1px solid ${subcat===s?'var(--o600)':'var(--g300)'}`,background:subcat===s?'var(--o50)':'transparent',color:subcat===s?'var(--o700)':'var(--g500)',fontSize:12,fontWeight:subcat===s?700:400,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .15s'}}>
              {s||'Todos'}
            </button>
          ))}
        </div>
      )}

      <div style={{fontSize:13,color:'var(--g500)',marginBottom:16,fontWeight:500}}>{filtered.length} producto{filtered.length!==1?'s':''}{search?` para "${search}"`:''}
      </div>

      {filtered.length===0 ? (
        <div style={{textAlign:'center',padding:'80px 0',color:'var(--g400)'}}>
          <div style={{fontSize:56,marginBottom:16}}>??</div>
          <div style={{fontWeight:700,fontSize:18,marginBottom:8}}>Sin resultados</div>
          <div style={{fontSize:14}}>Prueba con otra busqueda</div>
        </div>
      ) : view==='grid' ? (
        <div className="shop-grid">
          {filtered.map(p=>{
            const stock=totalStock(p);const out=stock===0;const low=!out&&stock<=3;
            const [hoverIdx,setHoverIdx]=React.useState(0);
            const imgs=p.images||[];
            return (
              <div key={p.id} className="shop-card" onClick={()=>setSelected(p)}
                onMouseLeave={()=>setHoverIdx(0)}>
                <div className="shop-card-img" style={{background:p.bgLight||'var(--g100)',position:'relative'}}>
                  {imgs.length>0
                    ? <img src={imgs[hoverIdx]||imgs[0]} alt={p.name} style={{transition:'opacity .25s'}}/>
                    : <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#F5F5F5',gap:8}}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D0D0D0" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                        <span style={{fontSize:11,color:'#C0C0C0',fontWeight:500}}>Sin imagen</span>
                      </div>}
                  {/* Arrow buttons for multi-image */}
                  {imgs.length>1&&(
                    <>
                      <button
                        onClick={e=>{e.stopPropagation();setHoverIdx(i=>(i-1+imgs.length)%imgs.length);}}
                        className="card-arrow card-arrow-left">&#8249;</button>
                      <button
                        onClick={e=>{e.stopPropagation();setHoverIdx(i=>(i+1)%imgs.length);}}
                        className="card-arrow card-arrow-right">&#8250;</button>
                    </>
                  )}
                  {/* Dot indicators */}
                  {imgs.length>1&&(
                    <div style={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',display:'flex',gap:4,zIndex:3,pointerEvents:'none'}}>
                      {imgs.map((_,i)=><div key={i} style={{width:i===hoverIdx?14:5,height:5,borderRadius:3,background:i===hoverIdx?'white':'rgba(255,255,255,.5)',transition:'all .2s'}}/>)}
                    </div>
                  )}
                  <div className="shop-card-badges">
                    {p.featured&&<span style={{background:'rgba(0,0,0,.75)',color:'white',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:20,backdropFilter:'blur(4px)'}}>DESTACADO</span>}
                    {!out&&<span style={{background:'var(--o600)',color:'white',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:20}}>-{Math.round((1-p.priceUSD/p.origUSD)*100)}%</span>}
                    {low&&!out&&<span style={{background:'var(--red)',color:'white',fontSize:9,fontWeight:800,padding:'3px 8px',borderRadius:20}}>ULTIMAS</span>}
                  </div>
                  <div className="shop-card-actions">
                    <button className="shop-card-action-btn" onClick={e=>{e.stopPropagation();setSelected(p);}}>+</button>
                  </div>
                  {out&&<div className="shop-card-sold-out"><div className="shop-card-sold-out-label">Agotado</div></div>}
                </div>
                <div className="shop-card-body">
                  <div className="shop-card-category">{p.category} / {p.subcategory}</div>
                  <div className="shop-card-name">{p.name}</div>
                  <div className="shop-card-brand">{p.brand}</div>
                  <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:4}}>
                    <span className="shop-card-price">{fmtCOP(p.priceUSD)}</span>
                    <span className="shop-card-orig">{fmtCOP(p.origUSD)}</span>
                  </div>
                  <div className="shop-card-usd">{fmtUSD(p.priceUSD)} USD</div>
                  {p.sizes&&Object.keys(p.sizes).length>1&&(
                    <div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:8}}>
                      {Object.entries(p.sizes).slice(0,7).map(([sz,st])=>(
                        <div key={sz} style={{minWidth:24,height:24,borderRadius:5,border:'1px solid',borderColor:st>0?'var(--g300)':'var(--g100)',background:st>0?'var(--white)':'var(--g50)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:st>0?'var(--g600)':'var(--g300)',padding:'0 4px',textDecoration:st===0?'line-through':'none'}}>{sz}</div>
                      ))}
                      {Object.keys(p.sizes).length>7&&<div style={{fontSize:10,color:'var(--g400)',alignSelf:'center'}}>+{Object.keys(p.sizes).length-7}</div>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {filtered.map(p=>{
            const stock=totalStock(p);const out=stock===0;
            return (
              <div key={p.id} onClick={()=>setSelected(p)} style={{background:'var(--white)',borderRadius:16,border:'1px solid var(--g200)',padding:'16px 20px',display:'flex',gap:16,alignItems:'center',cursor:'pointer',transition:'box-shadow .2s'}}
                onMouseOver={e=>e.currentTarget.style.boxShadow='var(--shadow-md)'} onMouseOut={e=>e.currentTarget.style.boxShadow='none'}>
                <div style={{width:80,height:80,borderRadius:12,background:p.bgLight||'var(--g100)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',flexShrink:0}}>
                  {p.images?.length>0?<img src={p.images[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='#D0D0D0' strokeWidth='1.5'><rect x='3' y='3' width='18' height='18' rx='2'/><circle cx='8.5' cy='8.5' r='1.5'/><polyline points='21,15 16,10 5,21'/></svg>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:10,color:'var(--g400)',fontWeight:700,textTransform:'uppercase',letterSpacing:.8,marginBottom:3}}>{p.category}</div>
                  <div style={{fontSize:16,fontWeight:700,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</div>
                  <div style={{fontSize:13,color:'var(--g400)'}}>{p.brand}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div style={{fontSize:20,fontWeight:900,color:'var(--g900)',marginBottom:2}}>{fmtCOP(p.priceUSD)}</div>
                  <div style={{fontSize:12,color:'var(--g400)',textDecoration:'line-through',marginBottom:6}}>{fmtCOP(p.origUSD)}</div>
                  {out
                    ? <span style={{fontSize:11,background:'var(--red-bg)',color:'var(--red)',padding:'3px 10px',borderRadius:'var(--r-full)',fontWeight:700}}>Agotado</span>
                    : <span style={{fontSize:11,background:'var(--o600)',color:'white',padding:'3px 10px',borderRadius:'var(--r-full)',fontWeight:700}}>-{Math.round((1-p.priceUSD/p.origUSD)*100)}% OFF</span>
                  }
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
