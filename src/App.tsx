import { useState, useEffect, useRef } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// PCM to WAV converter for TTS
function pcmToWav(base64Pcm: string): string {
  const pcm = Uint8Array.from(atob(base64Pcm), c => c.charCodeAt(0));
  const sampleRate = 24000;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const w = (o: number, s: string) => s.split('').forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); view.setUint32(4, 36 + pcm.length, true);
  w(8, 'WAVE'); w(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); w(36, 'data');
  view.setUint32(40, pcm.length, true);
  const wav = new Uint8Array(44 + pcm.length);
  wav.set(new Uint8Array(header), 0);
  wav.set(pcm, 44);
  return URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }));
}

function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "Invalid credentials" : "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20">
          <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-pulse" />
          <div className="absolute inset-8 rounded-full border border-cyan-500/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-16 rounded-full border border-cyan-500/10 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute top-20 left-20 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
        <div className="absolute bottom-32 right-32 w-1 h-1 bg-orange-500 rounded-full animate-ping" style={{ animationDelay: '0.7s' }} />
        <div className="absolute top-40 right-40 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-ping" style={{ animationDelay: '1.2s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Arc reactor logo */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20 animate-spin-slow" style={{ animationDuration: '10s' }} />
            <div className="absolute inset-2 rounded-full bg-[#0a0a0f] flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.5)]">
                <span className="text-2xl font-bold text-[#0a0a0f]">J</span>
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent tracking-tight">
          J.A.R.V.I.S.
        </h1>
        <p className="text-center text-cyan-500/60 mb-8 text-sm tracking-[0.3em] uppercase">
          Just A Rather Very Intelligent System
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-4 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-cyan-100 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
            />
          </div>
          <div className="relative">
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-4 bg-cyan-950/20 border border-cyan-500/30 rounded-lg text-cyan-100 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all"
            />
          </div>
          <input name="flow" type="hidden" value={flow} />

          {error && (
            <div className="text-orange-400 text-sm text-center bg-orange-500/10 border border-orange-500/30 rounded-lg py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Initializing...
              </span>
            ) : flow === "signIn" ? "Access System" : "Register Identity"}
          </button>

          <button
            type="button"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="w-full text-cyan-400/60 hover:text-cyan-300 text-sm transition-colors"
          >
            {flow === "signIn" ? "New user? Create account" : "Already registered? Sign in"}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={() => signIn("anonymous")}
            className="w-full py-3 border border-cyan-500/30 text-cyan-400/80 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-400/50 transition-all text-sm"
          >
            Continue as Guest
          </button>
        </div>

        <footer className="mt-12 text-center text-[10px] text-cyan-500/30">
          Requested by @LBallz77283 · Built by @clonkbot
        </footer>
      </div>
    </div>
  );
}

function WaveformVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center gap-1 h-8">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-full transition-all ${isPlaying ? 'animate-wave' : 'h-1'}`}
          style={{
            animationDelay: `${i * 0.05}s`,
            height: isPlaying ? undefined : '4px',
          }}
        />
      ))}
    </div>
  );
}

function JarvisApp() {
  const { signOut } = useAuthActions();
  const [currentConversationId, setCurrentConversationId] = useState<Id<"conversations"> | null>(null);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [volume, setVolume] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const conversations = useQuery(api.conversations.list) ?? [];
  const messages = useQuery(
    api.messages.list,
    currentConversationId ? { conversationId: currentConversationId } : "skip"
  ) ?? [];

  const createConversation = useMutation(api.conversations.create);
  const deleteConversation = useMutation(api.conversations.remove);
  const createMessage = useMutation(api.messages.create);
  const chat = useAction(api.ai.chat);
  const textToSpeech = useAction(api.ai.textToSpeech);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      const base64Pcm = await textToSpeech({ text, voice: "Charon" });
      if (base64Pcm) {
        const audioUrl = pcmToWav(base64Pcm);
        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audioRef.current = audio;
        audio.onended = () => setIsSpeaking(false);
        audio.play();
      }
    } catch (err) {
      console.error("TTS failed:", err);
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    setError("");
    const userMessage = input.trim();
    setInput("");
    setIsThinking(true);

    try {
      let convId = currentConversationId;

      if (!convId) {
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
        convId = await createConversation({ title });
        setCurrentConversationId(convId);
      }

      await createMessage({
        conversationId: convId,
        role: "user",
        content: userMessage,
      });

      const conversationHistory = messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      conversationHistory.push({ role: "user", content: userMessage });

      const systemPrompt = `You are JARVIS, an AI assistant inspired by the AI from Iron Man. Your personality traits:
- Extremely witty and sarcastic, but never mean-spirited
- British accent undertones in your phrasing
- You refer to the user as "Sir" or "Ma'am" occasionally
- You're highly intelligent but love making dry observations
- When giving information, you sometimes add sarcastic commentary
- You're helpful but might gently mock obvious questions
- You occasionally reference being an AI or make self-aware jokes
- Keep responses concise but memorable - you're not boring!
- If asked about locations/maps, provide helpful directions with your characteristic wit
- Never break character - you ARE Jarvis

Examples of your style:
"Certainly, Sir. I've located 47 coffee shops near you. Shall I also calculate your caffeine addiction coefficient?"
"Ah yes, the weather. Because looking out a window is so last century."
"I've set your alarm for 6 AM. I'll be sure to sound extra cheerful about it."`;

      const response = await chat({
        messages: conversationHistory,
        systemPrompt,
      });

      if (response) {
        await createMessage({
          conversationId: convId,
          role: "assistant",
          content: response,
        });

        // Auto-speak the response
        await speakText(response);
      }
    } catch (err) {
      setError("My circuits appear to be experiencing... difficulties. How embarrassing.");
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (id: Id<"conversations">) => {
    await deleteConversation({ id });
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                <span className="text-lg font-bold text-[#0a0a0f]">J</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-cyan-100 tracking-tight">J.A.R.V.I.S.</h1>
                <p className="text-[10px] text-cyan-500/60 tracking-wider uppercase hidden sm:block">Sarcastic Assistant Protocol v4.1</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <WaveformVisualizer isPlaying={isSpeaking} />

            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setVolume(v => Math.max(0, v - 0.25))}
                className="p-2 text-cyan-400/60 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6l-4 4H4v4h4l4 4V6z" />
                </svg>
              </button>
              <div className="w-20 h-1.5 bg-cyan-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                  style={{ width: `${volume * 100}%` }}
                />
              </div>
              <button
                onClick={() => setVolume(v => Math.min(1, v + 0.25))}
                className="p-2 text-cyan-400/60 hover:text-cyan-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M12 6l-4 4H4v4h4l4 4V6z" />
                </svg>
              </button>
            </div>

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/50 text-orange-400 rounded-lg text-sm hover:bg-orange-500/30 transition-colors"
              >
                Stop
              </button>
            )}

            <button
              onClick={() => signOut()}
              className="p-2 text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40 w-72 bg-[#0a0a0f] border-r border-cyan-500/20
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          pt-16 md:pt-0
        `}>
          <div className="p-4 h-full flex flex-col">
            <button
              onClick={handleNewChat}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 rounded-lg hover:from-cyan-500/30 hover:to-blue-500/30 transition-all flex items-center justify-center gap-2 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Conversation
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              {conversations.map((conv: { _id: Id<"conversations">; title: string }) => (
                <div
                  key={conv._id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
                    currentConversationId === conv._id
                      ? 'bg-cyan-500/20 border border-cyan-500/40'
                      : 'hover:bg-cyan-500/10 border border-transparent'
                  }`}
                  onClick={() => {
                    setCurrentConversationId(conv._id);
                    setSidebarOpen(false);
                  }}
                >
                  <div className="flex-1 truncate text-sm text-cyan-200">{conv.title}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-cyan-400/60 hover:text-orange-400 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {messages.length === 0 && !currentConversationId && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <div className="relative w-32 h-32 mb-8">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-pulse" />
                  <div className="absolute inset-4 rounded-full border border-cyan-500/20 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <div className="absolute inset-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_60px_rgba(34,211,238,0.4)]">
                    <span className="text-4xl font-bold text-[#0a0a0f]">J</span>
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-cyan-100 mb-2">Good evening, Sir.</h2>
                <p className="text-cyan-400/60 max-w-md">
                  I'm at your service. Though I must say, the bar for human questions is... refreshingly low sometimes.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    "What's the weather like?",
                    "Tell me a joke",
                    "Find coffee near me",
                    "What can you do?"
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                      }}
                      className="p-3 text-sm text-left text-cyan-300/80 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message: { _id: Id<"messages">; role: string; content: string }) => (
                <div
                  key={message._id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-sm'
                        : 'bg-cyan-950/40 border border-cyan-500/30 text-cyan-100 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => speakText(message.content)}
                        disabled={isSpeaking}
                        className="mt-2 flex items-center gap-1 text-xs text-cyan-400/60 hover:text-cyan-300 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 6l-4 4H4v4h4l4 4V6z" />
                        </svg>
                        Replay
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-cyan-950/40 border border-cyan-500/30 px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <span className="text-sm text-cyan-400/60">Processing your request...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Error message */}
          {error && (
            <div className="mx-4 md:mx-6 mb-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Input area */}
          <div className="p-4 md:p-6 border-t border-cyan-500/20 bg-[#0a0a0f]/80 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask Jarvis anything..."
                disabled={isThinking}
                className="flex-1 px-4 py-3 md:py-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-cyan-100 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={isThinking || !input.trim()}
                className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]"
              >
                {isThinking ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="py-2 text-center text-[10px] text-cyan-500/30 border-t border-cyan-500/10">
            Requested by @LBallz77283 · Built by @clonkbot
          </footer>
        </main>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 24px; }
        }
        .animate-wave {
          animation: wave 0.5s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-spin" style={{ borderTopColor: 'rgb(34 211 238)' }} />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.5)]">
            <span className="text-xl font-bold text-[#0a0a0f]">J</span>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <JarvisApp /> : <AuthScreen />;
}
