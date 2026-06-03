import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography, keyframes } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// ─── Types ────────────────────────────────────────────────────────────────────

type VoiceState = 'listening' | 'processing' | 'speaking' | 'error';

interface VoiceSessionProps {
  /** Called when a final transcript is ready — the parent sends it to the AI */
  onSendMessage: (text: string) => void;
  /** AI response text — Nova will speak it aloud then resume listening */
  pendingResponse: string | null;
  /** Called after Nova has finished speaking (clears pendingResponse in parent) */
  onResponseSpoken: () => void;
  /** End the voice session */
  onHangUp: () => void;
  /** Whether Nova is currently fetching an AI response */
  isProcessing: boolean;
}

// ─── Animations ───────────────────────────────────────────────────────────────

const ripple = keyframes`
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.2); opacity: 0;   }
`;

// ─── Web Speech API helpers ────────────────────────────────────────────────────

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const isSpeechSupported = !!SpeechRecognitionAPI;

// ─── Component ────────────────────────────────────────────────────────────────

const VoiceSession: React.FC<VoiceSessionProps> = ({
  onSendMessage,
  pendingResponse,
  onResponseSpoken,
  onHangUp,
  isProcessing,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('listening');
  const [transcript, setTranscript] = useState('');

  const recognitionRef      = useRef<any>(null);
  const utteranceRef        = useRef<SpeechSynthesisUtterance | null>(null);
  const isHungUp            = useRef(false);
  // Mirror of transcript state in a ref so recognition.onend can read the
  // current value without needing to call setState as a side-effectful reader.
  const transcriptRef       = useRef('');

  // Pin ALL callbacks in refs — prevents stale closure captures
  const onSendMessageRef    = useRef(onSendMessage);
  const onResponseSpokenRef = useRef(onResponseSpoken);
  const startListeningRef   = useRef<() => void>(() => {});

  // Keep refs current on every render (synchronous — no effect needed)
  onSendMessageRef.current    = onSendMessage;
  onResponseSpokenRef.current = onResponseSpoken;

  // ── Start listening ──────────────────────────────────────────────────────────
  // Defined as a plain function (not useCallback) and stored in a ref so it
  // never changes identity and never triggers effect re-runs.

  const startListening = () => {
    if (!isSpeechSupported || isHungUp.current) return;

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;

      recognition.lang            = 'en-US';
      recognition.continuous      = false;
      recognition.interimResults  = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let interim  = '';
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalStr += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        const text = finalStr || interim;
        transcriptRef.current = text;
        setTranscript(text);
      };

      recognition.onend = () => {
        if (isHungUp.current) return;
        // Read from ref — avoids calling a side effect inside a setState callback
        // (which React 18 Strict Mode double-invokes, causing duplicate API calls)
        const spokenText = transcriptRef.current.trim();
        transcriptRef.current = '';
        setTranscript('');
        if (spokenText) {
          onSendMessageRef.current(spokenText);
        }
      };

      recognition.onerror = (event: any) => {
        if (isHungUp.current) return;
        if (event.error === 'no-speech') {
          startListeningRef.current();
        } else {
          setVoiceState('error');
        }
      };

      setVoiceState('listening');
      recognition.start();
    } catch {
      setVoiceState('error');
    }
  };

  // Assign to ref synchronously so it's always up to date
  startListeningRef.current = startListening;

  // ── Initial start — [] deps so this NEVER re-runs on parent re-renders ───────

  useEffect(() => {
    // Unlock Chrome's speech synthesis. Chrome requires speechSynthesis.speak()
    // to be called within a user-gesture stack. We're still inside the gesture
    // that opened this component, so a silent dummy utterance here "unlocks" the
    // synthesis engine for all subsequent async calls in this session.
    const unlock = new SpeechSynthesisUtterance('');
    unlock.volume = 0;
    window.speechSynthesis.speak(unlock);
    window.speechSynthesis.cancel();

    startListeningRef.current();
    return () => {
      isHungUp.current = true;
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── React to processing state ─────────────────────────────────────────────

  useEffect(() => {
    if (isProcessing) {
      recognitionRef.current?.stop();
      setVoiceState('processing');
    }
  }, [isProcessing]);

  // ── Speak AI response then resume listening ───────────────────────────────

  useEffect(() => {
    if (!pendingResponse || isHungUp.current) return;

    const text = pendingResponse; // snapshot before any async re-render
    setVoiceState('speaking');
    window.speechSynthesis.cancel();

    const utterance      = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.rate   = 1.0;
    utterance.pitch  = 1.0;
    utterance.volume = 1.0;

    const finish = () => {
      if (isHungUp.current) return;
      clearInterval(keepAliveId);
      onResponseSpokenRef.current();
      // Small delay before listening again so browser finishes cleanup
      setTimeout(() => {
        if (!isHungUp.current) startListeningRef.current();
      }, 300);
    };
    utterance.onend   = finish;
    utterance.onerror = finish;

    const doSpeak = () => {
      const voices    = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) => v.name.toLowerCase().includes('google') && v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
      // Chrome bug workaround: pause+resume forces audio to actually start
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    };

    // Keepalive: Chrome silently stalls TTS for long responses (>~14 s) and
    // never fires onend. Nudging pause/resume every 10 s keeps it alive.
    const keepAliveId = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    }, 10000);

    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
    }

    return () => {
      clearInterval(keepAliveId);
      window.speechSynthesis.removeEventListener('voiceschanged', doSpeak);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingResponse]); // intentionally omit callbacks — they live in refs

  // ── Hang up handler ───────────────────────────────────────────────────────

  const handleHangUp = () => {
    isHungUp.current = true;
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    onHangUp();
  };

  // ── State config ──────────────────────────────────────────────────────────

  const stateConfig = {
    listening:  { label: 'Listening...',        color: '#00B5DF', icon: <MicIcon sx={{ fontSize: 28, color: 'white' }} /> },
    processing: { label: 'Nova is thinking...', color: '#003063', icon: <SmartToyIcon sx={{ fontSize: 28, color: 'white' }} /> },
    speaking:   { label: 'Nova is speaking...', color: '#00B5DF', icon: <SmartToyIcon sx={{ fontSize: 28, color: 'white' }} /> },
    error:      { label: 'Mic unavailable',     color: '#ef4444', icon: <MicIcon sx={{ fontSize: 28, color: 'white' }} /> },
  };

  const cfg = stateConfig[voiceState];

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        background: 'linear-gradient(135deg, #003063 0%, #00B5DF 100%)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.25)',
        borderRadius: '16px 16px 0 0',
        px: 3,
        py: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Orb with ripple */}
      <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {voiceState === 'listening' && [0, 0.5].map((delay, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: 52,
              height: 52,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.6)',
              animation: `${ripple} 1.6s ease-out ${delay}s infinite`,
            }}
          />
        ))}
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cfg.icon}
        </Box>
      </Box>

      {/* Text area */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500, mb: 0.25 }}>
          {cfg.label}
        </Typography>
        {transcript && voiceState === 'listening' && (
          <Typography
            noWrap
            sx={{ color: 'white', fontSize: 14, fontStyle: 'italic' }}
          >
            "{transcript}"
          </Typography>
        )}
        {!isSpeechSupported && (
          <Typography sx={{ color: '#fbbf24', fontSize: 12 }}>
            Use Chrome or Edge for voice support.
          </Typography>
        )}
      </Box>

      {/* Hang Up button */}
      <IconButton
        onClick={handleHangUp}
        aria-label="End voice session"
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          color: 'white',
          flexShrink: 0,
          '&:hover': { backgroundColor: '#dc2626' },
          transition: 'background-color 0.2s ease',
        }}
      >
        <CallEndIcon sx={{ fontSize: 22 }} />
      </IconButton>
    </Box>
  );
};

export default VoiceSession;
