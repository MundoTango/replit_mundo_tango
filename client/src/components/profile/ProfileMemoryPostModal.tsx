import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BeautifulPostCreator from '@/components/universal/BeautifulPostCreator';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, PenLine, MapPin, Heart, Star } from 'lucide-react';

interface ProfileMemoryPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemoryCreated?: () => void;
}

export const ProfileMemoryPostModal: React.FC<ProfileMemoryPostModalProps> = ({ 
  isOpen, 
  onClose,
  onMemoryCreated 
}) => {
  const { user } = useAuth();
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const memoryPrompts = [
    {
      id: 'dance',
      icon: <Star className="w-5 h-5" />,
      title: "Dance Memory",
      prompt: "Share a memorable dance experience...",
      color: "from-purple-400 to-pink-500"
    },
    {
      id: 'travel',
      icon: <MapPin className="w-5 h-5" />,
      title: "Travel Memory",
      prompt: "Tell us about your tango travels...",
      color: "from-turquoise-400 to-cyan-500"
    },
    {
      id: 'connection',
      icon: <Heart className="w-5 h-5" />,
      title: "Connection Memory",
      prompt: "Share a special connection you made...",
      color: "from-pink-400 to-red-500"
    },
    {
      id: 'learning',
      icon: <PenLine className="w-5 h-5" />,
      title: "Learning Memory",
      prompt: "What have you learned in tango?",
      color: "from-blue-400 to-indigo-500"
    }
  ];

  const handleMemoryCreated = () => {
    onMemoryCreated?.();
    onClose();
    setSelectedPrompt(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-br from-turquoise-50/50 to-cyan-50/50 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                Create a Memory
              </span>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Memory Prompts */}
          {!selectedPrompt && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                What kind of memory would you like to share?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {memoryPrompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-turquoise-200"
                    onClick={() => setSelectedPrompt(prompt.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-gradient-to-r ${prompt.color} rounded-lg`}>
                        <div className="text-white">{prompt.icon}</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{prompt.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{prompt.prompt}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPrompt('custom')}
                  className="text-turquoise-600 hover:text-turquoise-700"
                >
                  Or write your own memory...
                </Button>
              </div>
            </div>
          )}

          {/* Post Creator */}
          {selectedPrompt && (
            <div className="animate-in">
              {selectedPrompt !== 'custom' && (
                <div className="mb-4 p-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Prompt:</span>{' '}
                    {memoryPrompts.find(p => p.id === selectedPrompt)?.prompt}
                  </p>
                </div>
              )}
              
              <BeautifulPostCreator
                context={{ type: 'memory' }}
                user={user}
                onPostCreated={handleMemoryCreated}
              />

              <div className="mt-4 flex justify-start">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPrompt(null)}
                  className="text-gray-600"
                >
                  ← Back to prompts
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};