import { useState, useEffect, useRef, useCallback } from "react";

export type LiveVoiceState = 
  | "disconnected"
  | "connecting"
  | "ready"
  | "listening"
  | "thinking"
  | "speaking"
  | "interrupted"
  | "error";

export interface LiveTranscriptItem {
  id: string;
  sender: "user" | "gemini";
  text: string;
  timestamp: string;
  isFinal?: boolean;
}

export interface UseLiveVoiceOptions {
  voice?: "Zephyr" | "Puck" | "Charon" | "Kore" | "Fenrir";
  patientName?: string;
  onTranscript?: (item: LiveTranscriptItem) => void;
  onError?: (error: string) => void;
}

export function useLiveVoiceConversation(options: UseLiveVoiceOptions = {}) {
  const { voice = "Zephyr", patientName = "Patient", onTranscript, onError } = options;

  const [state, setState] = useState<LiveVoiceState>("disconnected");
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<LiveTranscriptItem[]>([]);
  const [userAudioLevel, setUserAudioLevel] = useState<number>(0);
  const [geminiAudioLevel, setGeminiAudioLevel] = useState<number>(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(24).fill(10));

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const scheduledTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const currentGeminiTurnTextRef = useRef<string>("");
  const animFrameRef = useRef<number | null>(null);
  const analyserInRef = useRef<AnalyserNode | null>(null);
  const analyserOutRef = useRef<AnalyserNode | null>(null);

  // Helper: Convert Float32Array to 16-bit PCM Base64
  const floatTo16BitPCMBase64 = (input: Float32Array): string => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Helper: Convert Base64 24kHz PCM to AudioBuffer
  const base64ToAudioBuffer = (
    base64: string,
    ctx: AudioContext,
    sampleRate: number = 24000
  ): AudioBuffer => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const dataView = new DataView(bytes.buffer);
    const numSamples = bytes.byteLength / 2;
    const audioBuffer = ctx.createBuffer(1, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    for (let i = 0; i < numSamples; i++) {
      const int16 = dataView.getInt16(i * 2, true);
      channelData[i] = int16 / 32768.0;
    }
    return audioBuffer;
  };

  // Stop all playing audio nodes (Interruption)
  const stopAllPlayingAudio = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // ignore
      }
    });
    activeSourcesRef.current = [];
    if (audioContextOutRef.current) {
      scheduledTimeRef.current = audioContextOutRef.current.currentTime;
    }
    isPlayingRef.current = false;
    setGeminiAudioLevel(0);
  }, []);

  // Connect to Gemini 3.1 Flash Live API
  const connect = useCallback(async () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setState("connecting");
    setErrorMessage(null);

    try {
      // 1. Initialize AudioContexts
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtxIn = new AudioCtx({ sampleRate: 16000 });
      const audioCtxOut = new AudioCtx({ sampleRate: 24000 });
      
      if (audioCtxIn.state === "suspended") await audioCtxIn.resume();
      if (audioCtxOut.state === "suspended") await audioCtxOut.resume();

      audioContextInRef.current = audioCtxIn;
      audioContextOutRef.current = audioCtxOut;
      scheduledTimeRef.current = audioCtxOut.currentTime;

      // 2. Request user microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // Create Analyser for input visualization
      const analyserIn = audioCtxIn.createAnalyser();
      analyserIn.fftSize = 64;
      analyserInRef.current = analyserIn;

      // Create Analyser for output visualization
      const analyserOut = audioCtxOut.createAnalyser();
      analyserOut.fftSize = 64;
      analyserOutRef.current = analyserOut;

      // Setup audio input processing
      const source = audioCtxIn.createMediaStreamSource(stream);
      source.connect(analyserIn);

      const processor = audioCtxIn.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMicMuted) return;
        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate volume level for UI
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const level = Math.min(100, Math.round(rms * 400));
        setUserAudioLevel(level);

        // If level is high and AI was speaking, user is interrupting!
        if (level > 25 && isPlayingRef.current) {
          stopAllPlayingAudio();
          setState("listening");
        }

        // Send to Live WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const base64Audio = floatTo16BitPCMBase64(inputData);
          wsRef.current.send(JSON.stringify({ audio: base64Audio }));
        }
      };

      source.connect(processor);
      processor.connect(audioCtxIn.destination);

      // 3. Connect WebSocket to /live endpoint
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/live?voice=${voice}&patientName=${encodeURIComponent(patientName)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setState("ready");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "ready") {
            setState("listening");
          } else if (data.type === "audio" && data.audio) {
            setState("speaking");
            isPlayingRef.current = true;

            const outCtx = audioContextOutRef.current;
            if (!outCtx) return;

            const audioBuffer = base64ToAudioBuffer(data.audio, outCtx, 24000);
            const sourceNode = outCtx.createBufferSource();
            sourceNode.buffer = audioBuffer;

            if (analyserOutRef.current) {
              sourceNode.connect(analyserOutRef.current);
              analyserOutRef.current.connect(outCtx.destination);
            } else {
              sourceNode.connect(outCtx.destination);
            }

            const startTime = Math.max(scheduledTimeRef.current, outCtx.currentTime + 0.02);
            sourceNode.start(startTime);
            scheduledTimeRef.current = startTime + audioBuffer.duration;

            activeSourcesRef.current.push(sourceNode);

            sourceNode.onended = () => {
              activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== sourceNode);
              if (activeSourcesRef.current.length === 0) {
                isPlayingRef.current = false;
                setState("listening");
                setGeminiAudioLevel(0);
              }
            };
          } else if (data.type === "text" && data.text) {
            currentGeminiTurnTextRef.current += data.text;
            const newTurnText = currentGeminiTurnTextRef.current;

            setTranscripts((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === "gemini" && !last.isFinal) {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...last,
                  text: newTurnText,
                };
                return updated;
              } else {
                const newItem: LiveTranscriptItem = {
                  id: `GEMINI-${Date.now()}`,
                  sender: "gemini",
                  text: newTurnText,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  isFinal: false,
                };
                return [...prev, newItem];
              }
            });
          } else if (data.type === "interrupted") {
            stopAllPlayingAudio();
            setState("listening");
            currentGeminiTurnTextRef.current = "";
          } else if (data.type === "turnComplete") {
            currentGeminiTurnTextRef.current = "";
            setTranscripts((prev) => {
              if (prev.length === 0) return prev;
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                isFinal: true,
              };
              return updated;
            });
          } else if (data.type === "error") {
            setErrorMessage(data.error || "Gemini Live encountered an error");
            setState("error");
            onError?.(data.error);
          }
        } catch (err) {
          console.error("Failed to parse Live WS message:", err);
        }
      };

      ws.onerror = (e) => {
        console.error("Live WebSocket error:", e);
        setErrorMessage("Connection error to Live API server.");
        setState("error");
      };

      ws.onclose = () => {
        setState("disconnected");
        stopAllPlayingAudio();
      };

      // 4. Start visualizer animation loop
      const updateVisualizer = () => {
        const bars: number[] = [];
        const isSpeakingAI = isPlayingRef.current;
        const activeAnalyser = isSpeakingAI ? analyserOutRef.current : analyserInRef.current;

        if (activeAnalyser) {
          const bufferLength = activeAnalyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          activeAnalyser.getByteFrequencyData(dataArray);

          // Calculate average level
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
          const avg = sum / bufferLength;

          if (isSpeakingAI) {
            setGeminiAudioLevel(Math.min(100, Math.round((avg / 255) * 100)));
          }

          // Generate 24 bar values
          for (let i = 0; i < 24; i++) {
            const dataIndex = Math.floor((i / 24) * bufferLength);
            const val = dataArray[dataIndex] || 0;
            const barHeight = Math.max(8, Math.min(95, Math.round((val / 255) * 100)));
            bars.push(barHeight);
          }
        } else {
          for (let i = 0; i < 24; i++) bars.push(8);
        }

        setWaveformBars(bars);
        animFrameRef.current = requestAnimationFrame(updateVisualizer);
      };

      animFrameRef.current = requestAnimationFrame(updateVisualizer);

    } catch (err: unknown) {
      console.error("Failed to connect live audio:", err);
      const msg = err instanceof Error ? err.message : "Microphone permission denied or device not found";
      setErrorMessage(msg);
      setState("error");
      onError?.(msg);
    }
  }, [voice, patientName, isMicMuted, stopAllPlayingAudio, onError]);

  // Send a text message turn to Gemini Live
  const sendTextMessage = useCallback((text: string) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Add to transcripts
    const userItem: LiveTranscriptItem = {
      id: `USER-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isFinal: true,
    };
    setTranscripts((prev) => [...prev, userItem]);
    onTranscript?.(userItem);

    // Stop existing playback and send text
    stopAllPlayingAudio();
    setState("thinking");
    currentGeminiTurnTextRef.current = "";

    wsRef.current.send(JSON.stringify({ text: text.trim() }));
  }, [stopAllPlayingAudio, onTranscript]);

  // Disconnect & cleanup
  const disconnect = useCallback(() => {
    stopAllPlayingAudio();

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }

    if (audioContextInRef.current) {
      audioContextInRef.current.close().catch(() => {});
      audioContextInRef.current = null;
    }

    if (audioContextOutRef.current) {
      audioContextOutRef.current.close().catch(() => {});
      audioContextOutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState("disconnected");
    setUserAudioLevel(0);
    setGeminiAudioLevel(0);
  }, [stopAllPlayingAudio]);

  // Toggle Mute
  const toggleMicMute = useCallback(() => {
    setIsMicMuted((prev) => !prev);
  }, []);

  // Clear Transcripts
  const clearTranscripts = useCallback(() => {
    setTranscripts([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    isMicMuted,
    errorMessage,
    transcripts,
    userAudioLevel,
    geminiAudioLevel,
    waveformBars,
    connect,
    disconnect,
    toggleMicMute,
    sendTextMessage,
    stopAllPlayingAudio,
    clearTranscripts,
  };
}
