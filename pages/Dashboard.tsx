
import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { UserRole, Program, Activity as ActivityType, Language } from '../types';
import { Link } from 'react-router-dom';
import AvatarSelector from '../components/AvatarSelector';
import AboutEditor from '../components/AboutEditor';
import SettingsEditor from '../components/SettingsEditor';
import { LanguageContext } from '../App';
import { auth, db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  orderBy,
  addDoc,
  setDoc,
  writeBatch,
  onSnapshot,
  increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
  ShieldAlert, 
  ShieldCheck,
  Activity, 
  Calendar as CalendarIcon,
  Settings,
  BookOpen,
  Award,
  GraduationCap,
  Inbox,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Plus,
  UserCheck,
  MapPin,
  ImageIcon,
  X,
  Upload,
  Link as LinkIcon,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Info,
  Check,
  Globe,
  Type,
  AlignRight,
  Repeat,
  CalendarDays
} from 'lucide-react';
import { encryptFile, decryptFile } from '../lib/security';

interface DashboardProps {
  role: UserRole;
}

interface AlertConfig {
  isOpen: boolean;
  type: 'success' | 'warning' | 'error' | 'info' | 'confirm';
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ITEMS_PER_PAGE = 5;

const WEEK_DAYS = [
    { id: 'Monday', ar: 'الإثنين', tr: 'Pazartesi', en: 'Monday' },
    { id: 'Tuesday', ar: 'الثلاثاء', tr: 'Salı', en: 'Tuesday' },
    { id: 'Wednesday', ar: 'الأربعاء', tr: 'Çarşamba', en: 'Wednesday' },
    { id: 'Thursday', ar: 'الخميس', tr: 'Perşembe', en: 'Thursday' },
    { id: 'Friday', ar: 'الجمعة', tr: 'Cuma', en: 'Friday' },
    { id: 'Saturday', ar: 'السبت', tr: 'Cumartesi', en: 'Saturday' },
    { id: 'Sunday', ar: 'الأحد', tr: 'Pazar', en: 'Sunday' },
];

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const { lang: appLang } = useContext(LanguageContext);
  const [avatar, setAvatar] = useState('');
  const [userName, setUserName] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'about_editor' | 'settings' | 'inbox' | 'programs'>('overview');
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  
  const [currentProgram, setCurrentProgram] = useState<Partial<Program>>({});
  const [currentActivity, setCurrentActivity] = useState<Partial<ActivityType>>({});
  
  const [programFormTab, setProgramFormTab] = useState<Language>(Language.AR);
  const [activityFormTab, setActivityFormTab] = useState<Language>(Language.AR);
  
  const [programErrors, setProgramErrors] = useState<Record<string, string>>({});
  const [activityErrors, setActivityErrors] = useState<Record<string, string>>({});
  
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [activityImageMode, setActivityImageMode] = useState<'upload' | 'url'>('upload');

  const [alert, setAlert] = useState<AlertConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activityFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setUserName(doc.data().fullName || 'مستخدم');
        setAvatar(doc.data().avatar || '');
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    setLoadingData(true);
    const unsubPrograms = onSnapshot(collection(db, 'programs'), (snap) => {
      setPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Program)));
      setLoadingData(false);
    });

    const unsubActivities = onSnapshot(collection(db, 'activities'), (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityType)));
    });

    const qV = query(collection(db, 'users'), where('role', '==', 'Volunteer'));
    const unsubVolunteers = onSnapshot(qV, (snap) => {
      setVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubPrograms();
      unsubActivities();
      unsubVolunteers();
    };
  }, []);

  const showAlert = (config: Omit<AlertConfig, 'isOpen'>) => {
    setAlert({ ...config, isOpen: true });
  };

  const closeAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  const validateProgram = (prog: Partial<Program>) => {
    const errors: Record<string, string> = {};
    if (!prog.title?.ar) errors.title_ar = 'مطلوب';
    if (!prog.title?.tr) errors.title_tr = 'مطلوب';
    if (!prog.title?.en) errors.title_en = 'مطلوب';
    if (!prog.image) errors.image = 'صورة البرنامج مطلوبة';
    setProgramErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateActivity = (act: Partial<ActivityType>) => {
    const errors: Record<string, string> = {};
    if (!act.title?.ar) errors.title_ar = 'مطلوب';
    if (!act.title?.tr) errors.title_tr = 'مطلوب';
    if (!act.title?.en) errors.title_en = 'مطلوب';
    if (!act.image) errors.image = 'صورة النشاط مطلوبة';
    if (!act.time) errors.time = 'توقيت النشاط مطلوب';
    if (act.type === 'One-time' && !act.date) errors.date = 'تاريخ النشاط مطلوب';
    if (act.type === 'Recurring' && (!act.recurringDays || act.recurringDays.length === 0)) errors.days = 'يرجى تحديد أيام التكرار';
    setActivityErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (isProgramModalOpen) validateProgram(currentProgram);
  }, [currentProgram, isProgramModalOpen]);

  useEffect(() => {
    if (isActivityModalOpen) validateActivity(currentActivity);
  }, [currentActivity, isActivityModalOpen]);

  const filteredPrograms = useMemo(() => {
    const s = (searchTerm || '').toLowerCase();
    return programs.filter(p => {
      const title = (p.title?.[appLang] || p.title?.ar || '').toLowerCase();
      return title.includes(s);
    });
  }, [programs, searchTerm, appLang]);

  const paginatedPrograms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPrograms.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPrograms, currentPage]);

  const handleSaveProgram = async () => {
    if (!validateProgram(currentProgram)) return;
    try {
      if (currentProgram.id) {
        await updateDoc(doc(db, 'programs', currentProgram.id), currentProgram);
      } else {
        await addDoc(collection(db, 'programs'), { ...currentProgram, createdAt: new Date().toISOString() });
        await updateDoc(doc(db, 'stats', 'global'), { programCount: increment(1) });
      }
      setIsProgramModalOpen(false);
      showAlert({ type: 'success', title: 'تم الحفظ', message: 'تم تحديث بيانات البرنامج بنجاح.' });
    } catch (e) { showAlert({ type: 'error', title: 'خطأ', message: 'فشل الحفظ' }); }
  };

  const handleSaveActivity = async () => {
    if (!validateActivity(currentActivity)) return;
    try {
      if (currentActivity.id) {
        await updateDoc(doc(db, 'activities', currentActivity.id), currentActivity);
      } else {
        await addDoc(collection(db, 'activities'), { ...currentActivity });
        await updateDoc(doc(db, 'stats', 'global'), { activityCount: increment(1) });
      }
      setIsActivityModalOpen(false);
      showAlert({ type: 'success', title: 'تمت الجدولة', message: 'تمت إضافة النشاط بنجاح.' });
    } catch (e) { showAlert({ type: 'error', title: 'خطأ', message: 'مشكلة في الاتصال.' }); }
  };

  const deleteProgram = async (id: string) => {
    const linked = activities.filter(a => a.programId === id);
    if (linked.length > 0) {
      showAlert({ type: 'error', title: 'مرفوض', message: `لا يمكن حذف البرنامج لوجود ${linked.length} أنشطة مرتبطة به.` });
      return;
    }
    showAlert({
      type: 'confirm',
      title: 'حذف نهائي',
      message: 'هل أنت متأكد من مسح هذا البرنامج؟',
      confirmLabel: 'حذف',
      onConfirm: async () => {
        await deleteDoc(doc(db, 'programs', id));
        await updateDoc(doc(db, 'stats', 'global'), { programCount: increment(-1) });
      }
    });
  };

  const deleteActivity = async (id: string) => {
    if (confirm("حذف النشاط نهائياً؟")) {
      await deleteDoc(doc(db, 'activities', id));
      await updateDoc(doc(db, 'stats', 'global'), { activityCount: increment(-1) });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'program' | 'activity') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const encrypted = encryptFile(reader.result as string);
        if (target === 'program') setCurrentProgram(p => ({ ...p, image: encrypted }));
        else setCurrentActivity(a => ({ ...a, image: encrypted }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderImagePreview = (imgData: any, className?: string) => {
    if (!imgData || typeof imgData !== 'string') return <div className="bg-gray-100 flex items-center justify-center w-full h-full"><ImageIcon className="text-gray-300" /></div>;
    const src = imgData.startsWith("SECURE_ENC_") ? decryptFile(imgData) : imgData;
    return <img src={src} className={className || "w-full h-full object-cover rounded-2xl"} alt="Preview" />;
  };

  const renderSuperAdminView = () => (
    <div className="space-y-8 pb-10">
      <div className="flex flex-wrap gap-2 md:gap-4 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', icon: <Activity size={16}/>, label: 'نظرة عامة' },
          { id: 'programs', icon: <Award size={16}/>, label: 'البرامج والأنشطة' },
          { id: 'inbox', icon: <Inbox size={16}/>, label: 'الطلبات والرسائل' },
          { id: 'about_editor', icon: <BookOpen size={16}/>, label: 'صفحة من نحن' },
          { id: 'settings', icon: <Settings size={16}/>, label: 'الإعدادات العامة' }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-4 px-3 font-bold text-sm whitespace-nowrap flex items-center gap-2 transition-all ${activeTab === tab.id ? 'border-b-4 border-primary-600 text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'programs' && (
        <div className="animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 gap-4">
                <div className="space-y-1 text-right">
                    <h3 className="text-2xl font-black text-gray-900">إدارة البرامج التعليمية</h3>
                    <p className="text-gray-400 text-xs font-bold">تتم المزامنة لحظياً مع قواعد البيانات</p>
                </div>
                <button 
                  onClick={() => { 
                    setCurrentProgram({ title: { ar: '', tr: '', en: '' }, description: { ar: '', tr: '', en: '' }, category: 'General', image: '' }); 
                    setIsProgramModalOpen(true); 
                  }}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl transition-all active:scale-95"
                >
                  <Plus size={20} /> إضافة برنامج جديد
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {paginatedPrograms.map(prog => (
                    <div key={prog.id} className="bg-white rounded-[3rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row border-r-[12px] border-primary-500 hover:shadow-2xl transition-all duration-500 group/card">
                        <div className="lg:w-80 bg-gray-50/50 p-8 flex flex-col border-l border-gray-100">
                            <div className="space-y-4 flex-1">
                                <div className="h-44 rounded-[2rem] overflow-hidden shadow-inner bg-white border-2 border-gray-100 relative group">
                                    {renderImagePreview(prog.image)}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                         <button onClick={() => { setCurrentProgram(prog); setIsProgramModalOpen(true); }} className="p-3 bg-white rounded-full text-primary-600 shadow-xl"><Settings size={20}/></button>
                                    </div>
                                </div>
                                <h4 className="text-xl font-black text-gray-900 leading-tight">{prog.title?.[appLang] || prog.title?.ar}</h4>
                                <div className="inline-flex px-3 py-1 bg-primary-100 text-primary-700 text-[10px] font-black rounded-full uppercase tracking-tighter">{prog.category}</div>
                            </div>
                            <div className="flex gap-2 mt-8">
                                <button onClick={() => deleteProgram(prog.id)} className="p-4 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl border border-gray-100 shadow-sm transition-all"><Trash2 size={18}/></button>
                                <button 
                                  onClick={() => {
                                    setCurrentActivity({ 
                                      programId: prog.id, 
                                      title: { ar: '', tr: '', en: '' }, 
                                      description: { ar: '', tr: '', en: '' }, 
                                      type: 'One-time', 
                                      status: 'Upcoming', 
                                      image: '', 
                                      location: '', 
                                      recurringDays: [] 
                                    });
                                    setIsActivityModalOpen(true);
                                  }}
                                  className="flex-1 bg-gray-900 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-3 hover:bg-primary-600 transition-all shadow-lg active:scale-95 group"
                                >
                                  <Plus size={18} /> نشاط جديد
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-8 text-right">
                            <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                                <h5 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CalendarDays size={14} className="text-primary-500"/> الجدول الزمني الحالي
                                </h5>
                                <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-3 py-1 rounded-lg uppercase">{activities.filter(a => a.programId === prog.id).length} أنشطة</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {activities.filter(a => a.programId === prog.id).map(act => (
                                    <div key={act.id} className="p-5 bg-white rounded-3xl border border-gray-100 flex items-center gap-5 relative group/item hover:border-primary-200 hover:shadow-lg transition-all border-r-4 border-r-primary-100">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-gray-50">
                                            {renderImagePreview(act.image)}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <h6 className="font-black text-gray-900 text-sm truncate">{act.title?.[appLang] || act.title?.ar}</h6>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <div className="flex items-center gap-1 text-[9px] text-primary-600 font-black"><Clock size={10}/> {act.time}</div>
                                                <div className={`px-2 py-0.5 ${act.type === 'Recurring' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'} text-[8px] font-black rounded-full uppercase`}>{act.type}</div>
                                            </div>
                                        </div>
                                        <button 
                                          onClick={() => deleteActivity(act.id)}
                                          className="opacity-0 group-hover/item:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                          <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                {activities.filter(a => a.programId === prog.id).length === 0 && (
                                    <div className="col-span-full py-12 text-center text-gray-300 font-bold italic border-2 border-dashed border-gray-100 rounded-[2.5rem]">لا توجد أنشطة مجدولة.</div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Program */}
            {isProgramModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col animate-bounce-in max-h-[90vh]" dir="rtl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black flex items-center gap-2 text-gray-900"><Award className="text-primary-600"/> إعدادات البرنامج</h3>
                            <button onClick={() => setIsProgramModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><X size={24}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                             <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit mx-auto">
                                {[Language.AR, Language.TR, Language.EN].map(l => (
                                    <button key={l} onClick={() => setProgramFormTab(l)} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all ${programFormTab === l ? 'bg-white text-primary-700 shadow-md' : 'text-gray-400'}`}>{l.toUpperCase()}</button>
                                ))}
                             </div>
                             <div className="space-y-4">
                                <label className="text-sm font-black text-gray-700 flex items-center gap-2"><Type size={16}/> العنوان ({programFormTab.toUpperCase()})</label>
                                <input value={currentProgram.title?.[programFormTab] || ''} onChange={e => setCurrentProgram({ ...currentProgram, title: { ...(currentProgram.title as any), [programFormTab]: e.target.value } })} className={`w-full p-4 bg-gray-50 border ${programErrors[`title_${programFormTab}`] ? 'border-red-300' : 'border-gray-200'} rounded-2xl font-bold`} />
                                <label className="text-sm font-black text-gray-700 mt-4 flex items-center gap-2"><AlignRight size={16}/> الوصف ({programFormTab.toUpperCase()})</label>
                                <textarea value={currentProgram.description?.[programFormTab] || ''} onChange={e => setCurrentProgram({ ...currentProgram, description: { ...(currentProgram.description as any), [programFormTab]: e.target.value } })} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-24 font-bold resize-none" />
                             </div>
                             <div onClick={() => fileInputRef.current?.click()} className="h-48 border-2 border-dashed border-gray-200 bg-gray-50 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 overflow-hidden relative group">
                                {currentProgram.image ? renderImagePreview(currentProgram.image) : <div className="text-center text-gray-400 font-bold"><Upload className="mx-auto mb-2" /> ارفع صورة البرنامج</div>}
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'program')} />
                             </div>
                        </div>
                        <div className="p-8 border-t border-gray-100 flex gap-4">
                            <button onClick={handleSaveProgram} className="flex-1 bg-primary-600 text-white font-black py-4 rounded-[2rem] shadow-xl">حفظ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Activity */}
            {isActivityModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col animate-bounce-in max-h-[95vh]" dir="rtl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><Activity className="text-accent-500"/> جدولة نشاط جديد</h3>
                            <button onClick={() => setIsActivityModalOpen(false)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><X size={24}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-right">
                                <div className="space-y-8">
                                    <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                                        {[Language.AR, Language.TR, Language.EN].map(l => (
                                            <button key={l} onClick={() => setActivityFormTab(l)} className={`px-5 py-2 rounded-xl font-black text-[10px] transition-all ${activityFormTab === l ? 'bg-white text-primary-700 shadow-md' : 'text-gray-400'}`}>{l.toUpperCase()}</button>
                                        ))}
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-700 flex items-center gap-2"><Type size={14}/> العنوان ({activityFormTab.toUpperCase()})</label>
                                        <input value={currentActivity.title?.[activityFormTab] || ''} onChange={e => setCurrentActivity({ ...currentActivity, title: { ...(currentActivity.title as any), [activityFormTab]: e.target.value } })} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" />
                                        <label className="text-xs font-black text-gray-700 flex items-center gap-2"><AlignRight size={14}/> الوصف ({activityFormTab.toUpperCase()})</label>
                                        <textarea value={currentActivity.description?.[activityFormTab] || ''} onChange={e => setCurrentActivity({ ...currentActivity, description: { ...(currentActivity.description as any), [activityFormTab]: e.target.value } })} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-24 font-bold resize-none" />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-700 flex items-center gap-2"><ImageIcon size={14}/> صورة النشاط</label>
                                        <div onClick={() => activityFileInputRef.current?.click()} className="h-48 border-2 border-dashed border-gray-200 bg-gray-50 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 overflow-hidden relative">
                                            {currentActivity.image ? renderImagePreview(currentActivity.image) : <Upload className="text-gray-300" />}
                                            <input ref={activityFileInputRef} type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'activity')} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-700 flex items-center gap-2"><Repeat size={14}/> نوع الجدولة</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={() => setCurrentActivity({ ...currentActivity, type: 'One-time' })} className={`p-4 rounded-2xl border-2 font-black text-sm ${currentActivity.type === 'One-time' ? 'border-accent-500 bg-accent-50' : 'border-gray-50 bg-gray-50'}`}>مرة واحدة</button>
                                            <button onClick={() => setCurrentActivity({ ...currentActivity, type: 'Recurring' })} className={`p-4 rounded-2xl border-2 font-black text-sm ${currentActivity.type === 'Recurring' ? 'border-accent-500 bg-accent-50' : 'border-gray-50 bg-gray-50'}`}>متكرر أسبوعياً</button>
                                        </div>
                                    </div>
                                    {currentActivity.type === 'One-time' ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="date" value={currentActivity.date || ''} onChange={e => setCurrentActivity({ ...currentActivity, date: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" />
                                            <input type="time" value={currentActivity.time || ''} onChange={e => setCurrentActivity({ ...currentActivity, time: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap gap-2">
                                                {WEEK_DAYS.map(day => (
                                                    <button key={day.id} onClick={() => {
                                                        const days = currentActivity.recurringDays || [];
                                                        const newDays = days.includes(day.id) ? days.filter(d => d !== day.id) : [...days, day.id];
                                                        setCurrentActivity({ ...currentActivity, recurringDays: newDays });
                                                    }} className={`px-4 py-2 rounded-xl font-bold text-[10px] ${currentActivity.recurringDays?.includes(day.id) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{day.ar}</button>
                                                ))}
                                            </div>
                                            <input type="time" value={currentActivity.time || ''} onChange={e => setCurrentActivity({ ...currentActivity, time: e.target.value })} className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" />
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الموقع</label>
                                        <input value={currentActivity.location || ''} onChange={e => setCurrentActivity({ ...currentActivity, location: e.target.value })} placeholder="المسجد، القاعة..." className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl font-bold" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 border-t border-gray-100 flex gap-4">
                            <button onClick={handleSaveActivity} className="flex-1 bg-primary-600 text-white font-black py-4 rounded-[2rem] shadow-2xl">حفظ النشاط</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
      
      {activeTab === 'inbox' && (
        <div className="animate-fade-in text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"><Inbox size={56} /></div>
          <p className="font-black text-gray-400 text-2xl mb-2">قسم البريد والطلبات</p>
          <p className="text-gray-400 font-medium">سيتم عرض الرسائل هنا قريباً.</p>
        </div>
      )}

      {activeTab === 'about_editor' && <AboutEditor />}
      {activeTab === 'settings' && <SettingsEditor />}

      {/* Modern Alert */}
      {alert.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in text-center">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-bounce-in p-10 border border-gray-100">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-inner mx-auto ${
                alert.type === 'success' ? 'bg-green-100 text-green-600' :
                alert.type === 'error' ? 'bg-red-100 text-red-600' :
                alert.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                alert.type === 'confirm' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
                {alert.type === 'success' && <Check size={48} />}
                {alert.type === 'error' && <X size={48} />}
                {alert.type === 'warning' && <AlertTriangle size={48} />}
                {alert.type === 'confirm' && <Info size={48} />}
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-4">{alert.title}</h3>
            <p className="text-gray-500 font-medium leading-relaxed mb-10">{alert.message}</p>
            <div className="flex gap-4">
                {alert.type === 'confirm' ? (
                    <>
                        <button onClick={closeAlert} className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl">إلغاء</button>
                        <button onClick={() => { alert.onConfirm?.(); closeAlert(); }} className="flex-1 bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl">تأكيد</button>
                    </>
                ) : (
                    <button onClick={closeAlert} className="w-full bg-primary-600 text-white font-black py-4 rounded-2xl shadow-xl">حسناً</button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12 text-right pb-24" dir="rtl">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8 bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">لوحة التحكم</h1>
              <p className="text-gray-500 font-medium flex items-center gap-2">أهلاً بك مجدداً، <span className="font-black text-primary-700 bg-primary-50 px-4 py-1.5 rounded-xl">{userName}</span></p>
            </div>
            <AvatarSelector currentAvatar={avatar} onAvatarChange={setAvatar} name={userName} className="shadow-2xl"/>
        </header>

        {loadingData ? (
           <div className="py-24 text-center flex flex-col items-center gap-6">
               <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-primary-100"></div>
               <p className="font-black text-gray-400 text-xl tracking-wide animate-pulse">جاري المزامنة...</p>
           </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {role === UserRole.SUPER_ADMIN && renderSuperAdminView()}
            {role !== UserRole.SUPER_ADMIN && role !== UserRole.GUEST && (
                <div className="text-center py-24 bg-white rounded-[4rem] border border-gray-100 shadow-2xl">
                    <GraduationCap size={80} className="mx-auto text-primary-100 mb-8" />
                    <h3 className="text-3xl font-black text-gray-900">مرحباً بك</h3>
                    <p className="text-gray-500 mt-2 text-lg">بوابتك لمتابعة خدمات جمعية الفرقان.</p>
                </div>
            )}
          </div>
        )}
    </div>
  );
};

export default Dashboard;
