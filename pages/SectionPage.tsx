import React, { useState, useEffect, useContext } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  Heart,
  Mic,
  Trophy,
  Loader2,
  Clock,
  MapPin,
  UserCheck,
  ChevronRight,
  Activity,
  Info,
  Target,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { Program, Activity as ActivityType, Language } from '../types';
import { LanguageContext } from '../App';
import { translations } from '../lib/translations';

interface SectionPageProps {
  title?: string;
  description?: string;
  type?: 'program' | 'donation' | 'service';
  icon?: 'quran' | 'mosque' | 'language' | 'competition' | 'sermon' | 'monthly';
}

const SectionPage: React.FC<SectionPageProps> = ({
  title: initialTitle,
  description: initialDesc,
  type: initialType = 'program',
  icon: initialIcon = 'quran',
}) => {
  const { id } = useParams<{ id: string }>();
  const { lang } = useContext(LanguageContext);

  const [program, setProgram] = useState<Program | null>(null);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const t = translations[lang].sections;

  useEffect(() => {
    const fetchProgramData = async () => {
      setLoading(true);
      try {
        let currentProgramData: Program | null = null;

        if (id) {
          const pSnap = await getDoc(doc(db, 'programs', id));
          if (pSnap.exists()) {
            currentProgramData = { id: pSnap.id, ...pSnap.data() } as Program;
            setProgram(currentProgramData);
          }
        }

        const aSnap = await getDocs(collection(db, 'activities'));
        const allActivities = aSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() } as ActivityType)
        );

        if (id) {
          setActivities(allActivities.filter((a) => a.programId === id));
        } else {
          const categoryMap: any = {
            quran: 'Quran',
            mosque: 'Mosque',
            language: 'Language',
            competition: 'Competition',
          };
          const targetCategory = categoryMap[initialIcon] || 'General';

          const pQuery = query(
            collection(db, 'programs'),
            where('category', '==', targetCategory)
          );
          const pDataSnap = await getDocs(pQuery);
          const pIds = pDataSnap.docs.map((d) => d.id);
          setActivities(
            allActivities.filter((a) => pIds.includes(a.programId))
          );
        }

        const vSnap = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'Volunteer'))
        );
        setVolunteers(vSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('Error fetching section data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProgramData();
  }, [id, initialIcon]);

  const pTitle = program?.title
    ? typeof program.title === 'string'
      ? program.title
      : program.title[lang]
    : initialTitle;
  const pDesc = program?.description
    ? typeof program.description === 'string'
      ? program.description
      : program.description[lang]
    : initialDesc;
  const pGoal = program?.goal?.[lang];
  const displayIcon = program?.category?.toLowerCase() || initialIcon;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'quran':
        return <BookOpen size={64} />;
      case 'mosque':
        return <Building2 size={64} />;
      case 'language':
        return <BookOpen size={64} />;
      case 'competition':
        return <Trophy size={64} />;
      case 'sermon':
        return <Mic size={64} />;
      default:
        return <Heart size={64} />;
    }
  };

  const getGradient = () => {
    switch (initialType) {
      case 'program':
        return 'from-primary-700 to-primary-900';
      case 'service':
        return 'from-purple-600 to-purple-800';
      default:
        return 'from-gray-700 to-gray-900';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 pb-20'>
      {/* Hero Header */}
      <div
        className={`bg-gradient-to-r ${getGradient()} text-white py-24 px-4 relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className='max-w-4xl mx-auto text-center relative z-10 animate-fade-in-up'>
          <div className='inline-flex p-6 bg-white/10 rounded-[2rem] mb-8 backdrop-blur-md border border-white/20 shadow-2xl'>
            {getIcon(displayIcon)}
          </div>
          <h1 className='text-4xl md:text-6xl font-black mb-6 leading-tight'>
            {pTitle}
          </h1>
          <p className='text-xl opacity-90 max-w-2xl mx-auto leading-relaxed'>
            {pDesc}
          </p>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 -mt-12 relative z-20'>
        <div className='bg-white rounded-[3rem] shadow-2xl p-8 md:p-16 border border-gray-100 min-h-[400px]'>
          {loading ? (
            <div className='flex flex-col items-center justify-center py-20 gap-4'>
              <Loader2 className='animate-spin text-primary-600' size={48} />
              <p className='font-bold text-gray-400 italic'>{t.fetchingData}</p>
            </div>
          ) : (
            <div className='space-y-16'>
              <div className='flex flex-col lg:flex-row gap-12 items-start'>
                <div className='lg:w-1/3 space-y-8 animate-fade-in'>
                  {program?.image && (
                    <div className='relative group'>
                      <img
                        src={program.image}
                        alt={pTitle}
                        className='w-full h-72 object-cover rounded-[2.5rem] shadow-xl border-4 border-white transition-transform duration-500 group-hover:scale-105'
                      />
                    </div>
                  )}

                  <div className='p-8 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-sm'>
                    <h3 className='font-black text-gray-900 text-xl mb-6 flex items-center gap-2'>
                      <Info className='text-primary-600' size={24} />{' '}
                      {t.infoTitle}
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex justify-between items-center py-2 border-b border-gray-200'>
                        <span className='text-gray-400 font-bold text-sm'>
                          {t.category}
                        </span>
                        <span className='bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-[10px] font-black'>
                          {program?.category}
                        </span>
                      </div>
                      {pGoal && (
                        <div className='pt-4 space-y-2'>
                          <div className='text-gray-400 font-bold text-sm flex items-center gap-2'>
                            <Target size={14} className='text-accent-500' /> هدف
                            البرنامج
                          </div>
                          <p className='text-sm text-gray-700 italic leading-relaxed'>
                            {pGoal}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className='flex-1 space-y-8'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-black text-2xl text-gray-900 flex items-center gap-3'>
                      <Calendar className='text-primary-600' />{' '}
                      {t.activeSchedules}
                    </h3>
                    <span className='text-xs bg-gray-100 text-gray-400 px-4 py-1.5 rounded-full font-bold'>
                      {t.total}: {activities.length}
                    </span>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        className='bg-white p-8 rounded-[2.5rem] border border-gray-200 hover:border-primary-400 transition-all hover:shadow-2xl group flex flex-col justify-between h-full animate-fade-in-up'
                      >
                        <div>
                          <div className='flex justify-between items-center mb-6'>
                            <div
                              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                act.status === 'Upcoming'
                                  ? 'bg-blue-100 text-blue-700'
                                  : act.status === 'Ongoing'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {act.status}
                            </div>
                            <Activity
                              size={20}
                              className='text-gray-200 group-hover:text-primary-400 transition-colors'
                            />
                          </div>
                          <h4 className='text-xl font-black text-gray-900 mb-4'>
                            {act.title}
                          </h4>
                          <p className='text-gray-500 text-sm mb-8 leading-relaxed line-clamp-3'>
                            {act.description}
                          </p>
                        </div>
                        <div className='space-y-4 border-t border-gray-100 pt-6'>
                          <div className='grid grid-cols-2 gap-4'>
                            <div className='flex items-center gap-2 text-xs font-bold text-gray-400'>
                              <Calendar
                                size={14}
                                className='text-primary-500'
                              />{' '}
                              {act.date}
                            </div>
                            <div className='flex items-center gap-2 text-xs font-bold text-gray-400'>
                              <Clock size={14} className='text-primary-500' />{' '}
                              {act.time}
                            </div>
                          </div>
                          <div className='flex items-center gap-2 text-xs font-bold text-gray-400'>
                            <MapPin size={14} className='text-primary-500' />{' '}
                            {act.location}
                          </div>
                        </div>
                      </div>
                    ))}
                    {activities.length === 0 && (
                      <div className='col-span-full py-24 text-center border-2 border-dashed border-gray-200 rounded-[3rem] bg-gray-50'>
                        <Calendar
                          size={64}
                          className='mx-auto text-gray-200 mb-4'
                        />
                        <h4 className='text-xl font-black text-gray-400'>
                          {t.noActivities}
                        </h4>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SectionPage;
