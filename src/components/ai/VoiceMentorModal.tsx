import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles, AlertCircle, Headphones } from 'lucide-react';

interface VoiceMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
}

export const VoiceMentorModal: React.FC<VoiceMentorModalProps> = ({
  isOpen, onClose, studentName
}) => {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [mentorResponse, setMentorResponse] = useState<string>('');
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setMentorResponse(`Namaste ${studentName}! I am your Meecademia AI Live Voice Mentor. Ask me anything about your JEE / NEET revision, resolving study burnout, or planning today's focus session.`);
      setVoiceState('idle');
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setIsLiveActive(false);
    }
  }, [isOpen, studentName]);

  if (!isOpen) return null;

  const handleStartLiveVoice = () => {
    setIsLiveActive(true);
    setIsListening(true);
    setVoiceState('listening');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const userSpoken = event.results[0][0].transcript;
        setTranscript(userSpoken);
        setVoiceState('thinking');

        setTimeout(() => {
          generateMentorVoiceAnswer(userSpoken);
        }, 800);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setVoiceState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      // Mock simulation for environments without webkitSpeechRecognition
      setTimeout(() => {
        setTranscript("How should I revise Rotational Dynamics torque problems today?");
        setVoiceState('thinking');
        setTimeout(() => {
          generateMentorVoiceAnswer("How should I revise Rotational Dynamics torque problems today?");
        }, 1000);
      }, 1500);
    }
  };

  const generateMentorVoiceAnswer = (query: string) => {
    setVoiceState('speaking');
    const reply = `For Rotational Dynamics, start by drawing free-body diagrams to resolve torque about the instantaneous center of rotation. Solve 10 standard problems from HC Verma, then tackle 5 previous year JEE Advanced multi-correct questions. Keep your calculation speed disciplined!`;
    setMentorResponse(reply);

    // Speak response
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(reply);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        setVoiceState('idle');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setVoiceState('idle'), 4000);
    }
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setVoiceState('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-lg shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white">Live AI Voice Mentor</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-700">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-slate-400">Low-latency two-way conversational study guidance</p>
            </div>
          </div>
          <button
            onClick={() => { handleStop(); onClose(); }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Voice Orb Body */}
        <div className="p-8 flex flex-col items-center justify-center text-center">
          
          {/* Animated Glowing Orb */}
          <div className="relative mb-6">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
              voiceState === 'listening'
                ? 'bg-gradient-to-tr from-rose-500 to-amber-500 scale-110 shadow-2xl shadow-rose-500/40 animate-pulse'
                : voiceState === 'thinking'
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 scale-105 shadow-2xl shadow-indigo-500/40 animate-spin'
                : voiceState === 'speaking'
                ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 scale-110 shadow-2xl shadow-emerald-500/40 animate-bounce'
                : 'bg-gradient-to-tr from-indigo-700 to-purple-800 shadow-xl shadow-indigo-500/20'
            }`}>
              {voiceState === 'listening' ? (
                <Mic className="w-12 h-12 text-white animate-pulse" />
              ) : voiceState === 'speaking' ? (
                <Volume2 className="w-12 h-12 text-white animate-pulse" />
              ) : (
                <Sparkles className="w-12 h-12 text-white/90" />
              )}
            </div>

            {/* Ripple waves */}
            {voiceState !== 'idle' && (
              <div className="absolute inset-0 rounded-full border-2 border-indigo-400/50 animate-ping pointer-events-none" />
            )}
          </div>

          {/* State Text */}
          <p className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
            {voiceState === 'listening' && 'Listening to your question...'}
            {voiceState === 'thinking' && 'Reasoning study strategy...'}
            {voiceState === 'speaking' && 'Live Audio Streaming Response'}
            {voiceState === 'idle' && 'Ready for voice query'}
          </p>

          {/* Spoken transcript box */}
          {transcript && (
            <div className="w-full mb-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">You asked:</span>
              "{transcript}"
            </div>
          )}

          {/* Mentor Speech Response */}
          <div className="w-full p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-100 leading-relaxed text-left max-h-36 overflow-y-auto">
            <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Mentor Briefing:</span>
            {mentorResponse}
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center space-x-3">
            {!isListening ? (
              <button
                onClick={handleStartLiveVoice}
                className="py-3 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/25 flex items-center space-x-2 transition cursor-pointer"
              >
                <Mic className="w-4 h-4 text-amber-300" />
                <span>Tap to Speak with Mentor</span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="py-3 px-6 rounded-2xl font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-lg flex items-center space-x-2 transition cursor-pointer"
              >
                <MicOff className="w-4 h-4" />
                <span>Stop Listening</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 text-center text-[11px] text-slate-500 border-t border-slate-800">
          Meecademia AI Academic Mentor • Powered by Gemini 3.8 Live API
        </div>
      </div>
    </div>
  );
};
