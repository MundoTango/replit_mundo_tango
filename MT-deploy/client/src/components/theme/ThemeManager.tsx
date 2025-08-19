import React, { useState } from 'react';
import { useTheme } from '../../lib/theme/theme-provider';
import { Palette, Sparkles, Eye, Moon, Sun, Globe, Shield } from 'lucide-react';

const ThemeManager: React.FC = () => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return <Shield className="w-4 h-4" />;
      case 'personal': return <Eye className="w-4 h-4" />;
      case 'cultural': return <Globe className="w-4 h-4" />;
      case 'agent': return <Sparkles className="w-4 h-4" />;
      case 'accessibility': return <Sun className="w-4 h-4" />;
      default: return <Palette className="w-4 h-4" />;
    }
  };

  const groupedThemes = availableThemes.reduce((acc, theme) => {
    if (!acc[theme.category]) {
      acc[theme.category] = [];
    }
    acc[theme.category].push(theme);
    return acc;
  }, {} as Record<string, typeof availableThemes>);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isExpanded ? (
        // Collapsed Theme Toggle Button
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 group"
          title="Change Theme"
        >
          <Palette className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-blue-500 transition-colors" />
        </button>
      ) : (
        // Expanded Theme Selector
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-80 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Choose Theme
              </h3>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Current Theme Preview */}
          <div className="mb-4 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex-shrink-0"
                style={{ background: currentTheme.preview }}
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {currentTheme.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {currentTheme.description}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Categories */}
          {Object.entries(groupedThemes).map(([category, themes]) => (
            <div key={category} className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(category)}
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {category}
                </h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setTheme(theme.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 group hover:shadow-md ${
                      currentTheme.id === theme.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ background: theme.preview }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {theme.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                      {theme.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quick Actions */}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
            <div className="flex gap-2">
              <button
                onClick={() => setTheme('mundo-tango')}
                className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-lg hover:from-pink-600 hover:to-blue-600 transition-all"
              >
                Default
              </button>
              <button
                onClick={() => setTheme('life-ceo')}
                className="flex-1 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                Executive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeManager;