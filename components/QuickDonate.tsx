
import React, { useState, useContext } from 'react';
import { Heart, X } from 'lucide-react';
import { LanguageContext } from '../App';
import { translations } from '../lib/translations';

const QuickDonate: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState<number | ''>('');

  const t = translations[lang].donate;
  const predefinedAmounts = [50, 100, 500, 1000];

  return (
    <>
      {/* Floating Button */}
      <div className={`fixed bottom-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-[100] transition-all duration-300 ${isOpen ? 'translate-y-20 opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-black py-4 px-6 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <Heart fill="currentColor" size={24} />
          <span>{t.quickTitle}</span>
        </button>
      </div>

      {/* Expanded Modal/Card */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Heart className="text-accent-500" fill="currentColor" />
                {t.quickTitle}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {t.desc}
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {predefinedAmounts.map((val) => (
                <button
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-2 px-1 rounded-lg border font-black text-sm transition-colors ${
                    amount === val 
                      ? 'bg-primary-50 border-primary-500 text-primary-700' 
                      : 'border-gray-200 text-gray-600 hover:border-primary-300'
                  }`}
                >
                  {val} $
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder={t.otherAmount}
                className={`block w-full ${lang === 'ar' ? 'pr-8 pl-4' : 'pl-8 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 font-bold`}
              />
            </div>

            <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4 rounded-xl shadow-md transition-colors">
              {t.confirm}
            </button>
            
            <div className="mt-4 flex justify-center gap-4 opacity-50 grayscale">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
               <span className="text-xs font-bold self-center">Iyzico</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickDonate;
