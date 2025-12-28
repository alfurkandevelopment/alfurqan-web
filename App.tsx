
import React, { useState, useEffect, createContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SetupWizard from './components/SetupWizard';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AidRequest from './pages/AidRequest';
import Login from './pages/Login';
import Register from './pages/Register';
import SectionPage from './pages/SectionPage';
import LanguageLearning from './pages/LanguageLearning';
import About from './pages/About';
import ProgramsList from './pages/ProgramsList';
import ActivitiesList from './pages/ActivitiesList';
import { UserRole, Language } from './types';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { decryptFile } from './lib/security';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  lang: Language.TR,
  setLang: () => {},
});

const App: React.FC = () => {
  const [currentRole, setRole] = useState<UserRole>(UserRole.GUEST);
  const [lang, setLang] = useState<Language>(Language.AR);
  const [loading, setLoading] = useState(true);
  const [isSetupNeeded, setIsSetupNeeded] = useState<boolean | null>(null);

  useEffect(() => {
    const dir = lang === Language.AR ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.body.className = `bg-gray-50 text-gray-800 font-sans ${dir === 'rtl' ? 'text-right' : 'text-left'}`;
  }, [lang]);

  // استقرار فحص الإعداد: نتجنب تغيير الحالة إلا بعد التأكد التام من استجابة Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system', 'config'), (snap) => {
      if (snap.exists()) {
        const isComplete = snap.data().isSetupComplete;
        setIsSetupNeeded(!isComplete);
      } else {
        // إذا لم يكن المستند موجوداً، فالنظام يحتاج لتهيئة
        setIsSetupNeeded(true);
      }
    }, (err) => {
      console.error("Setup check error:", err);
      // في حالة وجود خطأ (مثل نقص الصلاحيات)، نفترض أن الإعداد تم لعدم الدخول في حلقة مفرغة
      if (isSetupNeeded === null) setIsSetupNeeded(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role as UserRole);
          } else {
            setRole(UserRole.STUDENT);
          }
        } catch (e) {
          console.error("Error fetching role:", e);
          setRole(UserRole.GUEST);
        }
      } else {
        setRole(UserRole.GUEST);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading || isSetupNeeded === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600"></div>
            <p className="text-gray-400 font-bold animate-pulse">جاري الاتصال بنظام الفرقان...</p>
        </div>
      </div>
    );
  }

  if (isSetupNeeded) {
    return (
      <LanguageContext.Provider value={{ lang, setLang }}>
        <SetupWizard />
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <Router>
        <Layout currentRole={currentRole} setRole={setRole}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login setRole={setRole} />} />
            <Route path="/register" element={<Register setRole={setRole} />} />
            <Route path="/dashboard" element={<Dashboard role={currentRole} />} />
            <Route path="/aid-request" element={<AidRequest />} />
            <Route path="/programs" element={<ProgramsList />} />
            <Route path="/activities" element={<ActivitiesList />} />
            <Route path="/language-learning" element={<LanguageLearning />} />
            <Route path="/programs/:id" element={<SectionPage type="program" icon="quran" />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </LanguageContext.Provider>
  );
};

export default App;
