import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe2, Check, Sparkles, Languages } from 'lucide-react';
import { changeLanguage } from '@/i18n/config';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'list';
  showFlags?: boolean;
  groupByRegion?: boolean;
  className?: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  country: string;
  isActive: boolean;
  isLunfardo?: boolean;
}

interface UserLanguagePreference {
  id: number;
  userId: number;
  primaryLanguage: string;
  additionalLanguages: string[];
  preferredContentLanguages: string[];
  autoTranslate: boolean;
  showOriginalContent: boolean;
  translationQualityThreshold: number;
}

const LanguageSelector = ({ 
  variant = 'dropdown', 
  showFlags = true,
  groupByRegion = true,
  className = '' 
}: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();
  const [isChanging, setIsChanging] = useState(false);

  // Fetch supported languages from API
  const { data: supportedLanguages = [] } = useQuery<Language[]>({
    queryKey: ['/api/languages/supported'],
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch user's language preferences
  const { data: userPreferences } = useQuery<UserLanguagePreference>({
    queryKey: ['/api/languages/preferences'],
  });

  // Update language preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: Partial<UserLanguagePreference>) =>
      apiRequest('/api/languages/preferences', { method: 'PUT', body: preferences }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/languages/preferences'] });
    },
  });

  // Track language analytics mutation
  const trackAnalyticsMutation = useMutation({
    mutationFn: (data: { action: string; languageCode: string; metadata?: any }) =>
      apiRequest('/api/languages/analytics', { method: 'POST', body: data }),
  });

  const userLanguages = userPreferences?.additionalLanguages || [];

  const handleLanguageChange = async (languageCode: string) => {
    setIsChanging(true);
    try {
      // Change language in i18n
      await changeLanguage(languageCode);
      
      // Update user preferences on backend
      if (userPreferences) {
        await updatePreferencesMutation.mutateAsync({
          primaryLanguage: languageCode,
          additionalLanguages: userLanguages.includes(languageCode) 
            ? userLanguages 
            : [...userLanguages, languageCode],
        });
      }
      
      // Track analytics
      await trackAnalyticsMutation.mutateAsync({
        action: 'language_changed',
        languageCode,
        metadata: {
          previousLanguage: i18n.language,
          source: variant,
        },
      });
      
      toast({
        title: t('settings.languageChanged'),
        description: t('settings.languageChangedDesc', { 
          language: supportedLanguages.find(l => l.code === languageCode)?.name 
        }),
      });
    } catch (error) {
      toast({
        title: t('errors.languageChangeFailed'),
        description: t('errors.tryAgain'),
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
    }
  };

  const getLanguageGroups = () => {
    const groups: Record<string, Language[]> = {
      'Popular': supportedLanguages.filter(lang => 
        ['en', 'es', 'es-ar', 'pt', 'fr', 'de', 'it', 'ja', 'zh'].includes(lang.code)
      ),
      'Europe': supportedLanguages.filter(lang => 
        ['fr', 'de', 'it', 'nl', 'pl', 'ru', 'el', 'sv', 'no', 'da'].includes(lang.code)
      ),
      'Americas': supportedLanguages.filter(lang => 
        ['en', 'es', 'es-ar', 'pt', 'pt-br'].includes(lang.code)
      ),
      'Asia': supportedLanguages.filter(lang => 
        ['zh', 'zh-tw', 'ja', 'ko', 'hi', 'th', 'vi', 'id'].includes(lang.code)
      ),
      'Middle East & Africa': supportedLanguages.filter(lang => 
        ['ar', 'he', 'tr', 'fa', 'af'].includes(lang.code)
      ),
      'All Languages': supportedLanguages,
    };
    return groups;
  };

  const renderLanguageItem = (lang: Language) => {
    const isSelected = i18n.language === lang.code;
    const isUserLanguage = userLanguages.includes(lang.code);
    
    return (
      <DropdownMenuItem
        key={lang.code}
        onClick={() => handleLanguageChange(lang.code)}
        className="flex items-center justify-between hover:bg-turquoise-50"
        disabled={isChanging}
      >
        <div className="flex items-center gap-2">
          {showFlags && (
            <span className="text-xl">{getFlagEmoji(lang.country)}</span>
          )}
          <span className={isSelected ? 'font-semibold text-turquoise-600' : ''}>
            {lang.name}
          </span>
          {lang.isLunfardo && (
            <Badge className="bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Lunfardo
            </Badge>
          )}
          {isUserLanguage && (
            <Badge variant="outline" className="text-xs border-turquoise-300">
              {t('common.preferred')}
            </Badge>
          )}
        </div>
        {isSelected && <Check className="w-4 h-4 text-turquoise-600" />}
      </DropdownMenuItem>
    );
  };

  const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  if (variant === 'list') {
    return (
      <div className={`glassmorphic-card p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-turquoise-400 to-cyan-500">
          {t('settings.selectLanguage')}
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {supportedLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isChanging}
              className={`
                w-full p-3 rounded-lg text-left transition-all duration-200
                ${i18n.language === lang.code 
                  ? 'bg-gradient-to-r from-turquoise-100 to-cyan-100 border-2 border-turquoise-300' 
                  : 'hover:bg-turquoise-50 border border-gray-200'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {showFlags && (
                    <span className="text-2xl">{getFlagEmoji(lang.country)}</span>
                  )}
                  <div>
                    <div className="font-medium">{lang.name}</div>
                    <div className="text-sm text-gray-500">{lang.code}</div>
                  </div>
                  {lang.isLunfardo && (
                    <Badge className="bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Lunfardo
                    </Badge>
                  )}
                </div>
                {i18n.language === lang.code && (
                  <Check className="w-5 h-5 text-turquoise-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const languageGroups = getLanguageGroups();
  const currentLanguage = supportedLanguages.find(l => l.code === i18n.language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={`flex items-center gap-2 hover:bg-turquoise-50 ${className}`}
          disabled={isChanging}
        >
          <Globe2 className="w-4 h-4" />
          {showFlags && currentLanguage && (
            <span className="text-lg">{getFlagEmoji(currentLanguage.country)}</span>
          )}
          <span className="hidden sm:inline">{currentLanguage?.name || 'Language'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 glassmorphic-card" align="end">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Languages className="w-4 h-4" />
          {t('settings.chooseLanguage')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {groupByRegion ? (
          <>
            {/* Quick access to popular languages */}
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium text-gray-500 mb-1">{t('common.popular')}</p>
              {languageGroups['Popular'].slice(0, 5).map(renderLanguageItem)}
            </div>
            <DropdownMenuSeparator />
            
            {/* All languages grouped by region */}
            {Object.entries(languageGroups).map(([region, languages]) => {
              if (region === 'Popular' || region === 'All Languages') return null;
              return (
                <DropdownMenuSub key={region}>
                  <DropdownMenuSubTrigger className="hover:bg-turquoise-50">
                    {region}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="glassmorphic-card">
                    {languages.map(renderLanguageItem)}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })}
            
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="hover:bg-turquoise-50">
                {t('settings.allLanguages')}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="glassmorphic-card max-h-96 overflow-y-auto">
                {supportedLanguages.map(renderLanguageItem)}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {supportedLanguages.map(renderLanguageItem)}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;