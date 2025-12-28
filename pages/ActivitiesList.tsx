
import React, { useState, useEffect, useContext } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Activity, Language } from '../types';
import { LanguageContext } from '../App';
import { Loader2, Calendar, MapPin, Clock, UserCheck, RefreshCcw, Info } from 'lucide-react';
import { translations } from '../lib/translations';
import { decryptFile } from '../lib/security';

const WEEK_DAYS_MAP: any = {
  Monday: { ar: 'الإثنين', tr: 'Pazartesi', en: 'Monday' },
  Tuesday: { ar: 'الثلاثاء', tr: 'Salı', en: 'Tuesday' },
  Wednesday: { ar: 'الأربعاء', tr: 'Çarşamba', en: 'Wednesday' },
  Thursday: { ar: 'الخميس', tr: 'Perşembe', en: 'Thursday' },
  Friday: { ar: 'الجمعة', tr: 'Cuma', en: 'Friday' },
  Saturday: { ar: 'السبت', tr: 'Cumartesi', en: 'Saturday' },
  Sunday: { ar: 'الأحد', tr: 'Pazar', en: 'Sunday' },
};

const ActivitiesList: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Ongoing' | 'Completed' | 'Finished'>('All');

  const t = translations[lang].activities;

  useEffect(() => {
    // Real-time synchronization
    const unsubActivities = onSnapshot(collection(db, 'activities'), (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as Activity)));
      setLoading(false);
    });

    const vQuery = query(collection(db, 'users'), where('role', '==', 'Volunteer'));
    const unsubVolunteers = onSnapshot(vQuery, (snap) => {
      setVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubActivities();
      unsubVolunteers();
    };
  }, []);

  const filtered = filter === 'All' ? activities : activities.filter(a => a.status === filter);

  const getFilterLabel = (f: string) => {
    switch (f) {
      case 'All': return t.filterAll;
      case 'Upcoming': return t.filterUpcoming;
      case 'Ongoing': return t.filterOngoing;
      case 'Completed': return t.filterCompleted;
      case 'Finished': return lang === 'ar' ? 'منتهية' : 'Finished';
      default: return f;
    }
  };

  const renderImage = (img: string) => {
    if (!img) return null;
    const src = img.startsWith('SECURE_ENC_') ? decryptFile(img) : img;
    return <img src={src} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Activity" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-accent-600 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-4xl mx-auto relative z-10 animate-fade-in-up">
          <Calendar size={64} className="mx-auto text-white mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-6">{t.title}</h1>
          <p className="text-xl opacity-90">{t.desc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <div className="flex flex-wrap justify-center gap-3 mb-12 bg-white p-5 rounded-[2.5rem] shadow-xl border border-gray-100">
          {(['All', 'Upcoming', 'Ongoing', 'Completed'] as const).map((f) => (
             <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${filter === f ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20 scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
             >
                {getFilterLabel(f)}
             </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-[3rem] p-24 flex flex-col items-center shadow-xl">
            <Loader2 className="animate-spin text-accent-600 mb-4" size={48} />
            <p className="font-bold text-gray-400">{t.loading}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((act) => (
              <div key={act.id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group border-b-8 border-accent-100">
                <div className="h-56 relative overflow-hidden">
                  {renderImage(act.image)}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl text-white ${
                        act.status === 'Upcoming' ? 'bg-blue-600' :
                        act.status === 'Ongoing' ? 'bg-green-600' : 'bg-gray-600'
                     }`}>
                        {getFilterLabel(act.status)}
                     </span>
                     <span className="bg-white/90 backdrop-blur-md text-accent-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-accent-100 flex items-center gap-2">
                        {act.type === 'Recurring' ? <RefreshCcw size={10} /> : <Clock size={10} />}
                        {act.type === 'Recurring' ? (lang === 'ar' ? 'متكرر' : 'Recurring') : (lang === 'ar' ? 'مرة واحدة' : 'One-time')}
                     </span>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col text-right">
                  <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-accent-600 transition-colors">
                    {typeof act.title === 'string' ? act.title : (act.title?.[lang] || act.title?.ar)}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                    {typeof act.description === 'string' ? act.description : (act.description?.[lang] || act.description?.ar)}
                  </p>
                  
                  <div className="space-y-4 mt-auto">
                    <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                        <Calendar size={18} className="text-accent-500 shrink-0" />
                        {act.type === 'One-time' ? (
                           <span>{act.date}</span>
                        ) : (
                           <div className="flex flex-wrap gap-1">
                              {act.recurringDays?.map(day => (
                                 <span key={day} className="bg-accent-100 text-accent-700 px-2 py-0.5 rounded-md text-[9px]">
                                    {WEEK_DAYS_MAP[day]?.[lang] || day}
                                 </span>
                              ))}
                           </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                        <Clock size={18} className="text-accent-500 shrink-0" />
                        <span>{act.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 font-bold">
                        <MapPin size={18} className="text-accent-500 shrink-0" />
                        <span className="truncate">{act.location}</span>
                      </div>
                    </div>

                    {act.supervisorId && (
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <div className="w-10 h-10 rounded-full border-2 border-accent-100 overflow-hidden shadow-sm shrink-0">
                          <img 
                              src={volunteers.find(v => v.id === act.supervisorId)?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=S`} 
                              className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-[9px] font-black text-accent-600 uppercase tracking-tighter">بإشراف المشرف</div>
                          <div className="text-xs font-black text-gray-800 truncate">{volunteers.find(v => v.id === act.supervisorId)?.fullName || '...'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
               <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                  <Info size={64} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-2xl font-black text-gray-300">{t.noActivities}</p>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitiesList;
