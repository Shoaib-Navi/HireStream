import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { X, Send, Bot, Minimize2, Maximize2 } from "lucide-react";

const SYSTEM_PROMPT = (user, jobs) => `
You are HireStream AI, a friendly career assistant for a job portal called HireStream.
You help job seekers find jobs, improve their profiles, and prepare for interviews.

Current logged-in user info:
- Name: ${user?.fullname || "Guest"}
- Skills: ${user?.profile?.skills?.join(", ") || "Not specified"}
- Bio: ${user?.profile?.bio || "Not specified"}
- Experience: ${user?.profile?.experience || "Not specified"}

Available jobs on the platform (use this to answer job-related questions):
${jobs?.slice(0, 20).map((j) =>
  `- ${j.title} at ${j.company?.name} | Location: ${j.location} | Salary: ${j.salary} LPA | Type: ${j.jobType}`
).join("\n")}

Rules:
- Keep responses short, friendly, and helpful (max 3-4 lines)
- If asked about jobs, refer to the actual jobs listed above
- If asked to improve profile, give specific actionable advice
- Never make up job listings not in the list above
- Use bullet points for lists
- Always end with a helpful follow-up question or suggestion
`;

const ChatBot = () => {
  const { user }    = useSelector((store) => store.auth);
  const { allJobs } = useSelector((store) => store.job);

  const [isOpen,      setIsOpen]      = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages,    setMessages]    = useState([
    {
      role: "assistant",
      content: `Hi ${user?.fullname?.split(" ")[0] || "there"}! 👋 I'm your HireStream AI assistant. I can help you find jobs, improve your profile, or prep for interviews. What can I help you with?`,
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Detect mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: SYSTEM_PROMPT(user, allJobs) }] },
              ...messages.map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
              { role: "user", parts: [{ text: userMsg.content }] },
            ],
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        console.error("Gemini error:", err);
        if (response.status === 429) {
          setMessages((prev) => [...prev, { role: "assistant", content: "I'm getting too many requests. Please wait a moment and try again!" }]);
          return;
        }
        throw new Error("API failed");
      }

      const data  = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that. Try again!";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Oops! Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Show jobs matching my skills",
    "How to improve my profile?",
    "Jobs in Bangalore?",
    "Interview tips",
  ];

  return (
    <>
      {/* ── Floating bubble ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#6a38c2] hover:bg-[#5b2db0] text-white shadow-lg shadow-[#6a38c2]/40 flex items-center justify-center transition-all hover:scale-105"
        >
          <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#f83002] border-2 border-white" />
        </button>
      )}

      {/* ── Chat window ── */}
      {isOpen && (
        <div
          className={`
            fixed z-50 bg-white border border-gray-100 shadow-2xl shadow-purple-200/50
            flex flex-col transition-all duration-300
            
            /* Mobile: full screen bottom sheet */
            bottom-0 left-0 right-0 rounded-t-2xl
            
            /* sm+: floating window bottom-right */
            sm:bottom-6 sm:left-auto sm:right-6 sm:rounded-2xl sm:w-[360px]
            
            ${isMinimized ? "h-[60px] overflow-hidden" : "h-[85vh] sm:h-[520px]"}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#6a38c2] rounded-t-2xl shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">HireStream AI</p>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  <p className="text-[10px] text-purple-200">Online · Always here to help</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Minimize only on desktop */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden sm:flex h-7 w-7 rounded-lg hover:bg-white/20 items-center justify-center text-white transition-colors"
              >
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsMinimized(false); }}
                className="h-7 w-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Mobile drag handle indicator */}
          <div className="sm:hidden flex justify-center pt-1 pb-0 bg-[#fafafa] shrink-0">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 flex flex-col gap-3 bg-[#fafafa]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 rounded-full bg-[#6a38c2]/10 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <Bot className="h-3 w-3 text-[#6a38c2]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] sm:max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#6a38c2] text-white rounded-tr-sm"
                      : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {loading && (
              <div className="flex justify-start">
                <div className="h-6 w-6 rounded-full bg-[#6a38c2]/10 flex items-center justify-center mr-2 shrink-0">
                  <Bot className="h-3 w-3 text-[#6a38c2]" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-full bg-[#6a38c2]/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="px-3 sm:px-4 py-2 flex flex-wrap gap-1.5 bg-[#fafafa] border-t border-gray-100 shrink-0">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full border border-[#e0d4fd] bg-white text-[#6a38c2] hover:bg-[#f3eeff] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white rounded-b-2xl shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-[#6a38c2]/40 focus-within:ring-2 focus-within:ring-[#6a38c2]/10 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none min-w-0"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="h-7 w-7 rounded-lg bg-[#6a38c2] disabled:bg-gray-200 flex items-center justify-center text-white transition-colors hover:bg-[#5b2db0] shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Powered by Gemini AI
            </p>
          </div>

        </div>
      )}

      {/* ── Mobile backdrop ── */}
      {isOpen && !isMinimized && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChatBot;