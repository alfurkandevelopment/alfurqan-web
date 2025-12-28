import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, Upload, X } from 'lucide-react';

interface AvatarSelectorProps {
  currentAvatar: string;
  onAvatarChange: (url: string) => void;
  name: string;
  className?: string;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ currentAvatar, onAvatarChange, name, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAvatarChange(reader.result as string);
        setIsOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    onAvatarChange(url);
    setIsOpen(false); 
  };

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Display */}
      <div 
        className="relative group cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 relative z-10 transition-transform group-hover:scale-105">
          <img 
            src={currentAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-1 right-1 z-20 bg-white rounded-full p-2 shadow-md text-gray-600 hover:text-primary-600 transition-colors">
            <Camera size={18} />
        </div>
      </div>

      {/* Modal for Options */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100 animate-bounce-in">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">تغيير الصورة الشخصية</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-center mb-4">
                 <img 
                    src={currentAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`} 
                    alt="Preview" 
                    className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-inner bg-gray-50"
                  />
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-colors text-gray-700 font-medium group"
              >
                <div className="p-2 bg-blue-100 rounded-full text-blue-600 group-hover:bg-blue-200 transition-colors">
                    <Upload size={18} />
                </div>
                <span>رفع صورة من الجهاز</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />

              <button 
                onClick={generateAvatar}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-colors text-gray-700 font-medium group"
              >
                <div className="p-2 bg-purple-100 rounded-full text-purple-600 group-hover:bg-purple-200 transition-colors">
                    <RefreshCw size={18} />
                </div>
                <span>توليد صورة عشوائية (AI)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;