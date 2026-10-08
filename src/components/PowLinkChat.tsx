import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import mascot from "@/assets/powlink-chat-mascot.png.asset.json";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

const STORAGE_KEY = "powlink-chat-v2";
const CHAT_ID = "powlink-single-conversation";

function readSavedMessages(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) ? (saved as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function getErrorMessage(error: Error, ar: boolean) {
  const message = error.message.trim();
  if (message.includes("402")) {
    return ar
      ? "رصيد المساعد غير كافٍ حاليًا. يمكن لصاحب المشروع إضافة رصيد من الإعدادات."
      : "The assistant is out of credits. The project owner can add credits in settings.";
  }
  if (message.includes("429")) {
    return ar
      ? "المساعد مشغول حاليًا. انتظري قليلًا ثم حاولي مرة أخرى."
      : "The assistant is busy. Please wait a moment and try again.";
  }
  return message || (ar ? "تعذر الوصول إلى المساعد الآن." : "The assistant is unavailable right now.");
}

export function PowLinkChat() {
  const { lang } = useLang();
  const ar = lang === "ar";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initialMessages] = useState<UIMessage[]>(readSavedMessages);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);

  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    id: CHAT_ID,
    messages: initialMessages,
    transport,
    onFinish: ({ messages: completeMessages }) => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completeMessages));
    },
    onError: (chatError) => toast.error(getErrorMessage(chatError, ar)),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => textareaRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open, status]);

  useEffect(() => {
    if (status !== "ready" || messages.length === 0) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, status]);

  const clearConversation = useCallback(() => {
    if (busy) stop();
    setMessages([]);
    window.localStorage.removeItem(STORAGE_KEY);
    setInput("");
    window.setTimeout(() => textareaRef.current?.focus(), 0);
  }, [busy, setMessages, stop]);

  return (
    <div className="pow-chat" dir={ar ? "rtl" : "ltr"}>
      {open ? (
        <section className="pow-chat-panel" aria-label={ar ? "مساعد PowLink" : "PowLink assistant"}>
          <header className="pow-chat-header">
            <div className="pow-chat-agent">
              <img src={mascot.url} alt="" width={52} height={52} />
              <div>
                <strong>{ar ? "مساعد PowLink" : "PowLink Assistant"}</strong>
                <span><i />{ar ? "متاح للمساعدة" : "Ready to help"}</span>
              </div>
            </div>
            <div className="pow-chat-actions">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearConversation}
                aria-label={ar ? "مسح المحادثة" : "Clear conversation"}
                title={ar ? "مسح المحادثة" : "Clear conversation"}
              >
                <Trash2 />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label={ar ? "إغلاق المحادثة" : "Close chat"}
              >
                <X />
              </Button>
            </div>
          </header>

          <Conversation className="pow-chat-conversation">
            <ConversationContent className="pow-chat-messages">
              {messages.length === 0 && (
                <div className="pow-chat-welcome">
                  <img src={mascot.url} alt="" width={86} height={86} />
                  <h2>{ar ? "أهلًا! أنا مساعد PowLink" : "Hi! I’m the PowLink Assistant"}</h2>
                  <p>
                    {ar
                      ? "اسألني عن البلاغات، الكلاب المفقودة، التبنّي، أو ماذا تفعل لو وجدت كلبًا يحتاج مساعدة."
                      : "Ask about reports, lost dogs, adoption, or what to do when a dog needs help."}
                  </p>
                  <div className="pow-chat-suggestions">
                    {(
                      ar
                        ? ["لقيت كلب مصاب، أعمل إيه؟", "إزاي أعمل بلاغ؟", "إزاي أدور على كلبي المفقود؟"]
                        : ["I found an injured dog", "How do I file a report?", "How do I find my lost dog?"]
                    ).map((suggestion) => (
                      <Button
                        key={suggestion}
                        type="button"
                        variant="outline"
                        onClick={() => void sendMessage({ text: suggestion })}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  {message.role === "assistant" && (
                    <span className="pow-chat-role">
                      <img src={mascot.url} alt="" width={26} height={26} />
                      {ar ? "مساعد PowLink" : "PowLink Assistant"}
                    </span>
                  )}
                  <MessageContent className={message.role === "assistant" ? "pow-chat-assistant-bubble" : undefined}>
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <MessageResponse key={`${message.id}-${index}`}>{part.text}</MessageResponse>
                      ) : null,
                    )}
                  </MessageContent>
                </Message>
              ))}

              {status === "submitted" && (
                <div className="pow-chat-typing" aria-live="polite">
                  <img src={mascot.url} alt="" width={25} height={25} />
                  <Shimmer>{ar ? "بفكر في أفضل مساعدة..." : "Thinking of the best way to help..."}</Shimmer>
                </div>
              )}
              {error && <p className="pow-chat-error">{getErrorMessage(error, ar)}</p>}
            </ConversationContent>
            <ConversationScrollButton aria-label={ar ? "الانتقال لآخر رسالة" : "Scroll to latest"} />
          </Conversation>

          <div className="pow-chat-composer">
            <PromptInput
              onSubmit={({ text }) => {
                const content = text.trim();
                if (!content || busy) return;
                void sendMessage({ text: content });
                setInput("");
              }}
            >
              <PromptInputBody>
                <PromptInputTextarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.currentTarget.value)}
                  placeholder={ar ? "اكتب سؤالك هنا..." : "Type your question..."}
                  aria-label={ar ? "رسالتك" : "Your message"}
                  disabled={busy}
                  rows={2}
                />
              </PromptInputBody>
              <PromptInputFooter>
                <small>{ar ? "إرشاد أولي وليس تشخيصًا بيطريًا" : "Guidance only, not veterinary diagnosis"}</small>
                <PromptInputSubmit
                  status={status}
                  onStop={stop}
                  disabled={!input.trim() && !busy}
                  aria-label={busy ? (ar ? "إيقاف الرد" : "Stop response") : (ar ? "إرسال" : "Send")}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </section>
      ) : (
        <Button
          className="pow-chat-launcher"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label={ar ? "فتح مساعد PowLink" : "Open PowLink Assistant"}
        >
          <img src={mascot.url} alt="" width={98} height={98} />
          <span><MessageCircle />{ar ? "اسألني" : "Ask me"}</span>
        </Button>
      )}
    </div>
  );
}