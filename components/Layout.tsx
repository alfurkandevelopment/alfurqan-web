
import React, { useContext, useEffect, useState } from 'react';
import Navbar from './Navbar';
import { UserRole, Language } from '../types';
import { 
  Youtube, Instagram, Facebook, MessageCircle, MapPin, Mail, Phone, 
  Twitter, Linkedin, Link as LinkIcon, BellRing 
} from 'lucide-react';
import { LanguageContext } from '../App';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { translations as dict } from '../lib/translations';
import { decryptFile } from '../lib/security';

const iconMap: any = {
  Facebook: <Facebook size={20} />,
  Instagram: <Instagram size={20} />,
  Youtube: <Youtube size={20} />,
  MessageCircle: <MessageCircle size={20} />, 
  Twitter: <Twitter size={20} />,
  Linkedin: <Linkedin size={20} />,
  Phone: <Phone size={20} />,
  Mail: <Mail size={20} />,
  BellRing: <BellRing size={20} />, 
  Link: <LinkIcon size={20} />
};

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRole, setRole }) => {
  const { lang } = useContext(LanguageContext);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'content', 'settings'));
        if (snap.exists()) {
          setSiteSettings(snap.data());
        }
      } catch (e) {
        console.error("Error fetching settings:", e);
      }
    };
    fetchSettings();
  }, []);

  const t = dict[lang].common;

  const footerTranslations: any = {
    tr: {
      desc: 'Toplumsal kalkınma için bilim ve yardımı harmanlayan, İstanbul merkezli uluslararası bir sivil toplum kuruluşuyuz.',
      contact: 'İletişim Bilgileri',
      social: 'Bizi Takip Edin',
      addressDefault: 'İstanbul, Başakşehir, Furqan Binası'
    },
    ar: {
      desc: 'مؤسسة خيرية تنموية تسعى لنشر العلم النافع وتقديم يد العون للمحتاجين في إسطنبول وكافة أنحاء العالم.',
      contact: 'معلومات التواصل',
      social: 'تابعنا على وسائل التواصل',
      addressDefault: 'إسطنبول، بهشه شهير، بناء الفرقان'
    },
    en: {
      desc: 'A non-profit organization focused on education and relief efforts across Istanbul and the world.',
      contact: 'Contact Info',
      social: 'Follow Us',
      addressDefault: 'Basaksehir, Istanbul, Furqan Building'
    }
  };

  const ft = footerTranslations[lang];

  const allChannels = siteSettings?.channels || [];
  const footerContactInfo = allChannels.filter((c: any) => c.showInFooter && c.type === 'contact');
  const footerSocialLinks = allChannels.filter((c: any) => c.showInFooter && c.type === 'social');

  const displayAddress = siteSettings?.address?.[lang] || ft.addressDefault;
  const decodedLogo = siteSettings?.logo ? decryptFile(siteSettings.logo) : null;

  return (
    <div className={`min-h-screen flex flex-col font-sans bg-gray-50 ${lang === Language.AR ? 'text-right' : 'text-left'}`} dir={lang === Language.AR ? 'rtl' : 'ltr'}>
      <Navbar currentRole={currentRole} setRole={setRole} />
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-900 text-white pt-16 pb-8 mt-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {decodedLogo ? (
                  <img src={decodedLogo} alt="Logo" className="h-14 w-auto object-contain filter brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" />
                ) : (
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transform -rotate-3">
                    ف
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black tracking-tight">{t.brand}</h3>
                  <p className="text-primary-500 text-[10px] font-bold uppercase tracking-widest">{t.brandSub}</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                {ft.desc}
              </p>
            </div>

            <div className="space-y-6">
              <h4 className={`text-lg font-bold border-primary-500 pr-3 ${lang === Language.AR ? 'border-r-4' : 'border-l-4 pl-3'}`}>{ft.contact}</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li className="flex items-start gap-4 group">
                  <div className="bg-white/5 p-2 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                    <MapPin className="text-primary-500 shrink-0" size={18} />
                  </div>
                  <span className="pt-1">{displayAddress}</span>
                </li>
                {footerContactInfo.map((info: any, idx: number) => (
                  <li key={idx} className="flex items-center gap-4 group">
                    <div className="bg-white/5 p-2 rounded-lg group-hover:bg-primary-600/20 transition-colors">
                      <div className="text-primary-500 shrink-0">
                        {iconMap[info.icon] || <LinkIcon size={18} />}
                      </div>
                    </div>
                    <span dir={info.icon === 'Phone' || info.icon === 'Mail' ? 'ltr' : 'auto'} className="pt-0.5">
                        {info.value}
                    </span>
                  </li>
                ))}
                {footerContactInfo.length === 0 && (
                  <li className="flex items-center gap-4 text-gray-600 italic">
                    {t.noContact}
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className={`text-lg font-bold border-accent-500 pr-3 ${lang === Language.AR ? 'border-r-4' : 'border-l-4 pl-3'}`}>{ft.social}</h4>
              <div className="flex flex-wrap gap-4">
                {footerSocialLinks.map((social: any, idx: number) => (
                  <a
                    key={idx}
                    href={social.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/5 p-3 rounded-2xl text-gray-300 transition-all duration-300 hover:bg-primary-600 hover:text-white hover:-translate-y-2 shadow-sm flex items-center justify-center relative group"
                    title={social.name}
                  >
                    {iconMap[social.icon] || <LinkIcon size={20} />}
                    <span className="absolute -bottom-8 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {social.name}
                    </span>
                  </a>
                ))}
                {footerSocialLinks.length === 0 && (
                   <p className="text-gray-600 text-xs italic">{t.noSocial}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex justify-center items-center">
            <p className="text-gray-500 text-sm font-bold tracking-wide">
              {new Date().getFullYear()} {t.brand}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
