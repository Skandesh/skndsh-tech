import React, { useState, useRef, useEffect } from 'react';
import { generateAIResponse } from '../services/geminiService';
import { Terminal, X, Send, Cpu, Mic, MicOff } from 'lucide-react';
import { ChatMessage } from '../types';

const ChatInterface = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([
    { role: 'model', text: 'AETHER SYSTEM ONLINE. AWAITING INPUT.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isOpen]);

  // Voice Recognition Logic
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice module not compatible with this browser kernel.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setHistory(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare history for API
    const apiHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
    }));

    const responseText = await generateAIResponse(userMsg.text, apiHistory);

    setHistory(prev => [...prev, { role: 'model', text: responseText }]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Trigger */}
      <button 
        onClick={toggleChat}
        className={`fixed bottom-8 right-8 z-50 p-3 rounded-none border border-gray-700 bg-black/80 text-white hover:bg-white hover:text-black transition-all duration-300 backdrop-blur-sm ${isOpen ? 'hidden' : 'flex'} items-center gap-2 group`}
      >
        <Cpu className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-mono tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute right-12 whitespace-nowrap">
            INITIALIZE UPLINK
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 z-50 w-80 md:w-96 h-[400px] bg-black border border-gray-800 flex flex-col shadow-2xl shadow-gray-900/50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-950">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-500" />
              <span className="text-xs font-mono text-gray-400 tracking-widest">AETHER.EXE</span>
            </div>
            <button onClick={toggleChat} className="text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs custom-scrollbar">
            {history.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-2 border ${msg.role === 'user' ? 'border-gray-600 text-white bg-gray-900' : 'border-green-900/50 text-green-400 bg-green-950/10'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="text-green-500 animate-pulse">PROCESSING...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-800 flex gap-2 bg-black items-center">
            <button 
                type="button" 
                onClick={startListening}
                className={`text-gray-500 hover:text-white transition-colors ${isListening ? 'text-red-500 animate-pulse' : ''}`}
                title="Voice Input"
            >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "LISTENING..." : "QUERY SYSTEM..."}
              className="flex-1 bg-transparent text-white text-xs font-mono focus:outline-none placeholder-gray-700"
              autoFocus
            />
            <button type="submit" disabled={loading} className="text-gray-500 hover:text-white disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatInterface;