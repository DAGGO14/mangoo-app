import React, { useState, useRef } from 'react';
import { useApp, fmtUSD } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import Wishlist from './Wishlist';

const STORES=[
  {name:'Amazon',icon:'🛒',cat:'Todo',url:'https://www.amazon.com'},
  {name:'Adidas USA',icon:'👟',cat:'Ropa & Zapatos',url:'https://www.adidas.com/us'},
  {name:'Best Buy',icon:'💻',cat:'Electrónica',url:'https://www.bestbuy.com'},
  {name:'Nike',icon:'✔️',cat:'Deporte',url:'https://www.nike.com'},
  {name:'Sephora',icon:'💄',cat:'Belleza',url:'https://www.sephora.com'},
  {name:'Target',icon:'🎯',cat:'General',url:'https://www.target.com'},
  {name:'Walmart',icon:'🏪',cat:'General',url:'https://www.walmart.com'},
  {name:'Zara USA',icon:'👗',cat:'Moda',url:'https://www.zara.com/us'},
  {name:'Otra tienda',icon:'🌐',cat:'URL personalizada',url:''},
];
const CUSTOMS_NAMES=['Ropa y accesorios','Calzado','Electrónicos y accesorios','Belleza y cuidado personal','Artículos del hogar','Juguetes y juegos','Libros y material educativo','Suplementos deportivos','Otro'];

export default function Casillero() {
  const { addPackage, toast } = useApp();
  const { me } = useAuth();
  const [activeTab, setActiveTab] = useState('casillero');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState(null);
  const [store, setStore] = useState(null);
  const [items, setItems] = useState([{id:1,url:'',price:'',desc:'',notes:''}]);
  const [tForm, setTForm] = useState({tracking:'',price:'',desc:'',customsName:CUSTOMS_NAMES[0],invoiceLabel:'',weight:''});
  const setTF=(k,v)=>setTForm(f=>({...f,[k]:v}));
  const invoiceRef = useRef();
  const handleInvoice=(e)=>{const f=e.target.files?.[0];if(!f)return;setTF('invoiceLabel',f.name);toast('📎 '+f.name+' cargado','success');};
  const addItem=()=>setItems(i=>[...i,{id:Date.now(),url:'',price:'',desc:'',notes:''}]);
  const removeItem=(id)=>setItems(i=>i.filter(x=>x.id!==id));
  const setItem=(id,k,v)=>setItems(i=>i.map(x=>x.id===id?{...x,[k]:v}:x));
  const totalUSD=items.reduce((s,x)=>s+(parseFloat(x.price)||0),0);
  const flete=totalUSD>0?18.50:0;
  const fee=parseFloat((totalUSD*0.07).toFixed(2));
  const total=parseFloat((totalUSD+flete+fee).toFixed(2));
  const handleCopy=()=>{navigator.clipboard.writeText(`${me.name} — Suite #${me.suite}, 8751 NW 93rd Street Warehouse D, Miami FL 33178 USA`).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2500);};
  const handleStoreClick=(s)=>{setStore(s);setMode('store');if(s.url)window.open(s.url,'_blank');};
  const handleOrderStore=()=>{
    const valid=items.filter(x=>x.url&&x.price);
    if(!valid.length){toast('Ingresa al menos un producto con URL y precio','warn');return;}
    valid.forEach(item=>{
      const id='MNG-0'+(Math.floor(Math.random()*900)+100);
      addPackage({id,item:item.desc||'Producto USA',store:store?.name||'Tienda USA',price:parseFloat(item.price),status:0,icon:store?.icon||'📦',bg:'#E3F2FD',date:new Date().toLocaleDateString('es'),weight:'-',tracking:''},me);
    });
    setItems([{id:1,url:'',price:'',desc:'',notes:''}]);setMode(null);setStore(null);
  };
  const handleOrderTracking=()=>{
    if(!tForm.tracking||!tForm.price){toast('Tracking y valor son requeridos','warn');return;}
    const id='MNG-'+tForm.tracking.slice(-4).toUpperCase();
    addPackage({id,item:tForm.desc||'Paquete importado',store:'Ya comprado',price:parseFloat(tForm.price),status:1,icon:'📦',bg:'#F5F0EB',date:new Date().toLocaleDateString('es'),weight:tForm.weight||'-',tracking:tForm.tracking},me);
    setTForm({tracking:'',price:'',desc:'',customsName:CUSTOMS_NAMES[0],invoiceLabel:'',weight:''});setMode(null);
  };
  return (
    <div className="anim-up">
      {/* Tab bar */}
      <div style={{display:'flex',gap:4,background:'var(--white)',padding:4,borderRadius:'var(--r-lg)',marginBottom:24,width:'fit-content',boxShadow:'var(--shadow-xs)'}}>
        {[['casillero','📬 Mi Casillero'],['wishlist','🔥 Más Pedidos']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'8px 20px',borderRadius:'var(--r-md)',border:'none',background:activeTab===id?'var(--o600)':'transparent',color:activeTab===id?'white':'var(--g600)',fontWeight:600,fontSize:13,cursor:'pointer',fontFamily:'Plus Jakarta Sans,sans-serif',transition:'all .2s'}}>
            {label}
          </button>
        ))}
      </div>

      {activeTab==='wishlist' && <Wishlist/>}
      {activeTab==='casillero' && <div>
      <div className="page-head"><div><div className="page-title">Mi Casillero USA</div><div className="page-sub">Tu dirección personal en Miami</div></div></div>
      <div className="casillero-banner mb-24">
        <div style={{position:'relative',zIndex:1}}>
          <div className="cb-eyebrow">🇺🇸 Tu dirección en Estados Unidos</div>
          <div className="cb-name">{me.name} — Suite #{me.suite}</div>
          <div className="cb-addr">8751 NW 93rd Street, Warehouse D</div>
          <div className="cb-city">Miami, FL 33178 · United States</div>
          <div className="cb-actions">
            <button className={`cb-btn ${copied?'copied':''}`} onClick={handleCopy}>{copied?'✅ Copiado':'📋 Copiar dirección'}</button>
            <button className="cb-btn">📧 Email</button><button className="cb-btn">📱 Compartir</button>
          </div>
        </div>
      </div>
      <div className="two-col mb-24">
        <div className="card" style={{cursor:'pointer',border:mode==='store'?'2px solid var(--o600)':'1px solid var(--g200)',transition:'all .2s'}} onClick={()=>{setMode('store');setStore(null);}}>
          <div className="card-body" style={{textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:10}}>🛒</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Comprar en tienda USA</div>
            <div style={{fontSize:13,color:'var(--g500)'}}>Selecciona tienda, agrega productos y los recibimos en Miami</div>
          </div>
        </div>
        <div className="card" style={{cursor:'pointer',border:mode==='tracking'?'2px solid var(--o600)':'1px solid var(--g200)',transition:'all .2s'}} onClick={()=>setMode('tracking')}>
          <div className="card-body" style={{textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:10}}>📦</div>
            <div style={{fontWeight:700,fontSize:16,marginBottom:4}}>Ya compré, tengo tracking</div>
            <div style={{fontSize:13,color:'var(--g500)'}}>Ingresa número de seguimiento, valor y factura</div>
          </div>
        </div>
      </div>
      {mode==='store'&&(
        <div className="anim-up">
          <div className="card mb-20">
            <div className="card-head"><div className="card-title">Elige la tienda</div><span className="badge badge-orange">Click = abre la tienda</span></div>
            <div style={{padding:'16px 24px 24px'}}>
              <div className="store-grid">
                {STORES.map(s=>(
                  <div key={s.name} className={`store-tile ${store?.name===s.name?'selected':''}`} onClick={()=>handleStoreClick(s)}>
                    <div className="store-tile-icon">{s.icon}</div>
                    <div className="store-tile-name">{s.name}</div>
                    <div className="store-tile-cat">{s.cat}</div>
                    {s.url&&<div className="store-tile-link">↗ Abrir</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {store&&(
            <div className="card anim-up">
              <div className="card-head"><div><div className="card-title">{store.icon} {store.name} — Mis productos</div><div className="card-sub">Agrega todos los productos de este pedido</div></div><button className="btn btn-ghost btn-sm" onClick={addItem}>+ Producto</button></div>
              <div style={{padding:'0 24px 24px'}}>
                <div style={{background:'var(--o50)',border:'1px solid var(--o400)',borderRadius:12,padding:'12px 16px',marginBottom:20,fontSize:13}}>
                  <div style={{fontWeight:700,color:'var(--o700)',marginBottom:4}}>📬 Usa esta dirección:</div>
                  <div className="grid-2" style={{gap:8}}>
                    {[['Nombre',me.name],['Suite','Suite #'+me.suite],['Dirección','8751 NW 93rd Street, Warehouse D'],['Ciudad','Miami, FL 33178']].map(([l,v])=>(
                      <div key={l}><span style={{color:'var(--g500)',fontSize:11}}>{l}: </span><span style={{fontWeight:600,color:'var(--o700)'}}>{v}</span></div>
                    ))}
                  </div>
                </div>
                {items.map((item,idx)=>(
                  <div key={item.id} style={{background:'var(--g50)',borderRadius:12,padding:16,marginBottom:12,border:'1px solid var(--g200)'}}>
                    <div className="flex-between mb-12">
                      <div style={{fontWeight:600,fontSize:13}}>Producto {idx+1}</div>
                      {items.length>1&&<button onClick={()=>removeItem(item.id)} style={{background:'none',border:'none',color:'var(--red)',cursor:'pointer',fontSize:18}}>×</button>}
                    </div>
                    <div className="grid-2 mb-8">
                      <div className="form-group"><div className="form-label">URL del producto *</div><input className="form-input" placeholder="https://..." value={item.url} onChange={e=>setItem(item.id,'url',e.target.value)}/></div>
                      <div className="form-group"><div className="form-label">Precio USD *</div><input className="form-input" placeholder="$0.00" type="number" value={item.price} onChange={e=>setItem(item.id,'price',e.target.value)}/></div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group"><div className="form-label">Nombre del producto</div><input className="form-input" placeholder="Nike Air Max 270" value={item.desc} onChange={e=>setItem(item.id,'desc',e.target.value)}/></div>
                      <div className="form-group"><div className="form-label">Talla / color</div><input className="form-input" placeholder="Talla US 10, negro" value={item.notes} onChange={e=>setItem(item.id,'notes',e.target.value)}/></div>
                    </div>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm mb-20" onClick={addItem}>+ Otro producto</button>
                <div className="pay-box mb-16">
                  <div style={{fontWeight:700,marginBottom:10,fontSize:14}}>Resumen — {items.length} producto(s)</div>
                  <div className="pay-row"><span>Subtotal</span><span>{fmtUSD(totalUSD)}</span></div>
                  <div className="pay-row"><span>Flete Miami → Colombia</span><span>{fmtUSD(flete)}</span></div>
                  <div className="pay-row"><span>Servicio MANGOO (7%)</span><span>{fmtUSD(fee)}</span></div>
                  <div className="pay-row total"><span>Total estimado</span><span>{fmtUSD(total)}</span></div>
                </div>
                <div style={{display:'flex',gap:10}}>
                  <button className="btn btn-primary" style={{flex:1}} onClick={handleOrderStore}>✅ Confirmar pedido</button>
                  <button className="btn btn-ghost" onClick={()=>{setMode(null);setStore(null);}}>Cancelar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {mode==='tracking'&&(
        <div className="card anim-up">
          <div className="card-head"><div className="card-title">📦 Ya compré — Agregar seguimiento</div></div>
          <div style={{padding:'0 24px 24px'}}>
            <div className="grid-2 mb-16" style={{marginTop:16}}>
              <div className="form-group"><div className="form-label">Número de seguimiento *</div><input className="form-input mono" placeholder="1Z999AA10123456784" value={tForm.tracking} onChange={e=>setTF('tracking',e.target.value)}/></div>
              <div className="form-group"><div className="form-label">Valor declarado USD *</div><input className="form-input" placeholder="$0.00" type="number" value={tForm.price} onChange={e=>setTF('price',e.target.value)}/></div>
            </div>
            <div className="grid-2 mb-16">
              <div className="form-group"><div className="form-label">Nombre del producto</div><input className="form-input" placeholder="Ej: Nike Air Max 270" value={tForm.desc} onChange={e=>setTF('desc',e.target.value)}/></div>
              <div className="form-group"><div className="form-label">Empresa de mensajería</div>
                <select className="form-input" value={tForm.courier||''} onChange={e=>setTF('courier',e.target.value)}>
                  {['UPS','FedEx','USPS','DHL','Amazon Logistics','OnTrac','LaserShip','Newgistics','Otra'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group mb-16">
              <div className="form-label">Nombre aduanero</div>
              <select className="form-input" value={tForm.customsName} onChange={e=>setTF('customsName',e.target.value)}>
                {CUSTOMS_NAMES.map(c=><option key={c}>{c}</option>)}
              </select>
              <div className="form-hint">Se usa para el proceso de aduana DIAN Colombia</div>
            </div>
            <div className="form-group mb-20">
              <div className="form-label">Factura / Invoice (opcional)</div>
              <input ref={invoiceRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{display:'none'}} onChange={handleInvoice}/>
              <div className="upload-zone" onClick={()=>invoiceRef.current?.click()}>
                {tForm.invoiceLabel?<><div style={{fontSize:32,marginBottom:6}}>📎</div><div style={{fontWeight:600,color:'var(--o700)'}}>{tForm.invoiceLabel}</div><div style={{fontSize:12,color:'var(--g500)',marginTop:4}}>Clic para cambiar</div></>:<><div className="upload-zone-icon">📄</div><div className="upload-zone-text">Subir factura / invoice</div><div className="upload-zone-sub">PDF, JPG, PNG hasta 10MB</div></>}
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-primary" style={{flex:1}} onClick={handleOrderTracking}>✅ Registrar paquete</button>
              <button className="btn btn-ghost" onClick={()=>setMode(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>}
    </div>
  );
}
