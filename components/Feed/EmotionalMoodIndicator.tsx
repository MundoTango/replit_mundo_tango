import React, { useState, useEffect } from 'react';
import { Heart, Music, Coffee, Sparkles, MapPin, Users } from 'lucide-react';

interface EmotionalMoodIndicatorProps {
  userRole: string[];
  currentMood?: string;
  onMoodChange?: (mood: string, context: any) => void;
  showSoftPrompts?: boolean;
}

interface MoodOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  tangoContext: string;
  sharePrompt?: string;
}

const EmotionalMoodIndicator: React.FC<EmotionalMoodIndicatorProps> = ({
  userRole = [],
  currentMood,
  onMoodChange,
  showSoftPrompts = true
}) => {
  const [selectedMood, setSelectedMood] = useState<string>(currentMood || '');
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<Date>(new Date());

  // Role-adaptive mood options
  const getMoodOptions = (): MoodOption[] => {
    const baseMoods: MoodOption[] = [
      {
        id: 'energized',
        label: 'Energized',
        icon: <Sparkles className="w-4 h-4" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        description: 'Ready to dance the night away',
        tangoContext: 'Perfect for milongas and social dancing',
        sharePrompt: 'Share your energy with the community'
      },
      {
        id: 'reflective',
        label: 'Reflective',
        icon: <Coffee className="w-4 h-4" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200',
        description: 'In a contemplative mood',
        tangoContext: 'Great for sharing insights and memories',
        sharePrompt: 'What tango moment are you reflecting on?'
      },
      {
        id: 'passionate',
        label: 'Passionate',
        icon: <Heart className="w-4 h-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        description: 'Feeling the tango passion',
        tangoContext: 'Perfect for expressing deep connection to tango',
        sharePrompt: 'Share what ignites your tango passion'
      },
      {
        id: 'musical',
        label: 'Musical',
        icon: <Music className="w-4 h-4" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200',
        description: 'Connected to the music',
        tangoContext: 'Ideal for sharing musical discoveries',
        sharePrompt: 'What tango music is moving you?'
      }
    ];

    // Add role-specific moods
    if (userRole.includes('teacher') || userRole.includes('instructor')) {
      baseMoods.push({
        id: 'nurturing',
        label: 'Nurturing',
        icon: <Users className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        description: 'Ready to guide and teach',
        tangoContext: 'Perfect for sharing teaching insights',
        sharePrompt: 'Share a teaching moment or insight'
      });
    }

    if (userRole.includes('traveler')) {
      baseMoods.push({
        id: 'wanderlust',
        label: 'Wanderlust',
        icon: <MapPin className="w-4 h-4" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 border-indigo-200',
        description: 'Dreaming of new tango destinations',
        tangoContext: 'Great for sharing travel experiences',
        sharePrompt: 'Where is tango calling you next?'
      });
    }

    return baseMoods;
  };

  const moodOptions = getMoodOptions();
  const currentMoodData = moodOptions.find(mood => mood.id === selectedMood);

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood.id);
    setLastInteraction(new Date());
    setShowMoodSelector(false);
    
    // Trigger callback with mood context for memory tagging
    onMoodChange?.(mood.id, {
      timestamp: new Date(),
      role: userRole,
      context: mood.tangoContext,
      description: mood.description,
      sharePrompt: mood.sharePrompt
    });
  };

  // Auto-hide after inactivity to prevent burnout
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showMoodSelector) {
        setShowMoodSelector(false);
      }
    }, 10000); // Hide after 10 seconds of inactivity

    return () => clearTimeout(timer);
  }, [lastInteraction, showMoodSelector]);

  return (
    <div className="relative">
      {/* Mood Display/Trigger */}
      <button
        onClick={() => setShowMoodSelector(!showMoodSelector)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:shadow-md ${
          currentMoodData 
            ? currentMoodData.bgColor 
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
      >
        {currentMoodData ? (
          <>
            <span className={currentMoodData.color}>
              {currentMoodData.icon}
            </span>
            <span className={`text-sm font-medium ${currentMoodData.color}`}>
              {currentMoodData.label}
            </span>
          </>
        ) : (
          <>
            <Heart className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">How are you feeling?</span>
          </>
        )}
      </button>

      {/* Mood Selector Dropdown */}
      {showMoodSelector && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-1">How are you feeling today?</h3>
            <p className="text-xs text-gray-500">Your mood helps us surface relevant content and connections</p>
          </div>
          
          <div className="p-2 max-h-64 overflow-y-auto">
            {moodOptions.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedMood === mood.id ? mood.bgColor : ''
                }`}
              >
                <span className={mood.color}>
                  {mood.icon}
                </span>
                <div className="flex-1 text-left">
                  <div className={`font-medium text-sm ${mood.color}`}>
                    {mood.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {mood.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 italic">
                    {mood.tangoContext}
                  </div>
                </div>
              </button>
            ))}
          </div>
          
          {showSoftPrompts && currentMoodData?.sharePrompt && (
            <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 border-t border-gray-100">
              <p className="text-xs text-gray-600 italic">
                💭 {currentMoodData.sharePrompt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmotionalMoodIndicator;