
import React, { useState, useContext, useEffect } from 'react';
import { UserRole, Language } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Lock, BookOpen, Users, AlertCircle, UserCheck, ArrowLeft, Loader2, Sparkles, UserPlus, ShieldCheck } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { LanguageContext } from '../App';
import { translations } from '../lib/translations';
import { decryptFile } from '../lib/security';

interface RegisterProps {
  setRole: (role: UserRole) => void;
}

const Register: React.FC<RegisterProps> = ({ setRole }) => {
  const { lang } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'parent' | 'student' | 'volunteer'>('parent');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  const t = translations[lang].auth;
  const common = translations[lang].common;

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const snap = await getDoc(doc(db, 'content', 'settings'));
        if (snap.exists() && snap.data().logo) {
          setLogo(decryptFile(snap.data().logo));
        }
      } catch (e) {}
    };
    fetchLogo();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      let role: UserRole;
      if (activeTab === 'parent') role = UserRole.PARENT;
      else if (activeTab === 'student') role = UserRole.STUDENT;
      else role = UserRole.VOLUNTEER;
      
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        phone,
        role,
        createdAt: new Date().toISOString(),
        avatar: ''
      });

      setRole(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gray-50/50 flex flex-col items-center justify-center relative">
      <div className="mb-10 text-center animate-fade-in flex flex-col items-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-6 bg-white p-2 px-4 rounded-2xl shadow-sm border border-gray-100 text-primary-700 font-black text-sm">
           <ArrowLeft size={16} className={lang === Language.AR ? 'rotate-180' : ''} />
           {common.back}
        </Link>
        {logo ? (
           <img src={logo} alt="Logo" className="h-16 w-auto object-contain mb-4" />
        ) : (
           <div className="w-12 h-12 bg-primary-700 text-white rounded-xl flex items-center justify-center font-black text-xl mb-4">ف</div>
        )}
        <h1 className="text-4xl font-black text-gray-900 mt-2 flex items-center justify-center gap-3">
          <Sparkles className="text-accent-500" />
          {common.register}
        </h1>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden animate-fade-in-up">
        <div className="p-3 bg-gray-50/80 m-6 rounded-[2rem] flex gap-2">
           {[
             { id: 'student', label: t.registerStudent, icon: <BookOpen size={20} /> },
             { id: 'parent', label: t.registerParent, icon: <Users size={20} /> },
             { id: 'volunteer', label: t.registerVolunteer, icon: <UserCheck size={20} /> }
           ].map((tab) => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex-1 py-4 rounded-2xl font-black text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-400'}`}
             >
               {tab.icon}
               <span className="hidden sm:inline">{tab.label}</span>
             </button>
           ))}
        </div>

        <div className="px-8 pb-12 pt-4">
          <div className="mb-10 text-center space-y-2">
            <h2 className="text-2xl font-black text-gray-800">
              {activeTab === 'parent' ? t.registerParent : activeTab === 'student' ? t.registerStudent : t.registerVolunteer}
            </h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              {activeTab === 'parent' ? t.parentDesc : activeTab === 'student' ? t.studentDesc : t.volunteerDesc}
            </p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-sm border border-red-100">
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{t.fullName}</label>
                <div className="relative group">
                    <User className={`absolute top-1/2 -translate-y-1/2 ${lang === Language.AR ? 'right-5' : 'left-5'} text-gray-400 group-focus-within:text-primary-600`} size={20} />
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full ${lang === Language.AR ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold`} 
                      placeholder="محمد أحمد"
                    />
                </div>
              </div>
               <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{t.phone}</label>
                <div className="relative group">
                    <Phone className={`absolute top-1/2 -translate-y-1/2 ${lang === Language.AR ? 'right-5' : 'left-5'} text-gray-400 group-focus-within:text-primary-600`} size={20} />
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full ${lang === Language.AR ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold`} 
                      placeholder="+90 5XX XXX XX XX"
                    />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{t.email}</label>
              <div className="relative group">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 ${lang === Language.AR ? 'right-5' : 'left-5'} text-gray-400 group-focus-within:text-primary-600`} size={20} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${lang === Language.AR ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold`} 
                    placeholder="example@mail.com"
                  />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{t.password}</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold" 
                />
              </div>
               <div className="space-y-1">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">{t.confirmPassword}</label>
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 font-bold" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary-700 hover:bg-primary-800 text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  <UserPlus size={22} />
                  {t.completeRegister}
                </>
              )}
            </button>
          </form>

           <div className="mt-10 text-center flex flex-col items-center gap-4 pt-8 border-t border-gray-50">
            <div className="text-sm font-bold text-gray-500">
              {t.hasAccount} 
              <Link to="/login" className="text-primary-700 mx-2">{translations[lang].common.login}</Link>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-green-500" />
                {t.secureText}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
