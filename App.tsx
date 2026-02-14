
import React, { useState, useRef, useEffect } from 'react';
import { Message, Category, Sender } from './types';
import { chatWithFyonka } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "أهلاً بيكي يا قمر في فيونكة! 🎀 أنا خبيرة الجمال بتاعتك.. قوليلي حابة تسألي عن إيه النهاردة؟ إكسسوارات، مكياج، ولا عناية بالبشرة؟ ✨",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.General);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !selectedImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    const currentImg = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    const botReply = await chatWithFyonka(inputValue, selectedCategory, currentImg || undefined);
    
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: botReply,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex justify-center min-h-screen items-center bg-[#fff5f7]">
      <div className="w-full max-w-[480px] bg-white h-screen md:h-[92vh] shadow-2xl md:rounded-[2.5rem] flex flex-col overflow-hidden border-8 border-white">
        
        {/* Header */}
        <header className="bg-gradient-to-br from-[#FF9AA2] via-[#FFB7B2] to-[#FFDAC1] p-6 text-white shadow-sm flex items-center justify-between relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-pink-200/20 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 bg-white/95 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-pink-100 rotate-3 transform transition-transform hover:rotate-0">
                🎀
                </div>
                <div>
                <h1 className="font-bold text-xl tracking-tight text-pink-900/80">فيونكة - Fyonka</h1>
                <p className="text-[11px] font-semibold text-pink-800/60 flex items-center gap-1.5 mt-0.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    خبيرة التجميل متصلة
                </p>
                </div>
            </div>
            <button className="bg-white/30 backdrop-blur-md p-2.5 rounded-xl hover:bg-white/50 transition-all shadow-sm">
                <svg width="20" height="20" className="text-pink-900/60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
        </header>

        {/* Category Selector */}
        <div className="bg-[#fff9fa] px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-pink-50">
          {[
            { id: Category.General, label: 'الكل', icon: '✨' },
            { id: Category.Accessories, label: 'إكسسوارات', icon: '💍' },
            { id: Category.Makeup, label: 'مكياج', icon: '💄' },
            { id: Category.Skincare, label: 'بشرة', icon: '🧴' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                selectedCategory === cat.id 
                  ? 'bg-gradient-to-r from-[#FF9AA2] to-[#FFB7B2] text-white border-transparent' 
                  : 'bg-white text-pink-700/70 border-pink-100/50 hover:bg-pink-50'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 chat-scroll bg-[#fffcfd]">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {msg.image && (
                <div className="mb-2 rounded-2xl overflow-hidden shadow-sm max-w-[220px] border-4 border-white ring-1 ring-pink-100">
                  <img src={msg.image} alt="Uploaded" className="w-full h-auto object-cover" />
                </div>
              )}
              <div 
                className={`max-w-[88%] p-4 rounded-2xl text-sm leading-relaxed shadow-[0_2px_15px_-3px_rgba(255,182,193,0.2)] transition-all animate-in fade-in slide-in-from-bottom-3 duration-500 ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] text-white rounded-br-none' 
                    : 'bg-white text-gray-700 rounded-bl-none border border-pink-50'
                }`}
              >
                {msg.text}
                <div className={`text-[10px] mt-2 font-medium opacity-70 ${msg.sender === 'user' ? 'text-left' : 'text-right'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex flex-col items-start">
              <div className="bg-white border border-pink-50 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-pink-300 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="px-5 py-3 bg-pink-50/50 flex items-center gap-3 animate-in slide-in-from-bottom-4 border-t border-pink-100/30">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-white shadow-md">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1 -right-1 bg-rose-400 text-white p-1 rounded-full shadow-sm hover:bg-rose-500 transition-colors"
              >
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <p className="text-[11px] text-pink-600 font-bold italic">فيونكة جاهزة تحلل صورتك ✨</p>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-5 bg-white border-t border-pink-50 flex items-center gap-3">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-2xl text-pink-400 hover:bg-pink-50 hover:text-pink-500 transition-all border border-pink-100/50 shadow-sm group"
          >
            <svg width="20" height="20" className="group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="اسألي فيونكة عن جمالك..."
            className="flex-1 bg-pink-50/30 border border-pink-100/50 rounded-2xl px-5 py-3 outline-none text-sm focus:border-pink-300 focus:bg-white transition-all text-gray-700 placeholder-pink-300 font-medium"
          />

          <button
            onClick={handleSendMessage}
            disabled={(!inputValue.trim() && !selectedImage) || isLoading}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF9AA2] to-[#FFB7B2] text-white flex items-center justify-center shadow-lg hover:shadow-pink-200/50 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none group"
          >
            <svg style={{transform: 'rotate(180deg)'}} width="20" height="20" className="group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
