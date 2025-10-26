
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import type { User, Group, ActivePlan } from '../types';
import { CloseIcon, PaperAirplaneIcon, SparklesIcon, LocationMarkerIcon } from './IconComponents';

const API_KEY = process.env.API_KEY;

interface ChatbotProps {
  onClose: () => void;
  currentUser: User;
  groups: Group[];
  activePlan: ActivePlan | null;
}

interface Message {
  sender: 'user' | 'ai' | 'system';
  text: string;
}

const prewrittenQueries = [
  "Suggest a chill café near us for tonight.",
  "We want an adventurous plan this Sunday under ₹5000 per person.",
  "Recommend a movie + dinner combo plan for 4 friends."
];


const Chatbot: React.FC<ChatbotProps> = ({ onClose, currentUser, groups, activePlan }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLocationShared, setIsLocationShared] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const generateSystemPrompt = useCallback((currentLocation: { lat: number; lng: number } | null) => {
    let context = `You are "PlanBuddy Genie", a friendly and helpful AI assistant for the PlanBuddy app. Your goal is to provide concise and useful information about outing plans.
    The current user is ${currentUser.name}.
    Here are the user's groups:
    ${groups.map(g => `- ${g.name}: members are ${g.members.map(m => m.name).join(', ')}`).join('\n')}
    `;

    if (activePlan) {
      context += `\nThere is an active plan being considered:
      - Theme: ${activePlan.theme}
      - For Group: ${activePlan.group.name}
      - Date: ${activePlan.date}
      - Suggestions: ${activePlan.suggestions.map(s => `${s.name} at ${s.location} (Budget: ₹${s.budgetINR})`).join(', ')}.
      
      You can answer questions about distances to these places for different group members, details about the places, budget, etc. You have access to the member's locations for distance calculation.`;
    } else {
      context += "\nThere is no active plan right now. You can help the user brainstorm ideas or answer general questions about their groups.";
    }

    if (currentLocation) {
        context += `\nThe user is currently sharing their live location: latitude ${currentLocation.lat}, longitude ${currentLocation.lng}. Prioritize this for real-time, location-specific questions like "what's nearby?".`;
    }

    context += "\nDo not make up information you don't have. Be conversational and friendly.";
    return context;
  }, [currentUser, groups, activePlan]);


  useEffect(() => {
    if (!API_KEY) {
        console.warn("API_KEY not set. Chatbot is in mock mode.");
        if (messages.length === 0) {
            setMessages([
                { sender: 'ai', text: `Hi ${currentUser.name}! I'm the PlanBuddy Genie. How can I help you plan your next adventure?` }
            ]);
        }
        return;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const systemInstruction = generateSystemPrompt(location);

    const chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
    });

    setChat(chatSession);
    
    if (messages.length === 0) {
        setMessages([
            { sender: 'ai', text: `Hi ${currentUser.name}! I'm the PlanBuddy Genie. How can I help you plan your next adventure?` }
        ]);
    }

  }, [currentUser.name, generateSystemPrompt, location]);

  const handleToggleLocation = () => {
    if (isLocationShared) {
      setIsLocationShared(false);
      setLocation(null);
      setMessages(prev => [...prev, { sender: 'system', text: 'Location sharing disabled.' }]);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setIsLocationShared(true);
          setMessages(prev => [...prev, { sender: 'system', text: 'Location sharing enabled! I can now provide more accurate, real-time answers.' }]);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setMessages(prev => [...prev, { sender: 'system', text: 'Could not access your location. Please check your browser permissions.' }]);
        }
      );
    }
  };
  
  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = { sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chat) {
        // Mock response if API is not available
        setTimeout(() => {
            const aiResponse: Message = { sender: 'ai', text: "I'm in mock mode! I'd love to help, but my brain is offline." };
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }, 1000);
        return;
      }
      
      const response = await chat.sendMessage({ message: messageText });
      const aiResponse: Message = { sender: 'ai', text: response.text };
      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = { sender: 'ai', text: "Oops! Something went wrong. I'm having a little trouble thinking right now." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full max-w-lg h-[80vh] flex flex-col shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
          <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
            <SparklesIcon /> PlanBuddy Genie
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleToggleLocation} 
              className={`transition-colors p-1 rounded-full ${isLocationShared ? 'text-cyan-400 bg-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
              title={isLocationShared ? 'Stop sharing location' : 'Share current location'}
            >
              <LocationMarkerIcon />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => {
            if (msg.sender === 'system') {
              return (
                <div key={index} className="text-center text-xs text-slate-400 py-2">
                  <p>{msg.text}</p>
                </div>
              );
            }
            return (
              <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shrink-0"><SparklesIcon /></div>}
                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-cyan-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'}`}>
                  <p className="text-white text-sm">{msg.text}</p>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shrink-0"><SparklesIcon /></div>
              <div className="max-w-xs p-3 rounded-2xl bg-slate-700 rounded-bl-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            </div>
          )}

          {!isLoading && messages.filter(m => m.sender === 'user').length === 0 && (
            <div className="pt-4 space-y-2 animate-fade-in-prompts">
              <p className="text-xs text-center text-slate-400 font-medium">Try asking the Genie...</p>
              <div className="flex flex-col gap-2">
                {prewrittenQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(query)}
                    className="text-sm text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 p-3 rounded-lg transition-all hover:border-purple-500"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700 shrink-0">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Ask about places, distances, etc..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-4 pr-12 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon />
            </button>
          </div>
        </div>
      </div>
       <style>{`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(-25%);
              animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
            }
            50% {
              transform: translateY(0);
              animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
            }
          }
          .delay-150 { animation-delay: 0.15s; }
          .delay-300 { animation-delay: 0.3s; }

          @keyframes fade-in-prompts {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-prompts { animation: fade-in-prompts 0.5s ease-out forwards; }
       `}</style>
    </div>
  );
};

export default Chatbot;