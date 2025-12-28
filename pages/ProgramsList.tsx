
import React, { useState, useEffect, useContext } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Program, Language } from '../types';
import { LanguageContext } from '../App';
import { Loader2, Award, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { translations } from '../lib/translations';

const ProgramsList: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const t = translations[lang].programs;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pSnap = await getDocs(collection(db, 'programs'));
        setPrograms(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Program)));

        const vSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'Volunteer')));
        setVolunteers(vSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-primary-800 text-white py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-4xl mx-auto relative z-10 animate-fade-in-up">
          <Award size={64} className="mx-auto text-accent-400 mb-6" />
          <h1 className="text-4xl md:text-6xl font-black mb-6">{t.title}</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">{t.desc}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        {loading ? (
          <div className="bg-white rounded-[3rem] p-20 flex flex-col items-center shadow-xl border border-gray-100">
            <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
            <p className="font-bold text-gray-400 italic">{t.loading}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((prog) => (
              <div key={prog.id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col group hover:-translate-y-2 transition-all duration-500">
                <div className="h-60 overflow-hidden relative">
                  <img 
                    src={prog.image || 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80'} 
                    alt={typeof prog.title === 'string' ? prog.title : prog.title?.[lang]} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-5 right-5 bg-primary-600 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-2xl">
                    {prog.category}
                  </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-primary-700 transition-colors">
                    {typeof prog.title === 'string' ? prog.title : (prog.title?.[lang] || prog.title?.ar)}
                  </h3>
                  <p className="text-gray-500 text-sm mb-8 line-clamp-3 flex-1 leading-relaxed">
                    {typeof prog.description === 'string' ? prog.description : (prog.description?.[lang] || prog.description?.ar)}
                  </p>
                  
                  {prog.supervisorId && (
                    <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 rounded-full border-2 border-primary-100 overflow-hidden shrink-0 shadow-sm">
                        <img 
                            src={volunteers.find(v => v.id === prog.supervisorId)?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=S`} 
                            className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-black text-primary-600 uppercase tracking-tighter">{translations[lang].sections.supervisedBy}</div>
                        <div className="text-sm font-black text-gray-800 truncate">{volunteers.find(v => v.id === prog.supervisorId)?.fullName || '...'}</div>
                      </div>
                    </div>
                  )}

                  <Link 
                    to={prog.category === 'Language' ? '/language-learning' : `/programs/${prog.id}`}
                    className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary-600 transition-all shadow-xl shadow-gray-100 hover:shadow-primary-100 group-hover:-translate-y-1"
                  >
                    {t.details} 
                    <ChevronRight size={20} className={lang === Language.AR ? 'rotate-180' : ''} />
                  </Link>
                </div>
              </div>
            ))}
            
            {programs.length === 0 && (
                <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
                    <Award size={80} className="mx-auto text-gray-100 mb-6" />
                    <h3 className="text-2xl font-black text-gray-300">{t.noPrograms}</h3>
                    <p className="text-gray-400 mt-2">{t.noProgramsDesc}</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramsList;
