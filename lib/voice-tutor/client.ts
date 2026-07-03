// Browser-side WebRTC client for the Realtime Voice Tutor.
//
// Verified flow (OpenAI Realtime, 2025-2026):
//   1. POST /api/voice/session → { clientSecret (ek_...), sessionId, model, ... }.
//   2. Create RTCPeerConnection, add the mic track, create the "oai-events" data
//      channel, attach the remote audio stream to an <audio> element.
//   3. POST the SDP offer to https://api.openai.com/v1/realtime/calls with the
//      ephemeral token as the bearer and Content-Type: application/sdp.
//      The response body is the SDP answer.
//   4. Function calls arrive on the data channel as
//      response.function_call_arguments.done; we relay them to /api/voice/tools
//      and send the result back as conversation.item.create(function_call_output)
//      + response.create.
//
// NO OpenAI key is ever present in the browser — only the short-lived ek_ token.

import { REALTIME_WEBRTC_URL, DEFAULT_TURN_MODE, type VoiceTurnMode } from "./config";

export interface VoiceQuestion {
  id: string;
  objectiveId: string;
  stem: string;
  choices: { key: string; text: string }[];
}

/** The on-screen reveal after submit_answer resolves a question. */
export interface VoiceAnswerReveal {
  questionId: string;
  picked: string;
  correctKey: string | null;
  correct: boolean;
  explanation: string;
}

export type CaptionRole = "tutor" | "user";

export interface VoiceClientCallbacks {
  onStatus: (s: VoiceStatus) => void;
  onError: (message: string) => void;
  /** Called when a model audio response starts/stops, for the viz. */
  onSpeakingChange?: (speaking: boolean) => void;
  /** Called once the session id is known (after mint). */
  onSession?: (info: {
    sessionId: string;
    minutesRemainingToday: number;
    minutesRemainingThisMonth: number;
  }) => void;
  /**
   * A get_questions tool result arrived — push the first (current) question to
   * the on-screen card BEFORE the model starts reading it. Comes from the real
   * tool payload (answer key already stripped), never from the audio transcript.
   */
  onQuestion?: (q: VoiceQuestion) => void;
  /** A submit_answer result arrived — reveal correct/explanation on the card. */
  onAnswerReveal?: (reveal: VoiceAnswerReveal) => void;
  /**
   * Streaming transcript text. role:"tutor" = assistant audio transcript,
   * role:"user" = recognized user speech. `done` marks the end of an utterance.
   */
  onCaption?: (role: CaptionRole, text: string, done: boolean) => void;
}

export type VoiceStatus =
  | "idle"
  | "requesting-mic"
  | "minting"
  | "connecting"
  | "connected"
  | "ended"
  | "error";

export interface MintResponse {
  clientSecret: string;
  sessionId: string;
  model: string;
  voice: string;
  minutesRemainingToday: number;
  minutesRemainingThisMonth: number;
}

export class VoiceTutorClient {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private audioEl: HTMLAudioElement;
  private sessionId: string | null = null;
  private cb: VoiceClientCallbacks;
  private ended = false;
  private turnMode: VoiceTurnMode = DEFAULT_TURN_MODE;
  // Active cert for this session. Sent to /api/voice/tools so questions are
  // served — and the answer key resolved — from the caller's cert, not a
  // hardcoded Security+. Optional; the route defaults to Security+ when absent.
  private certId: string | undefined;

  constructor(
    audioEl: HTMLAudioElement,
    cb: VoiceClientCallbacks,
    certId?: string
  ) {
    this.audioEl = audioEl;
    this.cb = cb;
    this.certId = certId;
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  async start(localDate: string, turnMode: VoiceTurnMode = DEFAULT_TURN_MODE): Promise<void> {
    this.ended = false;
    this.turnMode = turnMode;
    try {
      // 1. Mic permission (must be a user gesture upstream).
      // noiseSuppression + echoCancellation + autoGainControl clean ambient
      // noise out of the captured track BEFORE it ever reaches OpenAI — the
      // first line of defense against phantom turns in noisy rooms.
      this.cb.onStatus("requesting-mic");
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch {
      this.cb.onStatus("error");
      this.cb.onError(
        "Microphone permission denied. Allow mic access and try again."
      );
      return;
    }

    // 2. Mint the ephemeral token (server enforces all caps here).
    this.cb.onStatus("minting");
    let mint: MintResponse;
    try {
      const resp = await fetch("/api/voice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ localDate, turnMode: this.turnMode }),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        this.cleanup();
        this.cb.onStatus("error");
        this.cb.onError(mapMintError(resp.status, data?.error, data?.resetInSeconds));
        return;
      }
      mint = (await resp.json()) as MintResponse;
    } catch {
      this.cleanup();
      this.cb.onStatus("error");
      this.cb.onError("Could not start a session. Check your connection.");
      return;
    }

    this.sessionId = mint.sessionId;
    this.cb.onSession?.({
      sessionId: mint.sessionId,
      minutesRemainingToday: mint.minutesRemainingToday,
      minutesRemainingThisMonth: mint.minutesRemainingThisMonth,
    });

    // 3. WebRTC peer connection.
    this.cb.onStatus("connecting");
    try {
      const pc = new RTCPeerConnection();
      this.pc = pc;

      // Remote audio → <audio> element.
      pc.ontrack = (e) => {
        this.audioEl.srcObject = e.streams[0];
        this.audioEl.play().catch(() => {});
      };

      // Mic track out.
      for (const track of this.localStream!.getTracks()) {
        pc.addTrack(track, this.localStream!);
      }

      // Data channel for events.
      const dc = pc.createDataChannel("oai-events");
      this.dc = dc;
      dc.onmessage = (e) => this.handleEvent(e.data);
      // In push-to-talk, mute the mic the moment the channel is live so no
      // ambient audio is captured before the user first holds the button.
      dc.onopen = () => this.primePushToTalk();

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          if (!this.ended) {
            this.cb.onError("Connection lost.");
            this.cb.onStatus("error");
          }
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpResp = await fetch(`${REALTIME_WEBRTC_URL}?model=${mint.model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${mint.clientSecret}`,
          "Content-Type": "application/sdp",
        },
      });
      if (!sdpResp.ok) {
        this.cleanup();
        this.cb.onStatus("error");
        this.cb.onError("Voice handshake failed. Try again.");
        return;
      }
      const answerSdp = await sdpResp.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      this.cb.onStatus("connected");
    } catch {
      this.cleanup();
      this.cb.onStatus("error");
      this.cb.onError("WebRTC setup failed. Your browser may not support it.");
    }
  }

  // ── Push-to-talk ────────────────────────────────────────────────────────────
  // In PTT mode the session has turn_detection=null, so OpenAI never
  // auto-detects a turn. The mic track is muted while the user is NOT holding
  // the button so ambient noise is never even captured. On press we unmute and
  // clear any stale buffered audio; on release we commit the buffered speech
  // and explicitly ask the model to respond — the ONLY way a turn ever fires.
  // This guarantees zero phantom turns in noisy environments.

  private setMicEnabled(enabled: boolean): void {
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }

  /** Mute the mic until the user explicitly holds the talk button (PTT only). */
  primePushToTalk(): void {
    if (this.turnMode !== "ptt") return;
    this.setMicEnabled(false);
  }

  /** User pressed/held the talk button: start capturing fresh audio. */
  startTalking(): void {
    if (this.turnMode !== "ptt") return;
    if (!this.dc || this.dc.readyState !== "open") return;
    // Discard anything captured while idle (belt + suspenders against leak).
    this.dc.send(JSON.stringify({ type: "input_audio_buffer.clear" }));
    this.setMicEnabled(true);
  }

  /**
   * User released the talk button: stop capturing, commit the spoken audio as
   * one input item, then ask the model to respond to exactly that. If nothing
   * was said this is a no-op-ish commit; the system prompt + empty-input guard
   * keep the model from inventing an answer.
   */
  stopTalking(): void {
    if (this.turnMode !== "ptt") return;
    this.setMicEnabled(false);
    if (!this.dc || this.dc.readyState !== "open") return;
    this.dc.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
    this.dc.send(JSON.stringify({ type: "response.create" }));
  }

  /** Inject a short instruction (e.g. the 14-min wrap-up warning). */
  sendSystemNudge(text: string): void {
    if (!this.dc || this.dc.readyState !== "open") return;
    this.dc.send(
      JSON.stringify({
        type: "response.create",
        response: { instructions: text },
      })
    );
  }

  private async handleEvent(raw: string): Promise<void> {
    let evt: {
      type?: string;
      name?: string;
      call_id?: string;
      arguments?: string;
      delta?: string;
      transcript?: string;
    };
    try {
      evt = JSON.parse(raw);
    } catch {
      return;
    }

    switch (evt.type) {
      case "response.audio.delta":
      case "output_audio_buffer.started":
        this.cb.onSpeakingChange?.(true);
        return;
      case "response.done":
      case "output_audio_buffer.stopped":
        this.cb.onSpeakingChange?.(false);
        return;

      // ── Captions ──────────────────────────────────────────────────────────
      // Assistant (tutor) audio transcript (GA event names).
      case "response.output_audio_transcript.delta":
        if (typeof evt.delta === "string")
          this.cb.onCaption?.("tutor", evt.delta, false);
        return;
      case "response.output_audio_transcript.done":
        if (typeof evt.transcript === "string")
          this.cb.onCaption?.("tutor", evt.transcript, true);
        return;
      // User speech transcription (requires audio.input.transcription in config).
      case "conversation.item.input_audio_transcription.delta":
        if (typeof evt.delta === "string")
          this.cb.onCaption?.("user", evt.delta, false);
        return;
      case "conversation.item.input_audio_transcription.completed":
        if (typeof evt.transcript === "string")
          this.cb.onCaption?.("user", evt.transcript, true);
        return;

      // Function call completed → relay to the tool bridge.
      case "response.function_call_arguments.done":
        if (evt.name && evt.call_id) {
          await this.dispatchToolCall(evt.name, evt.call_id, evt.arguments ?? "{}");
        }
        return;
    }
  }

  private async dispatchToolCall(
    name: string,
    callId: string,
    argsJson: string
  ): Promise<void> {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(argsJson);
    } catch {
      // leave empty
    }

    let output: unknown;
    let ok = false;
    try {
      const resp = await fetch("/api/voice/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.sessionId,
          name,
          arguments: args,
          ...(this.certId ? { certId: this.certId } : {}),
        }),
      });
      output = await resp.json();
      ok = resp.ok;
      if (!resp.ok) {
        // Surface a structured error to the model so it can recover gracefully.
        output = { error: (output as { error?: string })?.error ?? "tool_failed" };
      }
    } catch {
      output = { error: "tool_unreachable" };
    }

    // Surface the tool payload to the on-screen UI BEFORE handing the result
    // back to the model — so the question card appears as the tutor starts
    // reading it. The payload is the real (answer-key-stripped) tool result,
    // never parsed from the audio transcript.
    if (ok) this.relayToolResultToUi(name, args, output);

    if (!this.dc || this.dc.readyState !== "open") return;

    // Send the tool result back, then ask the model to continue.
    this.dc.send(
      JSON.stringify({
        type: "conversation.item.create",
        item: {
          type: "function_call_output",
          call_id: callId,
          output: JSON.stringify(output),
        },
      })
    );
    this.dc.send(JSON.stringify({ type: "response.create" }));
  }

  /** Map a tool result to the on-screen question card / answer reveal. */
  private relayToolResultToUi(
    name: string,
    args: Record<string, unknown>,
    output: unknown
  ): void {
    if (name === "get_questions") {
      const questions = (output as { questions?: VoiceQuestion[] })?.questions;
      const first = Array.isArray(questions) ? questions[0] : undefined;
      if (first && first.id && Array.isArray(first.choices)) {
        this.cb.onQuestion?.(first);
      }
      return;
    }
    if (name === "submit_answer") {
      const res = output as {
        correct?: boolean;
        correctKey?: string | null;
        explanation?: string;
      };
      const questionId =
        typeof args.questionId === "string" ? args.questionId : "";
      const picked =
        typeof args.picked === "string" ? args.picked.toUpperCase() : "";
      if (questionId) {
        this.cb.onAnswerReveal?.({
          questionId,
          picked,
          correctKey: res?.correctKey ?? null,
          correct: !!res?.correct,
          explanation: typeof res?.explanation === "string" ? res.explanation : "",
        });
      }
    }
  }

  /**
   * Fire-and-forget end via navigator.sendBeacon — survives page unload where a
   * normal fetch would be cancelled. Used on pagehide / visibilitychange→hidden
   * so a session ALWAYS records its duration even on abrupt exit. Idempotent on
   * the server (endSession returns the stored duration if already ended).
   */
  endViaBeacon(): void {
    const id = this.sessionId;
    this.cleanup();
    if (!id) return;
    try {
      navigator.sendBeacon?.(
        "/api/voice/end",
        new Blob([JSON.stringify({ sessionId: id, killed: true })], {
          type: "application/json",
        })
      );
    } catch {
      // Best-effort; server backstop + in-flight cap accounting still bound spend.
    }
  }

  /** Tear down WebRTC + mic. Does NOT call the end route (caller does that). */
  cleanup(): void {
    this.ended = true;
    try {
      this.dc?.close();
    } catch {}
    try {
      this.pc?.getSenders().forEach((s) => s.track?.stop());
      this.pc?.close();
    } catch {}
    try {
      this.localStream?.getTracks().forEach((t) => t.stop());
    } catch {}
    this.dc = null;
    this.pc = null;
    this.localStream = null;
    if (this.audioEl) this.audioEl.srcObject = null;
  }

  /** End the session: tear down + tell the server to record the duration. */
  async end(killed = false): Promise<void> {
    const id = this.sessionId;
    this.cleanup();
    this.cb.onStatus("ended");
    if (!id) return;
    try {
      await fetch("/api/voice/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: id, killed }),
      });
    } catch {
      // Best-effort; the server backstop + next-mint cap math still protect spend.
    }
  }
}

function mapMintError(
  status: number,
  code?: string,
  resetInSeconds?: number
): string {
  const resetHint = resetInSeconds
    ? ` Resets in about ${Math.ceil(resetInSeconds / 3600)}h.`
    : "";
  switch (code) {
    case "service_disabled":
      return "The voice tutor is temporarily unavailable.";
    case "service_capacity_reached":
      return "The voice tutor has hit its shared monthly capacity. Please try again next month.";
    case "daily_limit_reached":
      return `You have used your 30 free voice minutes for today.${resetHint}`;
    case "monthly_limit_reached":
      return `You have used your 60 free voice minutes for this month.${resetHint}`;
    case "unauthorized":
      return "Please sign in to use the voice tutor.";
    default:
      if (status === 401) return "Please sign in to use the voice tutor.";
      return "Could not start a voice session right now.";
  }
}
