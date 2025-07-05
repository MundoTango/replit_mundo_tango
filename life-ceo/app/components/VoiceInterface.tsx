// Voice Interface Component
import React, { useState, useEffect, useRef } from 'react';

interface VoiceInterfaceProps {
  onCommand: (command: string) => Promise<any>;
  onClose: () => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onCommand, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-AR'; // Buenos Aires Spanish

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        
        if (event.results[current].isFinal) {
          handleCommand(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleCommand = async (command: string) => {
    setIsProcessing(true);
    try {
      const result = await onCommand(command);
      setResponse(result.response || 'Command processed');
      
      // Speak response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(result.response);
        utterance.lang = 'es-AR';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setResponse('Sorry, I couldn\'t process that command');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="voice-interface">
      <div className="voice-header">
        <h2>Life CEO Voice Assistant</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="voice-content">
        <div className="voice-visualizer">
          <div className={`voice-circle ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
        </div>

        <div className="voice-status">
          {isListening && <p className="status-text">Listening...</p>}
          {isProcessing && <p className="status-text">Processing...</p>}
          {!isListening && !isProcessing && <p className="status-text">Tap to speak</p>}
        </div>

        {transcript && (
          <div className="transcript">
            <p className="transcript-label">You said:</p>
            <p className="transcript-text">{transcript}</p>
          </div>
        )}

        {response && (
          <div className="response">
            <p className="response-label">Life CEO:</p>
            <p className="response-text">{response}</p>
          </div>
        )}
      </div>

      <div className="voice-controls">
        <button
          className={`voice-button ${isListening ? 'active' : ''}`}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          onMouseDown={startListening}
          onMouseUp={stopListening}
          disabled={isProcessing}
        >
          {isListening ? '🎤' : '🎙️'}
        </button>
      </div>

      <style jsx>{`
        .voice-interface {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .voice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.2);
        }

        .voice-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .voice-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .voice-visualizer {
          position: relative;
          width: 200px;
          height: 200px;
          margin-bottom: 40px;
        }

        .voice-circle {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: all 0.3s ease;
        }

        .voice-circle.listening {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .voice-circle.processing {
          background: rgba(255, 200, 0, 0.3);
        }

        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          animation: pulse 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        .pulse-ring:nth-child(2) {
          animation-delay: 0.5s;
        }

        .pulse-ring:nth-child(3) {
          animation-delay: 1s;
        }

        .voice-circle.listening .pulse-ring {
          animation-duration: 1s;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        .voice-status {
          margin-bottom: 30px;
        }

        .status-text {
          font-size: 18px;
          opacity: 0.8;
          text-align: center;
        }

        .transcript,
        .response {
          width: 100%;
          max-width: 400px;
          margin-bottom: 20px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        .transcript-label,
        .response-label {
          font-size: 14px;
          opacity: 0.7;
          margin-bottom: 5px;
        }

        .transcript-text,
        .response-text {
          font-size: 16px;
          line-height: 1.5;
        }

        .voice-controls {
          padding: 20px;
          display: flex;
          justify-content: center;
        }

        .voice-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 40px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .voice-button:active,
        .voice-button.active {
          background: rgba(255, 100, 100, 0.5);
          transform: scale(0.95);
        }

        .voice-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};