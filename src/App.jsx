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
  AlertTriangle, FileText, Link as LinkIcon, Clock, CheckSquare
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
  const [allReadings, setAllReadings] = useState([]); // Cambiado de todayReadings a allReadings
  const [allUsers, setAllUsers] = useState([]);
  const [completionsMap, setCompletionsMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});

  // Estado de UI Usuario
  const [userFilter, setUserFilter] = useState('pending'); // 'pending' | 'completed'

  // Inputs
  const [commentText, setCommentText] = useState('');
  const [newReading, setNewReading] = useState({ 
    type: 'bible', date: new Date().toISOString().split('T')[0],
    title: '', startBook: 'Romanos', startChapter: '1', endBook: 'Romanos', endChapter: '1', verses: '', 
    externalLink: '', externalContent: '', observation: '' 
  });
  const [activeReadingIdForComment, setActiveReadingIdForComment] = useState(null);
  const [editingReading, setEditingReading] = useState(null); // Para que el admin edite
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

  // 3. Login con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await checkAndCreateProfile(user, user.displayName || "Usuario Google");
    } catch (error) {
      console.error("Error Google:", error);
      let msg = "Error al conectar con Google.";
      if (error.code === 'auth/unauthorized-domain') {
         const currentDomain = window.location.hostname;
         msg = `⚠️ Dominio bloqueado: "${currentDomain}". Agrégalo en Firebase Console.`;
      } else if (error.code === 'auth/popup-blocked') {
         msg = "⚠️ Pop-up bloqueado. Permite ventanas emergentes.";
      }
      alert(msg);
      setLoading(false);
    }
  };

  // 4. Crear Perfil
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
                email: user.email || user.uid + '@teologia.com',
                photoURL: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=0ea5e9&textColor=ffffff`,
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

  // Leer TODAS las Lecturas (Sin filtro de fecha para ver historial)
  useEffect(() => {
    if (!userData?.isApproved) return;
    
    const q = query(collection(db, 'artifacts', APP_ID, 'readings'));
    
    return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
        // Ordenar por fecha (descendente: lo más nuevo arriba)
        docs.sort((a,b) => {
            if (a.date > b.date) return -1;
            if (a.date < b.date) return 1;
            return 0;
        });
        setAllReadings(docs);
    });
  }, [userData]);

  // Leer Comentarios (Optimizamos para leer solo de lecturas visibles o todas si no son muchas)
  useEffect(() => {
    if (!userData?.isApproved || allReadings.length === 0) return;
    // Escuchar cambios globales en comentarios para simplificar en lugar de N listeners
    const q = query(collection(db, 'artifacts', APP_ID, 'comments'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const newMap = {};
        snapshot.docs.forEach(doc => {
            const d = doc.data();
            if (!newMap[d.readingId]) newMap[d.readingId] = [];
            newMap[d.readingId].push({id: doc.id, ...d});
        });
        setCommentsMap(newMap);
    }, (e) => {
        // Fallback sin indice
        if (e.code === 'failed-precondition') {
             // Reintentar sin orden
             const q2 = query(collection(db, 'artifacts', APP_ID, 'comments'));
             onSnapshot(q2, (snap) => {
                const newMap = {};
                snap.docs.forEach(doc => {
                    const d = doc.data();
                    if (!newMap[d.readingId]) newMap[d.readingId] = [];
                    newMap[d.readingId].push({id: doc.id, ...d});
                });
                 // Ordenar en cliente
                 Object.keys(newMap).forEach(k => {
                     newMap[k].sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
                 });
                 setCommentsMap(newMap);
             });
        }
    });
  }, [userData]); // Quitamos dependencia de allReadings para evitar recargas masivas

  // Leer Progreso (Todas mis completions)
  useEffect(() => {
    if (!activeUid) return;
    const q = query(collection(db, 'artifacts', APP_ID, 'completions'), where('userId', '==', activeUid));
    return onSnapshot(q, (snapshot) => {
        const map = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            map[data.readingId] = true;
        });
        setCompletionsMap(map);
    });
  }, [activeUid]);

  useEffect(() => {
    if (userData?.role !== 'admin') return;
    return onSnapshot(collection(db, 'artifacts', APP_ID, 'users'), s => {
        setAllUsers(s.docs.map(d => ({id: d.id, ...d.data()})));
    });
  }, [userData]);

  // --- ACCIONES ---
  const toggleCompletion = async (readingId) => {
      if (!activeUid) return;
      const id = `${activeUid}_${readingId}`;
      const ref = doc(db, 'artifacts', APP_ID, 'completions', id);
      if (completionsMap[readingId]) await deleteDoc(ref);
      else await setDoc(ref, { userId: activeUid, userName: userData.displayName, readingId, completedAt: serverTimestamp() });
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
      const date = newReading.date || new Date().toISOString().split('T')[0];
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
          data.scripture = newReading.title || "Lectura";
          data.externalLink = newReading.externalLink;
          data.externalContent = newReading.externalContent;
      }
      await addDoc(collection(db, 'artifacts', APP_ID, 'readings'), data);
      alert("Lectura publicada");
  };

  const updateReading = async (e) => {
      e.preventDefault();
      if (!editingReading) return;
      
      const ref = doc(db, 'artifacts', APP_ID, 'readings', editingReading.id);
      await updateDoc(ref, {
          title: editingReading.title,
          scripture: editingReading.scripture,
          observation: editingReading.observation,
          date: editingReading.date
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

  // Helpers para agrupar
  const getGroupedReadings = (filter) => {
      const filtered = allReadings.filter(r => {
          const isCompleted = completionsMap[r.id];
          return filter === 'completed' ? isCompleted : !isCompleted;
      });
      
      // Agrupar por fecha
      const groups = {};
      filtered.forEach(r => {
          if (!groups[r.date]) groups[r.date] = [];
          groups[r.date].push(r);
      });
      return groups; // Objeto { "2023-11-28": [lecturas...], ... }
  };

  // --- RENDERS ---

  if (loading) return <div className="h-screen flex items-center justify-center bg-sky-50"><Loader2 className="animate-spin text-sky-600" size={48}/></div>;

  if (view === 'login') return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-none shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-2"><img src={LOGO_URL} className="w-full h-full object-contain"/></div>
          <h1 className="text-2xl font-bold text-slate-800 font-serif">Teología Paulina</h1>
          <p className="text-sky-600 font-bold uppercase text-xs mt-2">Comunidad de Lectura</p>
        </div>
        <div className="space-y-4">
            <Button onClick={handleGoogleLogin} variant="google" className="w-full py-3 flex gap-2 justify-center items-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="font-bold">Continuar con Google</span>
            </Button>
            <div className="text-center text-xs text-slate-400">Acceso exclusivo para miembros registrados</div>
        </div>
      </Card>
    </div>
  );

  if (view === 'pending') return (
    <div className="h-screen flex items-center justify-center bg-sky-50 p-4">
        <Card className="max-w-md p-8 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Solicitud Recibida</h2>
            <p className="text-slate-600 mb-6">Hola <b>{userData?.displayName}</b>. Tu cuenta está pendiente de aprobación.</p>
            <Button onClick={handleLogout} variant="secondary">Cerrar Sesión</Button>
        </Card>
    </div>
  );

  const Header = () => (
      <header className="bg-white border-b sticky top-0 z-10 px-4 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 font-serif font-bold text-slate-800"><img src={LOGO_URL} className="w-8 h-8"/> <span className="hidden sm:inline">Teología Paulina</span></div>
          <div className="flex gap-3 items-center">
              <a href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer" className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors" title="YouTube"><Youtube size={24} /></a>
              {userData?.role === 'admin' && (
                  <div className="flex bg-slate-100 p-1 rounded">
                      <button onClick={()=>setView('admin')} className={`px-3 py-1 text-xs rounded ${view==='admin'?'bg-white shadow text-sky-600':''}`}>Admin</button>
                      <button onClick={()=>setView('dashboard')} className={`px-3 py-1 text-xs rounded ${view==='dashboard'?'bg-white shadow text-sky-600':''}`}>Lectura</button>
                  </div>
              )}
              <img src={userData?.photoURL} className="w-8 h-8 rounded-full border"/>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-500"><LogOut size={20}/></button>
          </div>
      </header>
  );

  if (view === 'admin') return (
      <div className="min-h-screen bg-sky-50 pb-20">
          <Header/>
          <main className="max-w-7xl mx-auto p-4 space-y-6">
              <div className="flex gap-2 border-b pb-2 overflow-x-auto">
                  <Button variant={activeTab==='reading'?'primary':'ghost'} onClick={()=>setActiveTab('reading')} className="text-sm"><BookOpen size={16} className="mr-2"/> Lecturas</Button>
                  <Button variant={activeTab==='users'?'primary':'ghost'} onClick={()=>setActiveTab('users')} className="text-sm"><Users size={16} className="mr-2"/> Usuarios</Button>
              </div>

              {activeTab === 'reading' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="p-6 h-fit">
                          <h2 className="font-bold text-lg mb-4 text-slate-800">Nueva Asignación</h2>
                          <form onSubmit={createReading} className="space-y-4">
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
                                      <textarea className="w-full p-2 border rounded text-sm" placeholder="Contenido" value={newReading.externalContent} onChange={e=>setNewReading({...newReading, externalContent:e.target.value})}/>
                                  </div>
                              )}
                              {newReading.type === 'bible' && <input className="w-full p-2 border rounded text-sm" placeholder="Título Tema" value={newReading.title} onChange={e=>setNewReading({...newReading, title:e.target.value})}/>}
                              <textarea className="w-full p-2 border rounded text-sm" placeholder="Observación Pastoral" value={newReading.observation} onChange={e=>setNewReading({...newReading, observation:e.target.value})}/>
                              <Button type="submit" variant="primary" className="w-full">Publicar</Button>
                          </form>
                      </Card>

                      <div className="space-y-3">
                          <h3 className="font-bold text-slate-700">Historial Reciente</h3>
                          {allReadings.slice(0, 10).map(r => (
                              <div key={r.id} className="bg-white p-3 rounded border flex justify-between items-start">
                                  {editingReading?.id === r.id ? (
                                      <form onSubmit={updateReading} className="w-full space-y-2">
                                          <input className="w-full p-1 border rounded text-sm" value={editingReading.title} onChange={e=>setEditingReading({...editingReading, title:e.target.value})} placeholder="Título"/>
                                          <textarea className="w-full p-1 border rounded text-sm" value={editingReading.observation} onChange={e=>setEditingReading({...editingReading, observation:e.target.value})} placeholder="Observación"/>
                                          <div className="flex gap-2 justify-end">
                                              <button type="button" onClick={()=>setEditingReading(null)} className="text-xs text-slate-500">Cancelar</button>
                                              <button type="submit" className="text-xs bg-sky-500 text-white px-2 py-1 rounded">Guardar</button>
                                          </div>
                                      </form>
                                  ) : (
                                      <>
                                          <div>
                                              <div className="font-bold text-slate-800 text-sm">{r.scripture} <span className="font-normal text-slate-400 ml-2">{r.date}</span></div>
                                              {r.observation && <div className="text-xs text-slate-500 italic mt-1">"{r.observation}"</div>}
                                          </div>
                                          <div className="flex gap-2">
                                              <button onClick={()=>setEditingReading(r)} className="text-sky-500 hover:bg-sky-50 p-1 rounded"><Edit3 size={16}/></button>
                                              <button onClick={()=>deleteReading(r.id)} className="text-slate-300 hover:text-red-500 p-1 rounded"><X size={16}/></button>
                                          </div>
                                      </>
                                  )}
                              </div>
                          ))}
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
          </main>
      </div>
  );

  // --- USER VIEW ---
  const groupedReadings = getGroupedReadings(userFilter);
  const sortedDates = Object.keys(groupedReadings).sort().reverse();

  return (
      <div className="min-h-screen bg-sky-50 pb-20">
          <Header/>
          <main className="max-w-3xl mx-auto p-4 space-y-6">
              
              {/* Tabs Pendiente/Completado */}
              <div className="flex p-1 bg-slate-200 rounded-lg">
                  <button onClick={()=>setUserFilter('pending')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='pending'?'bg-white text-sky-600 shadow-sm':'text-slate-500'}`}>Pendientes</button>
                  <button onClick={()=>setUserFilter('completed')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='completed'?'bg-white text-emerald-600 shadow-sm':'text-slate-500'}`}>Completadas</button>
              </div>

              {sortedDates.length === 0 ? (
                  <div className="text-center p-12 text-slate-400 bg-white rounded-xl border border-slate-100">
                      <ScrollText size={48} className="mx-auto mb-4 text-sky-200"/>
                      <p>No hay lecturas {userFilter === 'pending' ? 'pendientes' : 'completadas'}.</p>
                  </div>
              ) : (
                  sortedDates.map(date => (
                      <div key={date} className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider px-2">
                              <Calendar size={14}/> {date === new Date().toISOString().split('T')[0] ? 'Hoy' : new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                              <div className="h-px bg-slate-200 flex-1"></div>
                          </div>
                          
                          {groupedReadings[date].map(r => {
                              const isRead = completionsMap[r.id];
                              const comments = commentsMap[r.id] || [];
                              const showComments = activeReadingIdForComment === r.id;
                              return (
                                  <Card key={r.id} className="overflow-hidden">
                                      <div className={`p-4 flex justify-between items-start ${r.type==='bible'?'bg-white border-l-4 border-sky-500':'bg-white border-l-4 border-amber-400'}`}>
                                          <div className="flex-1">
                                              <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 block ${r.type==='bible'?'text-sky-500':'text-amber-600'}`}>{r.type==='bible'?'Bíblica':'Externo'}</span>
                                              <h3 className="text-lg font-bold text-slate-800">{r.scripture}</h3>
                                              {r.title && <p className="text-sm text-slate-500">{r.title}</p>}
                                              
                                              {r.type === 'external' && r.externalLink && (
                                                  <a href={r.externalLink} target="_blank" className="mt-2 inline-flex items-center gap-1 text-xs text-sky-600 font-bold hover:underline border px-2 py-1 rounded bg-sky-50 border-sky-100"><LinkIcon size={12}/> Ver Recurso</a>
                                              )}
                                              
                                              {r.observation && (
                                                  <div className="mt-3 bg-slate-50 p-3 rounded text-sm text-slate-600 italic border-l-2 border-slate-300">
                                                      <span className="not-italic font-bold text-xs text-slate-400 block mb-1">Observación:</span>
                                                      {r.observation}
                                                  </div>
                                              )}
                                          </div>
                                          <button onClick={()=>toggleCompletion(r.id)} className={`p-2 rounded-full ${isRead?'text-emerald-500 bg-emerald-50':'text-slate-300 hover:bg-slate-100'}`}>
                                              {isRead ? <CheckCircle size={24} fill="currentColor" className="text-emerald-100"/> : <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>}
                                          </button>
                                      </div>
                                      
                                      {/* Comentarios Mini */}
                                      <div className="bg-slate-50/50 border-t px-4 py-2 flex justify-between items-center">
                                          <button onClick={()=>setActiveReadingIdForComment(showComments?null:r.id)} className="text-xs font-medium text-slate-500 hover:text-sky-600 flex items-center gap-1">
                                              <MessageSquare size={14}/> {comments.length > 0 ? `${comments.length} comentarios` : 'Comentar'}
                                          </button>
                                          {r.externalContent && <span className="text-xs text-slate-400 flex items-center gap-1"><FileText size={12}/> Contenido</span>}
                                      </div>

                                      {/* Área Expandible */}
                                      {showComments && (
                                          <div className="p-4 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-1">
                                              {r.externalContent && (
                                                  <div className="mb-4 p-3 bg-white rounded border text-sm text-slate-700 max-h-40 overflow-y-auto shadow-sm">
                                                      {r.externalContent}
                                                  </div>
                                              )}
                                              
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
                                              </div>
                                              <form onSubmit={e=>postComment(e,r.id)} className="flex gap-2">
                                                  <input className="flex-1 p-2 border rounded text-sm" placeholder="Escribe..." value={commentText} onChange={e=>setCommentText(e.target.value)}/>
                                                  <button type="submit" disabled={!commentText.trim()} className="text-sky-500 hover:bg-sky-100 p-2 rounded"><Send size={16}/></button>
                                              </form>
                                          </div>
                                      )}
                                  </Card>
                              );
                          })}
                      </div>
                  ))
              )}
          </main>
      </div>
  );
}