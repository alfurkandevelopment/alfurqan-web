
import React, { useState, useEffect, useContext } from 'react';
import { 
    Send, User, CreditCard, HeartHandshake, FileText, 
    Upload, CheckCircle2, Loader2, HelpCircle,
    ListChecks
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { LanguageContext } from '../App';
import { Language } from '../types';
import { translations } from '../lib/translations';

const AidRequest: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const t = translations[lang].aid;
  const common = translations[lang].common;

  const [form, setForm] = useState({
    fullName: '',
    idNumber: '',
    aidType: '',
    description: '',
    phone: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'content', 'settings'));
        if (snap.exists()) {
          setCategories(snap.data().aidCategories || []);
        }
      } catch (err) {
        console.error("Error fetching aid categories", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.aidType) return;
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, 'aid_requests'), {
            ...form,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            lang: lang
        });
        setSuccess(true);
    } catch (err) {
        alert("Error");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary-600" size={48} />
        <p className="text-gray-500 font-bold">{common.loading}</p>
    </div>
  );

  if (success) return (
    <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 max-w-xl text-center animate-fade-in-up">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle2 size={56} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">{t.success}</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-10">{t.successSub}</p>
            <button 
                onClick={() => window.location.href = '#/'}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-1"
            >
                {common.back}
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <div className="inline-flex p-4 bg-primary-100 text-primary-700 rounded-3xl mb-6 shadow-sm">
                    <HeartHandshake size={40} />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{t.title}</h1>
                <p className="text-gray-500 text-lg">{t.sub}</p>
            </div>

            <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col lg:flex-row">
                <div className="lg:w-1/3 bg-primary-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-8 border-b border-white/20 pb-4">{t.importantNotes}</h3>
                        <ul className="space-y-6 text-primary-100">
                            <li className="flex gap-3">
                                <CheckCircle2 className="shrink-0 text-accent-400" size={20} />
                                <span className="text-sm">{t.securityPolicy}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 p-8 md:p-12 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                <User size={18} className="text-primary-600" />
                                {t.name}
                            </label>
                            <input 
                                type="text" 
                                required
                                value={form.fullName}
                                onChange={(e) => setForm({...form, fullName: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                <CreditCard size={18} className="text-primary-600" />
                                {t.idNumber}
                            </label>
                            <input 
                                type="text" 
                                required
                                value={form.idNumber}
                                onChange={(e) => setForm({...form, idNumber: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                <HelpCircle size={18} className="text-primary-600" />
                                {t.phone}
                            </label>
                            <input 
                                type="tel" 
                                required
                                value={form.phone}
                                onChange={(e) => setForm({...form, phone: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-mono"
                                dir="ltr"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                                <ListChecks size={18} className="text-primary-600" />
                                {t.type}
                            </label>
                            <select 
                                required
                                value={form.aidType}
                                onChange={(e) => setForm({...form, aidType: e.target.value})}
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                            >
                                <option value="">...</option>
                                {categories.map((cat: any) => (
                                    <option key={cat.id} value={cat[lang] || cat.ar}>
                                        {cat[lang] || cat.ar}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                            <FileText size={18} className="text-primary-600" />
                            {t.desc}
                        </label>
                        <textarea 
                            required
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm({...form, description: e.target.value})}
                            className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold resize-none"
                        ></textarea>
                    </div>

                    <div className="bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 p-8 text-center group hover:border-primary-500 transition-colors cursor-pointer">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload className="text-gray-400 group-hover:text-primary-600" />
                        </div>
                        <h4 className="font-bold text-gray-700 mb-1">{t.upload}</h4>
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-black py-5 px-8 rounded-2xl shadow-2xl flex items-center justify-center gap-4 text-xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    <Send size={24} />
                                    <span>{t.send}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default AidRequest;
