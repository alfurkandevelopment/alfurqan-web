
import React, { useState, useEffect, useContext } from 'react';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  Activity, 
  UserPlus, 
  CheckCircle2,
  Heart,
  MessageSquare,
  Send,
  Info,
  ChevronLeft,
  LayoutGrid
} from 'lucide-react';
import { Language, Program } from '../types';
import { db } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { 
  doc, 
  collection,
  addDoc,
  updateDoc,
  increment,
  onSnapshot,
  query,
  limit
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { LanguageContext } from '../App';
import { translations } from '../lib/translations';

const Home: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const [stats, setStats] = useState({ visitors: 0, members: 0, programs: 0, activities: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [latestPrograms, setLatestPrograms] = useState<Program[]>([]);

  const t = translations[lang].home;

  useEffect(() => {
    // 1. Real-time Stats Listener
    const statsRef = doc(db, 'stats', 'global');
    
    // Increment visitor count only once per session
    const sessionKey = 'alfurqan_visitor_session';
    if (!sessionStorage.getItem(sessionKey)) {
      updateDoc(statsRef, { visitorCount: increment(1) })
        .then(() => sessionStorage.setItem(sessionKey, 'active'))
        .catch(e => console.warn("Visitor counter error", e));
    }

    const unsubStats = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats({
          visitors: data.visitorCount || 0,
          members: data.memberCount || 0,
          programs: data.programCount || 0,
          activities: data.activityCount || 0
        });
      }
      setLoadingStats(false);
    });

    // 2. Real-time Latest Programs Listener
    const qPrograms = query(collection(db, 'programs'), limit(3));
    const unsubPrograms = onSnapshot(qPrograms, (snap) => {
      setLatestPrograms(snap.docs.map(d => ({ id: d.id, ...d.data() } as Program)));
    });

    return () => {
      unsubStats();
      unsubPrograms();
    };
  }, []);

  const [contactForm, setContactForm] = useState({ name: '', email: '', type: 'suggestion', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_messages'), { ...contactForm, timestamp: new Date().toISOString() });
      setSubmitSuccess(true);
      setContactForm({ name: '', email: '', type: 'suggestion', subject: '', message: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      alert("Error sending message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-0 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-primary-900 text-white overflow-hidden rounded-b-[3rem] shadow-2xl">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-start space-y-8 text-right">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-white animate-fade-in">
              {t.heroTitle}
              <span className="block text-accent-500 text-3xl md:text-5xl mt-4 font-bold">{t.heroSubtitle}</span>
            </h1>
            <p className="text-primary-100 text-xl md:text-2xl max-w-2xl leading-relaxed opacity-90 animate-fade-in delay-100">{t.heroDesc}</p>
            <div className="flex flex-wrap gap-5 justify-center md:justify-start pt-4 animate-fade-in delay-200">
              <Link to="/register" className="bg-accent-500 hover:bg-accent-600 text-black font-black py-4 px-12 rounded-2xl shadow-xl transition-all hover:-translate-y-1 text-lg flex items-center gap-2">
                <UserPlus size={22} /> {t.ctaJoin}
              </Link>
              <Link to="/about" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-black py-4 px-10 rounded-2xl shadow-lg transition-all hover:-translate-y-1 text-lg flex items-center gap-2 backdrop-blur-md">
                <Info size={22} /> {t.ctaAbout}
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full max-w-xl animate-fade-in delay-300">
            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/20 shadow-2xl relative">
              <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
                <span className="text-accent-400 font-black flex items-center gap-3 text-xl"><Activity size={24} /> {t.statsLive}</span>
              </div>
              <div className="grid grid-cols-2 gap-y-10 gap-x-6 text-center">
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <Users className="mx-auto mb-3 text-blue-200 w-8 h-8" />
                  <div className="text-3xl font-black font-mono text-white mb-1">{loadingStats ? '...' : stats.visitors}</div>
                  <div className="text-[10px] text-primary-200 font-bold uppercase tracking-widest">{t.statsVisitors}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <UserCheck className="mx-auto mb-3 text-primary-300 w-8 h-8" />
                  <div className="text-3xl font-black font-mono text-white mb-1">{loadingStats ? '...' : stats.members}</div>
                  <div className="text-[10px] text-primary-200 font-bold uppercase tracking-widest">{t.statsMembers}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <LayoutGrid className="mx-auto mb-3 text-accent-400 w-8 h-8" />
                  <div className="text-3xl font-black font-mono text-white mb-1">{loadingStats ? '...' : stats.programs}</div>
                  <div className="text-[10px] text-primary-200 font-bold uppercase tracking-widest">{t.statsPrograms}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                  <BookOpen className="mx-auto mb-3 text-green-300 w-8 h-8" />
                  <div className="text-3xl font-black font-mono text-white mb-1">{loadingStats ? '...' : stats.activities}</div>
                  <div className="text-[10px] text-primary-200 font-bold uppercase tracking-widest">{t.statsActivities}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-right">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-right">
            <h2 className="text-4xl font-black text-gray-900 mb-3">{t.programsTitle}</h2>
            <p className="text-gray-500 text-lg">{t.programsDesc}</p>
          </div>
          <Link to="/programs" className="flex items-center gap-2 text-primary-700 font-bold bg-primary-50 px-6 py-3 rounded-2xl transition-all">
            {t.viewAll} <ChevronLeft className={lang !== Language.AR ? 'rotate-180' : ''} size={20} />
          </Link>
        </div>
        
        {latestPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPrograms.map(prog => (
               <Link to={`/programs/${prog.id}`} key={prog.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="h-48 overflow-hidden">
                    <img src={prog.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="font-black text-xl mb-2 text-gray-900">{typeof prog.title === 'string' ? prog.title : (prog.title?.[lang] || prog.title?.ar)}</h3>
                    <p className="text-gray-500 text-sm line-clamp-2">{typeof prog.description === 'string' ? prog.description : (prog.description?.[lang] || prog.description?.ar)}</p>
                  </div>
               </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
             <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-400 font-bold">{t.programsPlaceholder}</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary-800 py-20 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Heart size={64} className="mx-auto text-accent-500 mb-6" fill="currentColor" />
          <h2 className="text-4xl md:text-5xl font-black mb-6">{t.ctaImpact}</h2>
          <p className="text-xl text-primary-100 mb-10 leading-relaxed max-w-2xl mx-auto">{t.ctaImpactDesc}</p>
          <Link to="/register" className="bg-accent-500 hover:bg-accent-600 text-black font-black py-4 px-12 rounded-2xl shadow-xl transition-all hover:-translate-y-1 text-lg">
            {t.ctaJoin}
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-20 text-right">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">
            {submitSuccess && (
              <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <CheckCircle2 size={64} className="text-green-500 mb-4" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">{t.successMsg}</h3>
                <button onClick={() => setSubmitSuccess(false)} className="mt-8 text-primary-600 font-bold hover:underline">{t.retry}</button>
              </div>
            )}
            <div className="text-center mb-10">
              <h3 className="text-3xl font-black text-gray-900 mb-3 flex items-center justify-center gap-3">
                <MessageSquare size={32} className="text-primary-600" /> {t.contactTitle}
              </h3>
              <p className="text-gray-500">{t.contactDesc}</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.formName}</label>
                  <input type="text" required value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{t.formEmail}</label>
                  <input type="email" required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold" dir="ltr" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.formType}</label>
                <div className="grid grid-cols-3 gap-3">
                  <button type="button" onClick={() => setContactForm({...contactForm, type: 'aid_request'})} className={`py-4 rounded-xl border text-[10px] md:text-sm font-black transition-all ${contactForm.type === 'aid_request' ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{t.formAid}</button>
                  <button type="button" onClick={() => setContactForm({...contactForm, type: 'suggestion'})} className={`py-4 rounded-xl border text-[10px] md:text-sm font-black transition-all ${contactForm.type === 'suggestion' ? 'bg-accent-500 text-white' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{t.formSuggestion}</button>
                  <button type="button" onClick={() => setContactForm({...contactForm, type: 'claim'})} className={`py-4 rounded-xl border text-[10px] md:text-sm font-black transition-all ${contactForm.type === 'claim' ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{t.formClaim}</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.formSubject}</label>
                <input type="text" required value={contactForm.subject} onChange={(e) => setContactForm({...contactForm, subject: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">{t.formMessage}</label>
                <textarea rows={4} required value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none resize-none font-bold"></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-primary-700 hover:bg-primary-800 text-white font-black py-4 px-8 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg disabled:opacity-50">
                {isSubmitting ? '...' : t.formSend} <Send size={20} className={lang !== Language.AR ? 'rotate-0' : 'rotate-180'} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
