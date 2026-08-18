import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Circle, 
  Square, 
  Download, 
  Trash2, 
  Play, 
  Pause,
  Clock,
  Video,
  Mic,
  FileVideo
} from 'lucide-react';

export interface RecorderProps {
  stream?: MediaStream | null;
  onRecordingComplete?: (blob: Blob) => void;
  maxDuration?: number;
}

export const Recorder: React.FC<RecorderProps> = ({
  stream = null,
  onRecordingComplete,
  maxDuration = 300
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedURL, setRecordedURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recordedURL) {
        URL.revokeObjectURL(recordedURL);
      }
    };
  }, [recordedURL]);

  const startRecording = useCallback(() => {
    if (!stream) return;

    chunksRef.current = [];
    try {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedURL(url);
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
      };

      recorder.start(1000);
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.warn('Failed to initialize session recorder:', error);
    }
  }, [stream, maxDuration, onRecordingComplete, stopRecording]);

  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
    } else {
      mediaRecorderRef.current.pause();
    }
    setIsPaused((prev) => !prev);
  }, [isPaused]);

  const downloadRecording = useCallback(() => {
    if (!recordedBlob) return;

    const link = document.createElement('a');
    link.download = `consultation_recording_${Date.now()}.webm`;
    link.href = URL.createObjectURL(recordedBlob);
    link.click();
  }, [recordedBlob]);

  const deleteRecording = useCallback(() => {
    if (recordedURL) {
      URL.revokeObjectURL(recordedURL);
    }
    setRecordedBlob(null);
    setRecordedURL(null);
    setDuration(0);
    chunksRef.current = [];
  }, [recordedURL]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="session-recorder-card" className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileVideo className="h-4 w-4 text-blue-400" />
          <h4 className="text-sm font-bold text-white">Session Clinical Recorder</h4>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          {isRecording && (
            <>
              <span className="text-rose-400 flex items-center gap-1">
                <Circle className="h-2 w-2 fill-rose-400 animate-pulse" />
                REC
              </span>
              <span className="text-slate-400">{formatDuration(duration)}</span>
            </>
          )}
        </div>
      </div>

      {recordedURL ? (
        <>
          <video
            ref={videoRef}
            src={recordedURL}
            className="w-full rounded-xl aspect-video bg-slate-900"
            onEnded={() => setIsPlaying(false)}
            controls
          />
          <div className="flex items-center gap-2">
            <button
              id="btn-delete-recording"
              type="button"
              onClick={deleteRecording}
              className="p-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-lg transition-all cursor-pointer"
              title="Delete recording"
              aria-label="Delete recording"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              id="btn-download-recording"
              type="button"
              onClick={downloadRecording}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              aria-label="Download recording"
            >
              <Download className="h-4 w-4" />
              Download Recording
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          {!isRecording ? (
            <button
              id="btn-start-recording"
              type="button"
              onClick={startRecording}
              disabled={!stream}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              aria-label="Start recording"
            >
              <Circle className="h-4 w-4" />
              Start Recording
            </button>
          ) : (
            <>
              <button
                id="btn-pause-recording"
                type="button"
                onClick={togglePause}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all cursor-pointer"
                title={isPaused ? "Resume" : "Pause"}
                aria-label={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                id="btn-stop-recording"
                type="button"
                onClick={stopRecording}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                aria-label="Stop recording"
              >
                <div className="flex items-center justify-center gap-2">
                  <Square className="h-4 w-4" />
                  Stop Recording
                </div>
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <Video className="h-3 w-3" />
        <span>{stream ? 'HD Video Stream' : 'Live Stream Inactive'}</span>
        <span className="text-slate-700">•</span>
        <Mic className="h-3 w-3" />
        <span>48kHz Audio</span>
        {isRecording && (
          <>
            <span className="text-slate-700">•</span>
            <Clock className="h-3 w-3" />
            <span>Max {maxDuration}s</span>
          </>
        )}
      </div>
    </div>
  );
};
