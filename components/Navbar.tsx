
import React, { useState, useEffect, useContext } from 'react';
import { UserRole, Language } from '../types';
import { 
  Menu, User, LogOut, LogIn, UserPlus, BookOpen, 
  Languages, Phone, Mail, Facebook, Instagram, 
  Youtube, MessageCircle, Twitter, Linkedin, Link as LinkIcon, BellRing,
  Award
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { LanguageContext } from '../App';
import { translations } from '../lib/translations';
import { decryptFile } from '../lib/security';

const iconMap: any = {
  Facebook: <Facebook size={14} />,
  Instagram: <Instagram size={14} />,
  Youtube: <Youtube size={14} />,
  MessageCircle: <MessageCircle size={14} />,
  Twitter: <Twitter size={14} />,
  Linkedin: <Linkedin size={14} />,
  Phone: <Phone size={14} />,
  Mail: <Mail size={14} />,
  BellRing: <BellRing size={14} />,
  Link: <LinkIcon size={14} />
};

interface NavbarProps {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRole, setRole }) => {
  const { lang, setLang } = useContext(LanguageContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const t = translations[lang].common;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'content', 'settings'));
        if (snap.exists()) setSiteSettings(snap.data());
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  const headerChannels = (siteSettings?.channels || []).filter((c: any) => c.showInHeader);

  const getFlagUrl = (l: Language) => {
    switch (l) {
      case Language.TR: return 'https://flagcdn.com/w40/tr.png';
      case Language.AR: return 'https://flagcdn.com/w40/sa.png';
      case Language.EN: return 'https://flagcdn.com/w40/us.png';
      default: return '';
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setRole(UserRole.GUEST);
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {headerChannels.length > 0 && (
        <div className="bg-primary-900 text-white py-1.5 px-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-6">
              {headerChannels.filter((c:any) => c.type === 'contact').map((c:any, i:number) => (
                <div key={i} className="flex items-center gap-2 text-primary-200">
                  {iconMap[c.icon]}
                  <span dir="ltr">{c.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
               {headerChannels.filter((c:any) => c.type === 'social').map((c:any, i:number) => (
                 <a key={i} href={c.value} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">
                    {iconMap[c.icon]}
                 </a>
               ))}
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                {siteSettings?.logo ? (
                   <div className="h-12 w-auto flex items-center">
                      <img 
                        src={decryptFile(siteSettings.logo)} 
                        alt="Logo" 
                        className="h-10 w-auto object-contain"
                      />
                   </div>
                ) : (
                  <div className="w-10 h-10 bg-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    ف
                  </div>
                )}
                <div>
                  <span className="text-xl font-bold text-primary-800 block leading-none">
                    {t.brand}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{t.brandSub}</span>
                </div>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className={`px-3 py-2 text-sm font-black transition-all ${isActive('/') ? 'text-primary-700 border-b-2 border-primary-700' : 'text-gray-600 hover:text-primary-600'}`}>{t.home}</Link>
              <Link to="/programs" className={`px-3 py-2 text-sm font-black transition-all ${isActive('/programs') ? 'text-primary-700 border-b-2 border-primary-700' : 'text-gray-600 hover:text-primary-600'}`}>{t.programs}</Link>
              <Link to="/activities" className={`px-3 py-2 text-sm font-black transition-all ${isActive('/activities') ? 'text-primary-700 border-b-2 border-primary-700' : 'text-gray-600 hover:text-primary-600'}`}>{t.activities}</Link>
              <Link to="/aid-request" className={`px-3 py-2 text-sm font-black transition-all ${isActive('/aid-request') ? 'text-primary-700 border-b-2 border-primary-700' : 'text-gray-600 hover:text-primary-600'}`}>{t.aid}</Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center gap-2 p-1.5 px-2 text-gray-700 hover:bg-gray-100 rounded-full transition-all border border-gray-200 shadow-sm"
                >
                  <Languages size={18} className="text-primary-600" />
                  <img src={getFlagUrl(lang)} alt={lang} className="w-5 h-3.5 object-cover rounded-sm shadow-xs border border-gray-100" />
                </button>
                {isLangOpen && (
                  <div className="absolute top-full mt-2 left-0 w-44 bg-white shadow-2xl rounded-2xl py-2 border border-gray-100 animate-fade-in z-50 overflow-hidden">
                    {[Language.TR, Language.AR, Language.EN].map((l) => (
                      <button 
                        key={l}
                        onClick={() => {setLang(l); setIsLangOpen(false);}} 
                        className={`w-full text-right px-4 py-3 text-sm flex items-center justify-between transition-colors ${lang === l ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-700'}`}
                      >
                        <span className="font-bold">{l === Language.TR ? 'Türkçe' : l === Language.AR ? 'العربية' : 'English'}</span>
                        <img src={getFlagUrl(l)} alt={l} className="w-6 h-4 object-cover rounded shadow-xs" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {currentRole === UserRole.GUEST ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="text-sm font-black text-gray-600 hover:text-primary-700 transition-colors">{t.login}</Link>
                  <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md transition-all transform hover:scale-105 active:scale-95">{t.register}</Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><User size={20} /></Link>
                  <button onClick={handleLogout} className="text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors"><LogOut size={20} /></button>
                </div>
              )}
              
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Menu size={24} /></button>
            </div>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-lg animate-fade-in-down">
            <Link to="/" className="block text-gray-700 font-bold px-4 py-2 rounded-lg hover:bg-gray-50">{t.home}</Link>
            <Link to="/programs" className="block text-gray-700 font-bold px-4 py-2 rounded-lg hover:bg-gray-50">{t.programs}</Link>
            <Link to="/activities" className="block text-gray-700 font-bold px-4 py-2 rounded-lg hover:bg-gray-50">{t.activities}</Link>
            <Link to="/aid-request" className="block text-gray-700 font-bold px-4 py-2 rounded-lg hover:bg-gray-50">{t.aid}</Link>
            {currentRole === UserRole.GUEST && (
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link to="/login" className="block text-center text-gray-600 font-bold py-3">{t.login}</Link>
                <Link to="/register" className="block text-center bg-primary-600 text-white font-bold py-3 rounded-xl">{t.register}</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
