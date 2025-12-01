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
  Flame, Award, Crown, Star, Medal, Lock, Percent, MessageCircle, ToggleLeft, ToggleRight, Plus, Trash2
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const APP_ID = 'teologia-paulina-app';
const LOGO_URL = "https://i.ibb.co/rD9fNMv/1764042450953.png";

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

const generateStaticPlan = () => {
    const plan = [];
    const books = Object.entries(BIBLE_STRUCTURE);
    let allChapters = [];
    books.forEach(([book, chapters]) => {
        for(let i=1; i<=chapters; i++) allChapters.push(`${book} ${i}`);
    });
    const totalChapters = allChapters.length;
    const totalDays = 365;
    const chaptersPerDay = totalChapters / totalDays;
    let currentChapterIndex = 0;
    const year = new Date().getFullYear();

    for (let d = 0; d < totalDays; d++) {
        const date = new Date(year, 0, d + 1);
        const dateStr = date.toISOString().split('T')[0];
        const nextIndex = Math.round((d + 1) * chaptersPerDay);
        const dailyChapters = allChapters.slice(currentChapterIndex, nextIndex);
        currentChapterIndex = nextIndex;

        let passage = "";
        if (dailyChapters.length > 0) {
            const first = dailyChapters[0];
            const last = dailyChapters[dailyChapters.length - 1];
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
        plan.push({ id: dateStr, date: dateStr, corePassage: passage, displayDate: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) });
    }
    return plan;
};

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

// Componentes UI
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type="button" }) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 shadow-md",
    google: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm font-bold",
    secondary: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    ghost: "text-sky-600 hover:bg-sky-50 bg-transparent"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>{children}</button>;
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden ${className}`}>{children}</div>
);

// --- COMPONENTE ADMIN VIEW ---
const AdminView = ({ staticPlan, dailyContentMap, allUsers, allCompletions, user, onBack }) => {
  const [activeTab, setActiveTab] = useState('reading');
  const [statsMode, setStatsMode] = useState('byUser');
  const [editingDay, setEditingDay] = useState(null);
  
  // Estado del formulario de edición
  const [editForm, setEditForm] = useState({ 
    observation: '', 
    extraReadings: [], // Array de { title, link }
    isEnabled: false 
  });
  
  // Estado temporal para agregar un nuevo extra
  const [newExtra, setNewExtra] = useState({ title: '', link: '' });

  const startEditing = (day) => {
    const content = dailyContentMap[day.id] || {};
    setEditingDay(day);
    setEditForm({
      observation: content.observation || '',
      extraReadings: content.extraReadings || [],
      isEnabled: content.isEnabled || false
    });
    setNewExtra({ title: '', link: '' });
  };

  const addExtraReading = () => {
    if (!newExtra.title) return;
    setEditForm({
      ...editForm,
      extraReadings: [...editForm.extraReadings, { ...newExtra, id: Date.now() }]
    });
    setNewExtra({ title: '', link: '' });
  };

  const removeExtraReading = (id) => {
    setEditForm({
      ...editForm,
      extraReadings: editForm.extraReadings.filter(e => e.id !== id)
    });
  };

  const saveDayConfig = async (e) => {
    e.preventDefault();
    if (!editingDay) return;
    
    const docRef = doc(db, 'artifacts', APP_ID, 'daily_content', editingDay.id);
    await setDoc(docRef, {
        observation: editForm.observation,
        extraReadings: editForm.extraReadings,
        isEnabled: editForm.isEnabled,
        updatedAt: serverTimestamp()
    }, { merge: true });
    
    setEditingDay(null);
  };

  const toggleDayEnabled = async (dayId, currentStatus) => {
    const docRef = doc(db, 'artifacts', APP_ID, 'daily_content', dayId);
    await setDoc(docRef, { isEnabled: !currentStatus }, { merge: true });
  };

  const updateUserStatus = async (uid, field, value) => {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid), { [field]: value });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex gap-2 border-b pb-2 overflow-x-auto">
            <Button variant={activeTab==='reading'?'primary':'ghost'} onClick={()=>setActiveTab('reading')} className="text-sm"><BookOpen size={16} className="mr-2"/> Planificación</Button>
            <Button variant={activeTab==='users'?'primary':'ghost'} onClick={()=>setActiveTab('users')} className="text-sm"><Users size={16} className="mr-2"/> Usuarios</Button>
            <Button variant={activeTab==='stats'?'primary':'ghost'} onClick={()=>setActiveTab('stats')} className="text-sm"><BarChart2 size={16} className="mr-2"/> Progreso</Button>
        </div>

        {activeTab === 'reading' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                    <label className="text-xs font-bold text-amber-600 uppercase block mb-2">Lecturas Adicionales</label>
                                    
                                    {/* Lista de Extras Agregados */}
                                    <div className="space-y-2 mb-3">
                                      {editForm.extraReadings.map((extra, idx) => (
                                        <div key={extra.id || idx} className="flex justify-between items-center bg-white p-2 rounded border border-amber-200 text-sm">
                                          <div className="truncate">
                                            <div className="font-bold text-slate-700">{extra.title}</div>
                                            <div className="text-xs text-slate-400 truncate">{extra.link}</div>
                                          </div>
                                          <button type="button" onClick={() => removeExtraReading(extra.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14}/></button>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Inputs para agregar nuevo */}
                                    <div className="flex flex-col gap-2 border-t border-amber-200 pt-2">
                                      <input 
                                          className="w-full p-2 border rounded text-sm" 
                                          placeholder="Título (Ej: Artículo Teológico)"
                                          value={newExtra.title}
                                          onChange={e=>setNewExtra({...newExtra, title:e.target.value})}
                                      />
                                      <div className="flex gap-2">
                                        <input 
                                            className="w-full p-2 border rounded text-sm" 
                                            placeholder="URL (Opcional)"
                                            value={newExtra.link}
                                            onChange={e=>setNewExtra({...newExtra, link:e.target.value})}
                                        />
                                        <Button type="button" onClick={addExtraReading} className="px-3" disabled={!newExtra.title}><Plus size={16}/></Button>
                                      </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 py-2 border-t border-b">
                                    <button 
                                        type="button" 
                                        onClick={()=>setEditForm({...editForm, isEnabled: !editForm.isEnabled})}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.isEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                                    </button>
                                    <span className="text-sm font-bold text-slate-700">{editForm.isEnabled ? 'Habilitado' : 'Oculto'}</span>
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

                <div className="lg:col-span-2 space-y-3">
                    <h3 className="font-bold text-slate-700 flex justify-between items-center">
                        <span>Calendario Anual</span>
                        <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded">365 Días</span>
                    </h3>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="max-h-[600px] overflow-y-auto divide-y">
                            {staticPlan.map(day => {
                                const content = dailyContentMap[day.id] || {};
                                const isEnabled = content.isEnabled;
                                const extrasCount = content.extraReadings?.length || 0;

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
                                                {content.observation && <span className="text-[10px] bg-sky-50 text-sky-600 px-1 rounded border border-sky-100">Comentario</span>}
                                                {extrasCount > 0 && <span className="text-[10px] bg-amber-50 text-amber-600 px-1 rounded border border-amber-100">+{extrasCount} Extras</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => toggleDayEnabled(day.id, isEnabled)}
                                                className={`p-2 rounded hover:bg-slate-200 text-slate-400 ${isEnabled ? 'text-emerald-500' : ''}`}
                                            >
                                                {isEnabled ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                                            </button>
                                            <button 
                                                onClick={() => startEditing(day)}
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
            </div>
        )}
    </div>
  );
};

// --- COMPONENTE USER VIEW ---
const UserView = ({ staticPlan, dailyContentMap, completionsMap, commentsMap, bibleProgress, user, activeUid }) => {
  const [userFilter, setUserFilter] = useState('pending');
  const [activeReadingIdForComment, setActiveReadingIdForComment] = useState(null);
  const [commentText, setCommentText] = useState('');

  const todayStr = getLocalDate();
  const todayDate = new Date(todayStr + 'T12:00:00');

  const userPlan = useMemo(() => {
    return staticPlan.map(day => {
        const content = dailyContentMap[day.id] || {};
        return { ...day, ...content };
    });
  }, [staticPlan, dailyContentMap]);

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
              userId: activeUid, userName: user.displayName, readingId, completedAt: serverTimestamp() 
          });
      }
  };

  const postComment = async (e, readingId) => {
      e.preventDefault();
      if (!commentText.trim()) return;
      await addDoc(collection(db, 'artifacts', APP_ID, 'comments'), {
          text: commentText, readingId, userId: activeUid, userName: user.displayName, userPhoto: user.photoURL, createdAt: serverTimestamp()
      });
      setCommentText('');
  };

  const sendWhatsAppNotification = (day) => {
      const link = "https://teologia-paulina-app.vercel.app";
      let msg = `*Plan Bíblico Diario* 🕊️\n\n📅 *Fecha:* ${day.displayDate}\n📖 *Lectura:* ${day.corePassage}`;
      if (day.observation) msg += `\n\n💬 *Pastoral:* _"${day.observation}"_`;
      msg += `\n\n🔗 *Leer aquí:* ${link}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
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

        <div className="flex p-1 bg-slate-200 rounded-lg">
            <button onClick={()=>setUserFilter('pending')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='pending'?'bg-white text-sky-600 shadow-sm':'text-slate-500'}`}>Pendientes</button>
            <button onClick={()=>setUserFilter('completed')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='completed'?'bg-white text-emerald-600 shadow-sm':'text-slate-500'}`}>Completadas</button>
        </div>

        <div className="space-y-4">
            {userPlan.map((day, index) => {
                const isComplete = completionsMap[day.id];
                
                if (userFilter === 'completed' && !isComplete) return null;
                if (userFilter === 'pending' && isComplete) return null;

                const readingDate = new Date(day.date + 'T12:00:00');
                const isFuture = readingDate > todayDate;
                const prevDayId = index > 0 ? userPlan[index-1].id : null;
                const isSeqLocked = prevDayId && !completionsMap[prevDayId];
                const isAdminLocked = !day.isEnabled;
                const isLocked = isFuture || isSeqLocked || isAdminLocked;

                const diffDays = (readingDate - todayDate) / (1000 * 60 * 60 * 24);
                if (userFilter === 'pending' && diffDays > 3) return null; 
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
                                    
                                    {(day.observation || (day.extraReadings && day.extraReadings.length > 0)) && (
                                        <div className="mt-3 bg-slate-50 p-3 rounded text-sm text-slate-600 border border-slate-100">
                                            {day.observation && (
                                                <div className="mb-2 italic border-l-2 border-amber-300 pl-2">
                                                    <span className="not-italic font-bold text-xs text-slate-400 block mb-1">Pastor:</span>
                                                    "{day.observation}"
                                                </div>
                                            )}
                                            {day.extraReadings && day.extraReadings.map((extra, i) => (
                                                <div key={i} className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 first:border-0 first:pt-0">
                                                    <span className="text-xs font-bold text-amber-600 uppercase">Extra:</span>
                                                    {extra.link ? (
                                                        <a href={extra.link} target="_blank" className="font-bold text-sky-600 hover:underline flex items-center gap-1">
                                                            {extra.title} <LinkIcon size={10}/>
                                                        </a>
                                                    ) : (
                                                        <span className="font-medium text-slate-700">{extra.title}</span>
                                                    )}
                                                </div>
                                            ))}
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
                                    <button onClick={() => sendWhatsAppNotification(day)} className="text-emerald-500 opacity-50 hover:opacity-100 p-1"><MessageCircle size={16}/></button>
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
            {userFilter === 'pending' && userPlan.every(d => completionsMap[d.id] || d.date > getLocalDate()) && (
                <div className="text-center py-10 text-slate-400">
                    <p>¡Estás al día! Revisa mañana para la siguiente lectura.</p>
                </div>
            )}
        </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [staticPlan] = useState(generateStaticPlan());
  const [dailyContentMap, setDailyContentMap] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [allCompletions, setAllCompletions] = useState([]); 
  const [completionsMap, setCompletionsMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  
  // Calculated State
  const [streak, setStreak] = useState(0);
  const [bibleProgress, setBibleProgress] = useState(0);

  // AUTH
  useEffect(() => {
    if (!document.querySelector('#tailwind-cdn')) {
        const script = document.createElement('script');
        script.id = 'tailwind-cdn';
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) { setLoading(false); setUserData(null); }
    });
    return () => unsubscribe();
  }, []);

  // PROFILE
  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'artifacts', APP_ID, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) setUserData(docSnap.data());
        else setUserData(null);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // LOAD DATA (Solo si está aprobado)
  useEffect(() => {
    if (!userData?.isApproved) return;
    
    const unsubDaily = onSnapshot(query(collection(db, 'artifacts', APP_ID, 'daily_content')), snap => {
        const map = {};
        snap.docs.forEach(d => map[d.id] = d.data());
        setDailyContentMap(map);
    });

    const unsubComments = onSnapshot(query(collection(db, 'artifacts', APP_ID, 'comments'), orderBy('createdAt', 'desc')), snap => {
        const map = {};
        snap.docs.forEach(doc => {
            const d = doc.data();
            if (!map[d.readingId]) map[d.readingId] = [];
            map[d.readingId].push({id: doc.id, ...d});
        });
        setCommentsMap(map);
    });

    const unsubCompletions = onSnapshot(query(collection(db, 'artifacts', APP_ID, 'completions'), where('userId', '==', userData.uid)), snap => {
        const map = {};
        const userCompletions = new Set();
        let count = 0;
        snap.docs.forEach(doc => {
            const data = doc.data();
            map[data.readingId] = true;
            userCompletions.add(data.readingId);
            count++;
        });
        setCompletionsMap(map);
        
        // Progress & Streak logic
        setBibleProgress(Math.min(100, Math.round((count / 365) * 100)));
        let currentStreak = 0;
        let cursorDate = getLocalDate();
        if (!userCompletions.has(cursorDate)) cursorDate = getPrevDateStr(cursorDate);
        while(userCompletions.has(cursorDate)) {
             currentStreak++;
             cursorDate = getPrevDateStr(cursorDate);
        }
        setStreak(currentStreak);
    });

    // Admin data load
    let unsubAllUsers = () => {};
    let unsubAllCompletions = () => {};
    
    if (userData.role === 'admin') {
         unsubAllUsers = onSnapshot(collection(db, 'artifacts', APP_ID, 'users'), s => {
            setAllUsers(s.docs.map(d => ({id: d.id, ...d.data()})));
        });
         unsubAllCompletions = onSnapshot(collection(db, 'artifacts', APP_ID, 'completions'), s => {
            setAllCompletions(s.docs.map(d => d.data()));
        });
    }

    return () => { unsubDaily(); unsubComments(); unsubCompletions(); unsubAllUsers(); unsubAllCompletions(); };
  }, [userData]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'artifacts', APP_ID, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
          // Check if first user
          const q = query(collection(db, 'artifacts', APP_ID, 'users'));
          const snap = await getDocs(q);
          const isFirst = snap.empty;
          
          await setDoc(userRef, {
                uid: result.user.uid,
                displayName: result.user.displayName,
                email: result.user.email,
                photoURL: result.user.photoURL,
                role: isFirst ? 'admin' : 'user',
                isApproved: isFirst ? true : false,
                createdAt: serverTimestamp()
          });
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
      setLoading(false);
    }
  };

  const handleLogout = async () => { await signOut(auth); window.location.reload(); };

  // --- RENDERING ---
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'admin'

  if (loading) return <div className="h-screen flex items-center justify-center bg-sky-50"><Loader2 className="animate-spin text-sky-600" size={48}/></div>;

  if (!user) return (
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

  if (userData && !userData.isApproved) return (
    <div className="h-screen flex items-center justify-center bg-sky-50 p-4">
        <Card className="max-w-md p-8 text-center">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Solicitud Recibida</h2>
            <p className="text-slate-600 mb-6">Hola <b>{userData.displayName}</b>. Tu cuenta será aprobada pronto.</p>
            <Button onClick={handleLogout} variant="secondary">Cerrar Sesión</Button>
        </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
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

      {view === 'admin' && userData?.role === 'admin' ? (
        <AdminView 
            staticPlan={staticPlan} 
            dailyContentMap={dailyContentMap} 
            allUsers={allUsers}
            allCompletions={allCompletions}
            user={userData}
        />
      ) : (
        <UserView 
            staticPlan={staticPlan}
            dailyContentMap={dailyContentMap}
            completionsMap={completionsMap}
            commentsMap={commentsMap}
            bibleProgress={bibleProgress}
            user={userData}
            activeUid={user.uid}
        />
      )}
    </div>
  );
}