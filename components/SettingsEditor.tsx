
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
  Save, Phone, Mail, MapPin, Globe, Loader2, CheckCircle, 
  Plus, Trash2, Facebook, Instagram, Youtube, MessageCircle, Twitter, Linkedin, 
  Link as LinkIcon, Eye, EyeOff, Smartphone, BellRing, Info, ListChecks, HeartHandshake,
  Image as ImageIcon, Upload, ShieldCheck, X
} from 'lucide-react';
import { encryptFile, decryptFile } from '../lib/security';

const iconOptions = [
  { id: 'Facebook', icon: <Facebook size={18} /> },
  { id: 'Instagram', icon: <Instagram size={18} /> },
  { id: 'Youtube', icon: <Youtube size={18} /> },
  { id: 'MessageCircle', icon: <MessageCircle size={18} />, label: 'WhatsApp / Community' },
  { id: 'Twitter', icon: <Twitter size={18} /> },
  { id: 'Linkedin', icon: <Linkedin size={18} /> },
  { id: 'Phone', icon: <Phone size={18} /> },
  { id: 'Mail', icon: <Mail size={18} /> },
  { id: 'BellRing', icon: <BellRing size={18} />, label: 'Telegram' },
  { id: 'Link', icon: <LinkIcon size={18} />, label: 'Other Link' }
];

const SettingsEditor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<any>({
    address: { ar: '', tr: '', en: '' },
    channels: [],
    aidCategories: [],
    logo: '', // Encrypted Base64
    favicon: '' // Encrypted Base64
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const snap = await getDoc(doc(db, 'content', 'settings'));
      if (snap.exists()) {
        const data = snap.data();
        setForm({
          address: data.address || { ar: '', tr: '', en: '' },
          channels: data.channels || [],
          aidCategories: data.aidCategories || [],
          logo: data.logo || '',
          favicon: data.favicon || ''
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await setDoc(doc(db, 'content', 'settings'), form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (field: 'logo' | 'favicon', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit size to avoid Firestore doc limit (1MB) - Base64 is about 33% larger
      if (file.size > 500 * 1024) {
         alert("الملف كبير جداً، يرجى اختيار صورة أقل من 500 كيلوبايت لضمان سرعة التحميل.");
         return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const encrypted = encryptFile(base64);
        setForm({ ...form, [field]: encrypted });
      };
      reader.readAsDataURL(file);
    }
  };

  const addChannel = () => {
    setForm({
      ...form,
      channels: [
        ...form.channels, 
        { 
          id: Date.now().toString(),
          name: '', 
          value: '', 
          icon: 'Link', 
          showInFooter: true, 
          showInHeader: false,
          type: 'social'
        }
      ]
    });
  };

  const addAidCategory = () => {
    setForm({
      ...form,
      aidCategories: [
        ...form.aidCategories,
        { id: Date.now().toString(), ar: '', tr: '', en: '' }
      ]
    });
  };

  const removeChannel = (id: string) => {
    setForm({ ...form, channels: form.channels.filter((c: any) => c.id !== id) });
  };

  const removeAidCategory = (id: string) => {
    setForm({ ...form, aidCategories: form.aidCategories.filter((c: any) => c.id !== id) });
  };

  const updateChannel = (id: string, field: string, value: any) => {
    setForm({
      ...form,
      channels: form.channels.map((c: any) => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const updateAidCategory = (id: string, field: string, value: string) => {
    setForm({
      ...form,
      aidCategories: form.aidCategories.map((c: any) => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-primary-600" size={40} />
        <p className="text-gray-500 font-bold">جاري تحميل الإعدادات...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in text-right pb-24" dir="rtl">
      
      {/* Visual Identity Management */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-primary-600"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl">
                    <ImageIcon size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900">الهوية البصرية واللوجو</h3>
                    <p className="text-gray-500 text-sm italic">إدارة ظهور علامتك التجارية بتشفير كامل للبيانات</p>
                </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-xs font-bold border border-green-100">
                <ShieldCheck size={16} />
                تخزين مشفر بنسبة 100%
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Logo Section */}
            <div className="space-y-4">
                <h4 className="font-black text-gray-700 text-sm uppercase tracking-widest px-2">اللوجو الرئيسي (Logo)</h4>
                <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="group relative h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all overflow-hidden"
                >
                    {form.logo ? (
                        <div className="relative w-full h-full flex items-center justify-center p-6">
                            <img 
                                src={decryptFile(form.logo)} 
                                alt="Logo Preview" 
                                className="max-w-full max-h-full object-contain drop-shadow-lg" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <Upload className="text-white" />
                                <span className="text-white font-black">تغيير اللوجو</span>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setForm({...form, logo: ''}) }}
                                className="absolute top-4 left-4 p-2 bg-white text-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                <Upload className="text-gray-400 group-hover:text-primary-600" />
                            </div>
                            <p className="text-gray-400 font-bold">انقر لرفع اللوجو الرئيسي</p>
                        </div>
                    )}
                    <input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload('logo', e)} className="hidden" accept="image/*" />
                </div>
            </div>

            {/* Favicon Section */}
            <div className="space-y-4">
                <h4 className="font-black text-gray-700 text-sm uppercase tracking-widest px-2">أيقونة المتصفح (Favicon)</h4>
                <div 
                    onClick={() => faviconInputRef.current?.click()}
                    className="group relative h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all overflow-hidden"
                >
                    {form.favicon ? (
                        <div className="relative w-full h-full flex items-center justify-center p-6">
                            <div className="w-20 h-20 p-2 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                                <img 
                                    src={decryptFile(form.favicon)} 
                                    alt="Favicon Preview" 
                                    className="max-w-full max-h-full object-contain" 
                                />
                            </div>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <Upload className="text-white" />
                                <span className="text-white font-black">تغيير الأيقونة</span>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setForm({...form, favicon: ''}) }}
                                className="absolute top-4 left-4 p-2 bg-white text-red-500 rounded-full shadow-lg hover:scale-110 transition-transform"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                                <Globe className="text-gray-400 group-hover:text-primary-600" />
                            </div>
                            <p className="text-gray-400 font-bold">انقر لرفع أيقونة المتصفح</p>
                        </div>
                    )}
                    <input type="file" ref={faviconInputRef} onChange={(e) => handleFileUpload('favicon', e)} className="hidden" accept="image/*" />
                </div>
            </div>
        </div>

        <div className="mt-8 p-4 bg-primary-50 rounded-2xl border border-primary-100 flex items-start gap-3">
            <Info className="text-primary-600 shrink-0 mt-1" size={18} />
            <p className="text-sm text-primary-800 leading-relaxed font-bold italic">
                ملاحظة: يتم تخزين الصور كنصوص مشفرة (Encrypted Strings) داخل قاعدة البيانات. لا يمكن رؤيتها إلا من خلال تطبيق الفرقان، مما يضمن أقصى درجات الخصوصية لمحتوى موقعك.
            </p>
        </div>
      </div>

      {/* Aid Categories Management */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-accent-500"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-accent-50 text-accent-600 rounded-2xl">
                    <HeartHandshake size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900">تخصيص أنواع المساعدات</h3>
                    <p className="text-gray-500 text-sm">حدد الخيارات التي ستظهر للمحتاجين في نموذج طلب المساعدة</p>
                </div>
            </div>
            <button 
                onClick={addAidCategory}
                className="bg-accent-500 hover:bg-accent-600 text-white font-black px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
                <Plus size={20} /> إضافة نوع مساعدة
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {form.aidCategories.map((cat: any) => (
                <div key={cat.id} className="p-5 bg-gray-50 rounded-3xl border border-gray-200 relative group hover:border-accent-300 transition-all">
                    <button 
                        onClick={() => removeAidCategory(cat.id)}
                        className="absolute -top-2 -left-2 bg-white text-red-500 p-2 rounded-full shadow-md border border-red-50 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">بالعربية</label>
                            <input 
                                value={cat.ar}
                                onChange={(e) => updateAidCategory(cat.id, 'ar', e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent-500 outline-none"
                                placeholder="مثل: سلة غذائية"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">TÜRKÇE</label>
                            <input 
                                value={cat.tr}
                                onChange={(e) => updateAidCategory(cat.id, 'tr', e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent-500 outline-none"
                                placeholder="Gıda Paketi"
                                dir="ltr"
                            />
                        </div>
                    </div>
                </div>
            ))}
            {form.aidCategories.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <ListChecks className="mx-auto mb-3 opacity-20" size={48} />
                    <p className="font-bold">لم يتم إضافة أنواع مساعدات بعد</p>
                </div>
            )}
        </div>
      </div>

      {/* Channels Management */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <Smartphone className="text-primary-600" />
            إدارة الهوية الرقمية وقنوات التواصل
          </h3>
          <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-primary-100">
             <Info size={16} />
             تحكم في كافة وسائل التواصل وأماكن ظهورها
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Physical Address */}
          <div className="space-y-6">
            <h4 className="font-bold text-gray-900 flex items-center gap-2 text-lg border-r-4 border-accent-500 pr-3">
              <MapPin size={20} className="text-accent-600" />
              عنوان المقر الرئيسي
            </h4>
            <div className="space-y-4">
              {['ar', 'tr', 'en'].map((l) => (
                <div key={l} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="block text-xs font-black text-gray-400 mb-2 uppercase tracking-widest">العنوان ({l})</label>
                  <input 
                    type="text"
                    value={form.address[l]} 
                    onChange={(e) => setForm({...form, address: {...form.address, [l]: e.target.value}})}
                    className="w-full p-2 bg-white rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                    placeholder="أدخل العنوان هنا..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Channels */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-gray-900 flex items-center gap-2 text-lg border-r-4 border-primary-500 pr-3">
                <Globe size={20} className="text-primary-600" />
                قنوات الاتصال والتواصل الاجتماعي
              </h4>
              <button 
                onClick={addChannel}
                className="flex items-center gap-2 bg-primary-600 text-white font-bold hover:bg-primary-700 px-5 py-2.5 rounded-2xl text-sm transition-all shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                <Plus size={18} /> إضافة وسيلة تواصل
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pl-2 no-scrollbar">
              {form.channels.map((channel: any) => (
                <div key={channel.id} className="p-6 bg-white rounded-[2rem] border border-gray-200 space-y-4 relative group hover:border-primary-300 hover:shadow-xl transition-all duration-300">
                  <button 
                    onClick={() => removeChannel(channel.id)}
                    className="absolute top-4 left-4 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 p-2 rounded-full"
                    title="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">اسم المنصة</label>
                      <input 
                        value={channel.name}
                        onChange={(e) => updateChannel(channel.id, 'name', e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">الأيقونة</label>
                      <select 
                        value={channel.icon}
                        onChange={(e) => updateChannel(channel.id, 'icon', e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none cursor-pointer font-bold"
                      >
                        {iconOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label || opt.id}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">الرابط أو القيمة</label>
                    <input 
                      value={channel.value}
                      onChange={(e) => updateChannel(channel.id, 'value', e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="flex-1">
                        <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">نوع الظهور</label>
                        <select
                           value={channel.type}
                           onChange={(e) => updateChannel(channel.id, 'type', e.target.value)}
                           className="w-full text-xs font-bold bg-gray-50 border border-gray-100 rounded-lg p-2 outline-none"
                        >
                            <option value="social">أيقونة تواصل (Social Link)</option>
                            <option value="contact">معلومة اتصال (Contact Info)</option>
                        </select>
                    </div>
                    <div className="flex gap-2 self-end">
                        <button 
                          onClick={() => updateChannel(channel.id, 'showInFooter', !channel.showInFooter)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black transition-all ${channel.showInFooter ? 'bg-primary-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                          {channel.showInFooter ? <Eye size={12} /> : <EyeOff size={12} />}
                          الفوتر
                        </button>
                        <button 
                          onClick={() => updateChannel(channel.id, 'showInHeader', !channel.showInHeader)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black transition-all ${channel.showInHeader ? 'bg-accent-500 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        >
                          {channel.showInHeader ? <Eye size={12} /> : <EyeOff size={12} />}
                          الهيدر
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center gap-6 border-t pt-10">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-primary-700 hover:bg-primary-800 text-white font-black py-5 px-24 rounded-3xl shadow-2xl flex items-center gap-4 text-2xl transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={28} />}
            {saving ? 'جاري الحفظ...' : 'حفظ كافة الإعدادات'}
          </button>
          
          {success && (
            <div className="flex items-center gap-3 text-green-600 font-black animate-bounce text-lg">
              <CheckCircle size={24} />
              تم تحديث إعدادات الموقع بنجاح!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsEditor;
