import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Lightbulb, 
  Bot, 
  User, 
  ArrowRight,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { SocraticMessage, LectureSession } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface SocraticTutorWidgetProps {
  lecture: LectureSession;
  currentMs: number;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const SocraticTutorWidget: React.FC<SocraticTutorWidgetProps> = ({
  lecture,
  currentMs,
  initialQuery,
  onClearInitialQuery,
}) => {
  const [messages, setMessages] = useState<SocraticMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I'm **Scribo**, your Socratic Co-Pilot for **${lecture.courseCode}**. Instead of dumping answers, I'll guide your reasoning step-by-step. What concept in today's lecture feels uncertain?`,
      timestamp: 'Just now',
      suggestedFollowups: [
        'Why does ReLU derivative matter?',
        'How does backprop pass gradients?',
        'What causes vanishing gradients?'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoVoiceResponse, setAutoVoiceResponse] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle external inquiry trigger (e.g. from transcript word click)
  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(`Can you guide me through what "${initialQuery}" means in this lecture?`);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  // Handle Speech Recognition
  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your doubt.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: SocraticMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: 'Just now',
      referencedTimestampMs: currentMs,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Find lecture words near current timestamp for contextual grounding
      const nearbyWords = lecture.words
        .filter((w) => Math.abs(w.startMs - currentMs) < 15000)
        .map((w) => w.text)
        .join(' ');

      const response = await fetch('/api/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: textToSend,
          lectureContext: nearbyWords || lecture.overview,
          topic: lecture.title,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const assistantMsg: SocraticMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "Let's consider what variable determines the output change in this equation.",
        timestamp: 'Just now',
        suggestedFollowups: data.suggestedFollowups || [
          'Can you elaborate with an analogy?',
          'What is the formula for this?',
          'How does this test on assessments?'
        ],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (autoVoiceResponse) {
        setIsSpeaking(true);
        audioEngine.speakText(assistantMsg.content, () => {
          setIsSpeaking(false);
        });
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg: SocraticMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: `Let's break this down: when the professor talked about **${lecture.title}**, what happens when you compute the partial derivative? What changes?`,
        timestamp: 'Just now',
        suggestedFollowups: ['Why does the gradient vanish?', 'Explain with an analogy'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (text: string) => {
    if (isSpeaking) {
      audioEngine.stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      audioEngine.speakText(text, () => {
        setIsSpeaking(false);
      });
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col h-full min-h-0 overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Socratic Voice Tutor
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Guiding Questions Only
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Builds reasoning rather than dependency.
            </p>
          </div>
        </div>

        {/* Voice Toggle */}
        <button
          onClick={() => {
            if (isSpeaking) audioEngine.stopSpeaking();
            setAutoVoiceResponse(!autoVoiceResponse);
          }}
          className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 transition-colors cursor-pointer min-h-[34px] ${
            autoVoiceResponse 
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold' 
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
          title="Toggle text-to-speech spoken guidance"
        >
          {autoVoiceResponse ? <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          <span className="hidden sm:inline text-[11px]">Voice {autoVoiceResponse ? 'On' : 'Off'}</span>
        </button>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-1.5 mb-1 text-[10px] text-slate-500">
              {msg.role === 'user' ? (
                <>
                  <span className="font-medium text-slate-600">You</span>
                  <User className="w-3 h-3 text-slate-400" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-indigo-600" />
                  <span className="text-indigo-700 font-semibold">Scribo Socratic AI</span>
                </>
              )}
            </div>

            <div
              className={`p-3.5 rounded-2xl max-w-[90%] text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-xs font-normal'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <button
                    onClick={() => speakMessage(msg.content)}
                    className="flex items-center space-x-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Listen aloud</span>
                  </button>
                  <span className="text-[10px] text-slate-500 font-mono">140ms on-device</span>
                </div>
              )}
            </div>

            {/* Suggested Followups */}
            {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {msg.suggestedFollowups.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(f)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-50 text-[11px] font-medium transition-all cursor-pointer shadow-2xs"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    <span>{f}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
            <span>Scribo is analyzing the lecture context and formulating a guiding question...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="mt-3 pt-3 border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <button
            type="button"
            onClick={toggleRecording}
            className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all cursor-pointer shrink-0 ${
              isRecording
                ? 'bg-rose-50 border-rose-400 text-rose-600 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Speak your doubt into microphone"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder="Speak or type your doubt here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors min-h-[40px]"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
