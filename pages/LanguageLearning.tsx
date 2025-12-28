
import React, { useState, useEffect } from 'react';
import { BookOpen, Volume2, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, ChevronRight, GraduationCap, Layout, MessageCircle, PenTool, Gamepad2, Sparkles, RefreshCw, Star, Layers } from 'lucide-react';

// --- Types & Interfaces ---

interface BilingualContent {
  tr: string;
  ar: string;
  audio?: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface GamePair {
  id: string;
  tr: string;
  ar: string;
}

interface Lesson {
  id: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'reading' | 'quiz' | 'game';
  content?: BilingualContent[];
  grammarRule?: {
    title: string;
    explanation: string;
    formula?: string;
    examples: BilingualContent[];
  };
  dialogue?: {
    speakers: { name: string; text: string; translation: string }[];
  };
  quiz?: QuizQuestion[];
  gameData?: GamePair[];
}

interface Unit {
  id: number;
  titleTr: string;
  titleAr: string;
  image: string;
  description: string;
  lessons: Lesson[];
}

// --- Data Content (Units 1-9) ---

const courseData: Unit[] = [
  {
    id: 1,
    titleTr: "Tanışma",
    titleAr: "التعارف والتحية",
    description: "أساسيات اللغة، التحيات، والأرقام.",
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    lessons: [
      {
        id: '1-vocab',
        title: 'مفردات: التحيات والأشياء (Kelime Dünyası)',
        type: 'vocabulary',
        content: [
          { tr: "Merhaba", ar: "مرحباً" },
          { tr: "Günaydın", ar: "صباح الخير" },
          { tr: "İyi günler", ar: "طاب يومك" },
          { tr: "İyi akşamlar", ar: "مساء الخير" },
          { tr: "İyi geceler", ar: "تصبح على خير" },
          { tr: "Hoşça kal", ar: "وداعاً (من المغادر)" },
          { tr: "Güle güle", ar: "مع السلامة (من الباقي)" },
          { tr: "Memnun oldum", ar: "تشرفت بمعرفتك" },
          { tr: "Teşekkür ederim", ar: "أشكرك" },
          { tr: "Nasılsın?", ar: "كيف حالك؟" },
          { tr: "Nerelisiniz?", ar: "من أين أنتم؟" },
          { tr: "Kalem", ar: "قلم" },
          { tr: "Kitap", ar: "كتاب" },
          { tr: "Defter", ar: "دفتر" },
          { tr: "Masa", ar: "طاولة" },
          { tr: "Sandalye", ar: "كرسي" },
          { tr: "Kapı", ar: "باب" },
          { tr: "Pencere", ar: "نافذة" },
          { tr: "Çanta", ar: "حقيبة" },
          { tr: "Bilgisayar", ar: "حاسوب" },
        ]
      },
      {
        id: '1-game',
        title: 'لعبة: تحدي الكلمات',
        type: 'game',
        gameData: [
          { id: 'g1', tr: "Günaydın", ar: "صباح الخير" },
          { id: 'g2', tr: "Kitap", ar: "كتاب" },
          { id: 'g3', tr: "Pencere", ar: "نافذة" },
          { id: 'g4', tr: "Hoşça kal", ar: "وداعاً" },
          { id: 'g5', tr: "Evet", ar: "نعم" },
          { id: 'g6', tr: "Hayır", ar: "لا" },
          { id: 'g7', tr: "Masa", ar: "طاولة" },
          { id: 'g8', tr: "Teşekkürler", ar: "شكراً" },
        ]
      },
      {
        id: '1-grammar-1',
        title: 'قواعد: أسماء الإشارة والجمع (İşaret Zamirleri ve Çoğul)',
        type: 'grammar',
        grammarRule: {
          title: "أسماء الإشارة والجمع (-lar/-ler)",
          explanation: "في التركية نستخدم 'Bu' للقريب، 'Şu' للبعيد قليلاً، و 'O' للبعيد جداً. للجمع، ننظر لآخر حرف صوتي: (a, ı, o, u) -> -lar، (e, i, ö, ü) -> -ler.",
          formula: "الاسم + lar / ler",
          examples: [
            { tr: "Bu nedir? Bu kitaptır.", ar: "ما هذا؟ هذا كتاب." },
            { tr: "O kim? O Ali.", ar: "من ذلك؟ ذلك علي." },
            { tr: "Kitap -> Kitaplar", ar: "كتاب -> كتب (حرف ثقيل a)" },
            { tr: "Ev -> Evler", ar: "منزل -> منازل (حرف خفيف e)" },
            { tr: "Kutu -> Kutular", ar: "صندوق -> صناديق" },
            { tr: "Göz -> Gözler", ar: "عين -> عيون" },
          ]
        }
      },
      {
        id: '1-grammar-2',
        title: 'قواعد: هل؟ / يوجد ولا يوجد (Soru Eki ve Var/Yok)',
        type: 'grammar',
        grammarRule: {
          title: "أداة الاستفهام (mı, mi, mu, mü) والوجودية",
          explanation: "للسؤال بـ 'هل'، نستخدم لاحقة تتغير حسب التوافق الصوتي الرباعي. 'Var' تعني يوجد، 'Yok' تعني لا يوجد.",
          formula: "a,ı -> mı | e,i -> mi | o,u -> mu | ö,ü -> mü",
          examples: [
            { tr: "Bu kalem mi?", ar: "هل هذا قلم؟" },
            { tr: "Okul güzel mi?", ar: "هل المدرسة جميلة؟" },
            { tr: "Sınıfta kim var?", ar: "من يوجد في الصف؟" },
            { tr: "Çantada kitap yok.", ar: "لا يوجد كتاب في الحقيبة." },
          ]
        }
      },
      {
        id: '1-quiz',
        title: 'اختبار شامل للوحدة الأولى',
        type: 'quiz',
        quiz: [
          {
            id: 1,
            question: "ما معنى 'İyi geceler'؟",
            options: ["صباح الخير", "مساء الخير", "تصبح على خير", "مرحباً"],
            correctIndex: 2,
            explanation: "تستخدم عند النوم أو في وقت متأخر من الليل."
          },
          {
            id: 2,
            question: "أي جمع هو الصحيح لكلمة 'Sınıf'؟",
            options: ["Sınıfler", "Sınıflar", "Sınıflir", "Sınıflor"],
            correctIndex: 1,
            explanation: "Sınıf تنتهي بـ ı (ثقيل) فتأخذ -lar."
          },
          {
            id: 3,
            question: "اختر أداة السؤال المناسبة: Bu doktor ____?",
            options: ["mı", "mi", "mu", "mü"],
            correctIndex: 2,
            explanation: "كلمة Doktor آخر حرف صوتي فيها 'o'، والقاعدة تقول (o, u -> mu)."
          },
          {
            id: 4,
            question: "ما عكس كلمة 'Var' (يوجد)؟",
            options: ["Yok", "Hayır", "Evet", "Değil"],
            correctIndex: 0,
            explanation: "Var (يوجد) عكسها Yok (لا يوجد/عدم)."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    titleTr: "Ailemiz",
    titleAr: "عائلتنا",
    description: "العائلة، الحالات الإعرابية، والأمر.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    lessons: [
      {
        id: '2-vocab',
        title: 'مفردات: العائلة والصفات',
        type: 'vocabulary',
        content: [
          { tr: "Anne", ar: "أُم" },
          { tr: "Baba", ar: "أب" },
          { tr: "Kardeş", ar: "أخ/أخت" },
          { tr: "Abla", ar: "أخت كبيرة" },
          { tr: "Ağabey (Abi)", ar: "أخ كبير" },
          { tr: "Dede", ar: "جد" },
          { tr: "Nine", ar: "جدة" },
          { tr: "Teyze", ar: "خالة" },
          { tr: "Amca", ar: "عم" },
          { tr: "Dayı", ar: "خال" },
          { tr: "Hala", ar: "عمة" },
          { tr: "Genç", ar: "شاب" },
          { tr: "Yaşlı", ar: "عجوز" },
          { tr: "Güzel", ar: "جميل" },
          { tr: "Çirkin", ar: "قبيح" },
          { tr: "Büyük", ar: "كبير" },
          { tr: "Küçük", ar: "صغير" },
        ]
      },
      {
        id: '2-grammar-1',
        title: 'قواعد: حالات الاسم (İsmin Hâlleri)',
        type: 'grammar',
        grammarRule: {
          title: "حالات الاسم: التواجد، التوجه، الابتعاد، المفعول به",
          explanation: "اللغة التركية تعتمد على اللواحق لتحديد مكان واتجاه الفعل.",
          formula: "-da (في) | -a (إلى) | -dan (من) | -ı (المفعول)",
          examples: [
            { tr: "Evde (في البيت)", ar: "لاحقة التواجد -de" },
            { tr: "Eve (إلى البيت)", ar: "لاحقة التوجه -e" },
            { tr: "Evden (من البيت)", ar: "لاحقة الابتعاد -den" },
            { tr: "Evi seviyorum (أحب البيت)", ar: "لاحقة المفعول به المحدد -i" },
            { tr: "Okulda, Okula, Okuldan, Okulu", ar: "في المدرسة، إلى المدرسة، من المدرسة، المدرسةَ" },
          ]
        }
      },
      {
        id: '2-grammar-2',
        title: 'قواعد: الزمن الحاضر (Şimdiki Zaman)',
        type: 'grammar',
        grammarRule: {
          title: "الزمن الحاضر / المضارع (-iyor)",
          explanation: "يستخدم للأفعال التي تحدث الآن. نحذف (mak/mek) ونضيف (iyor) مع مراعاة التوافق الصوتي والضمير.",
          formula: "جذر الفعل + (ı/i/u/ü)yor + ملحق الضمير",
          examples: [
            { tr: "Gelmek -> Geliyorum", ar: "أنا قادم" },
            { tr: "Okumak -> Okuyorsun", ar: "أنت تقرأ" },
            { tr: "Yazmak -> Yazıyor", ar: "هو يكتب" },
            { tr: "Gitmek -> Gidiyoruz", ar: "نحن ذاهبون (t تقلب إلى d)" },
          ]
        }
      },
      {
        id: '2-game',
        title: 'لعبة: العائلة والأفعال',
        type: 'game',
        gameData: [
          { id: 'f1', tr: "Anne", ar: "أُم" },
          { id: 'f2', tr: "Dayı", ar: "خال" },
          { id: 'f3', tr: "Geliyorum", ar: "أنا قادم" },
          { id: 'f4', tr: "Gidiyorsun", ar: "أنت ذاهب" },
          { id: 'f5', tr: "Okulda", ar: "في المدرسة" },
          { id: 'f6', tr: "Okula", ar: "إلى المدرسة" },
        ]
      },
      {
        id: '2-quiz',
        title: 'اختبار الوحدة الثانية',
        type: 'quiz',
        quiz: [
          {
            id: 1,
            question: "ما معنى 'Teyze'؟",
            options: ["عمة", "خالة", "جدة", "أخت"],
            correctIndex: 1,
            explanation: "Teyze تعني الخالة."
          },
          {
            id: 2,
            question: "أنا ذاهب ___ البيت. (Ben ___ gidiyorum)",
            options: ["Evde", "Evden", "Eve", "Evi"],
            correctIndex: 2,
            explanation: "الفعل Gitmek (الذهاب) يأخذ حرف الجر 'إلى' (-e/-a). لذا Eve."
          },
          {
            id: 3,
            question: "تصريف فعل Konuşmak (التحدث) مع 'نحن' (Biz)؟",
            options: ["Konuşuyorum", "Konuşuyor", "Konuşuyoruz", "Konuşuyorsun"],
            correctIndex: 2,
            explanation: "اللاحقة المناسبة لـ Biz هي -uz بعد yor. تصبح Konuşuyoruz."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    titleTr: "Günlük Hayat",
    titleAr: "الحياة اليومية",
    description: "الوقت، الروتين اليومي، والزمن الماضي.",
    image: "https://images.unsplash.com/photo-1499591934245-40b55745b905?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    lessons: [
        {
            id: '3-vocab',
            title: 'مفردات: الوقت والأرقام والأفعال',
            type: 'vocabulary',
            content: [
                { tr: "Saat", ar: "ساعة" },
                { tr: "Dakika", ar: "دقيقة" },
                { tr: "Sabah", ar: "صباح" },
                { tr: "Öğle", ar: "ظهر" },
                { tr: "Akşam", ar: "مساء" },
                { tr: "Gece", ar: "ليل" },
                { tr: "Erken", ar: "باكراً" },
                { tr: "Geç", ar: "متأخراً" },
                { tr: "Kahvaltı", ar: "فطور" },
                { tr: "Uyanmak", ar: "الاستيقاظ" },
                { tr: "Yatmak", ar: "النوم/الاستلقاء" },
                { tr: "Duş almak", ar: "الاستحمام" },
                { tr: "Yemek yemek", ar: "تناول الطعام" },
                { tr: "Bir", ar: "1" },
                { tr: "On", ar: "10" },
                { tr: "Yirmi", ar: "20" },
                { tr: "Otuz", ar: "30" },
                { tr: "Yüz", ar: "100" },
            ]
        },
        {
            id: '3-grammar-1',
            title: 'قواعد: الزمن الماضي الشهودي (Belirli Geçmiş Zaman)',
            type: 'grammar',
            grammarRule: {
                title: "الزمن الماضي (-dı / -di)",
                explanation: "يستخدم للأحداث التي تمت وانتهت في الماضي وكنا شهوداً عليها.",
                formula: "الفعل + (dı/di/du/dü) + لاحقة الضمير",
                examples: [
                    { tr: "Geldim", ar: "أتيت (Ben)" },
                    { tr: "Gittin", ar: "ذهبت (Sen)" },
                    { tr: "Yaptı", ar: "فعل/عمل (O)" },
                    { tr: "Okuduk", ar: "قرأنا (Biz)" },
                    { tr: "Yazdınız", ar: "كتبتم (Siz)" },
                    { tr: "Uyudular", ar: "ناموا (Onlar)" }
                ]
            }
        },
        {
            id: '3-grammar-2',
            title: 'قواعد: كم الساعة؟ (Saat Kaç?)',
            type: 'grammar',
            grammarRule: {
                title: "التعبير عن الوقت",
                explanation: "للوقت التام نستخدم الأرقام فقط. للنصف نستخدم 'buçuk'. للربع 'çeyrek'.",
                examples: [
                    { tr: "Saat beş", ar: "الساعة الخامسة (05:00)" },
                    { tr: "Saat beş buçuk", ar: "الساعة الخامسة والنصف (05:30)" },
                    { tr: "Saat beşi çeyrek geçiyor", ar: "الساعة الخامسة والربع" },
                    { tr: "Saat beşe çeyrek var", ar: "الساعة السادسة إلا ربع" }
                ]
            }
        },
        {
            id: '3-quiz',
            title: 'اختبار الوحدة الثالثة',
            type: 'quiz',
            quiz: [
                {
                    id: 1,
                    question: "حول الفعل 'Gel' (تعال) إلى الماضي مع الضمير 'أنا'.",
                    options: ["Geliyor", "Gelecek", "Geldim", "Geldin"],
                    correctIndex: 2,
                    explanation: "Gel + di + m = Geldim (أتيت)."
                },
                {
                    id: 2,
                    question: "الساعة 10:30 تعني:",
                    options: ["Saat on buçuk", "Saat on çeyrek", "Saat on", "Saat dokuz buçuk"],
                    correctIndex: 0,
                    explanation: "On (عشرة) + Buçuk (نصف)."
                },
                {
                    id: 3,
                    question: "ما معنى 'Akşam'؟",
                    options: ["صباح", "ظهر", "مساء", "ليل"],
                    correctIndex: 2,
                    explanation: "Akşam تعني مساء."
                }
            ]
        }
    ]
  },
  {
    id: 4,
    titleTr: "Çevremiz",
    titleAr: "بيئتنا ومحيطنا",
    description: "الأماكن، الاتجاهات، والزمن المستقبل.",
    image: "https://images.unsplash.com/photo-1572085313466-6710de8d7ba3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    lessons: [
        {
            id: '4-vocab',
            title: 'مفردات: المدينة والأماكن',
            type: 'vocabulary',
            content: [
                { tr: "Şehir", ar: "مدينة" },
                { tr: "Köy", ar: "قرية" },
                { tr: "Mahalle", ar: "حي" },
                { tr: "Cadde", ar: "شارع رئيسي" },
                { tr: "Sokak", ar: "شارع فرعي/زقاق" },
                { tr: "Banka", ar: "بنك" },
                { tr: "Postane", ar: "مكتب بريد" },
                { tr: "Eczane", ar: "صيدلية" },
                { tr: "Fırın", ar: "مخبز" },
                { tr: "Hastane", ar: "مستشفى" },
                { tr: "Sağ", ar: "يمين" },
                { tr: "Sol", ar: "يسار" },
                { tr: "İleri", ar: "للأمام" },
                { tr: "Geri", ar: "للخلف" },
                { tr: "Karşısında", ar: "في المقابل" },
            ]
        },
        {
            id: '4-grammar-1',
            title: 'قواعد: الزمن المستقبل (Gelecek Zaman)',
            type: 'grammar',
            grammarRule: {
                title: "الزمن المستقبل (-acak / -ecek)",
                explanation: "يستخدم للأحداث التي ستقع في المستقبل. (a,ı,o,u -> acak) ، (e,i,ö,ü -> ecek).",
                formula: "الفعل + (y)acak/ecek + الضمير",
                examples: [
                    { tr: "Geleceğim", ar: "سآتي (k تقلب ğ)" },
                    { tr: "Yazacak", ar: "سيكتب" },
                    { tr: "Okuyacağız", ar: "سنقرأ" },
                    { tr: "Gidecekler", ar: "سيذهبون" }
                ]
            }
        },
        {
            id: '4-grammar-2',
            title: 'قواعد: الملكية (İyelik Ekleri)',
            type: 'grammar',
            grammarRule: {
                title: "لواحق الملكية",
                explanation: "Benim (لي)، Senin (لك)، Onun (له)، Bizim (لنا)، Sizin (لكم)، Onların (لهم).",
                examples: [
                    { tr: "Benim evim", ar: "بيتي" },
                    { tr: "Senin araban", ar: "سيارتك" },
                    { tr: "Onun çantası", ar: "حقيبته/ا" },
                    { tr: "Bizim okulumuz", ar: "مدرستنا" }
                ]
            }
        },
        {
            id: '4-quiz',
            title: 'اختبار الوحدة الرابعة',
            type: 'quiz',
            quiz: [
                {
                    id: 1,
                    question: "كيف تقول 'سأذهب'؟",
                    options: ["Gidiyorum", "Gittim", "Gideceğim", "Gitmeliyim"],
                    correctIndex: 2,
                    explanation: "Gideceğim هو تصريف المستقبل للفعل Gitmek."
                },
                {
                    id: 2,
                    question: "Benim ....... (سيارة)",
                    options: ["Arabam", "Araban", "Arabası", "Arabamız"],
                    correctIndex: 0,
                    explanation: "مع Benim نضيف -m أو -ım. كلمة Araba تنتهي بصوتي فنضيف m."
                }
            ]
        }
    ]
  },
  {
    id: 5,
    titleTr: "Meslekler",
    titleAr: "المهن",
    description: "الوظائف والتركيبات الاسمية.",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    lessons: [
        {
            id: '5-vocab',
            title: 'مفردات: المهن والعمل',
            type: 'vocabulary',
            content: [
                { tr: "Öğretmen", ar: "معلم" },
                { tr: "Doktor", ar: "طبيب" },
                { tr: "Mühendis", ar: "مهندس" },
                { tr: "Polis", ar: "شرطي" },
                { tr: "Avukat", ar: "محامي" },
                { tr: "Hemşire", ar: "ممرضة" },
                { tr: "Şoför", ar: "سائق" },
                { tr: "Terzi", ar: "خياط" },
                { tr: "Aşçı", ar: "طباخ" },
                { tr: "Berber", ar: "حلاق" },
                { tr: "Pilot", ar: "طيار" },
                { tr: "Çiftçi", ar: "مزارع" },
                { tr: "İşçi", ar: "عامل" },
                { tr: "Memur", ar: "موظف" },
                { tr: "Emekli", ar: "متقاعد" }
            ]
        },
        {
            id: '5-grammar',
            title: 'قواعد: المضاف والمضاف إليه (İsim Tamlamaları)',
            type: 'grammar',
            grammarRule: {
                title: "التركيب الإضافي (المضاف والمضاف إليه)",
                explanation: "لربط اسمين ببعضهما (مثل: باب الغرفة، مدير المدرسة).",
                formula: "الاسم الأول + (ın/in) ... الاسم الثاني + (ı/i)",
                examples: [
                    { tr: "Evin kapısı", ar: "باب البيت" },
                    { tr: "Okul müdürü", ar: "مدير المدرسة" },
                    { tr: "Ali'nin arabası", ar: "سيارة علي" },
                    { tr: "Türkçe kitabı", ar: "كتاب اللغة التركية" }
                ]
            }
        },
        {
            id: '5-quiz',
            title: 'اختبار الوحدة الخامسة',
            type: 'quiz',
            quiz: [
                {
                    id: 1,
                    question: "أكمل: Oda.... rengi (لون الغرفة)",
                    options: ["Odanın", "Odaya", "Odadan", "Odayı"],
                    correctIndex: 0,
                    explanation: "المضاف إليه (المالك) يأخذ لاحقة -nın/nin."
                },
                {
                    id: 2,
                    question: "من يدافع عن الناس في المحكمة؟",
                    options: ["Doktor", "Avukat", "Mühendis", "Aşçı"],
                    correctIndex: 1,
                    explanation: "Avukat هو المحامي."
                }
            ]
        }
    ]
  },
  {
    id: 6,
    titleTr: "Ulaşım",
    titleAr: "المواصلات",
    description: "وسائل النقل، الاسم الموصول، والأعداد الترتيبية.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    lessons: [
        {
            id: '6-vocab',
            title: 'مفردات: وسائل النقل والسفر',
            type: 'vocabulary',
            content: [
                { tr: "Araba", ar: "سيارة" },
                { tr: "Otobüs", ar: "حافلة" },
                { tr: "Uçak", ar: "طائرة" },
                { tr: "Tren", ar: "قطار" },
                { tr: "Gemi", ar: "سفينة" },
                { tr: "Vapur", ar: "عبّارة" },
                { tr: "Taksi", ar: "تأكسي" },
                { tr: "Bisiklet", ar: "دراجة هوائية" },
                { tr: "Motosiklet", ar: "دراجة نارية" },
                { tr: "Havalimanı", ar: "مطار" },
                { tr: "Gar", ar: "محطة قطار" },
                { tr: "Durak", ar: "موقف" },
                { tr: "Bilet", ar: "تذكرة" },
                { tr: "Yolcu", ar: "مسافر" },
                { tr: "Trafik", ar: "ازدحام/مرور" }
            ]
        },
        {
            id: '6-grammar-1',
            title: 'قواعد: الاسم الموصول (ki / -daki)',
            type: 'grammar',
            grammarRule: {
                title: "لاحقة الوصل -ki (الذي/التي)",
                explanation: "تستخدم لربط الكلمة بمكان أو زمان، بمعنى 'الذي في...'.",
                examples: [
                    { tr: "Masadaki kitap", ar: "الكتاب الذي على الطاولة" },
                    { tr: "Evdeki hesap", ar: "الحساب الذي في البيت" },
                    { tr: "Yarinki maç", ar: "مباراة الغد" },
                    { tr: "Benimki", ar: "الذي لي (الخاص بي)" }
                ]
            }
        },
        {
            id: '6-grammar-2',
            title: 'قواعد: الأعداد الترتيبية (Sıra Sayıları)',
            type: 'grammar',
            grammarRule: {
                title: "الأول، الثاني، الثالث...",
                explanation: "تستخدم اللاحقة (ı)nci للتعبير عن الترتيب.",
                formula: "الرقم + (ı)nci / (u)ncu",
                examples: [
                    { tr: "Birinci (1.)", ar: "الأول" },
                    { tr: "İkinci (2.)", ar: "الثاني" },
                    { tr: "Üçüncü (3.)", ar: "الثالث" },
                    { tr: "Dördüncü (4.)", ar: "الرابع" }
                ]
            }
        },
        {
            id: '6-quiz',
            title: 'اختبار الوحدة السادسة',
            type: 'quiz',
            quiz: [
                {
                    id: 1,
                    question: "كيف نقول 'الطابق الخامس'؟",
                    options: ["Beş kat", "Beşinci kat", "Beşli kat", "Beşer kat"],
                    correctIndex: 1,
                    explanation: "Beşinci تعني الخامس."
                },
                {
                    id: 2,
                    question: "Arabada___ çanta (الحقيبة التي في السيارة)",
                    options: ["ki", "daki", "nki", "lar"],
                    correctIndex: 0,
                    explanation: "Araba + da (في) + ki (الذي). تصبح Arabadaki."
                }
            ]
        }
    ]
  },
  {
    id: 7,
    titleTr: "İletişim",
    titleAr: "الاتصالات",
    description: "التكنولوجيا، المقارنة، والتفضيل.",
    image: "https://images.unsplash.com/photo-1523966211575-eb4a01e7dd51?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    lessons: [
        {
            id: '7-vocab',
            title: 'مفردات: التكنولوجيا والاتصال',
            type: 'vocabulary',
            content: [
                { tr: "Telefon", ar: "هاتف" },
                { tr: "Bilgisayar", ar: "حاسوب" },
                { tr: "İnternet", ar: "إنترنت" },
                { tr: "Mesaj", ar: "رسالة" },
                { tr: "Aramak", ar: "الاتصال / البحث" },
                { tr: "Açmak", ar: "فتح" },
                { tr: "Kapatmak", ar: "إغلاق" },
                { tr: "Göndermek", ar: "إرسال" },
                { tr: "E-posta", ar: "بريد إلكتروني" },
                { tr: "Dosya", ar: "ملف" },
                { tr: "İndirmek", ar: "تحميل" },
                { tr: "Şifre", ar: "كلمة مرور" },
                { tr: "Kullanmak", ar: "استخدام" },
            ]
        },
        {
            id: '7-grammar-1',
            title: 'قواعد: المقارنة والتفضيل (Karşılaştırma)',
            type: 'grammar',
            grammarRule: {
                title: "Daha (أكثر) و En (الأكثر)",
                explanation: "للمقارنة بين شيئين نستخدم 'Daha'. للتفضيل المطلق نستخدم 'En'.",
                examples: [
                    { tr: "Ali, Ahmet'ten daha çalışkan.", ar: "علي أنشط من أحمد." },
                    { tr: "İstanbul Ankara'dan daha büyük.", ar: "إسطنبول أكبر من أنقرة." },
                    { tr: "En güzel şehir", ar: "أجمل مدينة" },
                    { tr: "Dünyanın en hızlı hayvanı", ar: "أسرع حيوان في العالم" }
                ]
            }
        },
        {
            id: '7-grammar-2',
            title: 'قواعد: منذ ولمدة (-den beri / -dır)',
            type: 'grammar',
            grammarRule: {
                title: "التعبير عن المدة الزمنية",
                explanation: "-den beri (منذ وقت محدد)، -dır/dir (لمدة زمنية).",
                examples: [
                    { tr: "Sabahtan beri bekliyorum.", ar: "أنتظر منذ الصباح." },
                    { tr: "İki saatten beri", ar: "منذ ساعتين" },
                    { tr: "İki saattir", ar: "لمدة ساعتين" },
                    { tr: "Uzun zamandır", ar: "منذ زمن طويل (لمدة طويلة)" }
                ]
            }
        },
        {
            id: '7-quiz',
            title: 'اختبار الوحدة السابعة',
            type: 'quiz',
            quiz: [
                {
                    id: 1,
                    question: "أيهما جملة مقارنة صحيحة؟",
                    options: ["Bu ev o evden daha büyük", "Bu ev o ev büyük", "Bu ev o ev en büyük", "Bu ev o ev kadar"],
                    correctIndex: 0,
                    explanation: "نستخدم المضاف منه (-den) + daha + الصفة."
                },
                {
                    id: 2,
                    question: "أعيش هنا ___ سنتين. (İki yıl___ burada yaşıyorum)",
                    options: ["dan", "dır", "beri", "da"],
                    correctIndex: 1,
                    explanation: "للتعبير عن المدة (Duration) نستخدم -dır."
                }
            ]
        }
    ]
  },
  {
    id: 8,
    titleTr: "Tatil",
    titleAr: "العطلة",
    description: "الفصول، الطقس، والمراجعة العامة.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    lessons: [
        {
            id: '8-vocab',
            title: 'مفردات: الطقس والفصول والشهور',
            type: 'vocabulary',
            content: [
                { tr: "Yaz", ar: "صيف" },
                { tr: "Kış", ar: "شتاء" },
                { tr: "İlkbahar", ar: "ربيع" },
                { tr: "Sonbahar", ar: "خريف" },
                { tr: "Ocak", ar: "يناير" },
                { tr: "Şubat", ar: "فبراير" },
                { tr: "Mart", ar: "مارس" },
                { tr: "Nisan", ar: "أبريل" },
                { tr: "Mayıs", ar: "مايو" },
                { tr: "Haziran", ar: "يونيو" },
                { tr: "Sıcak", ar: "حار" },
                { tr: "Soğuk", ar: "بارد" },
                { tr: "Ilık", ar: "معتدل" },
                { tr: "Yağmurlu", ar: "ممطر" },
                { tr: "Karlı", ar: "مثلج" },
                { tr: "Güneşli", ar: "مشمس" },
                { tr: "Deniz", ar: "بحر" },
                { tr: "Plaj", ar: "شاطئ" },
            ]
        },
        {
            id: '8-grammar',
            title: 'مراجعة القواعد العامة (Genel Tekrar)',
            type: 'grammar',
            grammarRule: {
                title: "ملخص الأزمنة والحالات",
                explanation: "في هذه الوحدة نراجع جميع الأزمنة (الماضي، الحاضر، المستقبل) وحروف الجر.",
                examples: [
                    { tr: "Yazın tatile gideceğim.", ar: "سأذهب للعطلة في الصيف (مستقبل)." },
                    { tr: "Dün çok soğuktu.", ar: "البارحة كان بارداً جداً (ماضي)." },
                    { tr: "Şu an yağmur yağıyor.", ar: "الآن تمطر (حاضر)." }
                ]
            }
        },
        {
            id: '8-game',
            title: 'لعبة: الفصول والطقس',
            type: 'game',
            gameData: [
                { id: 'w1', tr: "Yaz", ar: "صيف" },
                { id: 'w2', tr: "Kış", ar: "شتاء" },
                { id: 'w3', tr: "Güneşli", ar: "مشمس" },
                { id: 'w4', tr: "Yağmurlu", ar: "ممطر" },
                { id: 'w5', tr: "Sıcak", ar: "حار" },
                { id: 'w6', tr: "Soğuk", ar: "بارد" },
                { id: 'w7', tr: "Deniz", ar: "بحر" },
                { id: 'w8', tr: "Tatil", ar: "عطلة" },
            ]
        },
        {
            id: '8-quiz',
            title: 'اختبار الوحدة الثامنة',
            type: 'quiz',
            quiz: [
                {
                    id: 1,
                    question: "في أي فصل نذهب للسباحة عادة؟",
                    options: ["Kış", "Yaz", "Sonbahar", "İlkbahar"],
                    correctIndex: 1,
                    explanation: "Yaz (الصيف)."
                },
                {
                    id: 2,
                    question: "الجو بارد ومثلج. (Hava soğuk ve ...)",
                    options: ["Güneşli", "Sıcak", "Karlı", "Bulutlu"],
                    correctIndex: 2,
                    explanation: "Karlı تعني مثلج."
                }
            ]
        }
    ]
  },
  {
    id: 9,
    titleTr: "Genel Özet",
    titleAr: "المراجعة الشاملة",
    description: "تلخيص كامل للكتاب واختبار نهائي.",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    lessons: [
        {
            id: '9-vocab',
            title: 'أهم 50 كلمة في المستوى A1',
            type: 'vocabulary',
            content: [
                { tr: "Gitmek", ar: "الذهاب" },
                { tr: "Gelmek", ar: "المجيء" },
                { tr: "Almak", ar: "الأخذ/الشراء" },
                { tr: "Vermek", ar: "الإعطاء" },
                { tr: "Sevmek", ar: "الحب" },
                { tr: "İstemek", ar: "الرغبة" },
                { tr: "Bilmek", ar: "المعرفة" },
                { tr: "Görmek", ar: "الرؤية" },
                { tr: "Bakmak", ar: "نظر" },
                { tr: "Konuşmak", ar: "التحدث" },
                { tr: "Dinlemek", ar: "الاستماع" },
                { tr: "Yazmak", ar: "الكتابة" },
                { tr: "Okumak", ar: "القراءة" },
                { tr: "Çalışmak", ar: "العمل/الدراسة" },
                { tr: "Başlamak", ar: "التي" },
                { tr: "Bitmek", ar: "الانتهاء" },
            ]
        },
        {
            id: '9-grammar',
            title: 'جدول الأزمنة (Zamanlar Tablosu)',
            type: 'grammar',
            grammarRule: {
                title: "ملخص لواحق الأزمنة",
                explanation: "مقارنة سريعة بين الأزمنة الثلاثة الأساسية.",
                formula: "Gel (جذر)",
                examples: [
                    { tr: "Geldi (الماضي)", ar: "جاء (حدث وانتهى)" },
                    { tr: "Geliyor (الحاضر)", ar: "قادم (يحدث الآن)" },
                    { tr: "Gelecek (المستقبل)", ar: "سيأتي (سيحدث لاحقاً)" },
                    { tr: "Gel (الأمر)", ar: "تعال!" }
                ]
            }
        },
        {
            id: '9-quiz',
            title: 'الاختبار النهائي (Final Sınavı)',
            type: 'quiz',
            quiz: [
                {
                    id: 1,
                    question: "أي لاحقة تدل على الجمع؟",
                    options: ["-lar/-ler", "-lı/-li", "-cı/-ci", "-da/-de"],
                    correctIndex: 0,
                    explanation: "-lar/-ler هي لاحقة الجمع."
                },
                {
                    id: 2,
                    question: "Ben okula _______ (أنا ذاهب إلى المدرسة - الآن)",
                    options: ["Gittim", "Gideceğim", "Gidiyorum", "Giderim"],
                    correctIndex: 2,
                    explanation: "Gidiyorum (الحاضر المستمر)."
                },
                {
                    id: 3,
                    question: "Masada kitap _____? (هل يوجد كتاب على الطاولة؟)",
                    options: ["var", "yok", "var mı", "değil"],
                    correctIndex: 2,
                    explanation: "للسؤال عن الوجود نستخدم Var mı?"
                },
                {
                    id: 4,
                    question: "ما عكس 'Sıcak'؟",
                    options: ["Ilık", "Soğuk", "Serin", "Güneşli"],
                    correctIndex: 1,
                    explanation: "Soğuk (بارد)."
                },
                {
                    id: 5,
                    question: "Babamın arabası (سيارة أبي) - هذا تركيب:",
                    options: ["إضافي (Mülkiyet)", "وصفي", "فعل", "ظرف"],
                    correctIndex: 0,
                    explanation: "تركيب إضافي ملكي (İsim Tamlaması)."
                }
            ]
        }
    ]
  }
];

// --- Components ---

const BilingualText: React.FC<{ tr: string; ar: string; isHeader?: boolean }> = ({ tr, ar, isHeader }) => {
  const [showAr, setShowAr] = useState(false);

  return (
    <div 
      className={`group relative cursor-pointer rounded-lg transition-all duration-300 ${isHeader ? 'inline-block' : 'bg-white border border-gray-100 p-4 hover:border-primary-300 hover:shadow-md'}`}
      onClick={() => setShowAr(!showAr)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
            {!isHeader && (
                <div className="p-2 bg-primary-50 rounded-full text-primary-600">
                    <Volume2 size={18} />
                </div>
            )}
            <div>
                <p className={`font-bold text-gray-800 ${isHeader ? 'text-xl' : 'text-lg'}`} dir="ltr">{tr}</p>
                <p className={`text-primary-700 mt-1 font-medium transition-all duration-300 ${showAr ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 h-0 overflow-hidden'}`}>
                    {ar}
                </p>
            </div>
        </div>
        {!isHeader && (
            <div className="text-gray-400 hover:text-primary-600">
                {showAr ? <EyeOff size={16} /> : <Eye size={16} />}
            </div>
        )}
      </div>
      {!isHeader && !showAr && (
          <div className="absolute bottom-2 right-4 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              اضغط للترجمة
          </div>
      )}
    </div>
  );
};

const QuizRunner: React.FC<{ questions: QuizQuestion[] }> = ({ questions }) => {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const handleAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
        setIsAnswered(true);
        if (index === questions[currentQIndex].correctIndex) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    const resetQuiz = () => {
        setCurrentQIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResult(false);
    };

    if (showResult) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in-up">
                <div className="mb-4 inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600">
                    <GraduationCap size={48} />
                </div>
                <h3 className="text-2xl font-bold mb-2">اكتمل الاختبار!</h3>
                <p className="text-lg text-gray-600 mb-6">نتيجتك: <span className="font-bold text-primary-600">{score}</span> من {questions.length}</p>
                
                <div className="flex justify-center gap-2 mb-6">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={24} className={i < (score / questions.length) * 5 ? "text-yellow-400 fill-current" : "text-gray-200"} />
                    ))}
                </div>

                <button onClick={resetQuiz} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
                    إعادة الاختبار
                </button>
            </div>
        );
    }

    const question = questions[currentQIndex];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 text-sm text-gray-500">
                <span>السؤال {currentQIndex + 1} من {questions.length}</span>
                <span>النقاط: {score}</span>
            </div>
            
            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                <div className="bg-primary-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}></div>
            </div>
            
            <h4 className="text-xl font-bold text-gray-800 mb-6 text-right" dir="rtl">{question.question}</h4>
            
            <div className="space-y-3">
                {question.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={isAnswered}
                        className={`w-full p-4 rounded-lg border text-right transition-all flex justify-between items-center
                            ${!isAnswered ? 'hover:bg-gray-50 hover:border-gray-300 border-gray-200' : ''}
                            ${isAnswered && idx === question.correctIndex ? 'bg-green-50 border-green-500 text-green-700' : ''}
                            ${isAnswered && idx === selectedOption && idx !== question.correctIndex ? 'bg-red-50 border-red-500 text-red-700' : ''}
                        `}
                    >
                        <span dir="ltr" className="font-medium text-lg">{option}</span>
                        {isAnswered && idx === question.correctIndex && <CheckCircle size={20} className="text-green-500" />}
                        {isAnswered && idx === selectedOption && idx !== question.correctIndex && <XCircle size={20} className="text-red-500" />}
                    </button>
                ))}
            </div>

            {isAnswered && (
                <div className="mt-6 animate-fade-in-up">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-sm text-blue-800">
                        <strong>توضيح:</strong> {question.explanation}
                    </div>
                    <button onClick={nextQuestion} className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 font-bold flex items-center justify-center gap-2">
                        {currentQIndex < questions.length - 1 ? 'السؤال التالي' : 'عرض النتيجة'}
                        <ChevronRight className="rotate-180" size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Matching Game Component ---

const MatchingGame: React.FC<{ pairs: GamePair[] }> = ({ pairs }) => {
    const [leftItems, setLeftItems] = useState<GamePair[]>([]);
    const [rightItems, setRightItems] = useState<GamePair[]>([]);
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);
    const [matchedIds, setMatchedIds] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        initializeGame();
    }, [pairs]);

    const initializeGame = () => {
        const shuffledLeft = [...pairs].sort(() => Math.random() - 0.5);
        const shuffledRight = [...pairs].sort(() => Math.random() - 0.5);
        setLeftItems(shuffledLeft);
        setRightItems(shuffledRight);
        setMatchedIds([]);
        setSelectedLeft(null);
        setSelectedRight(null);
        setIsComplete(false);
    };

    const handleLeftClick = (id: string) => {
        if (matchedIds.includes(id)) return;
        setSelectedLeft(id);
        checkMatch(id, selectedRight);
    };

    const handleRightClick = (id: string) => {
        if (matchedIds.includes(id)) return;
        setSelectedRight(id);
        checkMatch(selectedLeft, id);
    };

    const checkMatch = (leftId: string | null, rightId: string | null) => {
        if (leftId && rightId) {
            if (leftId === rightId) {
                const newMatched = [...matchedIds, leftId];
                setMatchedIds(newMatched);
                setSelectedLeft(null);
                setSelectedRight(null);
                if (newMatched.length === pairs.length) {
                    setIsComplete(true);
                }
            } else {
                setTimeout(() => {
                    setSelectedLeft(null);
                    setSelectedRight(null);
                }, 500);
            }
        }
    };

    if (isComplete) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100 animate-bounce-in">
                <div className="mb-4 inline-flex p-4 rounded-full bg-green-100 text-green-600">
                    <Sparkles size={48} />
                </div>
                <h3 className="text-2xl font-bold mb-2">أحسنت!</h3>
                <p className="text-lg text-gray-600 mb-6">لقد طابقت جميع الكلمات بنجاح.</p>
                <button onClick={initializeGame} className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 mx-auto">
                    <RefreshCw size={18} />
                    لعب مرة أخرى
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Gamepad2 className="text-primary-600" />
                    صل الكلمة بمعناها
                </h3>
                <span className="text-sm bg-primary-50 text-primary-700 px-3 py-1 rounded-full">
                    {matchedIds.length} / {pairs.length}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-8 md:gap-16">
                <div className="space-y-3">
                    {leftItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleLeftClick(item.id)}
                            disabled={matchedIds.includes(item.id)}
                            className={`w-full p-4 rounded-xl text-center border-2 transition-all duration-200 font-bold text-lg
                                ${matchedIds.includes(item.id) 
                                    ? 'opacity-0 pointer-events-none' 
                                    : selectedLeft === item.id 
                                        ? 'border-primary-500 bg-primary-50 text-primary-700 scale-105 shadow-md' 
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                                }
                            `}
                            dir="ltr"
                        >
                            {item.tr}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {rightItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleRightClick(item.id)}
                            disabled={matchedIds.includes(item.id)}
                            className={`w-full p-4 rounded-xl text-center border-2 transition-all duration-200 font-bold text-lg
                                ${matchedIds.includes(item.id) 
                                    ? 'opacity-0 pointer-events-none' 
                                    : selectedRight === item.id 
                                        ? 'border-primary-500 bg-primary-50 text-primary-700 scale-105 shadow-md' 
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'
                                }
                            `}
                        >
                            {item.ar}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const LanguageLearning: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
    if (unit.lessons.length > 0) {
        setSelectedLesson(unit.lessons[0]);
    }
  };

  const handleBackToUnits = () => {
    setSelectedUnit(null);
    setSelectedLesson(null);
  };

  if (!selectedUnit) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-primary-800 text-white py-20 px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">تعليم اللغة التركية</h1>
            <p className="text-primary-200 text-lg max-w-2xl mx-auto">
                منهج "Yedi İklim" المعتمد - المستوى الأول (A1).
                <br/>
                8 وحدات متكاملة مع اختبارات تفاعلية وشرح مفصل للقواعد.
            </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courseData.map((unit) => (
                    <div 
                        key={unit.id} 
                        onClick={() => handleUnitClick(unit)}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden group border border-gray-100 flex flex-col"
                    >
                        <div className="h-48 overflow-hidden relative">
                            <img src={unit.image} alt={unit.titleTr} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                                <h3 className="text-white text-3xl font-bold">Unit {unit.id}</h3>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800" dir="ltr">{unit.titleTr}</h2>
                                    <h2 className="text-lg font-bold text-primary-600">{unit.titleAr}</h2>
                                </div>
                            </div>
                            <p className="text-gray-500 text-sm mb-6 flex-1">{unit.description}</p>
                            
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                <BookOpen size={14} /> {unit.lessons.filter(l => l.type === 'vocabulary').length} مفردات
                                <span className="mx-1">•</span>
                                <PenTool size={14} /> {unit.lessons.filter(l => l.type === 'grammar').length} قواعد
                                <span className="mx-1">•</span>
                                <Gamepad2 size={14} /> ألعاب
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gray-50 text-gray-700 font-bold group-hover:bg-primary-600 group-hover:text-white transition-all flex justify-center items-center gap-2">
                                <span>ابدأ التعلم</span>
                                <ChevronRight size={16} className="rotate-180" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-white border-l border-gray-200 flex flex-col h-full z-10 shadow-lg">
            <div className="p-6 border-b border-gray-100 bg-primary-50">
                <button onClick={handleBackToUnits} className="text-sm text-gray-500 hover:text-primary-700 flex items-center gap-1 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    العودة للقائمة
                </button>
                <h2 className="text-2xl font-bold text-gray-900" dir="ltr">{selectedUnit.titleTr}</h2>
                <p className="text-primary-600 font-medium">{selectedUnit.titleAr}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {selectedUnit.lessons.map((lesson) => (
                    <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`w-full text-right p-4 rounded-xl flex items-center gap-3 transition-all duration-200 ${
                            selectedLesson?.id === lesson.id 
                            ? 'bg-primary-600 text-white shadow-md translate-x-2' 
                            : 'bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200'
                        }`}
                    >
                        <div className={`p-2 rounded-lg ${selectedLesson?.id === lesson.id ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                            {lesson.type === 'vocabulary' && <BookOpen size={18} />}
                            {lesson.type === 'grammar' && <PenTool size={18} />}
                            {lesson.type === 'reading' && <MessageCircle size={18} />}
                            {lesson.type === 'quiz' && <CheckCircle size={18} />}
                            {lesson.type === 'game' && <Gamepad2 size={18} />}
                        </div>
                        <span className="font-medium text-sm flex-1">{lesson.title}</span>
                    </button>
                ))}
            </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/50">
            {selectedLesson ? (
                <div className="max-w-4xl mx-auto animate-fade-in-up">
                    <div className="mb-8 border-b border-gray-200 pb-4 flex justify-between items-end">
                        <div>
                            <span className="text-xs font-bold text-primary-600 tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                                {selectedLesson.type === 'vocabulary' ? 'مفردات' : 
                                 selectedLesson.type === 'grammar' ? 'قواعد' : 
                                 selectedLesson.type === 'reading' ? 'قراءة ومحادثة' : 
                                 selectedLesson.type === 'game' ? 'لعبة تفاعلية' : 'اختبار'}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mt-3">{selectedLesson.title}</h1>
                        </div>
                        <div className="text-gray-400">
                            {selectedUnit.titleTr}
                        </div>
                    </div>

                    {selectedLesson.type === 'vocabulary' && selectedLesson.content && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedLesson.content.map((item, idx) => (
                                <BilingualText key={idx} tr={item.tr} ar={item.ar} />
                            ))}
                        </div>
                    )}

                    {selectedLesson.type === 'grammar' && selectedLesson.grammarRule && (
                        <div className="space-y-8">
                            <div className="bg-white border border-blue-100 shadow-sm p-8 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                                <h3 className="text-2xl font-bold text-blue-900 mb-4">{selectedLesson.grammarRule.title}</h3>
                                
                                {selectedLesson.grammarRule.formula && (
                                    <div className="mb-6 p-4 bg-gray-100 rounded-lg font-mono text-center text-lg text-gray-700 border-2 border-dashed border-gray-300" dir="ltr">
                                        {selectedLesson.grammarRule.formula}
                                    </div>
                                )}
                                
                                <p className="text-lg text-gray-700 leading-relaxed mb-6">{selectedLesson.grammarRule.explanation}</p>
                            </div>
                            
                            <div>
                                <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <Layout size={24} className="text-primary-600" />
                                    أمثلة توضيحية (Örnekler)
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {selectedLesson.grammarRule.examples.map((ex, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-primary-200 transition-colors flex justify-between items-center group">
                                            <p className="text-xl font-bold text-gray-800" dir="ltr">{ex.tr}</p>
                                            <p className="text-gray-500 group-hover:text-primary-600 transition-colors">{ex.ar}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedLesson.type === 'reading' && selectedLesson.dialogue && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                    <MessageCircle size={20} />
                                    نص المحادثة
                                </h3>
                            </div>
                            <div className="p-8 space-y-8">
                                {selectedLesson.dialogue.speakers.map((line, idx) => (
                                    <div key={idx} className={`flex gap-4 ${idx % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl shrink-0 shadow-md ${idx % 2 === 0 ? 'bg-primary-500' : 'bg-yellow-500'}`}>
                                            {line.name.charAt(0)}
                                        </div>
                                        <div className={`flex-1 ${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                            <div className="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">{line.name}</div>
                                            <div className={`inline-block p-6 rounded-3xl max-w-[90%] cursor-pointer group shadow-sm hover:shadow-md transition-all ${idx % 2 === 0 ? 'bg-white border border-gray-100 rounded-tr-none' : 'bg-primary-50 border border-primary-100 rounded-tl-none'}`}>
                                                <p className="text-xl font-medium text-gray-800 mb-2" dir="ltr">{line.text}</p>
                                                <p className="text-sm text-gray-500 border-t border-gray-200 pt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    {line.translation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedLesson.type === 'game' && selectedLesson.gameData && (
                        <MatchingGame pairs={selectedLesson.gameData} />
                    )}

                    {selectedLesson.type === 'quiz' && selectedLesson.quiz && (
                        <QuizRunner questions={selectedLesson.quiz} />
                    )}

                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <Layers size={80} className="mb-6 opacity-20" />
                    <p className="text-xl font-medium text-gray-400">اختر درساً من القائمة الجانبية للبدء</p>
                </div>
            )}
        </main>
    </div>
  );
};

export default LanguageLearning;
