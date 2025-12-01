import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut, 
  updateProfile,
  GoogleAuthProvider 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp, 
  deleteDoc 
} from 'firebase/firestore';
import { 
  BookOpen, CheckCircle, MessageSquare, Users, LogOut, Calendar, Send, Loader2, 
  PlusCircle, BarChart2, Edit3, Save, ChevronDown, Youtube, ScrollText, 
  ArrowRight, ExternalLink, Shield, ShieldAlert, ShieldCheck, Bell, X, 
  AlertTriangle, FileText, Link as LinkIcon, Clock, CheckSquare, Activity, Book,
  Flame, Award, Crown, Star, Medal, Zap, MessageCircle, AlertCircle, Lock, LockKeyhole
} from 'lucide-react';

// --- TUS CLAVES REALES DE FIREBASE (PRODUCCIÓN) ---
const firebaseConfig = {
  apiKey: "AIzaSyDa3r6IryXje6nfB7sOXl9vUDnKOd-liR4",
  authDomain: "teologiapaulinaapp.firebaseapp.com",
  projectId: "teologiapaulinaapp",
  storageBucket: "teologiapaulinaapp.firebasestorage.app",
  messagingSenderId: "515560837418",
  appId: "1:515560837418:web:cdbbf3e7c066445e958e53",
  measurementId: "G-6V68GQ5JTY"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const APP_ID = 'teologia-paulina-app';

// --- CONFIGURACIÓN DE IDENTIDAD ---
const LOGO_URL = "https://i.ibb.co/rD9fNMv/1764042450953.png";
const YOUTUBE_CHANNEL = "https://youtube.com/@teologiapaulina?si=5gwOAmgbXHh1hbgc";
const APP_URL = "https://teologia-paulina-app.vercel.app"; 

// --- LÓGICA DEL PLAN ANUAL (1 Ene - 31 Dic) ---
const getBiblePlanForDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00'); 
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    let book = "Génesis";
    let chapter = dayOfYear;

    if (dayOfYear > 50) { book = "Éxodo"; chapter = dayOfYear - 50; }
    if (dayOfYear > 90) { book = "Levítico"; chapter = dayOfYear - 90; }
    if (dayOfYear > 117) { book = "Números"; chapter = dayOfYear - 117; }
    if (dayOfYear > 153) { book = "Deuteronomio"; chapter = dayOfYear - 153; }
    if (dayOfYear > 187) { book = "Josué"; chapter = dayOfYear - 187; }
    if (dayOfYear > 211) { book = "Jueces"; chapter = dayOfYear - 211; }
    if (dayOfYear > 232) { book = "Rut"; chapter = dayOfYear - 232; }
    if (dayOfYear > 236) { book = "Mateo"; chapter = dayOfYear - 236; }
    if (dayOfYear > 264) { book = "Marcos"; chapter = dayOfYear - 264; }
    if (dayOfYear > 280) { book = "Lucas"; chapter = dayOfYear - 280; }
    if (dayOfYear > 304) { book = "Juan"; chapter = dayOfYear - 304; }
    if (dayOfYear > 325) { book = "Hechos"; chapter = dayOfYear - 325; }
    if (dayOfYear > 353) { book = "Romanos"; chapter = dayOfYear - 353; }
    
    if (chapter <= 0) chapter = 1;

    return {
        id: `plan_${date.getFullYear()}_${dayOfYear}`, 
        date: dateStr,
        dayOfYear: dayOfYear,
        type: 'bible_plan',
        title: `Día ${dayOfYear} del Plan Anual`,
        scripture: `${book} ${chapter}`,
        isPlan: true
    };
};

// --- Configuración de Insignias ---
const BADGES = [
  { days: 7, label: "1 Semana", icon: Star, color: "text-yellow-500", bg: "bg-yellow-100" },
  { days: 30, label: "1 Mes", icon: Medal, color: "text-blue-500", bg: "bg-blue-100" },
  { days: 90, label: "3 Meses", icon: Shield, color: "text-indigo-500", bg: "bg-indigo-100" },
  { days: 180, label: "6 Meses", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-100" },
  { days: 270, label: "9 Meses", icon: Award, color: "text-pink-500", bg: "bg-pink-100" },
  { days: 365, label: "1 Año", icon: Crown, color: "text-amber-500", bg: "bg-amber-100" },
];

// --- Funciones Auxiliares ---
const getLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- Componentes UI ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 shadow-md",
    google: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm font-bold",
    secondary: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    ghost: "text-sky-600 hover:bg-sky-50 bg-transparent"
  };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>{children}</div>
);

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    blue: 'bg-sky-50 text-sky-700 border border-sky-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    red: 'bg-red-50 text-red-600 border border-red-100',
    purple: 'bg-purple-50 text-purple-600 border border-purple-100',
    gray: 'bg-gray-50 text-gray-600 border border-gray-100'
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${colors[color]}`}>{children}</span>
};

// --- App Principal ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('loading'); 
  const [activeTab, setActiveTab] = useState('reading'); 
  const [notification, setNotification] = useState(null);

  // Datos
  const [planReadings, setPlanReadings] = useState([]); 
  const [extraReadings, setExtraReadings] = useState([]); 
  const [adminComments, setAdminComments] = useState({}); 
  
  const [allUsers, setAllUsers] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]); 
  const [completionsMap, setCompletionsMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  
  // Gamificación
  const [streak, setStreak] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedPlanIds, setCompletedPlanIds] = useState(new Set()); 

  // Estado de UI
  const [userFilter, setUserFilter] = useState('pending'); 
  const [statsMode, setStatsMode] = useState('byUser'); 
  const [expandedStatItem, setExpandedStatItem] = useState(null);
  const [currentDateView, setCurrentDateView] = useState(getLocalDate()); 

  // Inputs
  const [commentText, setCommentText] = useState('');
  const [newExtraReading, setNewExtraReading] = useState({ 
    title: '', externalLink: '', externalContent: '' 
  });
  const [adminCommentText, setAdminCommentText] = useState('');
  const [activeReadingIdForComment, setActiveReadingIdForComment] = useState(null);
  const [loginName, setLoginName] = useState('');

  // 1. Inicializar Auth
  useEffect(() => {
    if (!document.querySelector('#tailwind-cdn')) {
        const script = document.createElement('script');
        script.id = 'tailwind-cdn';
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setView('login');
        setLoading(false);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Perfil
  useEffect(() => {
    if (!user) return;
    if (userData && userData.uid === user.uid) { setLoading(false); return; }

    const userRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            if (!data.isApproved) setView('pending');
            else setView(data.role === 'admin' ? 'admin' : 'dashboard');
        } else {
            setUserData(null);
        }
        setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user]);

  // --- GENERACIÓN DE PLAN Y EXTRAS ---
  useEffect(() => {
      if (!userData?.isApproved) return;

      // A. Plan Anual (1 Ene - Hoy + 7 dias)
      const readings = [];
      const today = new Date();
      const startDate = new Date(today.getFullYear(), 0, 1); 
      const endDate = new Date(today); 
      endDate.setDate(today.getDate() + 7); 
      
      let loopDate = new Date(startDate);
      while (loopDate <= endDate) {
          const dStr = loopDate.toISOString().split('T')[0];
          readings.push(getBiblePlanForDate(dStr));
          loopDate.setDate(loopDate.getDate() + 1);
      }
      setPlanReadings(readings.reverse()); 

      // B. Extras y Comentarios Pastorales
      const q = query(collection(db, 'artifacts', APP_ID, 'readings'));
      const unsubExtras = onSnapshot(q, (snapshot) => {
          const extras = [];
          const comments = {};
          
          snapshot.docs.forEach(doc => {
              const d = doc.data();
              if (d.type === 'bible_plan_annotation') {
                  comments[d.date] = d.observation; 
              } else {
                  extras.push({id: doc.id, ...d}); 
              }
          });
          
          setExtraReadings(extras);
          setAdminComments(comments);
      });

      return () => unsubExtras();
  }, [userData]);

  // --- PROGRESO USUARIO ---
  useEffect(() => {
      if (!userData?.uid) return;
      
      const q = query(collection(db, 'artifacts', APP_ID, 'completions'), where('userId', '==', userData.uid));
      return onSnapshot(q, (snapshot) => {
          const map = {};
          const doneIds = new Set();
          let planCompletedCount = 0;
          
          snapshot.docs.forEach(doc => {
              const data = doc.data();
              map[data.readingId] = true;
              doneIds.add(data.readingId);
              if (data.readingId.startsWith('plan_')) planCompletedCount++;
          });
          
          setCompletionsMap(map);
          setCompletedPlanIds(doneIds);

          // Progreso (365 días)
          const percent = Math.min(100, Math.round((planCompletedCount / 365) * 100));
          setProgressPercent(percent);
          setStreak(planCompletedCount); 
      });
  }, [userData]);

  // --- COMENTARIOS ---
  useEffect(() => {
    if (!userData?.isApproved) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'comments'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const newMap = {};
        snapshot.docs.forEach(doc => {
            const d = doc.data();
            if (!newMap[d.readingId]) newMap[d.readingId] = [];
            newMap[d.readingId].push({id: doc.id, ...d});
        });
        setCommentsMap(newMap);
    }, () => {}); 
  }, [userData]);

  // Admin: Usuarios
  useEffect(() => {
    if (userData?.role !== 'admin') return;
    const unsubUsers = onSnapshot(collection(db, 'artifacts', APP_ID, 'users'), s => setAllUsers(s.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubStats = onSnapshot(collection(db, 'artifacts', APP_ID, 'completions'), s => setAllCompletions(s.docs.map(d => d.data())));
    return () => { unsubUsers(); unsubStats(); };
  }, [userData]);

  // --- LÓGICA DE BLOQUEO SECUENCIAL ---
  const isLocked = (dateStr) => {
      const today = getLocalDate();
      if (dateStr > today) return true;
      
      const d = new Date(dateStr + 'T12:00:00');
      if (d.getDate() === 1 && d.getMonth() === 0) return false;

      d.setDate(d.getDate() - 1);
      const prevDateStr = d.toISOString().split('T')[0];
      const prevPlanId = getBiblePlanForDate(prevDateStr).id;

      return !completedPlanIds.has(prevPlanId);
  };

  // --- ACCIONES ---

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await checkAndCreateProfile(result.user, result.user.displayName);
    } catch (e) { alert("Error login"); setLoading(false); }
  };

  const checkAndCreateProfile = async (user, name) => {
    const userRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            const usersSnap = await getDocs(collection(db, 'artifacts', APP_ID, 'users'));
            const isFirst = usersSnap.empty;
            const newProfile = {
                uid: user.uid, displayName: name,
                email: user.email, photoURL: user.photoURL,
                role: isFirst ? 'admin' : 'user',
                isApproved: isFirst, createdAt: serverTimestamp()
            };
            await setDoc(userRef, newProfile);
            setUserData(newProfile);
            if(!isFirst) setView('pending');
            else setView('admin');
        }
    } catch (e) {}
  };

  const handleLogout = async () => {
      await signOut(auth);
      window.location.reload();
  };

  const toggleCompletion = async (readingId, date) => {
      const isComplete = completionsMap[readingId];
      
      if (readingId.startsWith('plan_') && !isComplete && isLocked(date)) {
          alert("Debes completar la lectura del día anterior primero.");
          return;
      }

      if (!confirm(isComplete ? "¿Desmarcar esta lectura?" : "Confirmar lectura completada")) return;

      const id = `${userData.uid}_${readingId}`;
      const ref = doc(db, 'artifacts', APP_ID, 'completions', id);
      if (isComplete) await deleteDoc(ref);
      else await setDoc(ref, { userId: userData.uid, userName: userData.displayName, readingId, date, completedAt: serverTimestamp() });
  };

  const saveAdminComment = async () => {
      const docId = `plan_annotation_${currentDateView}`;
      await setDoc(doc(db, 'artifacts', APP_ID, 'readings', docId), {
          type: 'bible_plan_annotation',
          date: currentDateView,
          observation: adminCommentText,
          updatedAt: serverTimestamp()
      });
      alert("Reflexión pastoral guardada para el día " + currentDateView);
  };

  const createExtraReading = async (e) => {
      e.preventDefault();
      await addDoc(collection(db, 'artifacts', APP_ID, 'readings'), {
          ...newExtraReading,
          type: 'external',
          date: currentDateView, 
          createdAt: serverTimestamp()
      });
      setNewExtraReading({title: '', externalLink: '', externalContent: ''});
      
      if(confirm("Material Extra publicado. ¿Enviar notificación por WhatsApp?")) {
          const title = newExtraReading.title || 'Nuevo Material Extra';
          const link = APP_URL;
          const msg = `*Teología Paulina* 🕊️\n\nSe ha añadido material extra para hoy:\n"${title}"\n\n🔗 Ver aquí: ${link}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      }
  };

  const postComment = async (e, readingId) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      await addDoc(collection(db, 'artifacts', APP_ID, 'comments'), {
          text: commentText, readingId, userId: userData.uid, userName: userData.displayName, userPhoto: userData.photoURL, createdAt: serverTimestamp()
      });
      setCommentText('');
  };

  const deleteReading = async (id) => {
      if(confirm('¿Borrar este material extra?')) await deleteDoc(doc(db, 'artifacts', APP_ID, 'readings', id));
  };

  const updateUserStatus = async (uid, field, value) => {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid), { [field]: value });
  };

  const debugCompletePrevious = async () => {
      if (!confirm("DEBUG: Marcar como leído todo hasta ayer?")) return;
      const today = new Date();
      const startDate = new Date(today.getFullYear(), 0, 1);
      
      let loopDate = new Date(startDate);
      while (loopDate < today) {
          const dStr = loopDate.toISOString().split('T')[0];
          if (dStr === getLocalDate()) break;
          const plan = getBiblePlanForDate(dStr);
          const id = `${userData.uid}_${plan.id}`;
          if (!completionsMap[plan.id]) {
             await setDoc(doc(db, 'artifacts', APP_ID, 'completions', id), { 
                 userId: userData.uid, readingId: plan.id, date: dStr, completedAt: serverTimestamp() 
             });
          }
          loopDate.setDate(loopDate.getDate() + 1);
      }
      alert("Historial rellenado.");
  };

  const getGroupedReadings = (filter) => {
      const filtered = planReadings.filter(r => {
          const isCompleted = completionsMap[r.id];
          if (filter === 'pending' && isCompleted) return;
          if (filter === 'completed' && !isCompleted) return;
          
          if (!r.grouped) r.grouped = {}; 
          return true;
      });
      
      const groups = {};
      filtered.forEach(r => {
          if (!groups[r.date]) groups[r.date] = [];
          groups[r.date].push(r);
      });
      return groups;
  };
  
  useEffect(() => {
    if (userData?.role !== 'admin') return;
    setAdminCommentText(adminComments[currentDateView] || '');
  }, [currentDateView, adminComments]);

  // --- RENDERS ---

  if (loading) return <div className="h-screen flex items-center justify-center bg-sky-50"><Loader2 className="animate-spin text-sky-600" size={48}/></div>;

  if (view === 'login') return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-none shadow-2xl text-center">
        <img src={LOGO_URL} className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-2 object-contain"/>
        <h1 className="text-2xl font-bold text-slate-800 font-serif">Teología Paulina</h1>
        <p className="text-sky-600 font-bold uppercase text-xs mt-2 mb-6">Plan Anual de Lectura</p>
        <Button onClick={handleGoogleLogin} variant="google" className="w-full py-3 flex justify-center gap-2">
            <span className="font-bold">Entrar con Google</span>
        </Button>
      </Card>
    </div>
  );

  if (view === 'pending') return (
    <div className="h-screen flex items-center justify-center bg-sky-50">
        <Card className="p-8 text-center">
            <h2 className="text-xl font-bold">Esperando Aprobación</h2>
            <Button onClick={()=>window.location.reload()} className="mt-4" variant="secondary">Recargar</Button>
        </Card>
    </div>
  );

  const Header = () => (
      <header className="bg-white border-b sticky top-0 z-20 px-4 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-800"><img src={LOGO_URL} className="w-8 h-8"/> <span className="hidden sm:inline">Teología Paulina</span></div>
          <div className="flex gap-3 items-center">
              <div className="hidden md:flex flex-col items-end mr-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Progreso Anual</div>
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{width: `${progressPercent}%`}}></div></div>
              </div>
              <a href={YOUTUBE_CHANNEL} target="_blank" className="text-red-600"><Youtube/></a>
              {userData?.role === 'admin' && <button onClick={()=>setView(view==='admin'?'dashboard':'admin')} className="text-xs bg-slate-100 px-3 py-1 rounded">{view==='admin'?'Ver App':'Ver Admin'}</button>}
              <img src={userData?.photoURL} className="w-8 h-8 rounded-full"/>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500"><LogOut size={20}/></button>
          </div>
      </header>
  );

  if (view === 'admin') return (
      <div className="min-h-screen bg-sky-50 pb-20">
          <Header/>
          <main className="max-w-5xl mx-auto p-4">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Panel Pastoral</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 h-fit">
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Calendar size={18}/> Plan Diario (Automático)</h3>
                      <div className="bg-sky-50 p-4 rounded-lg border border-sky-100 mb-4">
                          <label className="text-xs font-bold text-sky-600 uppercase block mb-1">Seleccionar Fecha</label>
                          <input type="date" className="w-full p-2 border rounded text-sm bg-white" value={currentDateView} onChange={e=>setCurrentDateView(e.target.value)}/>
                      </div>
                      
                      <div className="mb-4">
                          <div className="text-xs text-slate-400 uppercase font-bold">Lectura Asignada:</div>
                          <div className="text-xl font-serif font-bold text-slate-800">{getBiblePlanForDate(currentDateView).scripture}</div>
                      </div>

                      <textarea 
                        className="w-full p-3 border rounded h-32 text-sm focus:ring-2 focus:ring-sky-500 outline-none" 
                        placeholder="Escribe aquí la reflexión pastoral para este día..."
                        value={adminCommentText}
                        onChange={e => setAdminCommentText(e.target.value)}
                      />
                      <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-slate-400">{adminComments[currentDateView] ? 'Guardado' : 'Pendiente'}</span>
                          <Button onClick={saveAdminComment}>Guardar Reflexión</Button>
                      </div>
                  </Card>

                  <Card className="p-6 h-fit">
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><FileText size={18}/> Material Extra (Opcional)</h3>
                      <p className="text-xs text-slate-500 mb-4">Agrega videos o documentos para el: <b>{currentDateView}</b></p>
                      <div className="space-y-3">
                          <input className="w-full p-2 border rounded text-sm" placeholder="Título" value={newExtraReading.title} onChange={e=>setNewExtraReading({...newExtraReading, title:e.target.value})}/>
                          <input className="w-full p-2 border rounded text-sm" placeholder="Enlace (YouTube/PDF)" value={newExtraReading.externalLink} onChange={e=>setNewExtraReading({...newExtraReading, externalLink:e.target.value})}/>
                          <textarea className="w-full p-2 border rounded text-sm" placeholder="Descripción" value={newExtraReading.externalContent} onChange={e=>setNewExtraReading({...newExtraReading, externalContent:e.target.value})}/>
                          <Button onClick={createExtraReading} variant="secondary" className="w-full">Publicar Extra</Button>
                      </div>

                      <div className="mt-8 pt-4 border-t border-dashed border-slate-200">
                          <p className="text-[10px] text-red-400 font-bold uppercase mb-2">Zona de Pruebas</p>
                          <button onClick={debugCompletePrevious} className="text-xs bg-red-50 text-red-600 w-full py-2 rounded border border-red-100 hover:bg-red-100">🛠️ Simular usuario al día (Debug)</button>
                      </div>
                  </Card>
              </div>

              <div className="mt-8">
                  <h3 className="font-bold text-slate-700 mb-4">Usuarios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {allUsers.map(u => (
                          <Card key={u.id} className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                  <img src={u.photoURL} className="w-6 h-6 rounded-full"/>
                                  <span className="font-bold text-slate-700 truncate max-w-[100px]">{u.displayName}</span>
                              </div>
                              <div className="flex gap-1">
                                  <button onClick={()=>toggleUserStatus(u.id, 'isApproved', !u.isApproved)} className={`px-2 py-1 text-[10px] border rounded ${u.isApproved?'bg-emerald-50 text-emerald-600':'bg-slate-100'}`}>{u.isApproved?'Aprobado':'Aprobar'}</button>
                                  <button onClick={()=>toggleUserStatus(u.id, 'role', u.role==='admin'?'user':'admin')} className="px-2 py-1 text-[10px] border rounded text-amber-600">{u.role==='admin'?'Bajar':'Admin'}</button>
                              </div>
                          </Card>
                      ))}
                  </div>
              </div>
          </main>
      </div>
  );

  const groupedReadings = getGroupedReadings(userFilter);
  const sortedDates = Object.keys(groupedReadings).sort().reverse();

  return (
      <div className="min-h-screen bg-sky-50 pb-20">
          <Header/>
          <main className="max-w-3xl mx-auto p-4 space-y-6">
              <Card className="p-4 mb-6 bg-gradient-to-r from-sky-600 to-blue-600 text-white border-none shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold font-serif text-lg flex items-center gap-2"><Activity size={20}/> Mis Logros</h3>
                      <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Flame size={14}/> {streak} días racha</div>
                  </div>
                  <div className="grid grid-cols-6 gap-2 text-center">
                      {BADGES.map((badge, idx) => {
                          const isUnlocked = streak >= badge.days;
                          const Icon = badge.icon;
                          return (
                              <div key={idx} className={`flex flex-col items-center p-1 rounded-lg transition-all ${isUnlocked ? 'bg-white/10 opacity-100 scale-105' : 'opacity-40 grayscale'}`}>
                                  <div className={`p-1.5 rounded-full mb-1 bg-white ${badge.color}`}><Icon size={16} /></div>
                                  <span className="text-[9px] font-bold leading-tight">{badge.label}</span>
                              </div>
                          )
                      })}
                  </div>
              </Card>

              <div className="flex p-1 bg-slate-200 rounded-lg">
                  <button onClick={()=>setUserFilter('pending')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='pending'?'bg-white text-sky-600 shadow-sm':'text-slate-500'}`}>Pendientes</button>
                  <button onClick={()=>setUserFilter('completed')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='completed'?'bg-white text-emerald-600 shadow-sm':'text-slate-500'}`}>Completadas</button>
              </div>

              {sortedDates.length === 0 ? (
                  <div className="text-center p-12 text-slate-400 bg-white rounded-xl border border-slate-100">
                      <CheckSquare size={48} className="mx-auto mb-4 text-sky-200"/>
                      <p>No hay lecturas {userFilter === 'pending' ? 'pendientes' : 'completadas'}.</p>
                  </div>
              ) : (
                  sortedDates.map(date => {
                      const isLockedDay = isLocked(date);
                      const isToday = date === getLocalDate();
                      const dayExtras = extraReadings.filter(e => e.date === date);

                      return (
                      <div key={date} className={`space-y-4 relative pl-4 ${isLockedDay ? 'opacity-60' : ''}`}>
                           <div className="absolute left-0 top-2 bottom-0 w-0.5 bg-slate-200"></div>
                           <div className={`absolute left-[-4px] top-3 w-2.5 h-2.5 rounded-full ${isToday ? 'bg-sky-500 ring-4 ring-sky-100' : 'bg-slate-300'}`}></div>

                          <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-wider">
                              {isToday ? 'Hoy' : new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                              {isLockedDay && <Lock size={14}/>}
                          </div>

                          {groupedReadings[date].map(r => {
                              const isRead = completionsMap[r.id];
                              const comments = commentsMap[r.id] || [];
                              const showComments = activeReadingIdForComment === r.id;
                              const pastoralComment = adminComments[r.date];

                              return (
                                  <div key={r.id}>
                                      <Card className="overflow-hidden">
                                          <div className="p-5">
                                              <div className="flex justify-between items-start">
                                                  <div>
                                                      <h3 className="text-xl font-serif font-bold text-slate-800">{r.scripture}</h3>
                                                      <span className="text-xs font-bold text-sky-500 uppercase tracking-widest">Plan Anual</span>
                                                  </div>
                                                  {isRead && <CheckCircle className="text-emerald-500" size={24}/>}
                                              </div>

                                              {pastoralComment && (
                                                  <div className="mt-4 bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                                                      <div className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1"><Crown size={12}/> Reflexión Pastoral</div>
                                                      <p className="text-sm text-slate-700 italic">"{pastoralComment}"</p>
                                                  </div>
                                              )}

                                              {!isLockedDay ? (
                                                  <button 
                                                      onClick={() => toggleCompletion(r.id, r.date)}
                                                      className={`mt-4 w-full py-2.5 rounded-lg font-bold text-sm border transition-colors ${isRead ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'}`}
                                                  >
                                                      {isRead ? 'Lectura Completada' : 'Marcar como Leído'}
                                                  </button>
                                              ) : (
                                                  <div className="mt-4 bg-slate-100 text-slate-500 text-center py-2 rounded text-xs flex items-center justify-center gap-2">
                                                      <LockKeyhole size={14}/> 
                                                      {date > getLocalDate() ? 'Disponible en el futuro' : 'Completa los días anteriores primero'}
                                                  </div>
                                              )}
                                          </div>

                                          {!isLockedDay && (
                                            <div className="bg-slate-50 border-t p-2">
                                                <button onClick={() => setActiveReadingIdForComment(showComments ? null : r.id)} className="w-full text-left text-xs font-bold text-slate-500 hover:text-sky-600 flex items-center justify-center gap-2 py-2">
                                                    <MessageSquare size={16}/> {comments.length > 0 ? `Ver ${comments.length} comentarios` : 'Comentar'}
                                                </button>
                                                {showComments && (
                                                    <div className="p-3 border-t border-slate-200 animate-in slide-in-from-top-2">
                                                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                                                            {comments.map(c => (
                                                                <div key={c.id} className="bg-white p-2 rounded border text-xs">
                                                                    <span className="font-bold text-slate-700 block">{c.userName}</span>
                                                                    <span className="text-slate-600">{c.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <form onSubmit={e=>postComment(e,r.id)} className="flex gap-2">
                                                            <input className="flex-1 p-2 border rounded text-sm" placeholder="Escribe..." value={commentText} onChange={e=>setCommentText(e.target.value)}/>
                                                            <button type="submit" disabled={!commentText.trim()} className="text-sky-500"><Send size={16}/></button>
                                                        </form>
                                                    </div>
                                                )}
                                            </div>
                                          )}
                                      </Card>
                                      
                                      {/* EXTRAS */}
                                      {dayExtras.map(extra => (
                                          <Card key={extra.id} className="mt-4 border-l-4 border-purple-500 bg-purple-50/30">
                                              <div className="p-4">
                                                  <div className="flex gap-2 items-center mb-2">
                                                      <Badge color="amber">EXTRA</Badge>
                                                      <h4 className="font-bold text-slate-700 text-sm">{extra.title}</h4>
                                                  </div>
                                                  {extra.externalContent && <p className="text-xs text-slate-600 mb-2">{extra.externalContent}</p>}
                                                  {extra.externalLink && <a href={extra.externalLink} target="_blank" className="text-xs flex items-center gap-1 text-purple-600 font-bold hover:underline"><LinkIcon size={12}/> Ver Recurso</a>}
                                              </div>
                                          </Card>
                                      ))}
                                  </div>
                              );
                          })}
                      </div>
                  ))
              )}
          </main>
      </div>
  );
}