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
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { 
  BookOpen, CheckCircle, MessageSquare, Users, LogOut, Calendar, Send, Loader2, 
  BarChart2, Edit3, ChevronDown, Youtube, ScrollText, 
  Shield, ShieldCheck, Bell, X, 
  AlertTriangle, FileText, Link as LinkIcon, Activity,
  Flame, Award, Crown, Star, Medal, Lock, Percent, MessageCircle, ToggleLeft, ToggleRight, Plus, Trash2,
  AlertCircle, Settings, History, Clock, Zap, Search, UserCheck, UserPlus
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
const LOGO_URL = "https://i.postimg.cc/DwmFG9gG/Logo-TP.jpg";
const FAVICON_URL = "https://i.postimg.cc/DwmFG9gG/Logo-TP.jpg";
const YOUTUBE_CHANNEL = "https://youtube.com/@teologiapaulina?si=5gwOAmgbXHh1hbgc";
const APP_URL = "https://teologia-paulina-lectura-diaria.vercel.app/";

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

// --- Configuración de Insignias ---
const BADGES = [
  { days: 7, label: "1 Semana", icon: Star, color: "text-yellow-500", bg: "bg-yellow-100" },
  { days: 30, label: "1 Mes", icon: Medal, color: "text-blue-500", bg: "bg-blue-100" },
  { days: 90, label: "3 Meses", icon: Shield, color: "text-indigo-500", bg: "bg-indigo-100" },
  { days: 180, label: "Medio Año", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-100" },
  { days: 300, label: "Constancia", icon: Award, color: "text-pink-500", bg: "bg-pink-100" },
  { days: 365, label: "Biblia Completa", icon: Crown, color: "text-amber-500", bg: "bg-amber-100" },
];

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
        const dateObj = new Date(year, 0, d + 1);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dayNum = String(dateObj.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${dayNum}`;

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
        plan.push({ 
            id: dateStr, 
            date: dateStr, 
            corePassage: passage, 
            displayDate: dateObj.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) 
        });
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
  const [planSubTab, setPlanSubTab] = useState('pending'); 
  
  // Estados para Usuarios
  const [userTab, setUserTab] = useState('pending'); // 'pending' | 'approved'
  
  // Estados para Estadísticas
  const [statsMode, setStatsMode] = useState('byUser');
  const [searchQuery, setSearchQuery] = useState(''); // Buscador general

  const [editingDay, setEditingDay] = useState(null);
  const [expandedStatItem, setExpandedStatItem] = useState(null);
  
  const [editForm, setEditForm] = useState({ observation: '', extraReadings: [], isEnabled: false });
  const [newExtra, setNewExtra] = useState({ title: '', link: '' });

  const todayStr = getLocalDate();

  // Filtrado de usuarios
  const pendingUsers = useMemo(() => allUsers.filter(u => !u.isApproved), [allUsers]);
  const approvedUsers = useMemo(() => allUsers.filter(u => u.isApproved), [allUsers]);
  
  const visibleUsersList = useMemo(() => {
     return userTab === 'pending' ? pendingUsers : approvedUsers;
  }, [userTab, pendingUsers, approvedUsers]);

  // Filtrado de Estadísticas
  const filteredStatsUsers = useMemo(() => {
      if (!searchQuery) return allUsers;
      return allUsers.filter(u => u.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allUsers, searchQuery]);

  const filteredStatsReadings = useMemo(() => {
      if (!searchQuery) return staticPlan;
      return staticPlan.filter(d => 
          d.corePassage.toLowerCase().includes(searchQuery.toLowerCase()) || 
          d.displayDate.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [staticPlan, searchQuery]);


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

  const toggleDayEnabled = async (day, currentStatus) => {
    if (day.date <= todayStr) return; // No cambiar pasado ni hoy

    const docRef = doc(db, 'artifacts', APP_ID, 'daily_content', day.id);
    await setDoc(docRef, { isEnabled: !currentStatus }, { merge: true });
  };

  const sendWhatsAppNotification = (day, content) => {
      let msg = `*Plan Bíblico Diario*\n\n📅 *Fecha:* ${day.displayDate}\n📖 *Lectura:* ${day.corePassage}`;
      if (content?.extraReadings?.length > 0) msg += `\n\n➕ *Material Extra:* ${content.extraReadings.length} recursos disponibles.`;
      // LINK ELIMINADO A PETICIÓN
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const updateUserStatus = async (uid, field, value) => {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'users', uid), { [field]: value });
  };

  const setMassiveStartDate = async () => {
      if (!confirm("⚠️ ATENCIÓN: Esto establecerá la fecha de inicio del plan para TODOS los usuarios al 01-01-2026.\n\n¿Estás seguro?")) return;
      try {
          const usersSnapshot = await getDocs(collection(db, 'artifacts', APP_ID, 'users'));
          const batchSize = 450; 
          const batches = [];
          let currentBatch = writeBatch(db);
          let operationCounter = 0;
          usersSnapshot.docs.forEach((userDoc, index) => {
              const userRef = doc(db, 'artifacts', APP_ID, 'users', userDoc.id);
              currentBatch.update(userRef, { planStartDate: '2026-01-01' });
              operationCounter++;
              if (operationCounter === batchSize || index === usersSnapshot.size - 1) {
                  batches.push(currentBatch.commit());
                  currentBatch = writeBatch(db); 
                  operationCounter = 0;
              }
          });
          await Promise.all(batches);
          alert(`✅ Éxito.`);
      } catch (error) { console.error(error); alert("❌ Error."); }
  };

  const toggleStatExpand = (id) => {
    if (expandedStatItem === id) setExpandedStatItem(null);
    else setExpandedStatItem(id);
  };

  const visiblePlan = useMemo(() => {
      if (planSubTab === 'history') {
          return staticPlan.filter(d => d.date < todayStr).reverse();
      } else {
          return staticPlan.filter(d => d.date >= todayStr);
      }
  }, [staticPlan, planSubTab, todayStr]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex gap-2 border-b pb-2 overflow-x-auto">
            <Button variant={activeTab==='reading'?'primary':'ghost'} onClick={()=>setActiveTab('reading')} className="text-sm"><BookOpen size={16} className="mr-2"/> Planificación</Button>
            <div className="relative">
                <Button variant={activeTab==='users'?'primary':'ghost'} onClick={()=>setActiveTab('users')} className="text-sm"><Users size={16} className="mr-2"/> Usuarios</Button>
                {pendingUsers.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{pendingUsers.length}</span>}
            </div>
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
                                    <div className="text-xs font-bold text-sky-600 uppercase mb-1">Lectura Bíblica</div>
                                    <div className="font-bold text-slate-800 text-lg">{editingDay.corePassage}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Comentario Pastoral</label>
                                    <textarea className="w-full p-2 border rounded text-sm h-24" value={editForm.observation} onChange={e=>setEditForm({...editForm, observation:e.target.value})}/>
                                </div>
                                <div className="p-3 bg-amber-50 rounded border border-amber-100">
                                    <label className="text-xs font-bold text-amber-600 uppercase block mb-2">Lecturas Adicionales</label>
                                    <div className="space-y-2 mb-3">
                                      {editForm.extraReadings.map((extra, idx) => (
                                        <div key={extra.id || idx} className="flex justify-between items-center bg-white p-2 rounded border border-amber-200 text-sm">
                                          <div className="truncate"><div className="font-bold text-slate-700">{extra.title}</div></div>
                                          <button type="button" onClick={() => removeExtraReading(extra.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14}/></button>
                                        </div>
                                      ))}
                                    </div>
                                    <div className="flex flex-col gap-2 border-t border-amber-200 pt-2">
                                      <input className="w-full p-2 border rounded text-sm" placeholder="Título" value={newExtra.title} onChange={e=>setNewExtra({...newExtra, title:e.target.value})}/>
                                      <div className="flex gap-2">
                                        <input className="w-full p-2 border rounded text-sm" placeholder="URL" value={newExtra.link} onChange={e=>setNewExtra({...newExtra, link:e.target.value})}/>
                                        <Button type="button" onClick={addExtraReading} className="px-3" disabled={!newExtra.title}><Plus size={16}/></Button>
                                      </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-b bg-slate-50 px-2 rounded">
                                    <span className="text-sm font-bold text-slate-700">Estado de Publicación</span>
                                    <button type="button" disabled={editingDay.date <= todayStr} onClick={()=>setEditForm({...editForm, isEnabled: !editForm.isEnabled})} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${editForm.isEnabled ? 'bg-emerald-500' : 'bg-red-500'} ${editingDay.date <= todayStr ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${editForm.isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                                    </button>
                                </div>
                                <div className="text-center text-xs font-bold uppercase tracking-wide">
                                    {editingDay.date <= todayStr ? <span className="text-emerald-600">Visible (Automático)</span> : (editForm.isEnabled ? <span className="text-emerald-600">Visible</span> : <span className="text-red-500">Oculto</span>)}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="secondary" onClick={()=>setEditingDay(null)} className="flex-1">Cancelar</Button>
                                    <Button type="submit" variant="primary" className="flex-1">Guardar</Button>
                                </div>
                            </form>
                        ) : <div className="text-center py-10 text-slate-400 text-sm">Selecciona un día para editar.</div>}
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <span>Calendario Anual</span>
                            <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded">365 Días</span>
                        </h3>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                            <button onClick={() => setPlanSubTab('pending')} className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all ${planSubTab === 'pending' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'}`}><Clock size={12}/> Pendiente</button>
                            <button onClick={() => setPlanSubTab('history')} className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all ${planSubTab === 'history' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}><History size={12}/> Histórico</button>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="max-h-[600px] overflow-y-auto divide-y">
                            {visiblePlan.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm italic">No hay días en esta vista.</div> : (
                                visiblePlan.map(day => {
                                    const content = dailyContentMap[day.id] || {};
                                    const isEnabled = content.isEnabled;
                                    const isPast = day.date < todayStr;
                                    const isToday = day.date === todayStr;
                                    const isEffectivelyActive = isEnabled || isPast || isToday;

                                    return (
                                        <div key={day.id} className={`p-3 flex items-center justify-between hover:bg-slate-50 transition-colors ${editingDay?.id === day.id ? 'bg-sky-50 border-l-4 border-sky-500' : ''}`}>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-bold text-slate-500 w-12">{day.displayDate}</span>
                                                    {isPast ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">HISTÓRICO</span> : (isEffectivelyActive ? <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700"><CheckCircle size={10} className="mr-1"/> ACTIVO</span> : <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-500"><Lock size={10} className="mr-1"/> INACTIVO</span>)}
                                                </div>
                                                <div className="font-bold text-slate-800 text-sm">{day.corePassage}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => sendWhatsAppNotification(day, content)} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded"><MessageCircle size={18}/></button>
                                                <button onClick={() => toggleDayEnabled(day, isEnabled)} disabled={day.date <= todayStr} className={`p-2 rounded hover:bg-slate-200 ${day.date <= todayStr ? 'opacity-30 cursor-not-allowed text-slate-400' : (isEffectivelyActive ? 'text-emerald-500' : 'text-red-500')}`}>{isEffectivelyActive ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}</button>
                                                <button onClick={() => startEditing(day)} className="p-2 text-sky-500 hover:bg-sky-50 rounded"><Edit3 size={18}/></button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'users' && (
            <div className="space-y-4">
                <div className="flex gap-4 items-center justify-between bg-white p-2 rounded-lg border shadow-sm">
                    <div className="flex gap-2">
                         <button onClick={() => setUserTab('pending')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${userTab === 'pending' ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                             <UserPlus size={16}/> Pendientes {pendingUsers.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{pendingUsers.length}</span>}
                         </button>
                         <button onClick={() => setUserTab('approved')} className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition-all ${userTab === 'approved' ? 'bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                             <UserCheck size={16}/> Aprobados ({approvedUsers.length})
                         </button>
                    </div>
                    <Button variant="danger" onClick={setMassiveStartDate} className="text-[10px] py-1 h-8">⚡ Reset 2026</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleUsersList.map(u => (
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
                    {visibleUsersList.length === 0 && <div className="col-span-full text-center py-10 text-slate-400 italic">No hay usuarios en esta sección.</div>}
                </div>
            </div>
        )}

        {activeTab === 'stats' && (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button onClick={() => setStatsMode('byUser')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${statsMode === 'byUser' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'}`}>Por Usuario</button>
                        <button onClick={() => setStatsMode('byReading')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${statsMode === 'byReading' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'}`}>Por Lectura</button>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder={statsMode === 'byUser' ? "Buscar usuario..." : "Buscar libro/fecha..."}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {statsMode === 'byUser' ? (
                    <Card className="overflow-hidden">
                        <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 text-sm">Progreso por Usuario</div>
                        <div className="divide-y max-h-96 overflow-y-auto">
                            {filteredStatsUsers.map(u => {
                                const userReadIds = allCompletions.filter(c => c.userId === u.uid && c.readingId.startsWith(new Date().getFullYear())).map(c => c.readingId);
                                const count = userReadIds.length;
                                const percent = Math.min(100, Math.round((count / 365) * 100));
                                const isExpanded = expandedStatItem === u.id;
                                const pendingReadings = staticPlan.filter(day => {
                                    if (u.planStartDate && day.date < u.planStartDate) return false;
                                    return day.date <= todayStr && !userReadIds.includes(day.id);
                                });

                                return (
                                    <div key={u.id}>
                                        <div className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer" onClick={() => toggleStatExpand(u.id)}>
                                            <div className="flex items-center gap-3">
                                                <img src={u.photoURL} className="w-8 h-8 rounded-full"/>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-700">{u.displayName}</div>
                                                    <div className="text-xs text-slate-400">{count} días • {u.planStartDate || 'Sin fecha'}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-600">{percent}%</span>
                                                <div className="w-16 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width:`${percent}%`}}></div></div>
                                                <ChevronDown size={16} className={`text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="bg-red-50 p-3 text-xs border-t border-red-100">
                                                <div className="font-bold text-red-700 mb-2 flex items-center gap-1"><AlertCircle size={12}/> Pendientes ({pendingReadings.length})</div>
                                                {pendingReadings.length === 0 ? <div className="text-emerald-600 font-bold">¡Al día!</div> : (
                                                    <ul className="grid grid-cols-2 gap-1 text-slate-600">
                                                        {pendingReadings.slice(0, 10).map(r => <li key={r.id} className="truncate">• {r.displayDate}: {r.corePassage}</li>)}
                                                        {pendingReadings.length > 10 && <li className="text-red-400 font-bold">... y {pendingReadings.length - 10} más.</li>}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <div className="bg-slate-50 p-3 border-b font-bold text-slate-700 text-sm">Estado por Lectura</div>
                        <div className="divide-y max-h-96 overflow-y-auto">
                            {filteredStatsReadings.map(day => {
                                const readers = allCompletions.filter(c => c.readingId === day.id).map(c => c.userId);
                                const count = readers.length;
                                const percent = Math.round((count / Math.max(1, allUsers.length)) * 100);
                                const isExpanded = expandedStatItem === day.id;
                                const missingUsers = allUsers.filter(u => !readers.includes(u.uid));

                                return (
                                    <div key={day.id}>
                                        <div className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer" onClick={() => toggleStatExpand(day.id)}>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-slate-700">{day.corePassage}</div>
                                                <div className="text-xs text-slate-400">{day.displayDate}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right"><div className="text-xs font-bold text-slate-600">{count} / {allUsers.length}</div></div>
                                                <ChevronDown size={16} className={`text-slate-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="bg-slate-50 p-3 text-xs border-t">
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <div className="font-bold text-emerald-600 mb-1">Completado ({count})</div>
                                                        <div className="flex flex-wrap gap-1">{allUsers.filter(u => readers.includes(u.uid)).map(u => <span key={u.id} className="bg-white border border-emerald-100 px-1.5 py-0.5 rounded text-emerald-700">{u.displayName.split(' ')[0]}</span>)}</div>
                                                    </div>
                                                    <div className="flex-1 border-l pl-4 border-slate-200">
                                                        <div className="font-bold text-red-500 mb-1">Faltan ({missingUsers.length})</div>
                                                        <div className="flex flex-wrap gap-1">{missingUsers.slice(0, 10).map(u => <span key={u.id} className="bg-white border border-red-100 px-1.5 py-0.5 rounded text-red-600">{u.displayName.split(' ')[0]}</span>)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                )}
            </div>
        )}
    </div>
  );
};

// --- COMPONENTE USER VIEW ---
const UserView = ({ staticPlan, dailyContentMap, completionsMap, commentsMap, bibleProgress, streak, user, activeUid }) => {
  const [userFilter, setUserFilter] = useState('pending');
  const [activeReadingIdForComment, setActiveReadingIdForComment] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [startDateInput, setStartDateInput] = useState(user.planStartDate || '');

  const todayStr = getLocalDate();
  const todayDate = new Date(todayStr + 'T12:00:00');

  // Guardar Fecha de Inicio
  const saveStartDate = async () => {
      await updateDoc(doc(db, 'artifacts', APP_ID, 'users', activeUid), { planStartDate: startDateInput });
      setShowSettings(false);
      alert("Fecha de inicio actualizada. Tus pendientes se ajustarán a esta fecha.");
  };

  const userPlan = useMemo(() => {
    return staticPlan.map(day => {
        const content = dailyContentMap[day.id] || {};
        return { ...day, ...content };
    });
  }, [staticPlan, dailyContentMap]);

  // NUEVO: Plan visible ordenado según el filtro (DESC para Completados)
  const visiblePlan = useMemo(() => {
      if (userFilter === 'completed') {
          return [...userPlan].reverse(); 
      }
      return userPlan;
  }, [userPlan, userFilter]);

  const toggleCompletion = async (readingId) => {
      if (!activeUid) return;
      const isComplete = completionsMap[readingId];
      const id = `${activeUid}_${readingId}`;
      const docRef = doc(db, 'artifacts', APP_ID, 'completions', id);

      if (isComplete) {
          // Verificar si hay lecturas posteriores completadas
          const hasFutureReadings = Object.keys(completionsMap).some(completedDate => completedDate > readingId);
          if (hasFutureReadings) {
              alert("No puedes desmarcar esta lectura porque ya tienes lecturas posteriores completadas.");
              return;
          }
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
      // Mensaje de cumplimiento para el usuario SIN LINK
      let msg = `✅ *¡Lectura Completada!*\n\nHe terminado mi lectura diaria del plan *Teología Paulina*.\n\n📅 *Fecha:* ${day.displayDate}\n📖 *Pasaje:* ${day.corePassage}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- CÁLCULO DE ERROR DE CONEXIÓN MEJORADO ---
  const handleAuthError = (error) => {
      let msg = "Error al iniciar sesión.";
      if (error.code === 'auth/popup-closed-by-user') {
          msg = "Cerraste la ventana de inicio de sesión antes de terminar.";
      } else if (error.code === 'auth/network-request-failed') {
          msg = "Problema de conexión a internet. Verifica tu red.";
      } else if (error.code === 'auth/unauthorized-domain') {
          msg = `El dominio no está autorizado en Firebase. Admin: Agrega '${window.location.hostname}' en la consola de Firebase.`;
      } else {
          msg = `Error: ${error.message}`;
      }
      alert(msg);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'artifacts', APP_ID, 'users', result.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
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
                planStartDate: '2026-01-01',
                createdAt: serverTimestamp()
          });
      }
    } catch (error) {
      console.error(error);
      handleAuthError(error); // USAR NUEVO MANEJADOR DE ERRORES
      setLoading(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
        
        {/* CONFIGURACIÓN Y ENCABEZADO */}
        <div className="flex justify-end">
            <button onClick={() => setShowSettings(!showSettings)} className="text-slate-400 hover:text-sky-600 flex items-center gap-1 text-xs font-bold">
                <Settings size={14}/> {showSettings ? 'Cerrar Ajustes' : 'Configurar Plan'}
            </button>
        </div>

        {showSettings && (
            <Card className="p-4 bg-sky-50 border-sky-100 animate-in slide-in-from-top-2">
                <h4 className="font-bold text-slate-700 mb-2 text-sm">Ajustes de Lectura</h4>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500">
                        Fecha de Inicio Personal:
                        <span className="block text-[10px] text-slate-400 font-normal">Si te uniste tarde, selecciona tu fecha de inicio para ocultar pendientes antiguos.</span>
                    </label>
                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            className="p-2 rounded border border-slate-300 text-sm flex-1"
                            value={startDateInput}
                            onChange={(e) => setStartDateInput(e.target.value)}
                        />
                        <Button onClick={saveStartDate} className="text-xs">Guardar</Button>
                    </div>
                </div>
            </Card>
        )}

        {/* LOGROS Y RACHA */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-sky-600 to-blue-600 text-white border-none shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold font-serif text-lg flex items-center gap-2"><Activity size={20}/> Mis Logros</h3>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Flame size={14}/> {streak} días racha
                </div>
            </div>
            <div className="grid grid-cols-6 gap-2 text-center">
                {BADGES.map((badge, idx) => {
                    const isUnlocked = streak >= badge.days;
                    const Icon = badge.icon;
                    return (
                        <div key={idx} className={`flex flex-col items-center p-1 rounded-lg transition-all ${isUnlocked ? 'bg-white/10 opacity-100 scale-105' : 'opacity-40 grayscale'}`}>
                            <div className={`p-1.5 rounded-full mb-1 bg-white ${badge.color}`}>
                                <Icon size={16} />
                            </div>
                            <span className="text-[9px] font-bold leading-tight">{badge.label}</span>
                        </div>
                    )
                })}
            </div>
        </Card>

        {/* PROGRESO ANUAL - DISEÑO MEJORADO */}
        <Card className="p-6 bg-white border-none shadow-lg relative overflow-hidden ring-4 ring-sky-50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                    <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">Mi Progreso Anual</span>
                    <span className="text-3xl font-black text-slate-800 flex items-baseline gap-1">
                        {bibleProgress}<span className="text-sm text-slate-400">%</span>
                    </span>
                </div>
                <div className="bg-sky-100 p-3 rounded-xl">
                   <BookOpen size={28} className="text-sky-600"/>
                </div>
            </div>
            
            <div className="w-full h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                <div 
                    className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-emerald-500 transition-all duration-1000 ease-out flex items-center justify-end pr-2" 
                    style={{width: `${bibleProgress}%`}}
                >
                    {bibleProgress > 5 && <span className="text-[10px] font-bold text-white drop-shadow-md">{bibleProgress}%</span>}
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}></div>
            </div>

            <p className="text-xs text-slate-500 mt-3 text-center">
                Has completado <span className="font-bold text-slate-700">{Object.keys(completionsMap).length}</span> de 365 días. ¡Sigue así!
            </p>
        </Card>

        <div className="flex p-1 bg-slate-200 rounded-lg">
            <button onClick={()=>setUserFilter('pending')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='pending'?'bg-white text-sky-600 shadow-sm':'text-slate-500'}`}>Pendientes</button>
            <button onClick={()=>setUserFilter('completed')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${userFilter==='completed'?'bg-white text-emerald-600 shadow-sm':'text-slate-500'}`}>Completadas</button>
        </div>

        <div className="space-y-4">
            {visiblePlan.map((day, index) => {
                const isComplete = completionsMap[day.id];
                
                // --- FILTROS ---
                if (userFilter === 'completed' && !isComplete) return null;
                
                // Filtro especial para pendientes:
                if (userFilter === 'pending') {
                    if (isComplete) return null; // Si está completa, no mostrar en pendientes
                    // Si el usuario tiene fecha de inicio, ocultar lecturas ANTERIORES a esa fecha
                    if (user.planStartDate && day.date < user.planStartDate) return null;
                }

                const readingDate = new Date(day.date + 'T12:00:00');
                const isFuture = readingDate > todayDate;
                const isAdminLocked = !day.isEnabled;
                
                // LÓGICA DE VISIBILIDAD UNIFICADA
                const isToday = day.date === todayStr;
                const isPast = day.date < todayStr;
                // Si es fecha pasada, siempre está visible. Si es futuro, depende del admin.
                const isEffectivelyEnabled = isPast || isToday || day.isEnabled;

                // LÓGICA DE CANDADO (SEQUENTIAL LOCK) - INDEPENDIENTE DEL ORDEN VISUAL
                let isLocked = !isEffectivelyEnabled; 
                
                // Verificación de secuencia (SOLO SI NO ES PASADO)
                // Usamos staticPlan[0].id para detectar si es el primer día absoluto del plan
                if (day.id !== staticPlan[0].id) {
                    const prevDate = getPrevDateStr(day.date);
                    let isPrevOk = !!completionsMap[prevDate];

                    if (user.planStartDate) {
                        // Si la lectura anterior es MENOR a la fecha de inicio, se asume completada/saltada.
                        if (prevDate < user.planStartDate) {
                            isPrevOk = true;
                        }
                    }
                    
                    if (!isPrevOk) isLocked = true;
                }

                // SIEMPRE desbloquear fechas pasadas (Catch-up mode)
                if (isPast) isLocked = false;

                const diffDays = (readingDate - todayDate) / (1000 * 60 * 60 * 24);
                if (userFilter === 'pending' && diffDays > 3) return null; 
                if (!isEffectivelyEnabled && userFilter === 'pending' && diffDays > 0) return null;

                const comments = commentsMap[day.id] || [];
                const showComments = activeReadingIdForComment === day.id;

                return (
                    <div key={day.id} className={`transition-all duration-300 ${isLocked ? 'opacity-75 grayscale' : 'opacity-100'}`}>
                        <Card className={`overflow-hidden ${isLocked ? 'bg-slate-50' : ''}`}>
                            {isLocked && (
                                <div className="bg-slate-100 p-1 text-center text-[10px] uppercase font-bold text-slate-400 flex justify-center items-center gap-1 border-b">
                                    <Lock size={10}/> 
                                    {!isEffectivelyEnabled ? 'Aún no disponible' : (isFuture ? `Disponible el ${day.displayDate}` : 'Completa la anterior')}
                                </div>
                            )}
                            <div className={`p-4 flex justify-between items-start ${isEffectivelyEnabled ? 'bg-white border-l-4 border-sky-500' : 'bg-slate-50 border-l-4 border-slate-300'}`}>
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

  // FAVICON INJECTION
  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/jpeg';
    link.rel = 'icon';
    link.href = FAVICON_URL;
    document.getElementsByTagName('head')[0].appendChild(link);
    
    // Inject PWA Manifest
    const manifestLink = document.querySelector("link[rel*='manifest']") || document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify({
        "name": "Teología Paulina",
        "short_name": "Teología Paulina",
        "start_url": ".",
        "display": "standalone",
        "theme_color": "#0ea5e9",
        "background_color": "#ffffff",
        "icons": [
            { "src": FAVICON_URL, "sizes": "192x192", "type": "image/jpeg" },
            { "src": FAVICON_URL, "sizes": "512x512", "type": "image/jpeg" }
        ]
    }));
    document.head.appendChild(manifestLink);

    // Meta tags for PWA
    const metaTheme = document.querySelector("meta[name='theme-color']") || document.createElement('meta');
    metaTheme.name = 'theme-color';
    metaTheme.content = '#0ea5e9';
    document.head.appendChild(metaTheme);

    const metaApple = document.querySelector("meta[name='apple-mobile-web-app-capable']") || document.createElement('meta');
    metaApple.name = 'apple-mobile-web-app-capable';
    metaApple.content = 'yes';
    document.head.appendChild(metaApple);

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
        const datesSet = new Set();
        let count = 0;
        
        snap.docs.forEach(doc => {
            const data = doc.data();
            map[data.readingId] = true;
            
            // Recolectar fechas únicas para la racha
            if (data.completedAt) {
                const date = data.completedAt.toDate();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                datesSet.add(`${year}-${month}-${day}`);
            }

            // Contar para progreso anual
            if (data.readingId.startsWith(`${new Date().getFullYear()}-`)) {
                count++;
            }
        });
        setCompletionsMap(map);
        
        // --- CÁLCULO DE RACHA REAL (DÍAS CONSECUTIVOS) ---
        let currentStreak = 0;
        const today = new Date();
        
        // Función para checkear si una fecha está en el set
        const checkDate = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return datesSet.has(`${y}-${m}-${day}`);
        };

        // 1. Ver si hoy contó
        let cursor = new Date(today);
        if (!checkDate(cursor)) {
            // Si hoy no está, ver si ayer está (para no romper la racha visualmente aún)
            cursor.setDate(cursor.getDate() - 1);
            if (!checkDate(cursor)) {
                cursor = null; // Ni hoy ni ayer, racha rota
            }
        }

        // 2. Contar hacia atrás
        if (cursor) {
            currentStreak = 1; // Ya encontramos uno (hoy o ayer)
            while (true) {
                cursor.setDate(cursor.getDate() - 1);
                if (checkDate(cursor)) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }
        
        setStreak(currentStreak);
        setBibleProgress(Math.min(100, Math.round((count / 365) * 100)));
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
             <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
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
              <a href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                  <Youtube size={24} />
              </a>
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
            streak={streak}
            user={userData}
            activeUid={user.uid}
        />
      )}
    </div>
  );
}