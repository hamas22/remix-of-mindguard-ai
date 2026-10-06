import { createServerFn } from "@tanstack/react-start";

const AGENT_ID = "agent_5401kx8h5g4nfsmaffqvg83sd1k9";

export const getElevenLabsConversationToken = createServerFn({ method: "POST" }).handler(
  async () => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("ElevenLabs is not connected to this project");

    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${AGENT_ID}`,
      { headers: { "xi-api-key": apiKey } },
    );

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`ElevenLabs token request failed: ${res.status} ${body}`);
    }

    const data = (await res.json()) as { token: string };
    return { token: data.token, agentId: AGENT_ID };
  },
);
