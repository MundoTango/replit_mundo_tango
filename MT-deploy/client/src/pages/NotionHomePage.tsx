import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Heart, 
  BookOpen, 
  FileText,
  Sparkles
} from 'lucide-react';

interface NotionEntry {
  id: string;
  title: string;
  slug: string;
  type: string;
  body: string;
  tags: string[];
  emotionalTone: string;
  visibility: string;
  summary: string;
  imagePrompt: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  types: string[];
  tags: string[];
  emotionalTones: string[];
}

const TYPE_ICONS = {
  memory: <Heart className="w-4 h-4" />,
  event: <Calendar className="w-4 h-4" />,
  note: <FileText className="w-4 h-4" />,
  reflection: <BookOpen className="w-4 h-4" />,
};

const TYPE_COLORS = {
  memory: 'bg-pink-50 text-pink-700 border-pink-200',
  event: 'bg-blue-50 text-blue-700 border-blue-200',
  note: 'bg-green-50 text-green-700 border-green-200',
  reflection: 'bg-purple-50 text-purple-700 border-purple-200',
};

const TONE_COLORS = {
  joyful: 'bg-yellow-100 text-yellow-800',
  melancholic: 'bg-blue-100 text-blue-800',
  passionate: 'bg-red-100 text-red-800',
  nostalgic: 'bg-amber-100 text-amber-800',
  inspiring: 'bg-green-100 text-green-800',
  contemplative: 'bg-purple-100 text-purple-800',
};

export function NotionHomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch filter options
  const { data: filterOptions } = useQuery<FilterOptions>({
    queryKey: ['/api/notion/filters'],
    queryFn: async () => {
      const response = await fetch('/api/notion/filters');
      if (!response.ok) throw new Error('Failed to fetch filter options');
      const result = await response.json();
      return result.data;
    },
  });

  // Build query parameters for filtering
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set('visibility', 'Public'); // Only show public entries
    
    if (selectedType) params.set('type', selectedType);
    if (selectedTone) params.set('emotionalTone', selectedTone);
    if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));
    
    return params.toString();
  };

  // Fetch entries with filters
  const { data: entries, isLoading } = useQuery<NotionEntry[]>({
    queryKey: ['/api/notion/entries', selectedType, selectedTone, selectedTags],
    queryFn: async () => {
      const queryParams = buildQueryParams();
      const response = await fetch(`/api/notion/entries?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch entries');
      const result = await response.json();
      return result.data;
    },
  });

  // Filter entries by search term (client-side)
  const filteredEntries = entries?.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Group entries by type
  const groupedEntries = filteredEntries.reduce((acc: Record<string, NotionEntry[]>, entry) => {
    const type = entry.type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(entry);
    return acc;
  }, {});

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedType('');
    setSelectedTone('');
    setSelectedTags([]);
    setSearchTerm('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Mundo Tango Stories
              </h1>
              <p className="text-gray-600">
                Discover memories, events, and reflections from our global tango community
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-rose-500" />
              <span className="text-sm text-gray-500">Powered by Notion</span>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search stories, memories, and events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              {(selectedType || selectedTone || selectedTags.length > 0) && (
                <Button variant="ghost" onClick={clearFilters} size="sm">
                  Clear All
                </Button>
              )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="animate-in slide-in-from-top-2 duration-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Type</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All types</SelectItem>
                          {filterOptions?.types.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Emotional Tone</Label>
                      <Select value={selectedTone} onValueChange={setSelectedTone}>
                        <SelectTrigger>
                          <SelectValue placeholder="All tones" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All tones</SelectItem>
                          {filterOptions?.emotionalTones.map(tone => (
                            <SelectItem key={tone} value={tone}>
                              {tone.charAt(0).toUpperCase() + tone.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1 max-h-24 overflow-y-auto">
                        {filterOptions?.tags.map(tag => (
                          <Button
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTagToggle(tag)}
                            className="text-xs"
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4" />
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : Object.keys(groupedEntries).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([type, typeEntries]) => (
              <div key={type} className="animate-in fade-in duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    {TYPE_ICONS[type.toLowerCase() as keyof typeof TYPE_ICONS] || <FileText className="w-5 h-5" />}
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {type.charAt(0).toUpperCase() + type.slice(1)}s
                    </h2>
                  </div>
                  <Badge variant="outline">{typeEntries.length}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {typeEntries.map((entry, index) => (
                    <Link key={entry.id} href={`/${entry.slug}`}>
                      <Card 
                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg group-hover:text-rose-600 transition-colors line-clamp-2">
                              {entry.title}
                            </CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`flex items-center gap-1 flex-shrink-0 ${TYPE_COLORS[entry.type.toLowerCase() as keyof typeof TYPE_COLORS] || 'bg-gray-50 text-gray-700'}`}
                            >
                              {TYPE_ICONS[entry.type.toLowerCase() as keyof typeof TYPE_ICONS]}
                              {entry.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {entry.summary && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                              {entry.summary}
                            </p>
                          )}

                          <div className="space-y-3">
                            {entry.emotionalTone && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${TONE_COLORS[entry.emotionalTone.toLowerCase() as keyof typeof TONE_COLORS] || 'bg-gray-100 text-gray-700'}`}
                              >
                                {entry.emotionalTone}
                              </Badge>
                            )}

                            {entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                                {entry.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{entry.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div className="text-xs text-gray-500 pt-2 border-t">
                              {formatDate(entry.createdAt)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No stories found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find more stories.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}