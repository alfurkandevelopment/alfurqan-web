
import React, { useState, useContext, useRef } from 'react';
import { UserRole, Language } from '../types';
import { 
    ShieldCheck, UserPlus, Image as ImageIcon, CheckCircle, 
    ArrowRight, ArrowLeft, Loader2, Sparkles, Mail, Lock, User, Upload, X, AlertTriangle 
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { LanguageContext } from '../App';
import { translations } from '../lib/translations';
import { encryptFile, decryptFile } from '../lib/security';

const SetupWizard: React.FC = () => {
    const { lang } = useContext(LanguageContext);
    const t = translations[lang].setup;
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Step 1: Admin Info
    const [adminForm, setAdminForm] = useState({
        fullName: '',
        email: '',
        password: '',
    });

    // Step 2: Branding
    const [branding, setBranding] = useState({
        logo: '',
        favicon: ''
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (field: 'logo' | 'favicon', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) {
                setError("حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 500 ك.ب");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const encrypted = encryptFile(reader.result as string);
                setBranding(prev => ({ ...prev, [field]: encrypted }));
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFinalize = async () => {
        setLoading(true);
        setError(null);
        let user;
        try {
            // 1. محاولة إنشاء الحساب في Firebase Auth
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, adminForm.email, adminForm.password);
                user = userCredential.user;
            } catch (authErr: any) {
                if (authErr.code === 'auth/email-already-in-use') {
                    const signInCredential = await signInWithEmailAndPassword(auth, adminForm.email, adminForm.password);
                    user = signInCredential.user;
                } else {
                    throw authErr;
                }
            }

            if (!user) throw new Error("فشل في الوصول إلى حساب المدير.");

            // 2. تخزين بيانات المستخدم في Firestore برتبة Super Admin
            await setDoc(doc(db, 'users', user.uid), {
                fullName: adminForm.fullName,
                email: adminForm.email,
                role: UserRole.SUPER_ADMIN,
                createdAt: new Date().toISOString(),
                avatar: ''
            });

            // 3. تخزين إعدادات الموقع الأولية
            await setDoc(doc(db, 'content', 'settings'), {
                logo: branding.logo,
                favicon: branding.favicon,
                channels: [],
                aidCategories: [],
                address: { ar: '', tr: '', en: '' }
            });

            // 4. تهيئة الإحصائيات العامة (تصفير العداد)
            await setDoc(doc(db, 'stats', 'global'), {
                visitorCount: 0,
                memberCount: 1,
                programCount: 0,
                activityCount: 0,
                lastUpdated: new Date().toISOString()
            });

            // 5. وضع علامة اكتمال الإعداد
            await setDoc(doc(db, 'system', 'config'), {
                isSetupComplete: true,
                setupDate: new Date().toISOString(),
                initialAdminUid: user.uid
            });

            setTimeout(() => {
                window.location.reload();
            }, 500);
            
        } catch (err: any) {
            console.error("Setup Error:", err);
            let msg = err.message;
            if (err.code === 'auth/wrong-password') {
                msg = "هذا البريد مسجل بالفعل ولكن كلمة المرور خاطئة. يرجى استخدام كلمة المرور الصحيحة لإكمال الإعداد.";
            }
            setError(msg || "حدث خطأ غير متوقع أثناء التهيئة.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
            
            <div className="w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 animate-fade-in-up">
                {/* Sidebar Info */}
                <div className="md:w-80 bg-gray-50 p-10 flex flex-col justify-between border-l border-gray-100">
                    <div>
                        <div className="w-16 h-16 bg-primary-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary-700/20 mb-8 transform -rotate-3">
                            ف
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4">{t.welcome}</h2>
                        <p className="text-gray-500 text-sm leading-relaxed">{t.desc}</p>
                    </div>

                    <div className="space-y-4 pt-10">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {step > s ? <CheckCircle size={16} /> : s}
                                </div>
                                <span className={`text-xs font-bold ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {s === 1 ? t.step1Title : s === 2 ? t.step2Title : t.step3Title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Wizard Steps */}
                <div className="flex-1 p-10 md:p-16 relative">
                    {error && (
                        <div className="absolute top-4 left-4 right-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3 animate-shake z-20">
                            <AlertTriangle size={20} className="shrink-0" />
                            <p className="text-xs font-bold leading-relaxed">{error}</p>
                            <button onClick={() => setError(null)} className="ml-auto"><X size={16}/></button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">{t.step1Title}</h3>
                                <p className="text-gray-500 text-sm">{t.step1Desc}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{translations[lang].auth.fullName}</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600" size={20} />
                                        <input 
                                            value={adminForm.fullName} 
                                            onChange={e => setAdminForm({...adminForm, fullName: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold" 
                                            placeholder="Super Admin Name"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{translations[lang].auth.email}</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600" size={20} />
                                        <input 
                                            type="email"
                                            value={adminForm.email} 
                                            onChange={e => setAdminForm({...adminForm, email: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold" 
                                            placeholder="admin@alfurqan.org"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{translations[lang].auth.password}</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600" size={20} />
                                        <input 
                                            type="password"
                                            value={adminForm.password} 
                                            onChange={e => setAdminForm({...adminForm, password: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-bold" 
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => setStep(2)}
                                disabled={!adminForm.email || !adminForm.password || adminForm.password.length < 6}
                                className="w-full bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-primary-800 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {t.next} <ArrowRight size={20} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">{t.step2Title}</h3>
                                <p className="text-gray-500 text-sm">{t.step2Desc}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">اللوجو الرئيسي</h4>
                                    <div 
                                        onClick={() => logoInputRef.current?.click()}
                                        className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-all overflow-hidden relative"
                                    >
                                        {branding.logo ? (
                                            <img src={decryptFile(branding.logo)} className="max-h-full p-4 object-contain" />
                                        ) : (
                                            <Upload className="text-gray-300" />
                                        )}
                                        <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('logo', e)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Favicon</h4>
                                    <div 
                                        onClick={() => faviconInputRef.current?.click()}
                                        className="h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-all overflow-hidden relative"
                                    >
                                        {branding.favicon ? (
                                            <img src={decryptFile(branding.favicon)} className="w-12 h-12 object-contain" />
                                        ) : (
                                            <Sparkles className="text-gray-300" />
                                        )}
                                        <input ref={faviconInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload('favicon', e)} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="px-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-all"><ArrowLeft size={20}/></button>
                                <button 
                                    onClick={() => setStep(3)}
                                    className="flex-1 bg-primary-700 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-primary-800 transition-all active:scale-95"
                                >
                                    {t.next} <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-8 animate-fade-in flex flex-col items-center">
                            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                                <ShieldCheck size={48} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-900 mb-2">{t.step3Title}</h3>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto">{t.step3Desc}</p>
                            </div>

                            <div className="w-full bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-3 text-left">
                                <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">ADMIN:</span> <span>{adminForm.email}</span></div>
                                <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">ROLE:</span> <span className="text-primary-600">SUPER_ADMIN</span></div>
                                <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">BRANDING:</span> <span>{branding.logo ? 'Uploaded' : 'Default'}</span></div>
                            </div>

                            <button 
                                onClick={handleFinalize}
                                disabled={loading}
                                className="w-full bg-primary-700 text-white font-black py-5 rounded-3xl shadow-2xl flex items-center justify-center gap-3 hover:bg-primary-800 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={24} />}
                                {t.finish}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SetupWizard;
