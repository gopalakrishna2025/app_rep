import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, ChatStatus, GeoLocation, GroundingMetadata } from './types';
import { sendMessageStream, initializeChat, createLocationAwareSession } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import { GenerateContentResponse } from "@google/genai";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<ChatStatus>(ChatStatus.IDLE);
  const [location, setLocation] = useState<GeoLocation | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initial greeting and location fetch
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Default welcome message
    const welcomeMsg: Message = {
      id: 'welcome',
      role: 'model',
      text: "Hi there! I'm your Wanderlust travel companion. 🌍✈️\n\nI can help you find flights, hotels, interesting places to visit, and plan your perfect itinerary. Where are you dreaming of going?",
      timestamp: Date.now()
    };
    setMessages([welcomeMsg]);

    // Initialize chat
    initializeChat();

    // Ask for location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(loc);
          // Re-initialize session with location context
          createLocationAwareSession(loc);
          console.log("Location enabled:", loc);
        },
        (error) => {
          console.log("Location access denied or error:", error);
        }
      );
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || status === ChatStatus.STREAMING) return;

    const userText = inputValue.trim();
    setInputValue('');
    setStatus(ChatStatus.STREAMING);

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newUserMessage]);

    // Placeholder for model response
    const botMessageId = (Date.now() + 1).toString();
    const initialBotMessage: Message = {
      id: botMessageId,
      role: 'model',
      text: '',
      isStreaming: true,
      timestamp: Date.now() + 1
    };
    setMessages(prev => [...prev, initialBotMessage]);

    try {
      const stream = await sendMessageStream(userText, location);
      
      let fullText = '';
      let finalMetadata: GroundingMetadata | undefined = undefined;

      for await (const chunk of stream) {
        // Safe casting based on SDK usage
        const contentResponse = chunk as GenerateContentResponse;
        const textPart = contentResponse.text;
        
        if (textPart) {
          fullText += textPart;
        }

        // Check for grounding metadata in candidates
        // It usually arrives in the last chunks or accumulates, but we just take the latest non-null one
        const candidate = contentResponse.candidates?.[0];
        if (candidate?.groundingMetadata) {
            finalMetadata = candidate.groundingMetadata;
        }

        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, text: fullText, groundingMetadata: finalMetadata } 
              : msg
          )
        );
        scrollToBottom();
      }

      // Finish streaming
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );
      setStatus(ChatStatus.IDLE);

    } catch (error) {
      console.error(error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMessageId 
            ? { ...msg, text: "Sorry, I encountered a temporary glitch. Please try again!", isStreaming: false } 
            : msg
        )
      );
      setStatus(ChatStatus.ERROR);
    }
  }, [inputValue, location, status]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M18 3v11.25A2.25 2.25 0 0115.75 16.5h-2.25" opacity="0" /> {/* Hidden path for visual balance if needed, reused simplified icon */}
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Wanderlust AI</h1>
            <p className="text-xs text-slate-500 font-medium flex items-center">
              {location ? (
                <>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                    Using precise location
                </>
              ) : (
                <>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-1.5"></span>
                    Global mode
                </>
              )}
            </p>
          </div>
        </div>
        <button 
            onClick={() => {
                setMessages([]);
                initializeChat();
                const welcomeMsg: Message = {
                    id: Date.now().toString(),
                    role: 'model',
                    text: "Ready for a new adventure! Where to next?",
                    timestamp: Date.now()
                };
                setMessages([welcomeMsg]);
            }}
            className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
        >
            New Trip
        </button>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto w-full">
            {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
            ))}
            {/* Invisible padder for bottom scroll */}
            <div className="h-4"></div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-none bg-white p-4 border-t border-slate-200">
        <div className="max-w-3xl mx-auto w-full relative">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about flights, hotels, or hidden gems..."
            rows={1}
            className="w-full bg-slate-100 text-slate-900 placeholder-slate-500 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none shadow-inner"
            style={{ minHeight: '56px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || status === ChatStatus.STREAMING}
            className={`absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all duration-200
                ${!inputValue.trim() || status === ChatStatus.STREAMING 
                    ? 'bg-transparent text-slate-300' 
                    : 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95'
                }
            `}
          >
            {status === ChatStatus.STREAMING ? (
                 <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-[-45deg] translate-x-0.5 -translate-y-0.5">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            )}
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400">Powered by Gemini 2.5 • Information may be generated by AI</p>
        </div>
      </div>
    </div>
  );
}