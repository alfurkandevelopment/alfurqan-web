
import React, { useContext, useEffect, useState } from 'react';
import { Target, Heart, Shield, Users, Award, Landmark, CheckCircle2, Star, History, Sparkles, Sprout, Quote, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../App';
import { Language } from '../types';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const iconMap: any = {
  Target: <Target size={40} />,
  Heart: <Heart size={40} />,
  Shield: <Shield size={24} />,
  Award: <Award size={24} />,
  Users: <Users size={24} />,
  Landmark: <Landmark size={24} />,
  Sparkles: <Sparkles size={24} />,
  Sprout: <Sprout size={24} />,
  History: <History size={24} />
};

const About: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'content', 'about');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching about content:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const t_static: any = {
    tr: {
      heroTitle: 'Biz Kimiz?',
      heroDesc: 'Furqan Derneği olarak, toplumsal kalkınma için bilim ve yardımı harmanlayan bir gelecek inşa ediyoruz.',
      vision: 'Vizyonumuz',
      mission: 'Misyonumuz',
      valuesTitle: 'Değerlerimiz',
      valuesSub: 'Bizi yöneten temel ilkeler',
      journeyTitle: 'Hikayemiz',
      ctaTitle: 'Siz de Bu Yolculuğun Bir Parçası Olun',
      ctaBtn: 'İşbirliği Yapın'
    },
    ar: {
      heroTitle: 'من نحن؟',
      heroDesc: 'جمعية الفرقان للعمل الخيري والتنموي؛ مؤسسة رائدة تسعى لبناء مجتمع متكافل ومزدهر من خلال برامج تعليمية وإغاثية مستدامة.',
      vision: 'رؤيتنا',
      mission: 'رسالتنا',
      valuesTitle: 'قيمنا الجوهرية',
      valuesSub: 'المبادئ التي تقودنا في كل خطوة نخطوها نحو التغيير',
      journeyTitle: 'قصتنا: رحلة العطاء',
      ctaTitle: 'ساهم معنا في صناعة الأثر',
      ctaBtn: 'انضم إلينا الآن'
    },
    en: {
      heroTitle: 'Who We Are?',
      heroDesc: 'Furqan Association is a leading institution striving to build a cohesive and prosperous society.',
      vision: 'Our Vision',
      mission: 'Our Mission',
      valuesTitle: 'Our Core Values',
      valuesSub: 'Principles that guide us in every step',
      journeyTitle: 'Our Story',
      ctaTitle: 'Be Part of the Impact',
      ctaBtn: 'Join Us Now'
    }
  };

  const ts = t_static[lang];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
        <p className="text-gray-500 font-bold animate-pulse">جاري تحميل المحتوى...</p>
      </div>
    );
  }

  // Fallback data if DB is empty or fetch fails
  const visionText = content?.vision?.[lang] || ts.heroDesc;
  const missionText = content?.mission?.[lang] || ts.heroDesc;
  const quoteText = content?.quote?.[lang] || "بدأنا بحلم صغير، واليوم نرى الثمار في وجوه المستفيدين.";
  const values = content?.values || [
    { icon: 'Shield', title: { ar: 'الشفافية', tr: 'Şeffaflık', en: 'Transparency' }, desc: { ar: 'وضوح تام في مصادر التمويل وأوجه الصرف.', tr: 'Finansman kaynaklarında tam netlik.', en: 'Full clarity in funding sources.' } },
    { icon: 'Award', title: { ar: 'الإتقان', tr: 'Mükemmeliyet', en: 'Excellence' }, desc: { ar: 'نسعى لأعلى معايير الجودة في تنفيذ برامجنا.', tr: 'Programlarımızın uygulanmasında en yüksek kalite standartlarını hedefliyoruz.', en: 'We strive for the highest quality standards in our programs.' } }
  ];
  const journeyTitle = content?.journeyTitle?.[lang] || ts.journeyTitle;
  const journeySteps = content?.journeySteps || [
    { year: '2015', icon: 'Sparkles', title: { ar: 'بذرة النور', tr: 'Işık Tohumu', en: 'Seed of Light' }, desc: { ar: 'بداية حلقة تعليم القرآن الصغيرة في إسطنبول.', tr: 'İstanbul\'da küçük bir Kuran dersi halkasının başlangıcı.', en: 'Beginning of a small Quran teaching circle in Istanbul.' } }
  ];
  const gallery = content?.gallery || [
    "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80"
  ];

  return (
    <div className="min-h-screen bg-white animate-fade-in">
      {/* 1. Hero */}
      <section className="relative bg-primary-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 animate-fade-in-up">{ts.heroTitle}</h1>
          <p className="text-xl md:text-2xl text-primary-100 max-w-4xl mx-auto leading-relaxed opacity-90 animate-fade-in-up delay-100">
            {content?.heroDesc?.[lang] || ts.heroDesc}
          </p>
        </div>
      </section>

      {/* 2. Vision & Mission */}
      <section className="max-w-7xl mx-auto px-4 -mt-16 relative z-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 transform hover:-translate-y-2 transition-transform duration-500">
            <div className="w-20 h-20 bg-primary-100 text-primary-700 rounded-3xl flex items-center justify-center mb-8">
              <Target size={40} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">{ts.vision}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{visionText}</p>
          </div>
          <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 transform hover:-translate-y-2 transition-transform duration-500 delay-100">
            <div className="w-20 h-20 bg-accent-100 text-accent-700 rounded-3xl flex items-center justify-center mb-8">
              <Heart size={40} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-6">{ts.mission}</h2>
            <p className="text-gray-600 leading-relaxed text-lg">{missionText}</p>
          </div>
        </div>
      </section>

      {/* 3. Core Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-4">{ts.valuesTitle}</h2>
          <p className="text-gray-500 mb-16 max-w-2xl mx-auto text-lg">{ts.valuesSub}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v: any, i: number) => (
              <div key={i} className="p-10 rounded-[2rem] bg-white hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-50 transition-colors">
                  <div className="text-primary-600">{iconMap[v.icon] || <Shield size={24} />}</div>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">{v.title?.[lang] || 'Value'}</h3>
                <p className="text-gray-500 text-base leading-relaxed">{v.desc?.[lang] || ''}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Gallery & Quote */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 relative w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src={gallery[0]} alt="Gallery 1" className="rounded-3xl shadow-lg w-full h-64 object-cover transform -rotate-2 hover:rotate-0 transition-all duration-500" />
                <img src={gallery[1]} alt="Gallery 2" className="rounded-3xl shadow-lg w-full h-48 object-cover transform rotate-1 hover:rotate-0 transition-all duration-500" />
              </div>
              <div className="pt-12">
                <div className="bg-accent-500 p-8 rounded-3xl shadow-xl mb-4 text-white">
                  <Quote size={40} className="mb-4 opacity-50" />
                  <p className="font-bold text-lg leading-snug">"{quoteText}"</p>
                </div>
                <img src={gallery[2] || gallery[0]} alt="Gallery 3" className="rounded-3xl shadow-lg w-full h-64 object-cover transform rotate-2 hover:rotate-0 transition-all duration-500" />
              </div>
            </div>
          </div>

          {/* 5. Start of the Journey */}
          <div className="flex-1 space-y-10">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-widest shadow-sm">
              <History size={18} />
              {ts.journeyTitle}
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.15]">
              {journeyTitle}
            </h2>

            <div className={`space-y-8 relative border-primary-200 ${lang === Language.AR ? 'pr-8 border-r-2' : 'pl-8 border-l-2'}`}>
              {journeySteps.map((step: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className={`absolute top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm ${lang === Language.AR ? '-right-[41px]' : '-left-[41px]'} ${idx % 2 === 0 ? 'bg-primary-600' : 'bg-accent-500'}`}></div>
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-md text-primary-600 shrink-0">
                      {iconMap[step.icon] || <Sparkles size={24} />}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{step.title?.[lang]} ({step.year})</h4>
                      <p className="text-gray-600 leading-relaxed text-lg">{step.desc?.[lang]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-900 py-24 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Star className="text-accent-400 mx-auto mb-8 animate-pulse" fill="currentColor" size={48} />
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{ts.ctaTitle}</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mt-12">
            <Link to="/register" className="bg-accent-500 hover:bg-accent-600 text-black font-black py-5 px-14 rounded-3xl shadow-2xl transition-all hover:-translate-y-1 text-xl flex items-center justify-center gap-3">
              <CheckCircle2 size={24} />
              {ts.ctaBtn}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
