import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
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
  BarChart2, Edit3, ChevronDown, Youtube, ScrollText, 
  Shield, ShieldCheck, Bell, X, 
  AlertTriangle, FileText, Link as LinkIcon, Activity,
  Flame, Award, Crown, Star, Medal, Lock, Percent, MessageCircle, ToggleLeft, ToggleRight
} from 'lucide-react';

// --- TUS CLAVES REALES DE FIREBASE ---
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

// --- Estructura Bíblica y Lógica de Plan ---
const BIBLE_STRUCTURE = {
  "Génesis": 50, "Éxodo": 40, "Levítico": 27, "Números": 36, "Deuteronomio": 34,
  "Josué": 24, "Jueces": 21, "Rut": 4, "1 Samuel": 31, "2 Samuel": 24,
  "1 Reyes": 22, "2 Reyes": 25, "1 Crónicas": 29, "2 Crónicas": 36, "Esdras": 10,
  "Nehemías": 13, "Ester": 10, "Job": 42, "Salmos": 150, "Proverbios": 31,
  "Eclesiastés": 12, "Cantares": 8, "Isaías": 66, "Jeremías": 52, "Lamentaciones": 5,
  "Ezequiel": 48, "Daniel": 12, "Oseas": 14, "Joel": 3, "Amós": 9,
  "Abdías": 1, "Jonás": 4, "Miqueas": 7, "Nahúm": 3, "Habacuc": 3,
  "Sofonías": 3, "Hageo": 2, "Zacarías": 14, "Malaquías": 4,
  "Mateo": 28, "Marcos": 16, "Lucas": 24, "Juan": 21, "Hechos": 28,
  "Romanos": 16, "1 Corintios": 16, "2 Corintios": 13, "Gálatas": 6, "Efesios": 6,
  "Filipenses": 4, "Colosenses": 4, "1 Tesalonicenses": 5, "2 Tesalonicenses": 3,
  "1 Timoteo": 6, "2 Timoteo": 4, "Tito": 3, "Filemón": 1, "Hebreos": 13,
  "Santiago": 5, "1 Pedro": 5, "2 Pedro": 3, "1 Juan": 5, "2 Juan": 1,
  "3 Juan": 1, "Judas": 1, "Apocalipsis": 22
};

// Generar Plan Anual en Memoria (Estático)
const generateStaticPlan = () => {
    const plan = [];
    const books = Object.entries(BIBLE_STRUCTURE);
    let allChapters = [];
    
    // Aplanar todos los capítulos: ["Génesis 1", "Génesis 2"...]
    books.forEach(([book, chapters]) => {
        for(let i=1; i<=chapters; i++) {
            allChapters.push(`${book} ${i}`);
        }
    });

    // Dividir en 365 días
    const totalChapters = allChapters.length; // 1189
    const totalDays = 365;
    const chaptersPerDay = totalChapters / totalDays; // ~3.25
    
    let currentChapterIndex = 0;
    const year = new Date().getFullYear();

    for (let d = 0; d < totalDays; d++) {
        // Calcular fecha
        const date = new Date(year, 0, d + 1); // Enero 1 + d días
        const dateStr = date.toISOString().split('T')[0];
        
        // Calcular fin del rango para hoy
        const nextIndex = Math.round((d + 1) * chaptersPerDay);
        const dailyChapters = allChapters.slice(currentChapterIndex, nextIndex);
        currentChapterIndex = nextIndex;

        // Formatear texto de lectura (Ej: "Génesis 1 - Génesis 3")
        let passage = "";
        if (dailyChapters.length > 0) {
            const first = dailyChapters[0];
            const last = dailyChapters[dailyChapters.length - 1];
            
            // Simplificar si es el mismo libro
            const firstBook = first.split(' ').slice(0, -1).join(' ');
            const lastBook = last.split(' ').slice(0, -1).join(' ');
            
            if (first === last) passage = first;
            else if (firstBook === lastBook) {
                const firstChap = first.split(' ').pop();
                const lastChap = last.split(' ').pop();
                passage = `${firstBook} ${firstChap}-${lastChap}`;
            } else {
                passage = `${first} - ${last}`;
            }
        }

        plan.push({
            id: dateStr, // ID es la fecha
            date: dateStr,
            corePassage: passage,
            displayDate: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        });
    }
    return plan;
};

// --- Configuración de Insignias ---
const BADGES = [
  { days: 7, label: "1 Semana", icon: Star, color: "text-yellow-500", bg: "bg-yellow-100" },
  { days: 30, label: "1 Mes", icon: Medal, color: "text-blue-500", bg: "bg-blue-100" },
  { days: 90, label: "3 Meses", icon: Shield, color: "text-indigo-500", bg: "bg-indigo-100" },
  { days: 180, label: "Medio Año", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-100" },
  { days: 300, label: "Constancia", icon: Award, color: "text-pink-500", bg: "bg-pink-100" },
  { days: 365, label: "Biblia Completa", icon: Crown, color: "text-amber-500", bg: "bg-amber-100" },
];

// --- Funciones Auxiliares ---
const getLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getPrevDateStr = (dateStr) => {
   const d = new Date(dateStr + 'T12:00:00'); 
   d.setDate(d.getDate() - 1);
   const year = d.getFullYear();
   const month = String(d.getMonth() + 1).padStart(2, '0');
   const day = String(d.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
};

// --- Componentes UI Básicos ---
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

// --- App Principal ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('loading'); 
  const [activeTab, setActiveTab] = useState('reading'); 

  // Datos
  const [staticPlan] = useState(generateStaticPlan()); // El plan base 1-Ene a 31-Dic
  const [dailyContentMap, setDailyContentMap] = useState({}); // Info extra agregada por admin (comments, extra links, enabled status)
  
  const [allUsers, setAllUsers] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]); 
  const [completionsMap, setCompletionsMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  
  // Gamificación y Progreso
  const [streak, setStreak] = useState(0);
  const [bibleProgress, setBibleProgress] = useState(0);

  // Estado de UI Usuario
  const [userFilter, setUserFilter] = useState('pending'); 
  
  // Estado de UI Admin Stats
  const [statsMode, setStatsMode] = useState('byUser'); 
  const [expandedStatItem, setExpandedStatItem] = useState(null);

  // Inputs Admin
  const [editingDay, setEditingDay] = useState(null); 
  const [editForm, setEditForm] = useState({ observation: '', extraTitle: '', extraLink: '', isEnabled: false });

  // Inputs Comentarios
  const [commentText, setCommentText] = useState('');
  const [activeReadingIdForComment, setActiveReadingIdForComment] = useState(null);

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

  // 2. Escuchar Perfil de Usuario
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
    }, (error) => {
        console.log("Esperando perfil...", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // 3. Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await checkAndCreateProfile(result.user, result.user.displayName || "Usuario Google");
    } catch (error) {
      console.error(error);
      alert("Error al conectar.");
      setLoading(false);
    }
  };

  const checkAndCreateProfile = async (user, name, forceAdmin = false) => {
    const userRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
    try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            let isFirst = forceAdmin;
            if (!isFirst) {
                 try {
                    const usersSnap = await getDocs(collection(db, 'artifacts', APP_ID, 'users'));
                    isFirst = usersSnap.empty;
                } catch(e) {}
            }

            const newProfile = {
                uid: user.uid,
                displayName: name,
                email: user.email,
                photoURL: user.photoURL,
                role: isFirst ? 'admin' : 'user',
                isApproved: isFirst ? true : false,
                createdAt: serverTimestamp()
            };
            await setDoc(userRef, newProfile);
            setUserData(newProfile);
            if (!newProfile.isApproved) setView('pending');
            else setView(newProfile.role === 'admin' ? 'admin' : 'dashboard');
        }
    } catch (error) { console.error("Error perfil:", error); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload(); 
  };

  // --- LÓGICA DE DATOS ---
  const activeUid = userData?.uid;

  // Leer Contenido Diario (Configurado por Admin)
  useEffect(() => {
    if (!userData?.isApproved) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'daily_content'));
    return onSnapshot(q, (snapshot) => {
        const map = {};
        snapshot.docs.forEach(d => {
            map[d.id] = d.data(); // ID es la fecha (YYYY-MM-DD)
        });
        setDailyContentMap(map);
    });
  }, [userData]);

  // Leer Comentarios
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

  // Progreso y Racha
  useEffect(() => {
    if (!activeUid) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'completions'), where('userId', '==', activeUid));
    
    return onSnapshot(q, (snapshot) => {
        const map = {};
        const userCompletions = new Set();
        let count = 0;

        snapshot.docs.forEach(doc => {
            const data = doc.data();
            map[data.readingId] = true;
            userCompletions.add(data.readingId);
            count++;
        });
        setCompletionsMap(map);

        // Progreso Anual (Sobre 365 días)
        const percent = Math.min(100, Math.round((count / 365) * 100));
        setBibleProgress(percent);
        
        // Calculo de Racha Estricto
        let currentStreak = 0;
        let cursorDate = getLocalDate(); 
        
        // Verificar si hoy está completo
        const isTodayDone = userCompletions.has(cursorDate);
        if (!isTodayDone) cursorDate = getPrevDateStr(cursorDate);

        while(true) {
             if (userCompletions.has(cursorDate)) {
                 currentStreak++;
                 cursorDate = getPrevDateStr(cursorDate);
             } else {
                 break; 
             }
        }
        setStreak(currentStreak);
    });
  }, [activeUid]);

  // Admin Data
  useEffect(() => {
    if (userData?.role !== 'admin') return;
    const unsubUsers = onSnapshot(collection(db, 'artifacts', APP_ID, 'users'), s => {
        setAllUsers(s.docs.map(d => ({id: d.id, ...d.data()})));
    });
    const unsubStats = onSnapshot(collection(db, 'artifacts', APP_ID, 'completions'), s => {
        setAllCompletions(s.docs.map(d => d.data()));
    });
    return () => { unsubUsers(); unsubStats(); };
  }, [userData]);

  // --- ACCIONES ---

  // Admin: Guardar configuración de un día
  const saveDayConfig = async (e) => {
      e.preventDefault();
      if (!editingDay) return;
      
      const docRef = doc(db, 'artifacts', APP_ID, 'daily_content', editingDay.id);
      await setDoc(docRef, {
          observation: editForm.observation,
          extraTitle: editForm.extraTitle,
          extraLink: editForm.extraLink,
          isEnabled: editForm.isEnabled,
          updatedAt: serverTimestamp()
      }, { merge: true });
      
      setEditingDay(null);
  };

  const toggleDayEnabled = async (dayId, currentStatus) => {
      const docRef = doc(db, 'artifacts', APP_ID, 'daily_content', dayId);
      await setDoc(docRef, { isEnabled: !currentStatus }, { merge: true });
  };

  const sendWhatsAppNotification = (day, content) => {
      const link = APP_URL || window.location.origin;
      let msg = `*Plan Bíblico Diario* 🕊️\n\n📅 *Fecha:* ${day.displayDate}\n📖 *Lectura:* ${day.corePassage}`;
      
      if (content?.observation) msg += `\n\n💬 *Pastoral:* _"${content.observation}"_`;
      if (content?.extraTitle) msg += `\n\n➕ *Extra:* ${content.extraTitle}`;
      
      msg += `\n\n🔗 *Leer aquí:* ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const toggleCompletion = async (readingId) => {
      if (!activeUid) return;
      const isComplete = completionsMap[readingId];
      const id = `${activeUid}_${readingId}`;
      const docRef = doc(db, 'artifacts', APP_ID, 'completions', id);

      if (isComplete) {
          if (!confirm("¿Desmarcar lectura? Restará progreso.")) return;
          await deleteDoc(docRef);
      } else {
          await setDoc(docRef, { 
              userId: activeUid, userName: userData.displayName, readingId, completedAt: serverTimestamp() 
          });
      }
  };

  const postComment = async (e, readingId) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      await addDoc(collection(db, 'artifacts', APP_ID, 'comments'), {
          text: commentText, readingId, userId: activeUid, userName: userData.displayName, userPhoto: userData.photoURL, createdAt: serverTimestamp()
      });
      setCommentText('');
  };

  const updateUserStatus = async (uid, field, value) => {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid), { [field]: value });
  };

  // --- RENDERS ---

  if (loading) return <div className="h-screen flex items-center justify-center bg-sky-50"><Loader2 className="animate-spin text-sky-600" size={48}/></div>;

  if (view === 'login') return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-none shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-2"><img src={LOGO_URL} className="w-full h-full object-contain"/></div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">Teología Paulina</h1>
          <p className="text-sky-600 font-bold uppercase text-xs mt-2">Biblia en un Año</p>
        </div>
        <Button onClick={handleGoogleLogin} variant="google" className="w-full py-3 flex gap-2 justify-center">
             <span className="font-bold">Ingresar con Google</span>
        </Button>
      </Card>
    </div>
  );

  if (view === 'pending') return (
    <div className="h-screen flex items-center justify-center bg-sky-50 p-4">
        <Card className="max-w-md p-8 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Solicitud Recibida</h2>
            <p className="text-slate-600 mb-6">Hola <b>{userData?.displayName}</b>. Tu cuenta será aprobada pronto.</p>
            <Button onClick={handleLogout} variant="secondary">Cerrar Sesión</Button>
        </Card>
    </div>
  );

  const Header = () => (
      <header className="bg-white border-b sticky top-0 z-10 px-4 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-serif font-bold text-slate-800">
              <img src={LOGO_URL} className="w-8 h-8"/> 
              <span className="hidden sm:inline">Teología Paulina</span>
          </div>
          <div className="flex gap-3 items-center">
              {streak > 0 && (
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full border border-amber-100" title={`${streak} días seguidos`}>
                      <Flame size={16} className="text-amber-500 fill-amber-500" /><span className="text-xs font-bold text-amber-600">{streak}</span>
                  </div>
              )}
              {userData?.role === 'admin' && (
                  <div className="flex bg-slate-100 p-1 rounded">
                      <button onClick={()=>setView('admin')} className={`px-3 py-1 text-xs rounded ${view==='admin'?'bg-white shadow text-sky-600':''}`}>Admin</button>
                      <button onClick={()=>setView('dashboard')} className={`px-3 py-1 text-xs rounded ${view==='dashboard'?'bg-white shadow text-sky-600':''}`}>Leer</button>
                  </div>
              )}
              <img src={userData?.photoURL} className="w-8 h-8 rounded-full border"/>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500"><LogOut size={20}/></button>
          </div>
      </header>
  );

  // --- VISTA ADMIN ---
  if (view === 'admin') return (
      <div className="min-h-screen bg-sky-50 pb-20">
          <Header/>
          <main className="max-w-7xl mx-auto p-4 space-y-6">
              <div className="flex gap-2 border-b pb-2 overflow-x-auto">
                  <Button variant={activeTab==='reading'?'primary':'ghost'} onClick={()=>setActiveTab('reading')} className="text-sm"><BookOpen size={16} className="mr-2"/> Planificación</Button>
                  <Button variant={activeTab==='users'?'primary':'ghost'} onClick={()=>setActiveTab('users')} className="text-sm"><Users size={16} className="mr-2"/> Usuarios</Button>
                  <Button variant={activeTab==='stats'?'primary':'ghost'} onClick={()=>setActiveTab('stats')} className="text-sm"><BarChart2 size={16} className="mr-2"/> Progreso</Button>
              </div>

              {activeTab === 'reading' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* COLUMNA IZQUIERDA: EDITOR */}
                      <div className="lg:col-span-1">
                          <Card className="p-5 sticky top-24">
                              <h2 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                                  <Edit3 size={20} className="text-sky-600"/> 
                                  {editingDay ? `Editando: ${editingDay.displayDate}` : 'Selecciona un día'}
                              </h2>
                              
                              {editingDay ? (
                                  <form onSubmit={saveDayConfig} className="space-y-4">
                                      <div className="bg-sky-50 p-3 rounded text-sm mb-4 border border-sky-100">
                                          <div className="text-xs font-bold text-sky-600 uppercase mb-1">Lectura Bíblica (Fija)</div>
                                          <div className="font-bold text-slate-800 text-lg">{editingDay.corePassage}</div>
                                      </div>

                                      <div>
                                          <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Comentario Pastoral</label>
                                          <textarea 
                                              className="w-full p-2 border rounded text-sm h-24" 
                                              placeholder="Escribe un comentario..."
                                              value={editForm.observation}
                                              onChange={e=>setEditForm({...editForm, observation:e.target.value})}
                                          />
                                      </div>

                                      <div className="p-3 bg-amber-50 rounded border border-amber-100">
                                          <label className="text-xs font-bold text-amber-600 uppercase block mb-2">Lectura Adicional (Opcional)</label>
                                          <input 
                                              className="w-full p-2 border rounded text-sm mb-2" 
                                              placeholder="Título (Ej: Salmo Extra)"
                                              value={editForm.extraTitle}
                                              onChange={e=>setEditForm({...editForm, extraTitle:e.target.value})}
                                          />
                                          <input 
                                              className="w-full p-2 border rounded text-sm" 
                                              placeholder="Enlace Externo (URL)"
                                              value={editForm.extraLink}
                                              onChange={e=>setEditForm({...editForm, extraLink:e.target.value})}
                                          />
                                      </div>

                                      <div className="flex items-center gap-2 py-2 border-t border-b">
                                          <button 
                                              type="button" 
                                              onClick={()=>setEditForm({...editForm, isEnabled: !editForm.isEnabled})}
                                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                          >
                                              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                                          </button>
                                          <span className="text-sm font-bold text-slate-700">{editForm.isEnabled ? 'Habilitado para Usuarios' : 'Deshabilitado (Oculto)'}</span>
                                      </div>

                                      <div className="flex gap-2">
                                          <Button type="button" variant="secondary" onClick={()=>setEditingDay(null)} className="flex-1">Cancelar</Button>
                                          <Button type="submit" variant="primary" className="flex-1">Guardar</Button>
                                      </div>
                                  </form>
                              ) : (
                                  <div className="text-center py-10 text-slate-400 text-sm">
                                      Haz clic en el icono <Edit3 size={14} className="inline"/> de la lista para configurar el contenido del día.
                                  </div>
                              )}
                          </Card>
                      </div>

                      {/* COLUMNA DERECHA: LISTA PLAN */}
                      <div className="lg:col-span-2 space-y-3">
                          <h3 className="font-bold text-slate-700 flex justify-between items-center">
                              <span>Calendario Anual</span>
                              <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded">365 Días</span>
                          </h3>
                          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                              <div className="max-h-[600px] overflow-y-auto divide-y">
                                  {/* Mostrar días, revertido para ver los más recientes/futuros primero? O normal? Mejor normal para ver Enero primero o scroll al dia actual. 
                                      Para simplificar admin, mostramos todo. Usaremos scrollIntoView en una versión pro.
                                      Aquí invertimos para ver los últimos días arriba si es Diciembre, o mejor orden natural.
                                      Orden natural es mejor para entender el flujo. */}
                                  {staticPlan.map(day => {
                                      const content = dailyContentMap[day.id] || {};
                                      const isEnabled = content.isEnabled;

                                      return (
                                          <div key={day.id} className={`p-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${editingDay?.id === day.id ? 'bg-sky-50 border-l-4 border-sky-500' : ''}`}>
                                              <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 mb-1">
                                                      <span className="text-xs font-bold text-slate-500 w-12">{day.displayDate}</span>
                                                      {isEnabled ? 
                                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700"><CheckCircle size={10} className="mr-1"/> ACTIVO</span> 
                                                          : 
                                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400"><Lock size={10} className="mr-1"/> INACTIVO</span>
                                                      }
                                                  </div>
                                                  <div className="font-bold text-slate-800 text-sm">{day.corePassage}</div>
                                                  <div className="flex gap-2 mt-1">
                                                      {content.observation && <span className="text-[10px] bg-sky-50 text-sky-600 px-1 rounded border border-sky-100">Tiene Comentario</span>}
                                                      {content.extraTitle && <span className="text-[10px] bg-amber-50 text-amber-600 px-1 rounded border border-amber-100">+ Extra</span>}
                                                  </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                  <button 
                                                      onClick={() => toggleDayEnabled(day.id, isEnabled)}
                                                      className={`p-2 rounded hover:bg-slate-200 text-slate-400 ${isEnabled ? 'text-emerald-500' : ''}`}
                                                      title={isEnabled ? "Deshabilitar" : "Habilitar"}
                                                  >
                                                      {isEnabled ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                                                  </button>
                                                  <button 
                                                      onClick={() => {
                                                          setEditingDay(day);
                                                          setEditForm({
                                                              observation: content.observation || '',
                                                              extraTitle: content.extraTitle || '',
                                                              extraLink: content.extraLink || '',
                                                              isEnabled: content.isEnabled || false
                                                          });
                                                      }}
                                                      className="p-2 text-sky-500 hover:bg-sky-50 rounded"
                                                  >
                                                      <Edit3 size={18}/>
                                                  </button>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'users' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allUsers.map(u => (
                          <Card key={u.id} className="p-4 flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                  <img src={u.photoURL} className="w-10 h-10 rounded-full"/>
                                  <div className="min-w-0">
                                      <div className="font-bold text-sm text-slate-800 flex items-center gap-1 truncate">{u.displayName} {u.role==='admin' && <ShieldCheck size={14} className="text-amber-500"/>}</div>
                                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                                  </div>
                              </div>
                              <div className="flex gap-2 justify-between pt-2 border-t">
                                  {u.uid !== user.uid && (
                                      <>
                                          <button onClick={()=>updateUserStatus(u.id, 'isApproved', !u.isApproved)} className={`flex-1 px-2 py-1 text-xs border rounded ${u.isApproved?'bg-emerald-50 text-emerald-600':'bg-slate-100'}`}>{u.isApproved?'Aprobado':'Aprobar'}</button>
                                          <button onClick={()=>updateUserStatus(u.id, 'role', u.role==='admin'?'user':'admin')} className="flex-1 px-2 py-1 text-xs border rounded text-amber-600">{u.role==='admin'?'Bajar':'Subir'}</button>
                                      </>
                                  )}
                              </div>
                          </Card>
                      ))}
                  </div>
              )}

              {activeTab === 'stats' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card className="p-4 text-center bg-sky-50 border-sky-100">
                             <div className="text-2xl font-bold text-sky-600">365</div>
                             <div className="text-xs uppercase text-sky-400 font-bold">Días Plan</div>
                          </Card>
                          <Card className="p-4 text-center">
                             <div className="text-2xl font-bold text-slate-600">{allUsers.length}</div>
                             <div className="text-xs uppercase text-slate-400 font-bold">Usuarios</div>
                          </Card>
                      </div>

                      <div className="flex justify-center gap-4 mb-4">
                          <button onClick={() => setStatsMode('byUser')} className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${statsMode === 'byUser' ? 'bg-sky-600 text-white shadow' : 'bg-slate-100 text-slate-500'}`}>Por Usuario</button>
                      </div>

                      {statsMode === 'byUser' && (
                          <Card className="overflow-hidden">
                              <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 text-sm">Progreso por Usuario (Base 365 días)</div>
                              <div className="divide-y max-h-96 overflow-y-auto">
                                  {allUsers.map(u => {
                                      // Filtrar completados válidos (que pertenezcan al plan)
                                      const userReadIds = allCompletions.filter(c => c.userId === u.uid).map(c => c.readingId);
                                      // Simple count for now, assuming ids match dates
                                      const count = userReadIds.length;
                                      const percent = Math.min(100, Math.round((count / 365) * 100));
                                      
                                      return (
                                          <div key={u.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                              <div className="flex items-center gap-3">
                                                  <img src={u.photoURL} className="w-8 h-8 rounded-full"/>
                                                  <div>
                                                      <div className="text-sm font-bold text-slate-700">{u.displayName}</div>
                                                      <div className="text-xs text-slate-400">{count} días completados</div>
                                                  </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                 <span className="text-xs font-bold text-slate-600">{percent}%</span>
                                                 <div className="w-16 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${percent}%`}}></div></div>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </Card>
                      )}
                  </div>
              )}
          </main>
      </div>
  );

  // --- VISTA USUARIO (Render) ---
  
  const todayStr = getLocalDate();
  const todayDate = new Date(todayStr + 'T12:00:00');

  // Filtrar y preparar datos para el usuario
  const userPlan = useMemo(() => {
      // 1. Mapear estado
      const mapped = staticPlan.map(day => {
          const content = dailyContentMap[day.id] || {};
          return { ...day, ...content };
      });
      return mapped;
  }, [staticPlan, dailyContentMap]);

  return (
      <div className="min-h-screen bg-sky-50 pb-20">
          <Header/>
          <main className="max-w-3xl mx-auto p-4 space-y-6">
              
              {/* SECCIÓN DE PROGRESO ANUAL */}
              <Card className="p-5 bg-white border-none shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-1000" style={{width: `${bibleProgress}%`}}></div>
                  </div>
                  <div className="flex items-center justify-between mb-2 mt-2">
                      <div className="flex flex-col">
                          <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Mi Progreso Anual</span>
                          <span className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
                              {bibleProgress}<span className="text-sm text-slate-400">%</span>
                          </span>
                      </div>
                      <div className="bg-sky-50 p-2 rounded-lg">
                         <BookOpen size={24} className="text-sky-600"/>
                      </div>
                  </div>
                  <p className="text-xs text-slate-500">
                      Has completado {Object.keys(completionsMap).length} de 365 días del plan.
                  </p>
              </Card>

              {/* Tabs Pendiente/Completado */}
              <div className="flex p-1 bg-slate-200 rounded-lg">
                  <button onClick={()=>setUserFilter('pending')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='pending'?'bg-white text-sky-600 shadow-sm':'text-slate-500'}`}>Pendientes</button>
                  <button onClick={()=>setUserFilter('completed')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='completed'?'bg-white text-emerald-600 shadow-sm':'text-slate-500'}`}>Completadas</button>
              </div>

              {/* LISTA DE LECTURAS USUARIO */}
              <div className="space-y-4">
                  {userPlan.map((day, index) => {
                      // 0. Si el admin NO ha habilitado el día, y no es el usuario admin, NO mostrar (o mostrar bloqueado 'Próximamente')
                      // El requerimiento dice "El admin habilita". Asumiremos que si no está habilitado, está oculto o bloqueado permanentemente.
                      // Vamos a mostrarlo bloqueado si es el futuro o no habilitado.
                      
                      const isComplete = completionsMap[day.id];
                      
                      // FILTROS TABS
                      if (userFilter === 'completed' && !isComplete) return null;
                      if (userFilter === 'pending' && isComplete) return null;

                      // LÓGICA DE VISIBILIDAD & CANDADO
                      const readingDate = new Date(day.date + 'T12:00:00');
                      const isFuture = readingDate > todayDate;
                      
                      // Bloqueo Secuencial: El anterior debe estar completo (excepto el primero)
                      const prevDayId = index > 0 ? userPlan[index-1].id : null;
                      const isSeqLocked = prevDayId && !completionsMap[prevDayId];
                      
                      // Bloqueo Admin: Si !isEnabled
                      const isAdminLocked = !day.isEnabled;

                      const isLocked = isFuture || isSeqLocked || isAdminLocked;

                      // Si está bloqueado y es "pendiente", ocultar si está muy lejos en el futuro para no saturar
                      const diffDays = (readingDate - todayDate) / (1000 * 60 * 60 * 24);
                      if (userFilter === 'pending' && diffDays > 3) return null; 

                      // Si está deshabilitado por admin, ocultarlo completamente a menos que sea hoy o pasado cercano
                      if (isAdminLocked && userFilter === 'pending' && diffDays > 0) return null;

                      const comments = commentsMap[day.id] || [];
                      const showComments = activeReadingIdForComment === day.id;

                      return (
                          <div key={day.id} className={`transition-all duration-300 ${isLocked ? 'opacity-75 grayscale' : 'opacity-100'}`}>
                              <Card className={`overflow-hidden ${isLocked ? 'bg-slate-50' : ''}`}>
                                  {isLocked && (
                                      <div className="bg-slate-100 p-1 text-center text-[10px] uppercase font-bold text-slate-400 flex justify-center items-center gap-1 border-b">
                                          <Lock size={10}/> 
                                          {isAdminLocked ? 'Aún no disponible' : (isFuture ? `Disponible el ${day.displayDate}` : 'Completa la anterior')}
                                      </div>
                                  )}
                                  <div className={`p-4 flex justify-between items-start ${day.isEnabled ? 'bg-white border-l-4 border-sky-500' : 'bg-slate-50 border-l-4 border-slate-300'}`}>
                                      <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{day.displayDate}</span>
                                            <span className="text-[10px] font-bold uppercase text-sky-500">Lectura Diaria</span>
                                          </div>
                                          <h3 className="text-lg font-bold text-slate-800">{day.corePassage}</h3>
                                          
                                          {/* SECCIÓN ADICIONAL (CONFIGURADA POR ADMIN) */}
                                          {(day.observation || day.extraTitle) && (
                                              <div className="mt-3 bg-slate-50 p-3 rounded text-sm text-slate-600 border border-slate-100">
                                                  {day.observation && (
                                                      <div className="mb-2 italic border-l-2 border-amber-300 pl-2">
                                                          <span className="not-italic font-bold text-xs text-slate-400 block mb-1">Pastor:</span>
                                                          "{day.observation}"
                                                      </div>
                                                  )}
                                                  {day.extraTitle && (
                                                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                                                          <span className="text-xs font-bold text-amber-600 uppercase">Extra:</span>
                                                          {day.extraLink ? (
                                                              <a href={day.extraLink} target="_blank" className="font-bold text-sky-600 hover:underline flex items-center gap-1">
                                                                  {day.extraTitle} <LinkIcon size={10}/>
                                                              </a>
                                                          ) : (
                                                              <span className="font-medium text-slate-700">{day.extraTitle}</span>
                                                          )}
                                                      </div>
                                                  )}
                                              </div>
                                          )}
                                      </div>
                                      
                                      <div className="flex flex-col items-center gap-2 ml-2">
                                          <button 
                                              onClick={()=>toggleCompletion(day.id)} 
                                              className={`p-2 rounded-full ${isComplete?'text-emerald-500 bg-emerald-50':'text-slate-300 hover:bg-slate-100'}`} 
                                              disabled={isLocked}
                                          >
                                              {isComplete ? <CheckCircle size={24} fill="currentColor" className="text-emerald-100"/> : <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>}
                                          </button>
                                          <button onClick={() => sendWhatsAppNotification(day, day)} className="text-emerald-500 opacity-50 hover:opacity-100 p-1"><MessageCircle size={16}/></button>
                                      </div>
                                  </div>
                                  
                                  {!isLocked && (
                                    <div className="bg-slate-50/50 border-t p-2">
                                        <button 
                                            onClick={() => setActiveReadingIdForComment(showComments ? null : day.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full justify-center text-sm font-medium transition-colors ${
                                                showComments 
                                                ? 'bg-slate-200 text-slate-800' 
                                                : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                                            }`}
                                        >
                                            <MessageSquare size={18} />
                                            {comments.length > 0 ? `Ver ${comments.length} Comentarios` : 'Comentar'}
                                            <ChevronDown 
                                                size={16} 
                                                className={`ml-auto transform transition-transform duration-200 ${showComments ? 'rotate-180' : ''}`} 
                                            />
                                        </button>
                                    </div>
                                  )}

                                  {showComments && !isLocked && (
                                      <div className="p-4 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-1">
                                          <div className="space-y-3 mb-3">
                                              {comments.map(c => (
                                                  <div key={c.id} className="flex gap-2 items-start">
                                                      <img src={c.userPhoto} className="w-6 h-6 rounded-full mt-1"/>
                                                      <div className="bg-white p-2 rounded-r-lg rounded-bl-lg border text-sm flex-1">
                                                          <div className="font-bold text-xs text-slate-700">{c.userName}</div>
                                                          <p className="text-slate-600">{c.text}</p>
                                                      </div>
                                                  </div>
                                              ))}
                                              {comments.length === 0 && (
                                                  <p className="text-center text-xs text-slate-400 italic py-2">Sin comentarios aún.</p>
                                              )}
                                          </div>
                                          <form onSubmit={e=>postComment(e,day.id)} className="flex gap-2">
                                              <input className="flex-1 p-2 border rounded text-sm" placeholder="Escribe..." value={commentText} onChange={e=>setCommentText(e.target.value)}/>
                                              <button type="submit" disabled={!commentText.trim()} className="text-sky-500 hover:bg-sky-100 p-2 rounded"><Send size={16}/></button>
                                          </form>
                                      </div>
                                  )}
                              </Card>
                          </div>
                      );
                  })}
                  {/* Mensaje de estado vacío */}
                  {userFilter === 'pending' && userPlan.every(d => completionsMap[d.id] || d.date > getLocalDate()) && (
                      <div className="text-center py-10 text-slate-400">
                          <p>¡Estás al día! Revisa mañana para la siguiente lectura.</p>
                      </div>
                  )}
              </div>
          </main>
      </div>
  );
}