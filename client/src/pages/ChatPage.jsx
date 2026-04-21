import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { sendChatMessage } from '../services/api';

const SUGGESTIONS = [
  '📅 Lihat jadwal dokter',
  '👨‍⚕️ Jadwal dokter spesialis anak',
  '📝 Saya ingin buat reservasi',
];

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Halo! 👋 Saya **RS Sehat AI**, asisten virtual rumah sakit Anda.\n\nSaya bisa membantu Anda untuk:\n- 📅 Melihat **jadwal praktek** dokter\n- 📝 Membuat **reservasi** online\n\nSilakan tanyakan apa saja! 😊`,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text) => {
    const message = text || inputValue.trim();
    if (!message || isLoading) return;

    const userMessage = { role: 'user', content: message };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(newMessages);
      setMessages((prev) => [...prev, { role: 'model', content: response.content }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: '⚠️ Maaf, terjadi kesalahan. Silakan coba lagi nanti.\n\n*' + error.message + '*',
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-navy-900">
      {/* Header */}
      <header className="glass border-b border-white/5 px-4 py-3 flex items-center gap-3 shrink-0 z-10">
        <IconButton
          onClick={() => navigate('/')}
          sx={{ color: '#94a3b8' }}
          size="small"
        >
          <ArrowBackIcon />
        </IconButton>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
          <SmartToyIcon sx={{ color: '#fff', fontSize: 20 }} />
        </div>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-white leading-none">RS Sehat AI</h1>
          <p className="text-[11px] text-primary-400 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 inline-block animate-pulse" />
            Online
          </p>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 chat-bubble-enter ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center shrink-0 mt-1">
                <SmartToyIcon sx={{ color: '#06c4aa', fontSize: 16 }} />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'max-w-[80%] md:max-w-[65%] bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md'
                  : 'max-w-[90%] md:max-w-[80%] glass rounded-bl-md overflow-x-auto'
              }`}
            >
              {msg.role === 'model' ? (
                <div className="markdown-content text-sm text-slate-200 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-navy-400/20 to-navy-600/20 flex items-center justify-center shrink-0 mt-1">
                <PersonIcon sx={{ color: '#818cf8', fontSize: 16 }} />
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start chat-bubble-enter">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 flex items-center justify-center shrink-0 mt-1">
              <SmartToyIcon sx={{ color: '#06c4aa', fontSize: 16 }} />
            </div>
            <div className="glass rounded-2xl rounded-bl-md px-5 py-4">
              <div className="flex gap-1.5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
          {SUGGESTIONS.map((s) => (
            <Chip
              key={s}
              label={s}
              variant="outlined"
              onClick={() => handleSend(s)}
              sx={{
                borderColor: 'rgba(6, 196, 170, 0.2)',
                color: '#94a3b8',
                fontSize: '0.8rem',
                '&:hover': {
                  borderColor: 'rgba(6, 196, 170, 0.5)',
                  bgcolor: 'rgba(6, 196, 170, 0.05)',
                  color: '#06c4aa',
                },
              }}
            />
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="glass border-t border-white/5 px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto flex items-end gap-2">
          <TextField
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ketik pesan Anda..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.03)',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                '&:hover fieldset': { borderColor: 'rgba(6, 196, 170, 0.3)' },
                '&.Mui-focused fieldset': { borderColor: '#06c4aa' },
              },
              '& .MuiInputBase-input': {
                color: '#e2e8f0',
                fontSize: '0.9rem',
                '&::placeholder': { color: '#475569' },
              },
            }}
          />
          <IconButton
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            sx={{
              bgcolor: inputValue.trim() ? 'primary.main' : 'rgba(255,255,255,0.05)',
              color: inputValue.trim() ? '#fff' : '#475569',
              width: 44,
              height: 44,
              borderRadius: 3,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: inputValue.trim() ? 'primary.dark' : 'rgba(255,255,255,0.08)',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(255,255,255,0.03)',
                color: '#334155',
              },
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
