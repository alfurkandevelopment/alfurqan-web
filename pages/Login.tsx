
import React, { useState, useContext, useEffect } from 'react';
import { UserRole, Language } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, AlertCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { LanguageContext } from '../App';
import { translations } from '../lib/translations';
import { decryptFile } from '../lib/security';

interface LoginProps {
  setRole: (role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ setRole }) => {
  const { lang } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role as UserRole;
        setRole(role);
        navigate('/dashboard');
      } else {
        setError(lang === 'ar' ? 'لم يتم العثور على صلاحيات لهذا الحساب.' : 'Account permissions not found.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError(lang === 'ar' ? 'البريد أو كلمة المرور غير صحيحة.' : 'Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError(lang === 'ar' ? 'تم حظر الدخول مؤقتاً لكثرة المحاولات.' : 'Too many attempts. Account locked temporarily.');
      } else {
        setError(t.loginError);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1/2 bg-primary-900 rounded-b-[4rem] z-0 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
      </div>
      
      <div className="w-full max-w-lg z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
             {logo ? (
               <img src={logo} alt="Logo" className="h-20 w-auto object-contain drop-shadow-2xl" />
             ) : (
               <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center text-primary-900 font-black text-3xl shadow-xl transform -rotate-6">
                  ف
               </div>
             )}
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">{t.loginTitle}</h1>
          <p className="text-primary-100/80 font-medium">{t.loginSub}</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-white">
          {error && (
            <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-sm border border-red-100 animate-shake">
              <AlertCircle size={18} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleRealLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 text-right block">{t.email}</label>
              <div className="relative group">
                <User className={`absolute top-1/2 -translate-y-1/2 ${lang === Language.AR ? 'right-5' : 'left-5'} text-gray-400 group-focus-within:text-primary-600`} size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full ${lang === Language.AR ? 'pr-14 pl-6 text-right' : 'pl-14 pr-6 text-left'} py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold`}
                  placeholder="admin@alfurqan.org"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1 text-right block">{t.password}</label>
              <div className="relative group">
                <Lock className={`absolute top-1/2 -translate-y-1/2 ${lang === Language.AR ? 'right-5' : 'left-5'} text-gray-400 group-focus-within:text-primary-600`} size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full ${lang === Language.AR ? 'pr-14 pl-6 text-right' : 'pl-14 pr-6 text-left'} py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold`}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-3 bg-primary-700 hover:bg-primary-800 text-white font-black py-4 px-6 rounded-2xl shadow-xl active:scale-95 disabled:opacity-70 group transition-all"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>{t.loginBtn}</span>
                  <ArrowRight className={`${lang === Language.AR ? 'rotate-180' : ''}`} size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
             <div className="text-sm text-gray-500 font-bold">
               {t.noAccount} 
               <Link to="/register" className="text-primary-700 hover:text-accent-600 mx-2 transition-colors">{common.register}</Link>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">
                <ShieldCheck size={14} className="text-green-500" />
                {t.secureText}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
