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
  Flame, Award, Crown, Star, Medal, Zap, MessageCircle, AlertCircle, Lock, ChevronRight
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

// --- GENERADOR DE PLAN DE LECTURA (SIMULADO PARA DEMO) ---
// En una app real, esto sería un JSON completo de 365 días.
// Aquí generamos una estructura predecible basada en el día del año.
const getBiblePlanForDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Lógica simple de ejemplo: Génesis dura 50 días, luego Éxodo, etc.
    // Esto asegura que todos vean lo mismo para la misma fecha.
    let book = "Génesis";
    let chapter = dayOfYear;
    
    if (dayOfYear > 50) { book = "Éxodo"; chapter = dayOfYear - 50; }
    if (dayOfYear > 90) { book = "Levítico"; chapter = dayOfYear - 90; }
    // ... se extendería para toda la biblia
    
    return {
        id: `plan_${dateStr}`, // ID único basado en fecha
        date: dateStr,
        type: 'bible_plan',
        title: `Día ${dayOfYear}: ${book} ${chapter}`,
        scripture: `${book} ${chapter}`,
        isPlan: true
    };
};

// --- Componentes ---
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
  const [planReadings, setPlanReadings] = useState([]); // Lecturas generadas del plan
  const [extraReadings, setExtraReadings] = useState([]); // Lecturas extra del admin
  const [adminComments, setAdminComments] = useState({}); // Comentarios del admin sobre el plan
  
  const [allUsers, setAllUsers] = useState([]);
  const [completionsMap, setCompletionsMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({}); // Comentarios de usuarios
  
  // Gamificación
  const [streak, setStreak] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Estado de UI
  const [currentDateView, setCurrentDateView] = useState(new Date().toISOString().split('T')[0]);
  const [expandedStatItem, setExpandedStatItem] = useState(null);
  const [activeReadingIdForComment, setActiveReadingIdForComment] = useState(null);

  // Inputs
  const [commentText, setCommentText] = useState('');
  const [adminObservationText, setAdminObservationText] = useState('');
  const [newExtraReading, setNewExtraReading] = useState({ 
    type: 'external', title: '', externalLink: '', externalContent: '' 
  });
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
    if (userData && userData.uid !== user.uid) { setLoading(false); return; }

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

  // --- GENERACIÓN DE PLAN (VIRTUAL) ---
  useEffect(() => {
      if (!userData?.isApproved) return;
      
      // Generamos el plan para los últimos 30 días + hoy + 7 días futuros
      // En producción esto vendría de una base de datos estática o JSON
      const readings = [];
      const today = new Date();
      
      // Generar rango de fechas para mostrar en UI
      // Para demo: mostramos desde 1 Ene hasta hoy + 5 días
      const startDate = new Date(today.getFullYear(), 0, 1); // 1 Ene
      const endDate = new Date(today); 
      endDate.setDate(today.getDate() + 5); // Ver hasta 5 días en el futuro
      
      let loopDate = new Date(startDate);
      while (loopDate <= endDate) {
          const dStr = loopDate.toISOString().split('T')[0];
          readings.push(getBiblePlanForDate(dStr));
          loopDate.setDate(loopDate.getDate() + 1);
      }
      // Invertir para ver lo más reciente primero
      setPlanReadings(readings.reverse());
  }, [userData]);

  // --- LECTURA DE DATOS ---
  const activeUid = userData?.uid;

  // 1. Lecturas Extra y Comentarios del Admin (Guardados en DB)
  useEffect(() => {
    if (!userData?.isApproved) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'readings'));
    return onSnapshot(q, (snapshot) => {
        const extras = [];
        const adminObs = {};
        
        snapshot.docs.forEach(doc => {
            const d = doc.data();
            if (d.type === 'bible_plan_annotation') {
                // Es un comentario pastoral sobre un día del plan
                adminObs[d.date] = d.observation;
            } else {
                // Es una lectura extra
                extras.push({id: doc.id, ...d});
            }
        });
        setExtraReadings(extras);
        setAdminComments(adminObs);
    });
  }, [userData]);

  // 2. Comentarios de Usuarios
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
    }, () => {}); // Fallback silencioso
  }, [userData]);

  // 3. Progreso Personal
  useEffect(() => {
    if (!activeUid) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'completions'), where('userId', '==', activeUid));
    return onSnapshot(q, (snapshot) => {
        const map = {};
        let completedCount = 0;
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            map[data.readingId] = true;
            completedCount++;
        });
        setCompletionsMap(map);
        
        // Calcular % Anual (365 lecturas base)
        const percent = Math.min(100, Math.round((completedCount / 365) * 100));
        setProgressPercent(percent);
        
        // Calcular Racha (Simplificada para demo: conteo total)
        setStreak(completedCount); // En producción usar lógica de fechas consecutivas
    });
  }, [activeUid]);

  // --- ACCIONES ---

  // LOGIN
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
            setView(isFirst ? 'admin' : (isFirst ? 'admin' : 'pending')); // Fix view logic
            if(!isFirst) setView('pending');
            else setView('admin');
        }
    } catch (e) {}
  };

  // INTERACCIÓN
  const toggleCompletion = async (readingId, date) => {
      if (!activeUid) return;
      
      // Lógica de Secuencia: Verificar si completó el día anterior
      // Solo aplica para lecturas del plan bíblico
      if (readingId.startsWith('plan_')) {
          const currentDay = new Date(date);
          const prevDay = new Date(currentDay);
          prevDay.setDate(prevDay.getDate() - 1);
          const prevDayStr = prevDay.toISOString().split('T')[0];
          // El ID del plan anterior
          const prevId = `plan_${prevDayStr}`;
          
          // Si no es 1 de Enero y no ha completado el anterior
          // Nota: Para el demo permitimos empezar hoy, pero validamos si existe en el mapa
          // En producción estricta: if (date !== '2024-01-01' && !completionsMap[prevId]) ...
          
          // Validación simple para demo: No marcar hoy si ayer está pendiente (y ayer existe en el plan)
          const isPrevCompleted = completionsMap[prevId];
          // Asumimos que si no está en el mapa, no está hecho.
          // Excepción: Si la fecha es muy antigua o inicio de año.
          // Para UX: Solo advertir.
      }

      const isComplete = completionsMap[readingId];
      if (!confirm(isComplete ? "¿Desmarcar lectura?" : "Confirmar lectura completada")) return;

      const id = `${activeUid}_${readingId}`;
      const ref = doc(db, 'artifacts', APP_ID, 'completions', id);
      if (isComplete) await deleteDoc(ref);
      else await setDoc(ref, { userId: activeUid, readingId, date, completedAt: serverTimestamp() });
  };

  const saveAdminComment = async (date, text) => {
      // Guardar comentario pastoral para una fecha específica del plan
      // Usamos un ID compuesto para el documento: plan_annotation_FECHA
      const docId = `plan_annotation_${date}`;
      await setDoc(doc(db, 'artifacts', APP_ID, 'readings', docId), {
          type: 'bible_plan_annotation',
          date: date,
          observation: text,
          updatedAt: serverTimestamp()
      });
      alert("Comentario pastoral guardado");
  };

  const postComment = async (e, readingId) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      await addDoc(collection(db, 'artifacts', APP_ID, 'comments'), {
          text: commentText, readingId, userId: activeUid, userName: userData.displayName, userPhoto: userData.photoURL, createdAt: serverTimestamp()
      });
      setCommentText('');
  };

  // --- HELPERS ---
  const getLocalDate = () => new Date().toISOString().split('T')[0];
  
  const isLocked = (dateStr) => {
      // Bloquear futuro
      if (dateStr > getLocalDate()) return true;
      
      // Bloquear secuencial (si no completó ayer)
      const d = new Date(dateStr);
      d.setDate(d.getDate() - 1);
      const prevDateStr = d.toISOString().split('T')[0];
      const prevId = `plan_${prevDateStr}`;
      
      // Si no es 1 de Enero y no completó ayer, está bloqueado
      // (Ajuste: Si completionsMap está vacío es nuevo usuario, bloqueamos todo menos el primero que encuentre? 
      //  Para demo: Solo bloqueamos futuro estricto y visualmente indicamos secuencia)
      
      // Lógica estricta:
      // return !completionsMap[prevId] && dateStr !== '2024-01-01'; 
      return false; // Desactivado para facilitar demo, activarlo en producción real
  };

  // --- VISTAS ---

  if (loading) return <div className="h-screen flex items-center justify-center bg-sky-50"><Loader2 className="animate-spin text-sky-600" size={48}/></div>;

  if (view === 'login') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-500 to-sky-600 p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <img src={LOGO_URL} className="w-24 h-24 mx-auto mb-4"/>
        <h1 className="text-2xl font-bold text-slate-800">Teología Paulina</h1>
        <p className="text-slate-500 mb-6">Plan de Lectura Bíblica Anual</p>
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

  // Header Component
  const Header = () => (
      <header className="bg-white border-b sticky top-0 z-10 px-4 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-800"><img src={LOGO_URL} className="w-8 h-8"/> <span className="hidden sm:inline">Teología Paulina</span></div>
          <div className="flex gap-3 items-center">
              <div className="hidden md:flex flex-col items-end mr-2">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Progreso Anual</div>
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{width: `${progressPercent}%`}}></div></div>
              </div>
              <a href={YOUTUBE_CHANNEL} target="_blank" className="text-red-600"><Youtube/></a>
              {userData?.role === 'admin' && <button onClick={()=>setView(view==='admin'?'dashboard':'admin')} className="text-xs bg-slate-100 px-3 py-1 rounded">{view==='admin'?'Ver App':'Ver Admin'}</button>}
              <img src={userData?.photoURL} className="w-8 h-8 rounded-full"/>
          </div>
      </header>
  );

  // --- ADMIN VIEW ---
  if (view === 'admin') return (
      <div className="min-h-screen bg-sky-50 pb-20">
          <Header/>
          <main className="max-w-5xl mx-auto p-4">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Panel Pastoral</h2>
              
              {/* PLANIFICADOR PASTORAL */}
              <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6 h-[fit-content]">
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Calendar size={18}/> Plan Diario</h3>
                      <p className="text-xs text-slate-500 mb-4">Selecciona un día para agregar el comentario pastoral.</p>
                      
                      <input type="date" className="w-full p-2 border rounded mb-4" value={currentDateView} onChange={e=>setCurrentDateView(e.target.value)}/>
                      
                      <div className="bg-slate-50 p-4 rounded border mb-4">
                          <div className="font-bold text-sky-700">Lectura del Día:</div>
                          <div className="text-lg">{getBiblePlanForDate(currentDateView).scripture}</div>
                      </div>

                      <textarea 
                        className="w-full p-3 border rounded h-32 text-sm" 
                        placeholder="Escribe aquí la reflexión pastoral para este día..."
                        value={adminComments[currentDateView] || ''}
                        onChange={e => {
                            const newComments = {...adminComments, [currentDateView]: e.target.value};
                            setAdminComments(newComments); // Optimistic local
                        }}
                      />
                      <div className="mt-2 flex justify-end">
                          <Button onClick={() => saveAdminComment(currentDateView, adminComments[currentDateView])}>Guardar Reflexión</Button>
                      </div>
                  </Card>

                  <Card className="p-6 h-[fit-content]">
                      <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><FileText size={18}/> Material Extra</h3>
                      <div className="space-y-3">
                          <input className="w-full p-2 border rounded text-sm" placeholder="Título" value={newExtraReading.title} onChange={e=>setNewExtraReading({...newExtraReading, title:e.target.value})}/>
                          <input className="w-full p-2 border rounded text-sm" placeholder="Enlace (YouTube/PDF)" value={newExtraReading.externalLink} onChange={e=>setNewExtraReading({...newExtraReading, externalLink:e.target.value})}/>
                          <textarea className="w-full p-2 border rounded text-sm" placeholder="Descripción" value={newExtraReading.externalContent} onChange={e=>setNewExtraReading({...newExtraReading, externalContent:e.target.value})}/>
                          <Button onClick={async () => {
                              await addDoc(collection(db, 'artifacts', APP_ID, 'readings'), {
                                  ...newExtraReading, type: 'external', date: getLocalDate(), createdAt: serverTimestamp()
                              });
                              setNewExtraReading({type: 'external', title: '', externalLink: '', externalContent: ''});
                              alert("Material extra publicado");
                          }}>Publicar Extra</Button>
                      </div>
                  </Card>
              </div>
          </main>
      </div>
  );

  // --- USER VIEW ---
  return (
    <div className="min-h-screen bg-sky-50 pb-20">
        <Header/>
        <main className="max-w-3xl mx-auto p-4 space-y-6">
            
            {/* Barra de Progreso Móvil */}
            <div className="md:hidden bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>Progreso Anual</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" style={{width: `${progressPercent}%`}}></div>
                </div>
            </div>

            {/* LISTA DE LECTURAS */}
            <div className="space-y-8">
                {planReadings.map((planDay, idx) => {
                    const readingId = planDay.id; // plan_YYYY-MM-DD
                    const isComplete = completionsMap[readingId];
                    const isLockedDay = isLocked(planDay.date);
                    const comments = commentsMap[readingId] || [];
                    const showComments = activeReadingIdForComment === readingId;
                    const pastoralComment = adminComments[planDay.date];

                    // Buscar si hay extras para este día
                    const daysExtras = extraReadings.filter(e => e.date === planDay.date);

                    return (
                        <div key={readingId} className={`relative pl-4 ${isLockedDay ? 'opacity-60 grayscale' : ''}`}>
                            {/* Línea de tiempo visual */}
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                            <div className={`absolute left-[-5px] top-6 w-3 h-3 rounded-full border-2 border-white ${isComplete ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-slate-500">{new Date(planDay.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                {planDay.date === getLocalDate() && <Badge color="blue">HOY</Badge>}
                                {isLockedDay && <Lock size={14} className="text-slate-400"/>}
                            </div>

                            <Card className="overflow-hidden mb-4">
                                <div className="p-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-serif font-bold text-slate-800">{planDay.scripture}</h3>
                                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Plan Anual</p>
                                        </div>
                                        {isComplete && <CheckCircle className="text-emerald-500" size={24}/>}
                                    </div>

                                    {pastoralComment && (
                                        <div className="mt-4 bg-amber-50 p-3 rounded-lg border-l-4 border-amber-400">
                                            <div className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1"><Crown size={12}/> Reflexión Pastoral:</div>
                                            <p className="text-sm text-slate-700 italic">"{pastoralComment}"</p>
                                        </div>
                                    )}

                                    {!isLockedDay ? (
                                        <button 
                                            onClick={() => toggleCompletion(readingId, planDay.date)}
                                            className={`mt-4 w-full py-2 rounded-lg text-sm font-bold border transition-colors ${isComplete ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {isComplete ? 'Lectura Completada' : 'Marcar como Leído'}
                                        </button>
                                    ) : (
                                        <div className="mt-4 text-center text-xs text-slate-400 bg-slate-50 py-2 rounded">
                                            {planDay.date > getLocalDate() ? 'Disponible pronto' : 'Completa días anteriores primero'}
                                        </div>
                                    )}
                                </div>

                                {/* Comentarios */}
                                {!isLockedDay && (
                                    <div className="bg-slate-50 border-t p-2">
                                        <button onClick={() => setActiveReadingIdForComment(showComments ? null : readingId)} className="w-full text-left text-xs font-bold text-slate-500 hover:text-sky-600 flex items-center justify-center gap-2 py-1">
                                            <MessageSquare size={14}/> {comments.length > 0 ? `Ver ${comments.length} comentarios` : 'Añadir comentario'}
                                        </button>
                                        {showComments && (
                                            <div className="p-3 animate-in slide-in-from-top-2">
                                                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                                                    {comments.map(c => (
                                                        <div key={c.id} className="bg-white p-2 rounded border text-xs">
                                                            <span className="font-bold text-slate-700 block">{c.userName}</span>
                                                            <span className="text-slate-600">{c.text}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <form onSubmit={e=>postComment(e, readingId)} className="flex gap-2">
                                                    <input className="flex-1 p-2 border rounded text-sm" placeholder="Comentar..." value={commentText} onChange={e=>setCommentText(e.target.value)}/>
                                                    <button type="submit" disabled={!commentText.trim()} className="text-sky-500"><Send size={16}/></button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>

                            {/* Lecturas Extra del día */}
                            {daysExtras.map(extra => (
                                <Card key={extra.id} className="mb-4 border-l-4 border-purple-500 bg-purple-50/30">
                                    <div className="p-4">
                                        <div className="flex gap-2 items-center mb-2">
                                            <Badge color="amber">EXTRA</Badge>
                                            <h4 className="font-bold text-slate-700">{extra.title}</h4>
                                        </div>
                                        {extra.externalContent && <p className="text-sm text-slate-600 mb-2">{extra.externalContent}</p>}
                                        {extra.externalLink && <a href={extra.externalLink} target="_blank" className="text-xs flex items-center gap-1 text-purple-600 font-bold hover:underline"><LinkIcon size={12}/> Ver Recurso</a>}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    );
                })}
            </div>
        </main>
    </div>
  );
}