import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Mic, MicOff, Volume2, Globe, Brain, Calendar, Heart, DollarSign, Shield, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function LifeCEO() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [activeAgents, setActiveAgents] = useState([
    { name: 'Business Agent', status: 'active', icon: '💼' },
    { name: 'Finance Agent', status: 'active', icon: '💰' },
    { name: 'Health Agent', status: 'active', icon: '❤️' },
  ]);

  // Check if user is super admin
  const isSuperAdmin = user?.roles?.includes('super_admin') || user?.tangoRoles?.includes('super_admin');

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error('Access denied. Life CEO is only available for super administrators.');
      setLocation('/moments');
      return;
    }

    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language === 'en' ? 'en-US' : 'es-ES';

      recognitionInstance.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [isSuperAdmin, language, setLocation]);

  const toggleRecording = () => {
    if (!recognition) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      if (transcript.trim()) {
        processVoiceCommand(transcript);
      }
    } else {
      setTranscript('');
      recognition.start();
      setIsRecording(true);
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:4001/api/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command, 
          userId: user?.id || 1, 
          language 
        })
      });
      
      const data = await response.json();
      setResponse(data.response || 'Processing your request...');
      
      // Text-to-speech response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = language === 'en' ? 'en-US' : 'es-ES';
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast.error('Failed to process voice command');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/profile-switcher')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Life CEO</h1>
              <p className="text-xs text-gray-500">AI Life Management System</p>
            </div>
          </div>
          
          {/* Language Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                language === 'en' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                language === 'es' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              ES
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Agent Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {activeAgents.map((agent) => (
            <Card key={agent.name} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </Card>
          ))}
        </div>

        {/* Voice Interface */}
        <Card className="p-8 mb-6">
          <div className="text-center">
            {/* Recording Button */}
            <button
              onClick={toggleRecording}
              disabled={isProcessing}
              className={`w-32 h-32 rounded-full transition-all transform ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
              } text-white shadow-lg hover:shadow-xl disabled:opacity-50`}
            >
              {isRecording ? (
                <MicOff className="w-12 h-12 mx-auto" />
              ) : (
                <Mic className="w-12 h-12 mx-auto" />
              )}
            </button>
            
            <p className="mt-4 text-sm text-gray-600">
              {isRecording 
                ? language === 'en' ? 'Listening...' : 'Escuchando...'
                : language === 'en' ? 'Tap to speak' : 'Toca para hablar'
              }
            </p>

            {/* Transcript */}
            {transcript && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                <p className="text-sm text-gray-700">
                  <strong>{language === 'en' ? 'You said:' : 'Dijiste:'}</strong> {transcript}
                </p>
              </div>
            )}

            {/* Response */}
            {response && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg text-left">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-purple-900">{response}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Tasks Today</p>
                <p className="text-xl font-bold">8</p>
              </div>
              <Calendar className="w-6 h-6 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Health Score</p>
                <p className="text-xl font-bold">92%</p>
              </div>
              <Heart className="w-6 h-6 text-red-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Budget</p>
                <p className="text-xl font-bold">Good</p>
              </div>
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Security</p>
                <p className="text-xl font-bold">Safe</p>
              </div>
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}