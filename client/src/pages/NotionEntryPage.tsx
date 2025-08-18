import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Heart, 
  BookOpen, 
  FileText,
  Sparkles,
  Image,
  Clock
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

const TYPE_ICONS = {
  memory: <Heart className="w-5 h-5" />,
  event: <Calendar className="w-5 h-5" />,
  note: <FileText className="w-5 h-5" />,
  reflection: <BookOpen className="w-5 h-5" />,
};

const TYPE_COLORS = {
  memory: 'bg-pink-50 text-pink-700 border-pink-200',
  event: 'bg-blue-50 text-blue-700 border-blue-200',
  note: 'bg-green-50 text-green-700 border-green-200',
  reflection: 'bg-purple-50 text-purple-700 border-purple-200',
};

const TONE_COLORS = {
  joyful: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  melancholic: 'bg-blue-100 text-blue-800 border-blue-300',
  passionate: 'bg-red-100 text-red-800 border-red-300',
  nostalgic: 'bg-amber-100 text-amber-800 border-amber-300',
  inspiring: 'bg-green-100 text-green-800 border-green-300',
  contemplative: 'bg-purple-100 text-purple-800 border-purple-300',
};

export function NotionEntryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: entry, isLoading, error } = useQuery<NotionEntry>({
    queryKey: ['/api/notion/entries', slug],
    queryFn: async () => {
      const response = await fetch(`/api/notion/entries/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Entry not found');
        }
        throw new Error('Failed to fetch entry');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!slug,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBodyText = (text: string) => {
    // Simple markdown-like formatting
    return text
      .split('\n\n')
      .map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0">
          {paragraph}
        </p>
      ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-12 bg-gray-200 rounded w-3/4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Story not found
            </h2>
            <p className="text-gray-600 mb-6">
              The story you're looking for doesn't exist or may have been removed.
            </p>
            <Link href="/notion">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Stories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <Link href="/notion">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-2 ${TYPE_COLORS[entry.type?.toLowerCase() as keyof typeof TYPE_COLORS] || 'bg-gray-50 text-gray-700'}`}
                >
                  {TYPE_ICONS[entry.type?.toLowerCase() as keyof typeof TYPE_ICONS] || <FileText className="w-4 h-4" />}
                  {entry.type?.charAt(0).toUpperCase() + entry.type?.slice(1)}
                </Badge>
                
                {entry.emotionalTone && (
                  <Badge 
                    variant="secondary" 
                    className={`${TONE_COLORS[entry.emotionalTone.toLowerCase() as keyof typeof TONE_COLORS] || 'bg-gray-100 text-gray-700'}`}
                  >
                    {entry.emotionalTone}
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {entry.title}
              </h1>

              {entry.summary && (
                <p className="text-xl text-gray-600 mb-4 font-medium">
                  {entry.summary}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(entry.createdAt)}
                </div>
                {entry.createdAt !== entry.updatedAt && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Updated {formatDate(entry.updatedAt)}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span className="text-sm text-gray-500">Notion</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Body Content */}
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  {entry.body ? (
                    <div className="text-gray-700 leading-relaxed">
                      {formatBodyText(entry.body)}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No content available for this entry.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Image Prompt */}
            {entry.imagePrompt && (
              <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Image className="w-5 h-5" />
                    Suggested Image Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-100">
                    <p className="text-gray-700 italic">
                      "{entry.imagePrompt}"
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Use this prompt with AI image generators to create visuals for this story
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <Card className="animate-in fade-in slide-in-from-right-4 duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tag className="w-5 h-5" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata */}
            <Card className="animate-in fade-in slide-in-from-right-4 duration-700">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    {TYPE_ICONS[entry.type?.toLowerCase() as keyof typeof TYPE_ICONS] || <FileText className="w-4 h-4" />}
                    <span className="text-sm">{entry.type?.charAt(0).toUpperCase() + entry.type?.slice(1)}</span>
                  </div>
                </div>

                {entry.emotionalTone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Emotional Tone</label>
                    <p className="text-sm mt-1 capitalize">{entry.emotionalTone}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Visibility</label>
                  <p className="text-sm mt-1 capitalize">{entry.visibility}</p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm mt-1">{formatDate(entry.createdAt)}</p>
                </div>

                {entry.createdAt !== entry.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm mt-1">{formatDate(entry.updatedAt)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Back to Homepage */}
            <Card className="animate-in fade-in slide-in-from-right-4 duration-1000">
              <CardContent className="p-4">
                <Link href="/notion">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Explore More Stories
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}