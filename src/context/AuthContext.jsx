import React,{createContext,useContext,useState,useCallback,useEffect} from 'react';
import { fsSaveUser, fsGetUsers } from '../services/firebaseService';
import { useApp } from './AppContext';
const Ctx=createContext(null);
export const useAuth=()=>useContext(Ctx);
const ADMIN_EMAIL='gomezdaniele14@gmail.com';
const WORKER_EMAIL='gomezdaniele144@gmail.com';
const genSuite=()=>'MNG-'+(1000+Math.floor(Math.random()*9000));
const genOTP=()=>String(Math.floor(100000+Math.random()*900000));
const SEEDS=[
  {id:'admin-001',name:'Daniel Admin',email:ADMIN_EMAIL,password:'Loollool144+',role:'admin',phone:'+57 3001234567',country:'Colombia',address:'',suite:'MNG-0001',avatar:'DA',avatarImg:null,createdAt:new Date(Date.now()-60*864e5).toISOString()},
  {id:'worker-001',name:'Trabajador MANGOO',email:WORKER_EMAIL,password:'Loollool144+',role:'worker',phone:'+57 3009876543',country:'Colombia',address:'',suite:'MNG-0002',avatar:'WK',avatarImg:null,createdAt:new Date(Date.now()-30*864e5).toISOString()},
];

async function compressImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 80;
      const ratio = Math.min(MAX/img.width, MAX/img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

function safeLsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch(e) {
    if (e.name==='QuotaExceededError') {
      try {
        const stripped = Array.isArray(val)
          ? val.map(u=>({...u,avatarImg:null}))
          : (val&&typeof val==='object' ? {...val,avatarImg:null} : val);
        localStorage.setItem(key, JSON.stringify(stripped));
      } catch {}
    }
  }
}

function loadLocalUsers() {
  try{const s=JSON.parse(localStorage.getItem('mg9_users')||'[]');const ids=s.map(u=>u.id);return[...SEEDS.filter(x=>!ids.includes(x.id)),...s];}catch{return[...SEEDS];}
}

function mergeUsers(firestoreUsers) {
  const ids = firestoreUsers.map(u=>u.id);
  return [...SEEDS.filter(x=>!ids.includes(x.id)), ...firestoreUsers];
}

export function AuthProvider({children}){
  const { switchNotifsUser } = useApp();
  const [users,setUsersState]=useState(loadLocalUsers);
  const [me,setMe]=useState(()=>{try{return JSON.parse(localStorage.getItem('mg9_me')||'null');}catch{return null;}});
  const [err,setErr]=useState('');
  const [loading,setLd]=useState(false);
  const [pendingOTP,setPending]=useState(null);

  // ─── FIX: Cargar usuarios reales desde Firestore ───
  useEffect(() => {
    fsGetUsers()
      .then(firestoreUsers => {
        if (firestoreUsers.length > 0) {
          const merged = mergeUsers(firestoreUsers);
          setUsersState(merged);
          const nonSeeds = firestoreUsers.filter(x=>!SEEDS.find(s=>s.id===x.id));
          safeLsSet('mg9_users', nonSeeds);
        }
      })
      .catch(e => console.warn('No se pudo cargar usuarios de Firestore:', e));
  }, []);

  const saveUsers=(u)=>{const nonSeeds=u.filter(x=>!SEEDS.find(s=>s.id===x.id));safeLsSet('mg9_users',nonSeeds);setUsersState(u);};
  const persist=(u,c)=>{saveUsers(u);safeLsSet('mg9_me',c);};

  const register=async(data)=>{
    setLd(true);setErr('');await new Promise(r=>setTimeout(r,800));
    if(users.find(u=>u.email.toLowerCase()===data.email.toLowerCase())){setErr('Ya existe una cuenta con ese correo.');setLd(false);return'error';}
    if(data.password.length<6){setErr('Mínimo 6 caracteres.');setLd(false);return'error';}
    const code=genOTP();
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service_id:'service_rh3qy2q',template_id:'template_dz2ie3p',user_id:'jw6SXq4sLAgL5PrDP',template_params:{to_email:data.email,email:data.email,to_name:data.name,passcode:code,app_name:'MANGOO',time:new Date().toLocaleTimeString('es')}})});
      if(!res.ok) throw new Error('EmailJS status: '+res.status);
    } catch(e) {
      console.error('EmailJS error:', e);
      console.log('%c🔑 OTP fallback: '+code,'color:orange;font-size:20px;font-weight:bold');
    }
    setPending({code,userData:data,sentTo:data.email});setLd(false);return'otp';
  };

  const resendOTP=async()=>{
    if(!pendingOTP)return;
    const code=genOTP();
    const d=pendingOTP.userData;
    try {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service_id:'service_rh3qy2q',template_id:'template_dz2ie3p',user_id:'jw6SXq4sLAgL5PrDP',template_params:{to_email:d.email,email:d.email,to_name:d.name,passcode:code,app_name:'MANGOO',time:new Date().toLocaleTimeString('es')}})});
      if(!res.ok) throw new Error('EmailJS status: '+res.status);
    } catch(e) { console.error('EmailJS resend error:', e); console.log('%c🔑 OTP RESEND: '+code,'color:orange;font-size:20px;font-weight:bold'); }
    setPending(prev=>({...prev,code}));
  };

  const resetPassword=async(email)=>{
    await new Promise(r=>setTimeout(r,900));
    const user=users.find(u=>u.email.toLowerCase()===email.toLowerCase());
    const resetCode=genOTP();
    if(user){
      try { await fetch('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({service_id:'service_rh3qy2q',template_id:'template_dz2ie3p',user_id:'jw6SXq4sLAgL5PrDP',template_params:{to_email:email,email:email,to_name:user.name||'Usuario',passcode:resetCode,app_name:'MANGOO - Recuperacion de contrasena',time:new Date().toLocaleTimeString('es')}})}); }
      catch(e) { console.log('%c🔑 RESET CODE: '+resetCode,'color:purple;font-size:20px;font-weight:bold'); }
      return{ok:true,resetCode,userId:user.id};
    }
    return{ok:true};
  };

  const confirmReset=async(userId,newPassword)=>{
    const updated=users.map(u=>u.id===userId?{...u,password:newPassword}:u);
    saveUsers(updated);
    if(me?.id===userId){const u={...me,password:newPassword};setMe(u);safeLsSet('mg9_me',u);}
    return{ok:true};
  };

  const confirmOTP=async(entered)=>{
    if(!pendingOTP)return false;
    if(entered!==pendingOTP.code){setErr('Código incorrecto.');return false;}
    const d=pendingOTP.userData;
    const newUser={id:Date.now().toString(),name:d.name,email:d.email,password:d.password,phone:d.phone||'',country:d.country||'Colombia',address:d.address||'',suite:genSuite(),avatar:d.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2),avatarImg:null,createdAt:new Date().toISOString(),role:'buyer'};
    const updated=[...users,newUser];
    setMe(newUser);
    persist(updated,newUser);
    setPending(null);
    // GUARDAR EN FIRESTORE para que sea visible en todos los dispositivos
    fsSaveUser(newUser).catch(e=>console.warn('Error guardando usuario en Firestore:', e));
    switchNotifsUser(newUser.id);
    return true;
  };

  const login=async({email,password})=>{
    setLd(true);setErr('');await new Promise(r=>setTimeout(r,700));
    const user=users.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===password);
    if(!user){setErr('Correo o contraseña incorrectos.');setLd(false);return false;}
    if(user.disabled){setErr('Esta cuenta ha sido desactivada. Contacta al administrador.');setLd(false);return false;}
    setMe(user);
    safeLsSet('mg9_me',user);
    setLd(false);
    fsSaveUser(user).catch(()=>{});
    switchNotifsUser(user.id);
    return true;
  };

  const logout=useCallback(()=>{
    setMe(null);
    localStorage.removeItem('mg9_me');
    switchNotifsUser(null);
  },[switchNotifsUser]);

  const updateProfile=async(updates)=>{
    let finalUpdates={...updates};
    if(updates.avatarImg&&updates.avatarImg.length>5000){
      const compressed=await compressImage(updates.avatarImg);
      finalUpdates={...finalUpdates,avatarImg:compressed};
    }
    const u={...me,...finalUpdates};
    const us=users.map(x=>x.id===me.id?u:x);
    setMe(u);persist(us,u);
    fsSaveUser(u).catch(()=>{});
  };

  const createWorker = async (data) => {
    if (users.find(u=>u.email.toLowerCase()===data.email.toLowerCase())) {
      return { ok:false, error:'Ya existe una cuenta con ese correo.' };
    }
    const newWorker = {
      id: 'worker-' + Date.now(),
      name: data.name,
      email: data.email,
      password: data.password || 'Mangoo2024!',
      phone: data.phone || '',
      country: 'Colombia',
      address: '',
      suite: genSuite(),
      avatar: (data.name||'W').split(' ').filter(Boolean).map(w=>w[0]).join('').toUpperCase().slice(0,2)||'W',
      avatarImg: null,
      createdAt: new Date().toISOString(),
      role: 'worker',
      permissions: data.permissions || {orders:true,products:true,data:false,analytics:false,financial:false,manipulation:false},
    };
    const updated = [...users, newWorker];
    saveUsers(updated);
    setUsersState(updated);
    fsSaveUser(newWorker).catch(e=>console.warn('Error guardando worker en Firestore:', e));
    return { ok:true, worker: newWorker };
  };

  const deleteWorker = (workerId) => {
    const updated = users.filter(u => u.id !== workerId);
    saveUsers(updated);
    setUsersState(updated);
  };

  const isAdmin=me?.role==='admin';
  const isWorker=me?.role==='worker'||me?.role==='admin';
  const isBuyer=me?.role==='buyer';
  const clearOTP=()=>{setPending(null);setErr('');};

  const deleteUser=(id)=>{
    const updated=users.filter(u=>u.id!==id);
    saveUsers(updated);
    if(me?.id===id){setMe(null);safeLsSet('mg9_me',null);}
  };

  const updateUserAccess=(id,changes)=>{
    const updated=users.map(u=>u.id===id?{...u,...changes}:u);
    saveUsers(updated);
    if(me?.id===id){const u={...me,...changes};setMe(u);safeLsSet('mg9_me',u);}
  };
  return(<Ctx.Provider value={{me,users,err,loading,pendingOTP,setErr,clearOTP,register,confirmOTP,resendOTP,resetPassword,confirmReset,login,logout,updateProfile,isAdmin,isWorker,isBuyer,createWorker,deleteWorker,deleteUser,updateUserAccess}}>{children}</Ctx.Provider>);
}
