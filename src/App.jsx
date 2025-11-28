import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
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
} from 'firebase/firestore';
import {
  BookOpen,
  CheckCircle,
  MessageSquare,
  Users,
  LogOut,
  Calendar,
  Send,
  Loader2,
  PlusCircle,
  BarChart2,
  Edit3,
  Save,
  ChevronDown,
  Youtube,
  ScrollText,
  ArrowRight,
  ExternalLink,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Bell,
  X,
  AlertTriangle,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';

// --- TUS CLAVES REALES DE FIREBASE (PRODUCCIÓN) ---
const firebaseConfig = {
  apiKey: 'AIzaSyDa3r6IryXje6nfB7sOXl9vUDnKOd-liR4',
  authDomain: 'teologiapaulinaapp.firebaseapp.com',
  projectId: 'teologiapaulinaapp',
  storageBucket: 'teologiapaulinaapp.firebasestorage.app',
  messagingSenderId: '515560837418',
  appId: '1:515560837418:web:cdbbf3e7c066445e958e53',
  measurementId: 'G-6V68GQ5JTY',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const APP_ID = 'teologia-paulina-app';

// --- CONFIGURACIÓN DE IDENTIDAD ---
const LOGO_URL = 'https://i.ibb.co/rD9fNMv/1764042450953.png';
const YOUTUBE_CHANNEL =
  'https://youtube.com/@teologiapaulina?si=AI-DJ0BzKtqn-fY6';

// --- Estructura Bíblica ---
const BIBLE_STRUCTURE = {
  Génesis: 50,
  Éxodo: 40,
  Levítico: 27,
  Números: 36,
  Deuteronomio: 34,
  Josué: 24,
  Jueces: 21,
  Rut: 4,
  '1 Samuel': 31,
  '2 Samuel': 24,
  '1 Reyes': 22,
  '2 Reyes': 25,
  '1 Crónicas': 29,
  '2 Crónicas': 36,
  Esdras: 10,
  Nehemías: 13,
  Ester: 10,
  Job: 42,
  Salmos: 150,
  Proverbios: 31,
  Eclesiastés: 12,
  Cantares: 8,
  Isaías: 66,
  Jeremías: 52,
  Lamentaciones: 5,
  Ezequiel: 48,
  Daniel: 12,
  Oseas: 14,
  Joel: 3,
  Amós: 9,
  Abdías: 1,
  Jonás: 4,
  Miqueas: 7,
  Nahúm: 3,
  Habacuc: 3,
  Sofonías: 3,
  Hageo: 2,
  Zacarías: 14,
  Malaquías: 4,
  Mateo: 28,
  Marcos: 16,
  Lucas: 24,
  Juan: 21,
  Hechos: 28,
  Romanos: 16,
  '1 Corintios': 16,
  '2 Corintios': 13,
  Gálatas: 6,
  Efesios: 6,
  Filipenses: 4,
  Colosenses: 4,
  '1 Tesalonicenses': 5,
  '2 Tesalonicenses': 3,
  '1 Timoteo': 6,
  '2 Timoteo': 4,
  Tito: 3,
  Filemón: 1,
  Hebreos: 13,
  Santiago: 5,
  '1 Pedro': 5,
  '2 Pedro': 3,
  '1 Juan': 5,
  '2 Juan': 1,
  '3 Juan': 1,
  Judas: 1,
  Apocalipsis: 22,
};
const BIBLE_BOOKS_ORDER = Object.keys(BIBLE_STRUCTURE);

// --- Componentes ---
const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}) => {
  const baseStyle =
    'flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 shadow-md',
    google:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm font-bold',
    secondary:
      'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
    ghost: 'text-sky-600 hover:bg-sky-50 bg-transparent',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    blue: 'bg-sky-50 text-sky-700 border border-sky-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    gray: 'bg-gray-50 text-gray-600 border border-gray-100',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${colors[color]}`}
    >
      {children}
    </span>
  );
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
  const [todayReadings, setTodayReadings] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [completionsMap, setCompletionsMap] = useState({});
  const [commentsMap, setCompletionsMapComments] = useState({}); // Renamed to avoid confusion

  // Inputs
  const [loginName, setLoginName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [newReading, setNewReading] = useState({
    type: 'bible',
    date: new Date().toISOString().split('T')[0],
    title: '',
    startBook: 'Romanos',
    startChapter: '1',
    endBook: 'Romanos',
    endChapter: '1',
    verses: '',
    externalLink: '',
    externalContent: '',
    observation: '',
  });
  const [activeReadingIdForComment, setActiveReadingIdForComment] =
    useState(null);

  // 1. Inicializar Auth
  useEffect(() => {
    if (!document.querySelector('#tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
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

    // Si estamos en modo "recuperación" (el UID del perfil no coincide con el de auth),
    // no queremos que este listener sobrescriba nuestros datos con un perfil vacío.
    if (userData && userData.uid !== user.uid) {
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          if (!data.isApproved) setView('pending');
          else setView(data.role === 'admin' ? 'admin' : 'dashboard');
        } else {
          setUserData(null);
        }
        setLoading(false);
      },
      (error) => {
        console.log('Esperando perfil o sin permisos...', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // 3. Login con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await checkAndCreateProfile(user, user.displayName || 'Usuario Google');
    } catch (error) {
      console.error('Error Google:', error);
      let msg = 'Error al conectar con Google.';
      if (error.code === 'auth/unauthorized-domain')
        msg = `⚠️ Dominio no autorizado: ${window.location.hostname}`;
      else if (error.code === 'auth/popup-blocked')
        msg = '⚠️ Ventana bloqueada. Permite pop-ups en el navegador.';
      alert(msg);
      setLoading(false);
    }
  };

  // 4. Login Manual (Invitado Inteligente)
  const handleManualLogin = async (e) => {
    e.preventDefault();
    if (!loginName.trim()) return;
    setLoading(true);
    try {
      // Iniciamos sesión anónima para tener acceso
      const result = await signInAnonymously(auth);
      const currentUser = result.user;
      await updateProfile(currentUser, { displayName: loginName });

      // *** LÓGICA DE RECUPERACIÓN ***
      // Buscamos si ya existe un usuario con este nombre
      const usersRef = collection(db, 'artifacts', APP_ID, 'users');
      const q = query(usersRef, where('displayName', '==', loginName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // ¡Encontramos al usuario! Usamos SU perfil en lugar de crear uno nuevo
        const existingUser = querySnapshot.docs[0].data();
        console.log('Perfil recuperado:', existingUser.displayName);

        setUserData(existingUser); // Usamos los datos antiguos

        // Redirigimos según su estado antiguo
        if (!existingUser.isApproved) setView('pending');
        else setView(existingUser.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        // Usuario Nuevo - Creamos perfil normal vinculado al UID actual
        await checkAndCreateProfile(currentUser, loginName);
      }
    } catch (error) {
      console.error('Error Manual:', error);
      alert('Error al ingresar. Verifica tu conexión.');
      setLoading(false);
    }
  };

  // 5. Crear Perfil
  const checkAndCreateProfile = async (user, name) => {
    const userRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const usersSnap = await getDocs(
        collection(db, 'artifacts', APP_ID, 'users')
      );
      const isFirst = usersSnap.empty;

      const newProfile = {
        uid: user.uid,
        displayName: name,
        email: user.email || 'invitado@teologia.com',
        photoURL:
          user.photoURL ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=0ea5e9&textColor=ffffff`,
        role: isFirst ? 'admin' : 'user',
        isApproved: isFirst ? true : false,
        createdAt: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);

      // Actualizamos estado local inmediatamente
      setUserData(newProfile);
      if (!newProfile.isApproved) setView('pending');
      else setView(newProfile.role === 'admin' ? 'admin' : 'dashboard');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  // --- LÓGICA DE DATOS ---
  // Usamos userData?.uid para todas las consultas, asegurando continuidad si recuperamos perfil
  const activeUid = userData?.uid;

  // Leer Lecturas
  useEffect(() => {
    if (!userData?.isApproved) return;
    const today = new Date().toISOString().split('T')[0];
    const q = query(
      collection(db, 'artifacts', APP_ID, 'readings'),
      where('date', '==', today)
    );

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      docs.sort(
        (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0)
      );
      setTodayReadings(docs);
    });
  }, [userData]);

  // Leer Comentarios
  useEffect(() => {
    if (!userData?.isApproved || todayReadings.length === 0) return;

    const unsubscribes = todayReadings.map((r) => {
      const q = query(
        collection(db, 'artifacts', APP_ID, 'comments'),
        where('readingId', '==', r.id)
      );
      return onSnapshot(q, (s) => {
        const comments = s.docs.map((d) => ({ id: d.id, ...d.data() }));
        comments.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setCompletionsMapComments((prev) => ({ ...prev, [r.id]: comments }));
      });
    });
    return () => unsubscribes.forEach((u) => u());
  }, [todayReadings]);

  // Leer Progreso (Usando activeUid recuperado)
  useEffect(() => {
    if (!activeUid || todayReadings.length === 0) return;
    const unsubscribes = todayReadings.map((r) => {
      return onSnapshot(
        doc(db, 'artifacts', APP_ID, 'completions', `${activeUid}_${r.id}`),
        (s) => {
          setCompletionsMap((prev) => ({ ...prev, [r.id]: s.exists() }));
        }
      );
    });
    return () => unsubscribes.forEach((u) => u());
  }, [activeUid, todayReadings]);

  // Admin: Leer Usuarios
  useEffect(() => {
    if (userData?.role !== 'admin') return;
    return onSnapshot(collection(db, 'artifacts', APP_ID, 'users'), (s) => {
      setAllUsers(s.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [userData]);

  // --- ACCIONES ---

  const toggleCompletion = async (readingId) => {
    if (!activeUid) return;
    const id = `${activeUid}_${readingId}`;
    const ref = doc(db, 'artifacts', APP_ID, 'completions', id);
    if (completionsMap[readingId]) await deleteDoc(ref);
    else
      await setDoc(ref, {
        userId: activeUid,
        userName: userData.displayName,
        readingId,
        completedAt: serverTimestamp(),
      });
  };

  const postComment = async (e, readingId) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addDoc(collection(db, 'artifacts', APP_ID, 'comments'), {
      text: commentText,
      readingId,
      userId: activeUid,
      userName: userData.displayName,
      userPhoto: userData.photoURL,
      createdAt: serverTimestamp(),
    });
    setCommentText('');
  };

  const createReading = async (e) => {
    e.preventDefault();
    const date = newReading.date || new Date().toISOString().split('T')[0];
    let data = {
      type: newReading.type,
      date,
      title: newReading.title || '',
      observation: newReading.observation,
      createdBy: activeUid,
      createdAt: serverTimestamp(),
    };

    if (newReading.type === 'bible') {
      let scripture = `${newReading.startBook} ${newReading.startChapter}`;
      if (
        newReading.startBook !== newReading.endBook ||
        newReading.startChapter !== newReading.endChapter
      ) {
        scripture +=
          newReading.startBook === newReading.endBook
            ? `-${newReading.endChapter}`
            : ` - ${newReading.endBook} ${newReading.endChapter}`;
      }
      if (newReading.verses) scripture += `:${newReading.verses}`;
      data.scripture = scripture;
    } else {
      data.scripture = newReading.title || 'Lectura';
      data.externalLink = newReading.externalLink;
      data.externalContent = newReading.externalContent;
    }
    await addDoc(collection(db, 'artifacts', APP_ID, 'readings'), data);
    alert('Lectura publicada');
  };

  const deleteReading = async (id) => {
    if (confirm('¿Borrar lectura?'))
      await deleteDoc(doc(db, 'artifacts', APP_ID, 'readings', id));
  };

  const updateUserStatus = async (uid, field, value) => {
    await updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid), {
      [field]: value,
    });
  };

  const getChapters = (book) =>
    Array.from({ length: BIBLE_STRUCTURE[book] || 50 }, (_, i) => i + 1);

  // --- RENDERS ---

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-sky-50">
        <Loader2 className="animate-spin text-sky-600" size={48} />
      </div>
    );

  if (view === 'login')
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 border-none shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-2">
              <img src={LOGO_URL} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 font-serif">
              Teología Paulina
            </h1>
            <p className="text-sky-600 font-bold uppercase text-xs mt-2">
              Comunidad de Lectura
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              variant="google"
              className="w-full py-3 flex gap-2 justify-center"
            >
              <span className="font-bold">Continuar con Google</span>
            </Button>
            <div className="relative py-2">
              <div className="border-t"></div>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 bg-white px-2 text-xs text-slate-400">
                O invitado
              </span>
            </div>
            <form onSubmit={handleManualLogin} className="space-y-3">
              <input
                required
                className="w-full p-3 border rounded-lg text-sm"
                placeholder="Tu Nombre (Ej. Juan)"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
              />
              <Button type="submit" variant="primary" className="w-full">
                Entrar / Recuperar Sesión
              </Button>
            </form>
            <p className="text-xs text-center text-slate-400 px-4">
              Si usas el mismo nombre de una sesión anterior, recuperarás tu
              acceso.
            </p>
          </div>
        </Card>
      </div>
    );

  if (view === 'pending')
    return (
      <div className="h-screen flex items-center justify-center bg-sky-50 p-4">
        <Card className="max-w-md p-8 text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            Solicitud Recibida
          </h2>
          <p className="text-slate-600 mb-6">
            Hola <b>{userData?.displayName}</b>. Tu cuenta está pendiente de
            aprobación por un administrador.
          </p>
          <Button onClick={handleLogout} variant="secondary">
            Cerrar Sesión
          </Button>
        </Card>
      </div>
    );

  const Header = () => (
    <header className="bg-white border-b sticky top-0 z-10 px-4 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 font-serif font-bold text-slate-800">
        <img src={LOGO_URL} className="w-8 h-8" />{' '}
        <span className="hidden sm:inline">Teología Paulina</span>
      </div>
      <div className="flex gap-3 items-center">
        {userData?.role === 'admin' && (
          <div className="flex bg-slate-100 p-1 rounded">
            <button
              onClick={() => setView('admin')}
              className={`px-3 py-1 text-xs rounded ${
                view === 'admin' ? 'bg-white shadow text-sky-600' : ''
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={`px-3 py-1 text-xs rounded ${
                view === 'dashboard' ? 'bg-white shadow text-sky-600' : ''
              }`}
            >
              Lectura
            </button>
          </div>
        )}
        <img src={userData?.photoURL} className="w-8 h-8 rounded-full border" />
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-red-500"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );

  if (view === 'admin')
    return (
      <div className="min-h-screen bg-sky-50 pb-20">
        <Header />
        <main className="max-w-5xl mx-auto p-4 space-y-6">
          <div className="flex gap-2 border-b pb-2 overflow-x-auto">
            <Button
              variant={activeTab === 'reading' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('reading')}
              className="text-sm"
            >
              <BookOpen size={16} className="mr-2" /> Lecturas
            </Button>
            <Button
              variant={activeTab === 'users' ? 'primary' : 'ghost'}
              onClick={() => setActiveTab('users')}
              className="text-sm"
            >
              <Users size={16} className="mr-2" /> Usuarios
            </Button>
          </div>

          {activeTab === 'reading' && (
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 h-fit">
                <h2 className="font-bold text-lg mb-4 text-slate-800">
                  Nueva Asignación
                </h2>
                <form onSubmit={createReading} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="p-2 border rounded text-sm"
                      value={newReading.date}
                      onChange={(e) =>
                        setNewReading({ ...newReading, date: e.target.value })
                      }
                    />
                    <select
                      className="p-2 border rounded text-sm"
                      value={newReading.type}
                      onChange={(e) =>
                        setNewReading({ ...newReading, type: e.target.value })
                      }
                    >
                      <option value="bible">Biblia</option>
                      <option value="external">Externo</option>
                    </select>
                  </div>
                  {newReading.type === 'bible' ? (
                    <div className="space-y-2 bg-sky-50 p-3 rounded">
                      <div className="flex gap-1">
                        <select
                          className="flex-1 p-2 border rounded text-sm"
                          value={newReading.startBook}
                          onChange={(e) =>
                            setNewReading({
                              ...newReading,
                              startBook: e.target.value,
                              endBook: e.target.value,
                            })
                          }
                        >
                          {BIBLE_BOOKS_ORDER.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </select>
                        <select
                          className="w-16 p-2 border rounded text-sm"
                          value={newReading.startChapter}
                          onChange={(e) =>
                            setNewReading({
                              ...newReading,
                              startChapter: e.target.value,
                            })
                          }
                        >
                          {getChapters(newReading.startBook).map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-1">
                        <select
                          className="flex-1 p-2 border rounded text-sm"
                          value={newReading.endBook}
                          onChange={(e) =>
                            setNewReading({
                              ...newReading,
                              endBook: e.target.value,
                            })
                          }
                        >
                          {BIBLE_BOOKS_ORDER.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </select>
                        <select
                          className="w-16 p-2 border rounded text-sm"
                          value={newReading.endChapter}
                          onChange={(e) =>
                            setNewReading({
                              ...newReading,
                              endChapter: e.target.value,
                            })
                          }
                        >
                          {getChapters(newReading.endBook).map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                      <input
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Versículos"
                        value={newReading.verses}
                        onChange={(e) =>
                          setNewReading({
                            ...newReading,
                            verses: e.target.value,
                          })
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 bg-amber-50 p-3 rounded">
                      <input
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Título *"
                        required
                        value={newReading.title}
                        onChange={(e) =>
                          setNewReading({
                            ...newReading,
                            title: e.target.value,
                          })
                        }
                      />
                      <input
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Link URL"
                        value={newReading.externalLink}
                        onChange={(e) =>
                          setNewReading({
                            ...newReading,
                            externalLink: e.target.value,
                          })
                        }
                      />
                      <textarea
                        className="w-full p-2 border rounded text-sm"
                        placeholder="Contenido"
                        value={newReading.externalContent}
                        onChange={(e) =>
                          setNewReading({
                            ...newReading,
                            externalContent: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                  {newReading.type === 'bible' && (
                    <input
                      className="w-full p-2 border rounded text-sm"
                      placeholder="Título Tema"
                      value={newReading.title}
                      onChange={(e) =>
                        setNewReading({ ...newReading, title: e.target.value })
                      }
                    />
                  )}
                  <textarea
                    className="w-full p-2 border rounded text-sm"
                    placeholder="Observación Pastoral"
                    value={newReading.observation}
                    onChange={(e) =>
                      setNewReading({
                        ...newReading,
                        observation: e.target.value,
                      })
                    }
                  />
                  <Button type="submit" variant="primary" className="w-full">
                    Publicar
                  </Button>
                </form>
              </Card>
              <div className="space-y-3">
                <h3 className="font-bold text-slate-700">
                  Asignado para: {newReading.date}
                </h3>
                {todayReadings
                  .filter((r) => r.date === newReading.date)
                  .map((r) => (
                    <Card key={r.id} className="p-3 relative group">
                      <button
                        onClick={async () => {
                          if (confirm('Borrar?'))
                            await deleteDoc(
                              doc(db, 'artifacts', APP_ID, 'readings', r.id)
                            );
                        }}
                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                      <div className="font-bold text-slate-800">
                        {r.scripture}
                      </div>
                      <div className="text-xs text-slate-500">{r.title}</div>
                    </Card>
                  ))}
                {todayReadings.filter((r) => r.date === newReading.date)
                  .length === 0 && (
                  <p className="text-slate-400 italic text-sm">
                    Nada programado aún.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-3">
              {allUsers.map((u) => (
                <Card
                  key={u.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img src={u.photoURL} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="font-bold text-sm text-slate-800 flex items-center gap-1">
                        {u.displayName}{' '}
                        {u.role === 'admin' && (
                          <ShieldCheck size={14} className="text-amber-500" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {u.uid !== activeUid && (
                      <>
                        <button
                          onClick={() =>
                            updateUserStatus(u.id, 'isApproved', !u.isApproved)
                          }
                          className={`px-2 py-1 text-xs border rounded ${
                            u.isApproved
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-slate-100'
                          }`}
                        >
                          {u.isApproved ? 'Aprobado' : 'Aprobar'}
                        </button>
                        <button
                          onClick={() =>
                            updateUserStatus(
                              u.id,
                              'role',
                              u.role === 'admin' ? 'user' : 'admin'
                            )
                          }
                          className="px-2 py-1 text-xs border rounded text-amber-600"
                        >
                          {u.role === 'admin' ? 'Bajar' : 'Subir'}
                        </button>
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

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      <Header />
      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-serif font-bold text-xl text-slate-800">
            Lecturas de Hoy
          </h2>
          <span className="text-sm bg-white px-3 py-1 rounded-full shadow-sm text-slate-500">
            {new Date().toLocaleDateString()}
          </span>
        </div>

        {todayReadings.length === 0 ? (
          <div className="text-center p-12 text-slate-400 bg-white rounded-xl border border-slate-100">
            <ScrollText size={48} className="mx-auto mb-4 text-sky-200" />
            <p>No hay lecturas asignadas para hoy.</p>
          </div>
        ) : (
          todayReadings.map((r) => {
            const isRead = completionsMap[r.id];
            const comments = commentsMap[r.id] || [];
            const showComments = activeReadingIdForComment === r.id;
            return (
              <Card key={r.id} className="overflow-hidden">
                <div
                  className={`p-6 text-white relative ${
                    r.type === 'bible' ? 'bg-sky-600' : 'bg-amber-500'
                  }`}
                >
                  <div className="relative z-10">
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded uppercase tracking-wider">
                      {r.type === 'bible' ? 'Bíblica' : 'Externo'}
                    </span>
                    <h3 className="text-2xl font-serif font-bold mt-2">
                      {r.scripture}
                    </h3>
                    {r.type === 'bible' && (
                      <p className="opacity-90">{r.title}</p>
                    )}
                  </div>
                  <BookOpen
                    className="absolute right-4 bottom-4 opacity-20"
                    size={64}
                  />
                </div>
                <div className="p-6">
                  {r.type === 'external' && (
                    <div className="mb-6 space-y-4">
                      {r.externalContent && (
                        <div className="bg-slate-50 p-4 rounded text-sm text-slate-600">
                          {r.externalContent}
                        </div>
                      )}
                      {r.externalLink && (
                        <a
                          href={r.externalLink}
                          target="_blank"
                          className="flex items-center gap-2 text-sky-600 font-bold text-sm hover:underline"
                        >
                          <LinkIcon size={16} /> Abrir Recurso
                        </a>
                      )}
                    </div>
                  )}
                  {r.observation && (
                    <div className="bg-amber-50 p-4 rounded border-l-4 border-amber-400 mb-6 text-sm text-slate-700 italic">
                      <span className="block font-bold text-xs text-amber-700 not-italic mb-1">
                        Nota Pastoral:
                      </span>
                      "{r.observation}"
                    </div>
                  )}
                  <button
                    onClick={() => toggleCompletion(r.id)}
                    className={`w-full py-3 rounded font-bold flex items-center justify-center gap-2 transition-colors ${
                      isRead
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isRead ? (
                      <>
                        <CheckCircle size={18} /> Completado
                      </>
                    ) : (
                      'Marcar como Leído'
                    )}
                  </button>
                </div>
                <div className="bg-slate-50 border-t p-4">
                  <button
                    onClick={() =>
                      setActiveReadingIdForComment(showComments ? null : r.id)
                    }
                    className="text-sm text-slate-500 hover:text-sky-600 flex items-center gap-2 w-full"
                  >
                    <MessageSquare size={16} /> {comments.length} Comentarios{' '}
                    <ChevronDown
                      size={14}
                      className={`ml-auto transform ${
                        showComments ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {showComments && (
                    <div className="mt-4 space-y-3">
                      <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                        {comments.map((c) => (
                          <div
                            key={c.id}
                            className="bg-white p-3 rounded border text-sm"
                          >
                            <div className="flex justify-between mb-1">
                              <span className="font-bold text-slate-700">
                                {c.userName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(
                                  c.createdAt?.seconds * 1000
                                ).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-600">{c.text}</p>
                          </div>
                        ))}
                        {comments.length === 0 && (
                          <p className="text-center text-xs text-slate-400">
                            Sin comentarios.
                          </p>
                        )}
                      </div>
                      <form
                        onSubmit={(e) => postComment(e, r.id)}
                        className="flex gap-2"
                      >
                        <input
                          className="flex-1 p-2 border rounded text-sm"
                          placeholder="Escribe algo..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim()}
                          className="bg-sky-500 text-white p-2 rounded"
                        >
                          <Send size={16} />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </main>
    </div>
  );
}
