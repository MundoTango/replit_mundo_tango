import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Mic, MicOff, Volume2, Globe, Brain, Calendar, Heart, DollarSign, Shield, Send, Plus, Search, FolderOpen, MessageSquare, Settings, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  conversations: string[];
  createdAt: Date;
}

export default function LifeCEOEnhanced() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const deferredPromptRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [activeAgents, setActiveAgents] = useState([
    { name: 'Business Agent', status: 'active', icon: '💼' },
    { name: 'Finance Agent', status: 'active', icon: '💰' },
    { name: 'Health Agent', status: 'active', icon: '❤️' },
  ]);

  // Check if user is super admin
  const isSuperAdmin = user?.roles?.includes('super_admin') || user?.tangoRoles?.includes('super_admin');

  // Register service worker and handle PWA installation
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Handle PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setIsInstallPromptVisible(true);
    });
  }, []);

  // Load conversations and projects from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('life-ceo-conversations');
    const savedProjects = localStorage.getItem('life-ceo-projects');
    
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    } else {
      // Create default conversation
      const defaultConvo: Conversation = {
        id: 'default',
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setConversations([defaultConvo]);
      setActiveConversationId('default');
    }
    
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  // Save conversations and projects to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('life-ceo-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('life-ceo-projects', JSON.stringify(projects));
    }
  }, [projects]);

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error('Access denied. Life CEO is only available for super administrators.');
      setLocation('/moments');
      return;
    }

    // Initialize audio context for noise suppression
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Initialize speech recognition with enhanced settings
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language === 'en' ? 'en-US' : 'es-ES';
      recognitionInstance.maxAlternatives = 3;

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
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [isSuperAdmin, language, setLocation]);

  // Handle PWA installation
  const handleInstallPWA = async () => {
    if (deferredPromptRef.current) {
      deferredPromptRef.current.prompt();
      const { outcome } = await deferredPromptRef.current.userChoice;
      if (outcome === 'accepted') {
        toast.success('Life CEO app installed successfully!');
      }
      deferredPromptRef.current = null;
      setIsInstallPromptVisible(false);
    }
  };

  // Create new conversation
  const createNewConversation = () => {
    const newConvo: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: activeProjectId
    };
    setConversations([...conversations, newConvo]);
    setActiveConversationId(newConvo.id);
  };

  // Create new project
  const createNewProject = () => {
    const name = prompt('Enter project name:');
    if (name) {
      const newProject: Project = {
        id: Date.now().toString(),
        name,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        icon: '📁',
        conversations: [],
        createdAt: new Date()
      };
      setProjects([...projects, newProject]);
    }
  };

  // Enhanced voice recording with noise suppression
  const toggleRecording = async () => {
    if (isRecording) {
      recognition?.stop();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    } else {
      try {
        // Request microphone with noise suppression
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          } 
        });
        
        mediaStreamRef.current = stream;
        
        // Apply additional noise filtering if needed
        if (audioContextRef.current) {
          const source = audioContextRef.current.createMediaStreamSource(stream);
          const analyser = audioContextRef.current.createAnalyser();
          analyser.fftSize = 2048;
          source.connect(analyser);
        }
        
        recognition?.start();
        setIsRecording(true);
        setTranscript('');
      } catch (error) {
        toast.error('Failed to access microphone');
        console.error('Microphone error:', error);
      }
    }
  };

  // Send message to Life CEO backend
  const sendMessage = async () => {
    if (!transcript.trim() && !response.trim()) return;

    const currentConvo = conversations.find(c => c.id === activeConversationId);
    if (!currentConvo) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcript.trim(),
      timestamp: new Date()
    };

    const updatedConvo = {
      ...currentConvo,
      messages: [...currentConvo.messages, userMessage],
      updatedAt: new Date()
    };

    setConversations(conversations.map(c => c.id === activeConversationId ? updatedConvo : c));
    setTranscript('');
    setIsProcessing(true);

    try {
      // Use the actual Life CEO chat endpoint
      const res = await fetch('/api/life-ceo/chat/general/message', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ 
          message: userMessage.content
        })
      });

      const data = await res.json();
      
      if (data.success && data.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response || data.data.content || 'I understand. How can I help you further?',
          timestamp: new Date()
        };

        const finalConvo = {
          ...updatedConvo,
          messages: [...updatedConvo.messages, assistantMessage],
          updatedAt: new Date()
        };

        setConversations(conversations.map(c => c.id === activeConversationId ? finalConvo : c));
        setResponse(assistantMessage.content);

        // Speak the response
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(assistantMessage.content);
          utterance.lang = language === 'en' ? 'en-US' : 'es-ES';
          window.speechSynthesis.speak(utterance);
        }
      } else {
        toast.error('Failed to get response from Life CEO');
      }
    } catch (error) {
      toast.error('Failed to process command');
      console.error('Command error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const filteredConversations = conversations.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!activeProjectId || c.projectId === activeProjectId)
  );

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Life CEO</h2>
            <Button
              onClick={createNewConversation}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Projects */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Projects</span>
              <Button
                onClick={createNewProject}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            {projects.map(project => (
              <div
                key={project.id}
                onClick={() => setActiveProjectId(project.id === activeProjectId ? '' : project.id)}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  activeProjectId === project.id ? 'bg-purple-50' : ''
                }`}
              >
                <span>{project.icon}</span>
                <span className="text-sm truncate">{project.name}</span>
              </div>
            ))}
          </div>

          {/* Conversations */}
          <div className="space-y-1">
            {filteredConversations.map(convo => (
              <div
                key={convo.id}
                onClick={() => setActiveConversationId(convo.id)}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                  activeConversationId === convo.id ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-sm truncate flex-1 mx-2">{convo.title}</span>
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation('/profile-switcher')}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <h1 className="text-xl font-semibold">
                {activeConversation?.title || 'Life CEO Assistant'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {isInstallPromptVisible && (
                <Button
                  onClick={handleInstallPWA}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Install App
                </Button>
              )}
              
              <Button
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                variant="outline"
                size="sm"
              >
                <Globe className="h-4 w-4 mr-2" />
                {language === 'en' ? 'EN' : 'ES'}
              </Button>
              
              <Button
                onClick={() => setShowSidebar(!showSidebar)}
                variant="ghost"
                size="sm"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConversation?.messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">Processing...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleRecording}
              size="lg"
              className={`rounded-full w-16 h-16 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            
            <div className="flex-1">
              <Input
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder={language === 'en' ? "Type or speak your command..." : "Escribe o habla tu comando..."}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isProcessing}
              />
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!transcript.trim() || isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isRecording && (
            <div className="mt-2 text-sm text-red-500 animate-pulse">
              Recording... Speak clearly
            </div>
          )}
        </div>

        {/* Agent Status Bar */}
        <div className="bg-gray-100 border-t border-gray-200 p-2">
          <div className="flex items-center justify-around">
            {activeAgents.map(agent => (
              <div key={agent.name} className="flex items-center gap-2 text-xs">
                <span>{agent.icon}</span>
                <span className="text-gray-600">{agent.name}</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}