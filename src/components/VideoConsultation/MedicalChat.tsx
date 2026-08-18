import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Image,
  FileText,
  CheckCheck,
  Check,
  X,
  Loader2,
  Download,
  Copy
} from 'lucide-react';

export interface MedicalChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isDoctor: boolean;
  isRead?: boolean;
  attachments?: {
    name: string;
    type: string;
    url?: string;
    size?: number;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

export interface MedicalChatProps {
  messages: MedicalChatMessage[];
  onSendMessage: (text: string, attachments?: File[]) => void;
  isDoctor: boolean;
  patientName: string;
  doctorName: string;
}

export const MedicalChat: React.FC<MedicalChatProps> = ({
  messages,
  onSendMessage,
  isDoctor,
  patientName,
  doctorName
}) => {
  const [messageText, setMessageText] = useState('');
  const [isTyping] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!messageText.trim() && attachments.length === 0) return;

    onSendMessage(messageText, attachments);
    setMessageText('');
    setAttachments([]);
  }, [messageText, attachments, onSendMessage]);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
      const maxSize = 10 * 1024 * 1024;
      return validTypes.includes(file.type) && file.size <= maxSize;
    });
    setAttachments((prev) => [...prev, ...validFiles]);
    setShowAttachmentMenu(false);
  }, []);

  const copyMessage = useCallback((text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }, []);

  const renderAttachments = (fileAttachments?: MedicalChatMessage['attachments']) => {
    if (!fileAttachments || fileAttachments.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-1.5">
        {fileAttachments.map((file, idx) => (
          <div key={idx} className="px-2 py-1 bg-slate-800/50 rounded-lg text-[10px] flex items-center gap-1.5">
            <Paperclip className="h-3 w-3 text-slate-400" />
            <span className="text-slate-300 truncate max-w-[100px]">{file.name}</span>
            {file.size && (
              <span className="text-slate-500 text-[8px]">
                {(file.size / 1024 / 1024).toFixed(1)}MB
              </span>
            )}
            <button className="text-slate-500 hover:text-slate-300 cursor-pointer">
              <Download className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const getStatusIcon = (isRead?: boolean) => {
    if (isRead === undefined) return null;
    return isRead ? (
      <CheckCheck className="h-3 w-3 text-blue-400" />
    ) : (
      <Check className="h-3 w-3 text-slate-500" />
    );
  };

  return (
    <div id="medical-chat-container" className="flex flex-col h-full">
      {/* Chat messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto pr-2 space-y-3 min-h-[200px] max-h-[400px]">
        {messages.map((msg) => {
          const isOwn = msg.isDoctor === isDoctor;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              onMouseEnter={() => setSelectedMessage(msg.id)}
              onMouseLeave={() => setSelectedMessage(null)}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1.5 ${
                  isOwn
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[10px] opacity-70">
                  <span className="font-bold">
                    {isOwn ? (isDoctor ? doctorName : patientName) : (isDoctor ? patientName : doctorName)}
                  </span>
                  <div className="flex items-center gap-1">
                    <span>{msg.time}</span>
                    {isOwn && getStatusIcon(msg.isRead)}
                  </div>
                </div>
                
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                
                {renderAttachments(msg.attachments)}

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {msg.reactions.map((reaction, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-slate-700/50 rounded-full text-[10px]">
                        {reaction.emoji} {reaction.count}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message actions (hover) */}
                {selectedMessage === msg.id && (
                  <div className="flex items-center gap-1 mt-1 pt-1 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => copyMessage(msg.text)}
                      className="p-1 hover:bg-white/10 rounded cursor-pointer"
                      title="Copy"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-800 text-slate-400 p-3 rounded-2xl rounded-bl-none text-xs flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Doctor is typing...</span>
            </div>
          </div>
        )}

        {/* Quick replies for patients */}
        {!isDoctor && messages.length > 0 && messages[messages.length - 1].isDoctor && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {[
              'Thank you doctor',
              'Understood',
              'I will follow that',
              'Can you clarify?'
            ].map((reply, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSendMessage(reply, []);
                }}
                className="px-2.5 py-1 bg-slate-800/60 border border-slate-700 rounded-xl text-xs text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
              >
                {reply}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Attachment preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-slate-950/50 rounded-xl border border-slate-800 mt-2">
          {attachments.map((file, idx) => (
            <div key={idx} className="relative px-2.5 py-1.5 bg-slate-800 rounded-xl flex items-center gap-2 text-xs">
              <span className="text-slate-300 truncate max-w-[120px]">{file.name}</span>
              <button
                type="button"
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800 mt-2">
        <div className="relative">
          <button
            id="btn-chat-attachment"
            type="button"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="p-2 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {showAttachmentMenu && (
            <div className="absolute bottom-full left-0 mb-2 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-xl z-10">
              <div className="flex flex-col gap-1 text-xs min-w-[160px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-slate-200"
                >
                  <FileText className="h-4 w-4" /> File / PDF
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-slate-200"
                >
                  <Image className="h-4 w-4" /> Image / Lab Scan
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </div>
          )}
        </div>

        <input
          id="input-med-chat"
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={isDoctor ? "Type clinical instructions..." : "Ask a question..."}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        <button
          id="btn-med-chat-send"
          type="button"
          onClick={handleSend}
          disabled={!messageText.trim() && attachments.length === 0}
          className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-all cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
