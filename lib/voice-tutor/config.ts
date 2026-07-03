// Realtime Voice Tutor session configuration: the model, voice, system prompt,
// and the function-tool definitions registered with OpenAI at token-mint time.
//
// Verified against the live OpenAI API on 2026-05-28:
//   POST https://api.openai.com/v1/realtime/client_secrets
//   body: { session: { type: "realtime", model, instructions, audio.output.voice, tools } }
//   → { value: "ek_...", expires_at, session: {...} }
// The `value` is the short-lived ephemeral client secret the browser uses for
// the WebRTC SDP handshake. The real OPENAI_API_KEY never leaves the server.

export const REALTIME_MODEL = "gpt-realtime";
export const REALTIME_VOICE = "marin"; // calm, clear default; any current voice works
export const CLIENT_SECRETS_URL = "https://api.openai.com/v1/realtime/client_secrets";

// The WebRTC SDP handshake target. The browser POSTs its SDP offer here with the
// ephemeral token as the bearer; OpenAI answers with the SDP answer.
export const REALTIME_WEBRTC_URL = "https://api.openai.com/v1/realtime/calls";

export const SYSTEM_PROMPT = `You are a live spoken tutor for the CompTIA Security+ SY0-701 exam.

SCOPE: Only discuss Security+ SY0-701 material. Politely decline anything off-topic.

QUIZZING — this is the core loop:
- NEVER invent or hallucinate exam questions. To quiz the user you MUST call the get_questions tool and read back exactly what it returns.
- When the user asks to be quizzed (e.g. "quiz me on PKI", "drill my weak areas"), first call get_weak_objectives if they did not name a specific objective, then call get_questions with the objective code (like "1.4") and a small count (1-5).
- Read the question stem and ALL answer choices aloud (A, B, C, D). Then wait for the user's spoken answer. Do not reveal or hint at the answer before they commit.
- When they answer, call submit_answer with the questionId and their picked letter. Tell them whether they were correct and give a concise spoken explanation (about 30-60 seconds) grounded in what the tool returns.
- Use get_recent_misses and get_mastery_summary to ground targeted explanations of why the user keeps missing a topic.

STYLE: Conversational, encouraging, but honest. Keep turns short and natural for spoken audio. One question at a time.

TIME: Sessions are capped at 15 minutes. If you are told the session is nearly over, wrap up gracefully.

AUDIO INPUT: If you did not clearly receive a spoken answer from the user, ask them to repeat — never answer your own question on the user's behalf. Background noise is not an answer.`;

// Function tools registered with the realtime session. The browser relays each
// invocation to POST /api/voice/tools, which dispatches to the existing
// study-buddy server functions and returns the result back over the data channel.
export interface RealtimeTool {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export const VOICE_TOOLS: RealtimeTool[] = [
  {
    type: "function",
    name: "get_weak_objectives",
    description:
      "Return the user's lowest-mastery Security+ objectives so you can target a drill. Call this when the user asks about their weak areas or asks to be quizzed without naming an objective.",
    parameters: {
      type: "object",
      properties: {
        n: {
          type: "number",
          description: "How many weak objectives to return (1-5).",
        },
      },
    },
  },
  {
    type: "function",
    name: "get_questions",
    description:
      "Fetch up to 5 real exam questions for one objective code (e.g. '1.4'). Returns stems and answer choices ONLY — never the answer key. Use the returned questionId when calling submit_answer.",
    parameters: {
      type: "object",
      properties: {
        objective: {
          type: "string",
          description: "Objective code like '1.4' or '4.1'.",
        },
        n: {
          type: "number",
          description: "How many questions to fetch (1-5).",
        },
      },
      required: ["objective"],
    },
  },
  {
    type: "function",
    name: "submit_answer",
    description:
      "Submit the user's chosen answer for a question. Records the attempt to the user's progress (FSRS) and returns whether it was correct plus the explanation. Only call this AFTER the user has committed to an answer.",
    parameters: {
      type: "object",
      properties: {
        questionId: {
          type: "string",
          description: "The id from a get_questions result.",
        },
        picked: {
          type: "string",
          description: "The chosen answer letter: A, B, C, or D.",
        },
      },
      required: ["questionId", "picked"],
    },
  },
  {
    type: "function",
    name: "get_mastery_summary",
    description:
      "Return the user's per-domain mastery and predicted Security+ score (100-900). Use for high-level 'how am I doing' answers.",
    parameters: { type: "object", properties: {} },
  },
  {
    type: "function",
    name: "get_recent_misses",
    description:
      "Return the user's recently-missed questions (their own history), optionally filtered to one objective. Use to explain why they keep missing a topic.",
    parameters: {
      type: "object",
      properties: {
        objective: {
          type: "string",
          description: "Optional objective code like '4.1' to filter to.",
        },
        limit: {
          type: "number",
          description: "Max misses to return (1-20).",
        },
      },
    },
  },
];

// Turn-detection mode the user picked on /voice. "auto" = hands-free
// (semantic_vad lets a model decide when the user actually finished a thought,
// far better at ignoring background noise than raw amplitude VAD). "ptt" =
// push-to-talk: NO automatic turn detection at all — the client manually
// commits the input buffer + asks for a response only when the user releases
// the talk button, so ambient noise can never trigger a phantom turn.
export type VoiceTurnMode = "auto" | "ptt";

export const DEFAULT_TURN_MODE: VoiceTurnMode = "auto";

export function isVoiceTurnMode(v: unknown): v is VoiceTurnMode {
  return v === "auto" || v === "ptt";
}

// Verified against the live OpenAI Realtime API (2026-05): turn_detection nests
// under session.audio.input.turn_detection. semantic_vad supports an
// `eagerness` knob ("low" waits longer before deciding the user is done — best
// for noisy rooms / thoughtful answers). Setting turn_detection to null
// disables OpenAI's auto-detection entirely (the push-to-talk case).
type TurnDetection =
  | {
      type: "semantic_vad";
      eagerness: "low" | "medium" | "high" | "auto";
      create_response: boolean;
      interrupt_response: boolean;
    }
  | {
      type: "server_vad";
      threshold: number;
      prefix_padding_ms: number;
      silence_duration_ms: number;
      create_response: boolean;
      interrupt_response: boolean;
    }
  | null;

/**
 * The turn_detection config for a given mode. Exported so the client can also
 * apply it via session.update if it ever needs to switch mid-session.
 *  - auto: semantic_vad, eagerness "low" (conservative — waits for a real,
 *    finished thought rather than cutting in on a pause or on room noise).
 *  - ptt:  null — OpenAI does not auto-detect turns; the client drives every
 *    turn manually with input_audio_buffer.commit + response.create.
 */
export function turnDetectionFor(mode: VoiceTurnMode): TurnDetection {
  if (mode === "ptt") return null;
  return {
    type: "semantic_vad",
    eagerness: "low",
    create_response: true,
    interrupt_response: true,
  };
}

/** Build the request body for POST /v1/realtime/client_secrets. */
export function buildClientSecretBody(mode: VoiceTurnMode = DEFAULT_TURN_MODE) {
  return {
    session: {
      type: "realtime",
      model: REALTIME_MODEL,
      instructions: SYSTEM_PROMPT,
      audio: {
        output: { voice: REALTIME_VOICE },
        // Transcribe the USER's spoken audio so their answers can show in the
        // on-screen captions. Purely a visual aid — does not affect the audio
        // loop. The assistant's own transcript streams via
        // response.output_audio_transcript.* without extra config.
        //
        // turn_detection: semantic_vad (hands-free) or null (push-to-talk).
        // Without this the API used its default server-VAD at default
        // sensitivity, so background noise registered as the user speaking and
        // the model answered phantom turns.
        input: {
          transcription: { model: "whisper-1" },
          turn_detection: turnDetectionFor(mode),
        },
      },
      tools: VOICE_TOOLS,
      tool_choice: "auto",
    },
  };
}
