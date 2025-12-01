import React, { useState, useEffect } from 'react';
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
  deleteDoc,
  writeBatch 
} from 'firebase/firestore';
import { 
  BookOpen, CheckCircle, MessageSquare, Users, LogOut, Calendar, Send, Loader2, 
  BarChart2, Edit3, ChevronDown, Youtube, ScrollText, 
  Shield, ShieldCheck, Bell, X, 
  AlertTriangle, FileText, Link as LinkIcon, Activity,
  Flame, Award, Crown, Star, Medal, Lock, Percent, MessageCircle
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

// --- Estructura Bíblica ---
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
const BIBLE_BOOKS_ORDER = Object.keys(BIBLE_STRUCTURE);

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

  // Datos
  const [allReadings, setAllReadings] = useState([]);
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

  // Inputs
  const [commentText, setCommentText] = useState('');
  const [newReading, setNewReading] = useState({ 
    type: 'bible', date: getLocalDate(), 
    title: '', startBook: 'Romanos', startChapter: '1', endBook: 'Romanos', endChapter: '1', verses: '', 
    externalLink: '', externalContent: '', observation: '' 
  });
  const [activeReadingIdForComment, setActiveReadingIdForComment] = useState(null);
  const [editingReading, setEditingReading] = useState(null); 

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
      alert("Error al conectar. Verifica tu conexión o intenta más tarde.");
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

  // Leer TODAS las Lecturas (Ordenadas por fecha ascendente para lógica secuencial)
  useEffect(() => {
    if (!userData?.isApproved) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'readings'));
    return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        // Orden estricto por fecha (necesario para la secuencia)
        docs.sort((a,b) => {
            if (a.date > b.date) return 1;
            if (a.date < b.date) return -1;
            return 0;
        });
        setAllReadings(docs);
    });
  }, [userData]);

  // Comentarios
  useEffect(() => {
    if (!userData?.isApproved || allReadings.length === 0) return;
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
  }, [userData, allReadings]); 

  // Progreso y Racha
  useEffect(() => {
    if (!activeUid || allReadings.length === 0) return;
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

        // Calcular porcentaje anual (Asumimos meta de 365 días o total de lecturas si es mayor)
        const totalGoal = Math.max(365, allReadings.length);
        const percent = Math.min(100, Math.round((count / totalGoal) * 100));
        setBibleProgress(percent);
        
        // Racha
        const readingsByDate = {};
        allReadings.forEach(r => {
            if (!readingsByDate[r.date]) readingsByDate[r.date] = [];
            readingsByDate[r.date].push(r.id);
        });

        let currentStreak = 0;
        let cursorDate = getLocalDate(); 
        
        let todaysReadings = readingsByDate[cursorDate];
        let isTodayDone = false;
        if (todaysReadings && todaysReadings.length > 0) {
            isTodayDone = todaysReadings.every(id => userCompletions.has(id));
        }

        if (!isTodayDone) cursorDate = getPrevDateStr(cursorDate);

        while(true) {
             const dayReadingsIds = readingsByDate[cursorDate];
             if (!dayReadingsIds || dayReadingsIds.length === 0) break;
             const isDayComplete = dayReadingsIds.every(id => userCompletions.has(id));
             if (isDayComplete) {
                 currentStreak++;
                 cursorDate = getPrevDateStr(cursorDate);
             } else {
                 break; 
             }
        }
        setStreak(currentStreak);
    });
  }, [activeUid, allReadings]);

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

  // Generador de Año Bíblico (Función Admin Potente)
  const generateBibleYear = async () => {
      if(!confirm("⚠️ ATENCIÓN: Esto generará 365 lecturas vacías (slots) para todo el año actual. \n\n¿Estás seguro de que quieres crear la estructura ahora?")) return;
      
      setLoading(true);
      const year = new Date().getFullYear();
      const batchSize = 500; // Firebase limit
      const batch = writeBatch(db);
      
      let count = 0;
      // Generar desde 1 de Enero hasta 31 de Diciembre
      for (let m = 0; m < 12; m++) {
          const daysInMonth = new Date(year, m + 1, 0).getDate();
          for (let d = 1; d <= daysInMonth; d++) {
              const monthStr = String(m + 1).padStart(2, '0');
              const dayStr = String(d).padStart(2, '0');
              const dateStr = `${year}-${monthStr}-${dayStr}`;

              // Referencia para crear ID único basado en fecha para evitar duplicados
              const docId = `bible_${dateStr}`; 
              const docRef = doc(db, 'artifacts', APP_ID, 'readings', docId);
              
              batch.set(docRef, {
                  type: 'bible',
                  date: dateStr,
                  title: `Lectura del ${d}/${m+1}`,
                  scripture: "Lectura por definir", // Placeholder
                  observation: "",
                  createdBy: activeUid,
                  createdAt: serverTimestamp()
              }, { merge: true }); // Merge evita borrar si ya editaste algo ese día
              count++;
          }
      }

      await batch.commit();
      setLoading(false);
      alert(`¡Éxito! Se generaron/actualizaron ${count} días de lectura.`);
  };

  const sendWhatsAppNotification = (reading) => {
      const title = reading.scripture || reading.title || 'Nueva Lectura';
      const link = APP_URL || window.location.origin;
      const message = `*Plan Bíblico Diario* 🕊️\n\n📅 *Fecha:* ${reading.date}\n📖 *Lectura:* ${title}\n\n${reading.observation ? `_"${reading.observation}"_` : ''}\n\n🔗 *Leer aquí:* ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const toggleCompletion = async (readingId) => {
      if (!activeUid) return;
      const isComplete = completionsMap[readingId];
      if (isComplete) {
          if (!confirm("¿Desmarcar lectura? Restará progreso.")) return;
          await deleteDoc(doc(db, 'artifacts', APP_ID, 'completions', `${activeUid}_${readingId}`));
      } else {
          await setDoc(doc(db, 'artifacts', APP_ID, 'completions', `${activeUid}_${readingId}`), { 
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

  const createReading = async (e) => {
      e.preventDefault();
      const date = newReading.date || getLocalDate();
      let data = { 
          type: newReading.type, date, title: newReading.title || '', observation: newReading.observation, createdBy: activeUid, createdAt: serverTimestamp() 
      };

      if (newReading.type === 'bible') {
          let scripture = `${newReading.startBook} ${newReading.startChapter}`;
          if (newReading.startBook !== newReading.endBook || newReading.startChapter !== newReading.endChapter) {
              scripture += (newReading.startBook === newReading.endBook) ? `-${newReading.endChapter}` : ` - ${newReading.endBook} ${newReading.endChapter}`;
          }
          if (newReading.verses) scripture += `:${newReading.verses}`;
          data.scripture = scripture;
      } else {
          data.scripture = newReading.title || "Lectura Extra";
          data.externalLink = newReading.externalLink;
          data.externalContent = newReading.externalContent;
      }
      await addDoc(collection(db, 'artifacts', APP_ID, 'readings'), data);
      setNewReading({ ...newReading, title: '', observation: '' });
      alert("Lectura agregada (adicional al plan anual).");
  };

  const updateReading = async (e) => {
      e.preventDefault();
      if (!editingReading) return;
      const ref = doc(db, 'artifacts', APP_ID, 'readings', editingReading.id);
      await updateDoc(ref, {
          title: editingReading.title,
          scripture: editingReading.scripture,
          observation: editingReading.observation,
          date: editingReading.date,
          externalLink: editingReading.externalLink || ''
      });
      setEditingReading(null);
      alert("Lectura actualizada");
  };

  const deleteReading = async (id) => {
      if(confirm('¿Borrar lectura?')) await deleteDoc(doc(db, 'artifacts', APP_ID, 'readings', id));
  };

  const updateUserStatus = async (uid, field, value) => {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid), { [field]: value });
  };

  const getChapters = (book) => Array.from({length: BIBLE_STRUCTURE[book]||50}, (_,i) => i+1);

  // --- RENDERS ---

  if (loading) return <div className="h-screen flex items-center justify-center bg-sky-50"><Loader2 className="animate-spin text-sky-600" size={48}/></div>;

  if (view === 'login') return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-none shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-2"><img src={LOGO_URL} className="w-full h-full object-contain"/></div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">Teología Paulina</h1>
          <p className="text-sky-600 font-bold uppercase text-xs mt-2">Plan Bíblico Anual</p>
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
                  <Button variant={activeTab==='reading'?'primary':'ghost'} onClick={()=>setActiveTab('reading')} className="text-sm"><BookOpen size={16} className="mr-2"/> Plan & Lecturas</Button>
                  <Button variant={activeTab==='users'?'primary':'ghost'} onClick={()=>setActiveTab('users')} className="text-sm"><Users size={16} className="mr-2"/> Usuarios</Button>
                  <Button variant={activeTab==='stats'?'primary':'ghost'} onClick={()=>setActiveTab('stats')} className="text-sm"><BarChart2 size={16} className="mr-2"/> Progreso</Button>
              </div>

              {activeTab === 'reading' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="p-6 h-fit">
                          <h2 className="font-bold text-lg mb-4 text-slate-800">Gestión de Contenido</h2>
                          
                          <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mb-6">
                              <h3 className="font-bold text-amber-800 text-sm mb-2">⚡ Acciones Rápidas</h3>
                              <Button onClick={generateBibleYear} variant="secondary" className="w-full text-xs border-amber-200 text-amber-700 hover:bg-amber-100">
                                  <Calendar className="mr-2" size={16}/> Generar Estructura Año Completo
                              </Button>
                              <p className="text-[10px] text-amber-600/70 mt-2 leading-tight">Crea espacios vacíos para cada día del año actual para que solo tengas que editarlos.</p>
                          </div>

                          <h3 className="font-bold text-slate-700 text-sm mb-2">Agregar Lectura Extra / Manual</h3>
                          <form onSubmit={createReading} className="space-y-4 border-t pt-4">
                              <div className="grid grid-cols-2 gap-2">
                                  <input type="date" className="p-2 border rounded text-sm" value={newReading.date} onChange={e=>setNewReading({...newReading, date: e.target.value})}/>
                                  <select className="p-2 border rounded text-sm" value={newReading.type} onChange={e=>setNewReading({...newReading, type: e.target.value})}>
                                      <option value="bible">Biblia</option>
                                      <option value="external">Externo</option>
                                  </select>
                              </div>
                              {newReading.type === 'bible' ? (
                                  <div className="space-y-2 bg-sky-50 p-3 rounded">
                                      <div className="flex gap-1"><select className="flex-1 p-2 border rounded text-sm" value={newReading.startBook} onChange={e=>setNewReading({...newReading, startBook:e.target.value, endBook:e.target.value})}>{BIBLE_BOOKS_ORDER.map(b=><option key={b}>{b}</option>)}</select><select className="w-16 p-2 border rounded text-sm" value={newReading.startChapter} onChange={e=>setNewReading({...newReading, startChapter:e.target.value})}>{getChapters(newReading.startBook).map(n=><option key={n}>{n}</option>)}</select></div>
                                      <div className="flex gap-1"><select className="flex-1 p-2 border rounded text-sm" value={newReading.endBook} onChange={e=>setNewReading({...newReading, endBook:e.target.value})}>{BIBLE_BOOKS_ORDER.map(b=><option key={b}>{b}</option>)}</select><select className="w-16 p-2 border rounded text-sm" value={newReading.endChapter} onChange={e=>setNewReading({...newReading, endChapter:e.target.value})}>{getChapters(newReading.endBook).map(n=><option key={n}>{n}</option>)}</select></div>
                                      <input className="w-full p-2 border rounded text-sm" placeholder="Versículos" value={newReading.verses} onChange={e=>setNewReading({...newReading, verses:e.target.value})}/>
                                  </div>
                              ) : (
                                  <div className="space-y-2 bg-amber-50 p-3 rounded">
                                      <input className="w-full p-2 border rounded text-sm" placeholder="Título *" required value={newReading.title} onChange={e=>setNewReading({...newReading, title:e.target.value})}/>
                                      <input className="w-full p-2 border rounded text-sm" placeholder="Link URL" value={newReading.externalLink} onChange={e=>setNewReading({...newReading, externalLink:e.target.value})}/>
                                  </div>
                              )}
                              <textarea className="w-full p-2 border rounded text-sm" placeholder="Comentario Pastoral" value={newReading.observation} onChange={e=>setNewReading({...newReading, observation:e.target.value})}/>
                              <Button type="submit" variant="primary" className="w-full">Guardar Lectura</Button>
                          </form>
                      </Card>

                      <div className="space-y-3">
                          <h3 className="font-bold text-slate-700">Agenda de Lecturas ({allReadings.length})</h3>
                          <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
                              {/* Mostrar lecturas ordenadas, primero las más recientes para facilitar edición */}
                              {[...allReadings].reverse().map(r => (
                                  <div key={r.id} className={`bg-white p-3 rounded border flex justify-between items-start hover:shadow-sm ${r.scripture==='Lectura por definir' ? 'border-l-4 border-l-red-300' : 'border-l-4 border-l-emerald-400'}`}>
                                      {editingReading?.id === r.id ? (
                                          <form onSubmit={updateReading} className="w-full space-y-2">
                                              <div className="font-bold text-sky-600 mb-2 text-xs">Editando: {r.date}</div>
                                              <input className="w-full p-1 border rounded text-sm font-bold" value={editingReading.scripture} onChange={e=>setEditingReading({...editingReading, scripture:e.target.value})} placeholder="Ej: Génesis 1-3"/>
                                              <input className="w-full p-1 border rounded text-sm" value={editingReading.title} onChange={e=>setEditingReading({...editingReading, title:e.target.value})} placeholder="Título / Tema"/>
                                              {r.type === 'external' && <input className="w-full p-1 border rounded text-sm" value={editingReading.externalLink} onChange={e=>setEditingReading({...editingReading, externalLink:e.target.value})} placeholder="Link URL"/>}
                                              <textarea className="w-full p-1 border rounded text-sm min-h-[80px]" value={editingReading.observation} onChange={e=>setEditingReading({...editingReading, observation:e.target.value})} placeholder="Comentario Pastoral"/>
                                              <div className="flex gap-2 justify-end">
                                                  <button type="button" onClick={()=>setEditingReading(null)} className="text-xs text-slate-500">Cancelar</button>
                                                  <button type="submit" className="text-xs bg-sky-500 text-white px-3 py-1 rounded">Guardar</button>
                                              </div>
                                          </form>
                                      ) : (
                                          <>
                                              <div className="flex-1 cursor-pointer" onClick={()=>setEditingReading(r)}>
                                                  <div className="flex items-center gap-2">
                                                      <span className="text-[10px] font-bold bg-slate-100 px-1 rounded text-slate-500">{r.date}</span>
                                                      <span className={`font-bold text-sm ${r.scripture==='Lectura por definir'?'text-red-400':'text-slate-800'}`}>{r.scripture}</span>
                                                  </div>
                                                  {r.observation ? 
                                                     <div className="text-xs text-slate-600 italic mt-1 line-clamp-1">"{r.observation}"</div> 
                                                     : <div className="text-[10px] text-slate-300 mt-1">Sin comentario</div>}
                                              </div>
                                              <div className="flex gap-2 ml-2 items-center">
                                                  <button onClick={() => sendWhatsAppNotification(r)} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded"><MessageCircle size={16}/></button>
                                                  <button onClick={()=>setEditingReading(r)} className="text-sky-500 hover:bg-sky-50 p-1 rounded"><Edit3 size={16}/></button>
                                                  <button onClick={()=>deleteReading(r.id)} className="text-slate-300 hover:text-red-500 p-1 rounded"><X size={16}/></button>
                                              </div>
                                          </>
                                      )}
                                  </div>
                              ))}
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
                             <div className="text-2xl font-bold text-sky-600">{allReadings.length}</div>
                             <div className="text-xs uppercase text-sky-400 font-bold">Lecturas Totales</div>
                          </Card>
                          <Card className="p-4 text-center">
                             <div className="text-2xl font-bold text-slate-600">{allUsers.length}</div>
                             <div className="text-xs uppercase text-slate-400 font-bold">Usuarios</div>
                          </Card>
                      </div>

                      <div className="flex justify-center gap-4 mb-4">
                          <button onClick={() => setStatsMode('byUser')} className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${statsMode === 'byUser' ? 'bg-sky-600 text-white shadow' : 'bg-slate-100 text-slate-500'}`}>Por Usuario</button>
                          <button onClick={() => setStatsMode('byReading')} className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${statsMode === 'byReading' ? 'bg-sky-600 text-white shadow' : 'bg-slate-100 text-slate-500'}`}>Por Lectura</button>
                      </div>

                      {statsMode === 'byUser' ? (
                          <Card className="overflow-hidden">
                              <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 text-sm">Progreso por Usuario</div>
                              <div className="divide-y max-h-96 overflow-y-auto">
                                  {allUsers.map(u => {
                                      const validReadingIds = new Set(allReadings.map(r => r.id));
                                      const userReadIds = allCompletions.filter(c => c.userId === u.uid && validReadingIds.has(c.readingId)).map(c => c.readingId);
                                      const percent = Math.round((userReadIds.length / Math.max(1, allReadings.length)) * 100);
                                      
                                      return (
                                          <div key={u.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                              <div className="flex items-center gap-3">
                                                  <img src={u.photoURL} className="w-8 h-8 rounded-full"/>
                                                  <div>
                                                      <div className="text-sm font-bold text-slate-700">{u.displayName}</div>
                                                      <div className="text-xs text-slate-400">{userReadIds.length} lecturas</div>
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
                      ) : (
                          <Card className="overflow-hidden">
                              <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 text-sm">Estado por Lectura</div>
                              <div className="divide-y max-h-96 overflow-y-auto">
                                  {allReadings.map(r => {
                                      const readers = allCompletions.filter(c => c.readingId === r.id).map(c => c.userId);
                                      return (
                                          <div key={r.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                              <div className="flex-1">
                                                  <div className="text-sm font-bold text-slate-700">{r.scripture}</div>
                                                  <div className="text-xs text-slate-400">{r.date}</div>
                                              </div>
                                              <div className="text-right text-xs">
                                                  <span className="font-bold text-emerald-600">{readers.length}</span> / {allUsers.length} leyeron
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
  
  // Agrupar lecturas para mostrar
  // Nota: Para la vista de usuario, 'allReadings' ya viene ordenado por fecha.
  // Filtramos para mostrar según el tab, pero necesitamos calcular los 'locks' (bloqueos) antes de filtrar.
  
  const todayStr = getLocalDate();
  const todayDate = new Date(todayStr + 'T12:00:00');

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
                      Has completado {Object.keys(completionsMap).length} de {Math.max(365, allReadings.length)} lecturas asignadas.
                  </p>
              </Card>

              {/* Tabs Pendiente/Completado */}
              <div className="flex p-1 bg-slate-200 rounded-lg">
                  <button onClick={()=>setUserFilter('pending')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='pending'?'bg-white text-sky-600 shadow-sm':'text-slate-500'}`}>Pendientes</button>
                  <button onClick={()=>setUserFilter('completed')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='completed'?'bg-white text-emerald-600 shadow-sm':'text-slate-500'}`}>Completadas</button>
              </div>

              {/* LISTA DE LECTURAS */}
              <div className="space-y-4">
                  {allReadings.map((r, index) => {
                      const isComplete = completionsMap[r.id];
                      
                      // LÓGICA DE FILTRADO VISUAL (Tabs)
                      if (userFilter === 'completed' && !isComplete) return null;
                      if (userFilter === 'pending' && isComplete) return null;

                      // LÓGICA DE BLOQUEO (Candados)
                      // 1. Bloqueo por fecha (No mostrar si es futuro)
                      const readingDate = new Date(r.date + 'T12:00:00');
                      const isFuture = readingDate > todayDate;
                      
                      // 2. Bloqueo Secuencial (No desbloquear si la anterior no está completa)
                      // Excepción: La primera lectura (index 0) siempre está libre si la fecha es correcta.
                      const prevReading = index > 0 ? allReadings[index - 1] : null;
                      const isSeqLocked = prevReading && !completionsMap[prevReading.id];

                      const isLocked = isFuture || isSeqLocked;

                      // Si es futuro y estamos en pendientes, tal vez ocultar para no saturar, 
                      // o mostrar bloqueado. El usuario pidió "habilitando por día".
                      // Decisión: Mostrar bloqueado pero visible para saber qué viene, 
                      // PERO si es muy al futuro (más de 1 día), mejor ocultar para no hacer scroll infinito.
                      const diffDays = (readingDate - todayDate) / (1000 * 60 * 60 * 24);
                      if (isFuture && diffDays > 3) return null; // Solo mostramos los próximos 3 días bloqueados

                      const comments = commentsMap[r.id] || [];
                      const showComments = activeReadingIdForComment === r.id;

                      return (
                          <div key={r.id} className={`transition-all duration-300 ${isLocked ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                              <Card className={`overflow-hidden ${isLocked ? 'pointer-events-none bg-slate-50' : ''}`}>
                                  {isLocked && (
                                      <div className="bg-slate-100 p-1 text-center text-[10px] uppercase font-bold text-slate-400 flex justify-center items-center gap-1 border-b">
                                          <Lock size={10}/> {isFuture ? `Disponible el ${r.date}` : 'Completa la anterior para desbloquear'}
                                      </div>
                                  )}
                                  <div className={`p-4 flex justify-between items-start ${r.type==='bible'?'bg-white border-l-4 border-sky-500':'bg-white border-l-4 border-amber-400'}`}>
                                      <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{r.date}</span>
                                            <span className={`text-[10px] font-bold uppercase ${r.type==='bible'?'text-sky-500':'text-amber-600'}`}>{r.type==='bible'?'Bíblica':'Externo'}</span>
                                          </div>
                                          <h3 className="text-lg font-bold text-slate-800">{r.scripture}</h3>
                                          {r.title && <p className="text-sm text-slate-500">{r.title}</p>}
                                          
                                          {r.type === 'external' && r.externalLink && (
                                              <a href={r.externalLink} target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs text-sky-600 font-bold hover:underline border px-2 py-1 rounded bg-sky-50 border-sky-100"><LinkIcon size={12}/> Ver Recurso</a>
                                          )}
                                          
                                          {r.observation && (
                                              <div className="mt-3 bg-slate-50 p-3 rounded text-sm text-slate-600 italic border-l-2 border-slate-300">
                                                  <span className="not-italic font-bold text-xs text-slate-400 block mb-1">Observación Pastoral:</span>
                                                  {r.observation}
                                              </div>
                                          )}
                                      </div>
                                      <button onClick={()=>toggleCompletion(r.id)} className={`p-2 rounded-full ${isComplete?'text-emerald-500 bg-emerald-50':'text-slate-300 hover:bg-slate-100'}`} disabled={isLocked}>
                                          {isComplete ? <CheckCircle size={24} fill="currentColor" className="text-emerald-100"/> : <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>}
                                      </button>
                                  </div>
                                  
                                  {!isLocked && (
                                    <div className="bg-slate-50/50 border-t p-2">
                                        <button 
                                            onClick={() => setActiveReadingIdForComment(showComments ? null : r.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg w-full justify-center text-sm font-medium transition-colors ${
                                                showComments 
                                                ? 'bg-slate-200 text-slate-800' 
                                                : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                                            }`}
                                        >
                                            <MessageSquare size={18} />
                                            {comments.length > 0 ? `Ver ${comments.length} Comentarios` : 'Escribir comentario'}
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
                                                  <p className="text-center text-xs text-slate-400 italic py-2">Sé el primero en comentar.</p>
                                              )}
                                          </div>
                                          <form onSubmit={e=>postComment(e,r.id)} className="flex gap-2">
                                              <input className="flex-1 p-2 border rounded text-sm" placeholder="Escribe..." value={commentText} onChange={e=>setCommentText(e.target.value)}/>
                                              <button type="submit" disabled={!commentText.trim()} className="text-sky-500 hover:bg-sky-100 p-2 rounded"><Send size={16}/></button>
                                          </form>
                                      </div>
                                  )}
                              </Card>
                          </div>
                      );
                  })}
                  {/* Mensaje si todo está completo y no hay nada bloqueado visible */}
                  {userFilter === 'pending' && allReadings.filter(r => {
                      const readingDate = new Date(r.date + 'T12:00:00');
                      const diffDays = (readingDate - todayDate) / (1000 * 60 * 60 * 24);
                      return !completionsMap[r.id] && (!readingDate > todayDate || diffDays <= 3);
                  }).length === 0 && (
                      <div className="text-center py-10 text-slate-400">
                          <p>¡Estás al día con las lecturas!</p>
                      </div>
                  )}
              </div>
          </main>
      </div>
  );
}