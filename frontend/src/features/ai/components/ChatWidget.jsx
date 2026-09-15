import { useEffect, useRef, useState } from "react";
import { MessageCircle, Minus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { useSendChatMessageMutation } from "../api";

const MAX_INPUT_LENGTH = 2000;
const MAX_HISTORY = 20;

const SUGGESTIONS = ["Show jobs matching my skills", "How can I improve my profile?", "Remote jobs?", "Interview tips"];

const greeting = (user) => ({
  role: "assistant",
  content: `Hi ${user?.fullName?.split(" ")[0] || "there"}! 👋 I'm the HireStream assistant. I can help you find jobs, improve your profile or prepare for interviews. What can I help with?`,
});

// Floating career assistant. The backend adds job and profile context and keeps the API key private.
const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [greeting(user)]);
  const [input, setInput] = useState("");
  const [sendChatMessage, { isLoading }] = useSendChatMessageMutation();
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || isLoading) return;

    const history = [...messages, { role: "user", content }];
    setMessages(history);
    setInput("");

    try {
      const reply = await sendChatMessage(history.slice(-MAX_HISTORY)).unwrap();
      setMessages((previous) => [...previous, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: getErrorMessage(error, "Oops! Something went wrong. Please try again."), isError: true },
      ]);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  if (!isOpen) {
    return (
      <Button
        size="icon-lg"
        onClick={() => setIsOpen(true)}
        aria-label="Open HireStream assistant"
        className="fixed right-4 bottom-4 z-40 size-13 rounded-full shadow-elevated sm:right-6 sm:bottom-6"
      >
        <MessageCircle className="size-6" />
      </Button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="HireStream assistant"
      className="fixed inset-x-0 bottom-0 z-50 flex h-[85vh] flex-col overflow-hidden rounded-t-2xl border bg-card shadow-elevated sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[34rem] sm:w-[23rem] sm:rounded-2xl"
    >
      <div className="flex items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/15">
            <MessageCircle className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">HireStream assistant</p>
            <p className="text-xs opacity-80">Replies may not always be accurate</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            onClick={() => setIsOpen(false)}
            aria-label="Minimize assistant"
          >
            <Minus />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
            onClick={() => {
              setIsOpen(false);
              setMessages([greeting(user)]);
            }}
            aria-label="Close assistant and clear the conversation"
          >
            <X />
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-surface p-4" aria-live="polite">
        {messages.map((message, index) => (
          <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "type-body max-w-[85%] rounded-2xl px-3.5 py-2 whitespace-pre-wrap",
                message.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : "rounded-bl-sm border bg-card text-foreground",
                message.isError && "border-destructive/30 text-destructive",
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start" role="status" aria-label="Assistant is typing">
            <div className="flex gap-1 rounded-2xl rounded-bl-sm border bg-card px-4 py-3">
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-1.5 animate-bounce rounded-full bg-foreground/50"
                  style={{ animationDelay: `${dot * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-1.5 border-t bg-surface px-4 py-2.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => send(suggestion)}
              className="type-caption rounded-full border bg-card px-2.5 py-1 text-foreground transition-colors hover:bg-accent"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <input
          id="chat-input"
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          maxLength={MAX_INPUT_LENGTH}
          placeholder="Ask me anything…"
          autoComplete="off"
          className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || isLoading} aria-label="Send message">
          <Send />
        </Button>
      </form>
    </div>
  );
};

export default ChatWidget;
