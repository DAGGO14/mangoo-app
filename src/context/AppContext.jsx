import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import {
  fsListenOrders, fsAddOrder, fsUpdateOrder, fsDeleteOrder,
  fsListenProducts, fsSaveProduct, fsDeleteProduct,
  fsGetPackages, fsAddPackage,
  fsGetWishlist, fsSaveWishlistItem, fsDeleteWishlistItem,
  fsListenNotifs, fsAddNotif, fsMarkNotifsRead,
  fsSaveUser
} from '../services/firebaseService';


// Compress image to ~200KB max before storing in Firestore
async function compressImg(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return dataUrl;
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const MAX = 800;
      const ratio = Math.min(MAX/img.width, MAX/img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
export const USD_TO_COP = 4100;
export const fmtCOP=(usd)=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(usd*USD_TO_COP);
export const fmtUSD=(n)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
export const CUSTOMS_LIMIT=200; export const CUSTOMS_RATE=0.19;
export const CATEGORY_MAP={'Ropa':['Hoodies','Camisetas','Camisas','Pantalones','Jeans','Vestidos','Chaquetas','Buzos','Shorts','Ropa interior','Accesorios'],'Calzado':['Tenis','Botas','Sandalias','Zapatos formales','Pantuflas','Tacones'],'Electrónica':['Teléfonos','Laptops','Tablets','Audio','Accesorios','Wearables','Consolas','Cámaras'],'Belleza':['Skincare','Maquillaje','Cabello','Perfumes','Uñas','Cuerpo'],'Hogar':['Cocina','Decoración','Organización','Iluminación','Baño'],'Deportes':['Ropa deportiva','Calzado deportivo','Equipos','Suplementos'],'Otros':['General']};
export const CLOTHING_SIZES=['XXS','XS','S','M','L','XL','XXL','XXXL'];
export const GENDERS=['Unisex','Hombre','Mujer'];
export const SHOE_SIZES_US=['5','5.5','6','6.5','7','7.5','8','8.5','9','9.5','10','10.5','11','11.5','12','13'];
export const GENERIC_SIZES=['Único'];
export const CUSTOMS_CATEGORIES=['Ropa y accesorios','Calzado','Electrónicos','Belleza','Artículos del hogar','Juguetes','Libros','Suplementos','Otro'];
export const MARKETPLACE_STATUSES=[
  {key:'paid',label:'Pago confirmado',color:'#F0FDF4',text:'#15803D',icon:'✅'},
  {key:'preparing',label:'Preparando pedido',color:'#EFF6FF',text:'#1D4ED8',icon:'📋'},
  {key:'ready',label:'Listo para despacho',color:'#FFF7ED',text:'#C2410C',icon:'📦'},
  {key:'sent_carrier',label:'Entregado a transportista',color:'#F5F3FF',text:'#6D28D9',icon:'🚛'},
  {key:'in_transit_local',label:'En camino',color:'#FFF3E0',text:'#B04A00',icon:'🚚'},
  {key:'delivered',label:'Entregado',color:'#F0FDF4',text:'#15803D',icon:'✅'},
  {key:'cancelled',label:'Cancelado',color:'#FEF2F2',text:'#DC2626',icon:'🚫'},
];
export const CASILLERO_STATUSES=[
  {key:'pending_arrival',label:'A la espera en USA',color:'#EFF6FF',text:'#1D4ED8',icon:'⏳'},
  {key:'received_usa',label:'Recibido en bodega USA',color:'#F0FDF4',text:'#15803D',icon:'📦'},
  {key:'in_transit',label:'En tránsito',color:'#FFF7ED',text:'#C2410C',icon:'✈️'},
  {key:'customs',label:'En aduana Colombia',color:'#FFFBEB',text:'#B45309',icon:'🛃'},
  {key:'local_warehouse',label:'Bodega local MANGOO',color:'#F5F3FF',text:'#6D28D9',icon:'🏪'},
  {key:'out_delivery',label:'En camino',color:'#FFF0F0',text:'#DC2626',icon:'🚚'},
  {key:'delivered',label:'Entregado',color:'#F0FDF4',text:'#15803D',icon:'✅'},
  {key:'cancelled',label:'Cancelado',color:'#FEF2F2',text:'#DC2626',icon:'🚫'},
];
export const getStatuses=(type)=>type==='marketplace'?MARKETPLACE_STATUSES:CASILLERO_STATUSES;
export const getStatus=(key,type)=>{const list=type==='marketplace'?MARKETPLACE_STATUSES:CASILLERO_STATUSES;return list.find(s=>s.key===key)||{key,label:key,color:'#F5F5F4',text:'#78716C',icon:'📋'};};

const SEED=[
  {id:1,name:'Hoodie Premium Essentials',brand:'USA Import',priceUSD:45,origUSD:60,category:'Ropa',subcategory:'Hoodies',images:[],emoji:'🧥',bgLight:'#F5F0EB',desc:'Hoodie oversize 380g directo de USA.',sizes:{S:3,M:5,L:2,XL:1,XXL:0},sizeType:'clothing',featured:true,status:'published',createdAt:new Date(0).toISOString()},
  {id:2,name:'Nike Air Force 1 Low',brand:'Nike USA',priceUSD:110,origUSD:130,category:'Calzado',subcategory:'Tenis',images:[],emoji:'👟',bgLight:'#F5F0EB',desc:'AF1 clásico en blanco.',sizes:{'7':1,'8':2,'9':3,'10':2,'11':1,'12':0},sizeType:'shoes',featured:true,status:'published',createdAt:new Date(0).toISOString()},
  {id:3,name:'Camiseta Oversized Vintage',brand:'USA Import',priceUSD:28,origUSD:38,category:'Ropa',subcategory:'Camisetas',images:[],emoji:'👕',bgLight:'#F5F0EB',desc:'100% algodón lavado ácido.',sizes:{XS:2,S:4,M:6,L:3,XL:1},sizeType:'clothing',featured:true,status:'published',createdAt:new Date(0).toISOString()},
  {id:4,name:'AirPods Pro 2da Gen',brand:'Apple USA',priceUSD:189,origUSD:249,category:'Electrónica',subcategory:'Audio',images:[],emoji:'🎧',bgLight:'#F5F0EB',desc:'ANC + audio espacial.',sizes:{'Único':2},sizeType:'generic',featured:false,status:'published',createdAt:new Date(0).toISOString()},
];

const DEFAULT_WISHLIST=[
  {id:'w1',name:'Stanley Quencher 40oz',category:'Hogar',emoji:'🥤',requests:23,url:'https://www.stanley1913.com',notes:'Color Fog y Rose Quartz los más pedidos',createdAt:new Date(0).toISOString()},
  {id:'w2',name:'New Balance 9060',category:'Calzado',emoji:'👟',requests:18,url:'https://www.newbalance.com',notes:'Tallas 8–11 US principalmente',createdAt:new Date(0).toISOString()},
  {id:'w3',name:'Lululemon Align Leggings',category:'Ropa',emoji:'🧘',requests:15,url:'https://www.lululemon.com',notes:'Talla S y M, colores neutros',createdAt:new Date(0).toISOString()},
  {id:'w4',name:'Dyson Airwrap Complete',category:'Belleza',emoji:'💇',requests:12,url:'https://www.dyson.com',notes:'Complete Long version',createdAt:new Date(0).toISOString()},
  {id:'w5',name:'Apple Watch Ultra 2',category:'Electrónica',emoji:'⌚',requests:9,url:'https://www.apple.com',notes:'49mm titanio negro',createdAt:new Date(0).toISOString()},
  {id:'w6',name:'On Cloud 5',category:'Calzado',emoji:'☁️',requests:7,url:'https://www.on.com',notes:'All White más solicitado',createdAt:new Date(0).toISOString()},
];

function lsGet(key,def){try{const v=localStorage.getItem(key);return v!==null?JSON.parse(v):def;}catch{return def;}}
function lsSet(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch{}}
export function getNotifsKey(uid){return uid?`mg9_notifs_${uid}`:'mg9_notifs_guest';}

export function AppProvider({children,currentUserId}){
  const [products,setProductsState]   = useState([]);
  const [orders,setOrdsState]         = useState([]);
  const [packages,setPkgsState]       = useState([]);
  const [notifs,setNotifsState]       = useState([]);
  const [wishlist,setWishlistState]   = useState([]);
  const [cart,setCart]                = useState([]);
  const [toasts,setToasts]            = useState([]);
  const [synced,setSynced]            = useState(false); // true once Firebase loaded

  const productsRef  = useRef([]);
  const ordersRef    = useRef([]);
  const currentUidRef= useRef(currentUserId);

  // ─── Seed Firebase products only once, never overwrite user's products ───
  const seedProductsIfEmpty = useCallback(async (prods) => {
    // Check if seed already done via a flag in Firestore
    try {
      const { getDoc, setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const flagRef = doc(db, '_meta', 'seeded');
      const flagSnap = await getDoc(flagRef);
      if (!flagSnap.exists()) {
        // First time ever — seed products
        for (const p of SEED) { await fsSaveProduct(p); }
        await setDoc(flagRef, { done: true, at: new Date().toISOString() });
      }
    } catch(e) { console.warn('Seed check failed', e); }
  }, []);

  // ─── Seed wishlist if empty ───
  const seedWishlistIfEmpty = useCallback(async (list) => {
    if (list.length === 0) {
      for (const w of DEFAULT_WISHLIST) { await fsSaveWishlistItem(w); }
    }
  }, []);

  // ─── Load packages + wishlist once (not realtime) ───
  useEffect(() => {
    fsGetPackages().then(pkgs => setPkgsState(pkgs)).catch(()=>{});
    fsGetWishlist().then(list => {
      if (list.length === 0) {
        seedWishlistIfEmpty([]);
        setWishlistState(DEFAULT_WISHLIST);
      } else {
        setWishlistState(list);
      }
    }).catch(()=>{});
  }, [seedWishlistIfEmpty]);

  // ─── Realtime listeners ───
  useEffect(() => {
    const unsubOrders = fsListenOrders(ords => {
      ordersRef.current = ords;
      setOrdsState(ords);
      setSynced(true);
    });
    const unsubProds = fsListenProducts(prods => {
      productsRef.current = prods;
      setProductsState(prods);
      if (prods.length === 0) {
        seedProductsIfEmpty(prods);
      }
    });
    return () => { unsubOrders(); unsubProds(); };
  }, [seedProductsIfEmpty]);

  // ─── Realtime notifs for current user ───
  useEffect(() => {
    const uid = currentUidRef.current;
    if (!uid) { setNotifsState([]); return; }
    const unsub = fsListenNotifs(uid, items => setNotifsState(items));
    return unsub;
  }, [currentUidRef.current]);

  // ─── Switch notifs when user logs in/out ───
  const switchNotifsUser = useCallback((userId) => {
    currentUidRef.current = userId;
    if (!userId) { setNotifsState([]); return; }
    const unsub = fsListenNotifs(userId, items => setNotifsState(items));
    return unsub;
  }, []);

  const toast = useCallback((msg, type='default') => {
    const id = Date.now();
    setToasts(t => [...t, {id,msg,type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const refresh = useCallback(() => {
    toast('🔄 Sincronizando con Firebase...', 'success');
  }, [toast]);

  // ─── Notifications ───
  const addNotif = useCallback((title, body) => {
    const uid = currentUidRef.current;
    if (!uid) return;
    fsAddNotif(uid, {title,body,read:false,time:'Ahora'}).catch(()=>{});
  }, []);

  const addNotifForUser = useCallback((userId, title, body) => {
    if (!userId) return;
    fsAddNotif(userId, {title,body,read:false,time:'Ahora'}).catch(()=>{});
  }, []);

  const markAllRead = useCallback(() => {
    const uid = currentUidRef.current;
    if (!uid) return;
    const unread = notifs.filter(n=>!n.read).map(n=>n.id);
    if (unread.length) fsMarkNotifsRead(uid, unread).catch(()=>{});
    setNotifsState(prev => prev.map(n=>({...n,read:true})));
  }, [notifs]);

  // ─── CART ───
  const addToCart = useCallback((product, qty=1, size=null) => {
    if (size !== null) {
      const av = product.sizes?.[size] ?? 0;
      const inC = cart.find(x=>x.id===product.id&&x.selectedSize===size)?.qty||0;
      if (inC+qty > av) { toast('Sin stock en talla '+size,'warn'); return; }
    }
    setCart(c => {
      const key = product.id+'_'+(size||'default');
      const ex = c.find(x=>x.cartKey===key);
      if (ex) return c.map(x=>x.cartKey===key?{...x,qty:x.qty+qty}:x);
      return [...c,{...product,qty,selectedSize:size,cartKey:key}];
    });
    toast('🛒 '+product.name+(size?' ('+size+')':'')+' agregado','success');
  }, [cart, toast]);
  const removeFromCart = useCallback((ck)=>setCart(c=>c.filter(x=>x.cartKey!==ck)),[]);
  const updateCartQty  = useCallback((ck,qty)=>{if(qty<1){removeFromCart(ck);return;}setCart(c=>c.map(x=>x.cartKey===ck?{...x,qty}:x));},[removeFromCart]);
  const clearCart = useCallback(()=>setCart([]),[]);

  // ─── ORDERS ───
  const placeMarketOrder = useCallback(async (cartItems, user, totalUSD) => {
    // Update stock
    const updated = productsRef.current.map(p => {
      const matching = cartItems.filter(x=>x.id===p.id);
      if (!matching.length) return p;
      const ns = {...(p.sizes||{})};
      matching.forEach(item=>{if(item.selectedSize&&ns[item.selectedSize]!==undefined)ns[item.selectedSize]=Math.max(0,ns[item.selectedSize]-item.qty);});
      return {...p,sizes:ns};
    });
    productsRef.current = updated;
    setProductsState(updated);
    for (const p of updated.filter((_,i)=>cartItems.some(x=>x.id===productsRef.current[i]?.id))) {
      await fsSaveProduct(p).catch(()=>{});
    }
    // Save order
    const order = {
      id:'ORD-'+Date.now().toString().slice(-6),
      type:'marketplace',
      userId:user?.id||'',
      userName:user?.name||'Cliente',
      userEmail:user?.email||'',
      userPhone:user?.phone||'',
      items:cartItems.map(x=>({name:x.name,qty:x.qty,priceUSD:x.priceUSD,size:x.selectedSize,image:x.images?.[0]||null,emoji:x.emoji})),
      totalUSD,
      status:'paid',
      notes:[],
      photos:[],
      createdAt:new Date().toISOString()
    };
    await fsAddOrder(order);
    addNotif('🛍️ Nueva venta', (user?.name||'Cliente')+' compró: '+cartItems.map(x=>x.name).join(', '));
    clearCart();
    return order;
  }, [addNotif, clearCart]);

  const addPackage = useCallback(async (pkg, user) => {
    const newPkg = {...pkg,userId:user?.id||'',userName:user?.name||'',userEmail:user?.email||'',notes:[],photos:[],createdAt:new Date().toISOString()};
    await fsAddPackage(newPkg).catch(()=>{});
    setPkgsState(prev=>[newPkg,...prev]);
    const order = {
      id:'PKG-'+Date.now().toString().slice(-6),
      type:'casillero',
      userId:user?.id||'',
      userName:user?.name||'Cliente',
      userEmail:user?.email||'',
      items:[{name:pkg.item,qty:1,priceUSD:pkg.price,image:null,emoji:'📦'}],
      totalUSD:pkg.price,
      status:'pending_arrival',
      trackingUSA:pkg.tracking||'',
      notes:[],
      photos:[],
      createdAt:new Date().toISOString()
    };
    await fsAddOrder(order);
    addNotif('📦 Nuevo pedido casillero', (user?.name||'Cliente')+' registró: '+pkg.item);
    toast('📦 Pedido '+pkg.id+' registrado','success');
  }, [addNotif, toast]);

  const updateOrderStatus = useCallback(async (orderId, newStatus, note, photoBase64) => {
    const order = ordersRef.current.find(o=>o.id===orderId);
    if (!order) return;
    const nn = note ? [...(order.notes||[]),{text:note,date:new Date().toISOString(),author:'Staff'}] : (order.notes||[]);
    const np = photoBase64 ? [...(order.photos||[]),photoBase64] : (order.photos||[]);
    const updates = {status:newStatus||order.status,notes:nn,photos:np};
    await fsUpdateOrder(orderId, updates);
    if (newStatus && order.userId) {
      const st = getStatus(newStatus, order.type);
      addNotifForUser(order.userId, `${st.icon} Pedido actualizado`, `${orderId}: ${st.label}`);
    }
    toast('✅ Orden actualizada','success');
  }, [addNotifForUser, toast]);

  const addNoteToOrder = useCallback(async (orderId, note, photoBase64) => {
    const order = ordersRef.current.find(o=>o.id===orderId);
    if (!order) return;
    const nn = note ? [...(order.notes||[]),{text:note,date:new Date().toISOString(),author:'Staff'}] : (order.notes||[]);
    const np = photoBase64 ? [...(order.photos||[]),photoBase64] : (order.photos||[]);
    await fsUpdateOrder(orderId, {notes:nn,photos:np});
  }, []);

  const cancelOrder = useCallback(async (orderId) => {
    await fsUpdateOrder(orderId, {status:'cancelled',cancelledAt:new Date().toISOString()});
    toast('Orden cancelada','warn');
  }, [toast]);

  const deleteOrder = useCallback(async (orderId) => {
    await fsDeleteOrder(orderId);
    toast('Orden eliminada');
  }, [toast]);

  // ─── PRODUCTS ───
  const addProduct = useCallback(async (p) => {
    const id = Date.now();
    // Compress images before saving to Firestore (max ~200KB each)
    let images = p.images || [];
    if (images.length > 0) {
      images = await Promise.all(images.map(img => compressImg(img)));
    }
    const newP = {...p, id, images, createdAt:new Date().toISOString()};
    await fsSaveProduct(newP);
    toast(p.status==='draft'?'💾 Borrador guardado':'✅ Producto publicado','success');
  }, [toast]);

  const updateProduct = useCallback(async (id, u) => {
    let updates = {...u};
    if (updates.images && updates.images.length > 0) {
      updates.images = await Promise.all(updates.images.map(img => compressImg(img)));
    }
    const updated = {...(productsRef.current.find(x=>x.id===id)||{}), ...updates};
    await fsSaveProduct(updated);
    toast(u.status==='draft'?'💾 Borrador guardado':'✅ Actualizado','success');
  }, [toast]);

  const deleteProduct = useCallback(async (id) => {
    await fsDeleteProduct(id);
    toast('Eliminado');
  }, [toast]);

  // ─── WISHLIST ───
  const addWishlistItem = useCallback(async (item) => {
    const newItem = {...item, id:'w'+Date.now(), requests:1, createdAt:new Date().toISOString()};
    await fsSaveWishlistItem(newItem);
    setWishlistState(prev=>[...prev,newItem]);
    toast('✅ Producto agregado','success');
  }, [toast]);

  const updateWishlistItem = useCallback(async (id, updates) => {
    const updated = {...(wishlist.find(x=>x.id===id)||{}), ...updates};
    await fsSaveWishlistItem(updated);
    setWishlistState(prev=>prev.map(x=>x.id===id?{...x,...updates}:x));
    toast('✅ Actualizado','success');
  }, [wishlist, toast]);

  const deleteWishlistItem = useCallback(async (id) => {
    await fsDeleteWishlistItem(id);
    setWishlistState(prev=>prev.filter(x=>x.id!==id));
    toast('Eliminado');
  }, [toast]);

  const requestWishlistItem = useCallback(async (id) => {
    const item = wishlist.find(x=>x.id===id);
    if (!item) return;
    const updated = {...item, requests:(item.requests||0)+1};
    await fsSaveWishlistItem(updated);
    setWishlistState(prev=>prev.map(x=>x.id===id?updated:x));
  }, [wishlist]);

  const unreadCount  = notifs.filter(n=>!n.read).length;
  const cartCount    = cart.reduce((s,x)=>s+x.qty,0);
  const cartTotalUSD = cart.reduce((s,x)=>s+x.priceUSD*x.qty,0);

  return (
    <Ctx.Provider value={{
      products,packages,orders,cart,toasts,notifs,unreadCount,cartCount,cartTotalUSD,
      wishlist,synced,
      toast,refresh,switchNotifsUser,fsSaveUser,
      addToCart,removeFromCart,updateCartQty,clearCart,
      placeMarketOrder,addPackage,updateOrderStatus,addNoteToOrder,
      cancelOrder,deleteOrder,
      addProduct,updateProduct,deleteProduct,
      addWishlistItem,updateWishlistItem,deleteWishlistItem,requestWishlistItem,
      markAllRead
    }}>
      {children}
    </Ctx.Provider>
  );
}
