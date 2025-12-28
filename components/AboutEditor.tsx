
import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Save, Plus, Trash2, Globe, Layout, Image as ImageIcon, History } from 'lucide-react';

const AboutEditor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<'ar' | 'tr' | 'en'>('ar');
  
  const [form, setForm] = useState<any>({
    heroDesc: { ar: '', tr: '', en: '' },
    vision: { ar: '', tr: '', en: '' },
    mission: { ar: '', tr: '', en: '' },
    quote: { ar: '', tr: '', en: '' },
    values: [],
    journeyTitle: { ar: '', tr: '', en: '' },
    journeySteps: [],
    gallery: ['', '', '']
  });

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, 'content', 'about'));
      if (snap.exists()) setForm(snap.data());
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'content', 'about'), form);
      alert('تم الحفظ بنجاح!');
    } catch (e) {
      alert('خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const addValue = () => {
    setForm({
      ...form,
      values: [...form.values, { icon: 'Shield', title: { ar: '', tr: '', en: '' }, desc: { ar: '', tr: '', en: '' } }]
    });
  };

  const addJourneyStep = () => {
    setForm({
      ...form,
      journeySteps: [...form.journeySteps, { icon: 'Sparkles', year: '2025', title: { ar: '', tr: '', en: '' }, desc: { ar: '', tr: '', en: '' } }]
    });
  };

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <Layout className="text-primary-600" />
          تعديل محتوى صفحة "من نحن"
        </h2>
        <div className="flex gap-2">
          {['ar', 'tr', 'en'].map((l: any) => (
            <button 
              key={l} 
              onClick={() => setActiveLang(l)}
              className={`px-4 py-2 rounded-lg font-bold uppercase ${activeLang === l ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold border-r-4 border-primary-500 pr-3">المعلومات الأساسية ({activeLang})</h3>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">وصف الهيرو (Hero Description)</label>
            <textarea 
              value={form.heroDesc[activeLang]} 
              onChange={(e) => setForm({...form, heroDesc: {...form.heroDesc, [activeLang]: e.target.value}})}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500 h-32"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الرؤية (Vision)</label>
              <textarea 
                value={form.vision[activeLang]} 
                onChange={(e) => setForm({...form, vision: {...form.vision, [activeLang]: e.target.value}})}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 h-32"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">الرسالة (Mission)</label>
              <textarea 
                value={form.mission[activeLang]} 
                onChange={(e) => setForm({...form, mission: {...form.mission, [activeLang]: e.target.value}})}
                className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 h-32"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">الاقتباس النصي (Quote)</label>
            <input 
              value={form.quote[activeLang]} 
              onChange={(e) => setForm({...form, quote: {...form.quote, [activeLang]: e.target.value}})}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200"
            />
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="text-lg font-bold border-r-4 border-accent-500 pr-3 flex items-center gap-2">
            <ImageIcon size={20} />
            معرض الصور (URLs)
          </h3>
          {form.gallery.map((url: string, i: number) => (
            <div key={i}>
               <label className="block text-xs font-bold text-gray-400 mb-1">صورة {i+1}</label>
               <input 
                value={url} 
                onChange={(e) => {
                  const newG = [...form.gallery];
                  newG[i] = e.target.value;
                  setForm({...form, gallery: newG});
                }}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs"
                placeholder="https://..."
              />
            </div>
          ))}
        </div>
      </div>

      {/* Values Editor */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold border-r-4 border-blue-500 pr-3">القيم الجوهرية</h3>
          <button onClick={addValue} className="flex items-center gap-2 text-primary-600 font-bold hover:bg-primary-50 px-4 py-2 rounded-lg">
            <Plus size={18} /> إضافة قيمة
          </button>
        </div>
        <div className="space-y-6">
          {form.values.map((v: any, i: number) => (
            <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
               <div>
                  <label className="block text-xs font-bold mb-1">الأيقونة (Landmark, Shield, etc)</label>
                  <input value={v.icon} onChange={(e) => {
                    const newV = [...form.values];
                    newV[i].icon = e.target.value;
                    setForm({...form, values: newV});
                  }} className="w-full p-3 bg-white border border-gray-200 rounded-lg" />
               </div>
               <div>
                  <label className="block text-xs font-bold mb-1">العنوان ({activeLang})</label>
                  <input value={v.title[activeLang]} onChange={(e) => {
                    const newV = [...form.values];
                    newV[i].title[activeLang] = e.target.value;
                    setForm({...form, values: newV});
                  }} className="w-full p-3 bg-white border border-gray-200 rounded-lg" />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">الوصف ({activeLang})</label>
                  <div className="flex gap-2">
                    <input value={v.desc[activeLang]} onChange={(e) => {
                      const newV = [...form.values];
                      newV[i].desc[activeLang] = e.target.value;
                      setForm({...form, values: newV});
                    }} className="w-full p-3 bg-white border border-gray-200 rounded-lg flex-1" />
                    <button onClick={() => {
                      const newV = form.values.filter((_:any, idx:number) => idx !== i);
                      setForm({...form, values: newV});
                    }} className="p-3 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={20} />
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Journey Editor */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold border-r-4 border-purple-500 pr-3 flex items-center gap-2">
            <History size={20} />
            رحلة البداية (Journey)
          </h3>
          <button onClick={addJourneyStep} className="flex items-center gap-2 text-primary-600 font-bold hover:bg-primary-50 px-4 py-2 rounded-lg">
            <Plus size={18} /> إضافة محطة
          </button>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">عنوان الرحلة الرئيسي ({activeLang})</label>
          <input 
            value={form.journeyTitle[activeLang]} 
            onChange={(e) => setForm({...form, journeyTitle: {...form.journeyTitle, [activeLang]: e.target.value}})}
            className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200"
          />
        </div>
        <div className="space-y-6">
          {form.journeySteps.map((step: any, i: number) => (
            <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-4">
               <div>
                  <label className="block text-xs font-bold mb-1">السنة</label>
                  <input value={step.year} onChange={(e) => {
                    const newS = [...form.journeySteps];
                    newS[i].year = e.target.value;
                    setForm({...form, journeySteps: newS});
                  }} className="w-full p-3 bg-white border border-gray-200 rounded-lg" />
               </div>
               <div>
                  <label className="block text-xs font-bold mb-1">الأيقونة</label>
                  <input value={step.icon} onChange={(e) => {
                    const newS = [...form.journeySteps];
                    newS[i].icon = e.target.value;
                    setForm({...form, journeySteps: newS});
                  }} className="w-full p-3 bg-white border border-gray-200 rounded-lg" />
               </div>
               <div>
                  <label className="block text-xs font-bold mb-1">العنوان ({activeLang})</label>
                  <input value={step.title[activeLang]} onChange={(e) => {
                    const newS = [...form.journeySteps];
                    newS[i].title[activeLang] = e.target.value;
                    setForm({...form, journeySteps: newS});
                  }} className="w-full p-3 bg-white border border-gray-200 rounded-lg" />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-xs font-bold mb-1">الفقرة ({activeLang})</label>
                  <div className="flex gap-2">
                    <textarea value={step.desc[activeLang]} onChange={(e) => {
                      const newS = [...form.journeySteps];
                      newS[i].desc[activeLang] = e.target.value;
                      setForm({...form, journeySteps: newS});
                    }} className="w-full p-3 bg-white border border-gray-200 rounded-lg flex-1 h-20" />
                    <button onClick={() => {
                      const newS = form.journeySteps.filter((_:any, idx:number) => idx !== i);
                      setForm({...form, journeySteps: newS});
                    }} className="self-start p-3 text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={20} />
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-6 z-40 flex justify-center">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white font-black py-4 px-20 rounded-2xl shadow-2xl flex items-center gap-3 text-xl transition-all transform hover:-translate-y-1 disabled:opacity-50"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ كافة التعديلات'}
          <Save size={24} />
        </button>
      </div>
    </div>
  );
};

export default AboutEditor;
