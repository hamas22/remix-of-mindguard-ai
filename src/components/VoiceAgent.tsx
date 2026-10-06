import { useConversation, ConversationProvider } from "@elevenlabs/react";
import { useCallback, useState } from "react";
import { Mic, MicOff, Loader2, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getElevenLabsConversationToken } from "@/lib/elevenlabs.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

export function VoiceAgent() {
  return (
    <ConversationProvider>
      <VoiceAgentInner />
    </ConversationProvider>
  );
}

function VoiceAgentInner() {
  const [connecting, setConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const getToken = useServerFn(getElevenLabsConversationToken);

  const conversation = useConversation({
    onConnect: () => toast.success("Connected"),
    onDisconnect: () => {},
    onError: (err) => {
      console.error(err);
      toast.error(typeof err === "string" ? err : "Voice connection error");
    },
    onMessage: (message: { source?: string; message?: string }) => {
      if (message?.message && message?.source) {
        setTranscript((prev) => [
          ...prev,
          { role: message.source === "user" ? "user" : "agent", text: message.message! },
        ]);
      }
    },
  });

  const start = useCallback(async () => {
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { token } = await getToken();
      await conversation.startSession({
        conversationToken: token,
        connectionType: "webrtc",
      });
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to start voice session");
    } finally {
      setConnecting(false);
    }
  }, [conversation, getToken]);

  const stop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isActive = conversation.status === "connected";

  return (
    <div className="space-y-6">
      <div className="glass-strong rounded-3xl p-8 flex flex-col items-center text-center">
        <div className="relative size-40 mb-6">
          <div
            className={`absolute inset-0 rounded-full gradient-primary transition-opacity ${
              isActive ? "opacity-40 animate-ping" : "opacity-10"
            }`}
          />
          <div
            className={`absolute inset-4 rounded-full gradient-primary blur-xl transition-opacity ${
              isActive && conversation.isSpeaking ? "opacity-70 animate-pulse-glow" : "opacity-30"
            }`}
          />
          <div className="absolute inset-8 rounded-full glass-strong flex items-center justify-center">
            {isActive ? (
              <Radio className="size-14 text-white animate-pulse" />
            ) : (
              <Mic className="size-14 text-white" />
            )}
          </div>
        </div>

        <p className="text-lg font-medium">
          {isActive
            ? conversation.isSpeaking
              ? "Agent is speaking..."
              : "Listening..."
            : "Tap to start a voice conversation"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Speak naturally — your voice will be analyzed for emotional cues.
        </p>

        <div className="mt-6 flex gap-3">
          {!isActive ? (
            <Button
              size="lg"
              onClick={start}
              disabled={connecting}
              className="gap-2 gradient-primary text-white border-0 hover:scale-105 transition-transform glow"
            >
              {connecting ? <Loader2 className="size-4 animate-spin" /> : <Mic className="size-4" />}
              Start Talking
            </Button>
          ) : (
            <Button size="lg" variant="destructive" onClick={stop} className="gap-2">
              <MicOff className="size-4" /> End Conversation
            </Button>
          )}
        </div>
      </div>

      {transcript.length > 0 && (
        <div className="glass-strong rounded-3xl p-6 max-h-96 overflow-y-auto space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Transcript
          </h3>
          {transcript.map((m, i) => (
            <div
              key={i}
              className={`rounded-2xl p-3 text-sm ${
                m.role === "user"
                  ? "bg-primary/10 border border-primary/20 ml-8"
                  : "bg-background/40 border border-white/10 mr-8"
              }`}
            >
              <div className="text-xs text-muted-foreground mb-1 capitalize">{m.role}</div>
              {m.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
