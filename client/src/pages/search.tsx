import { useState, useCallback, useEffect } from 'react';
import { Search as SearchIcon, Users, Calendar, MapPin, FileText, Loader2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useDebounce } from '@/hooks/use-debounce';
import { Link } from 'wouter';
import { format } from 'date-fns';

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'event' | 'group';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  link: string;
  metadata?: Record<string, any>;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'users' | 'posts' | 'events' | 'groups'>('all');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: searchResults, isLoading } = useQuery<{ results: SearchResult[] }>({
    queryKey: ['/api/search', debouncedQuery, activeFilter],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { results: [] };
      
      const response = await apiRequest('/api/search', {
        method: 'POST',
        body: {
          query: debouncedQuery,
          filter: activeFilter
        }
      });
      return response;
    },
    enabled: debouncedQuery.length > 0
  });

  const filters = [
    { value: 'all', label: 'All', icon: SearchIcon },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'posts', label: 'Posts', icon: FileText },
    { value: 'events', label: 'Events', icon: Calendar },
    { value: 'groups', label: 'Groups', icon: MapPin }
  ];

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-5 w-5" />;
      case 'post': return <FileText className="h-5 w-5" />;
      case 'event': return <Calendar className="h-5 w-5" />;
      case 'group': return <MapPin className="h-5 w-5" />;
      default: return <SearchIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="glassmorphic-card bg-white/70 backdrop-blur-xl border-b border-white/50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-turquoise-400 to-cyan-500 bg-clip-text text-transparent mb-6">
            Search Mundo Tango
          </h1>
          
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for users, posts, events, or groups..."
              className="w-full pl-12 pr-12 py-4 glassmorphic-card bg-white/80 backdrop-blur-xl border border-turquoise-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-turquoise-400 focus:border-transparent text-lg"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value as any)}
                  className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 ${
                    activeFilter === filter.value
                      ? 'bg-gradient-to-r from-turquoise-400 to-cyan-500 text-white shadow-lg'
                      : 'glassmorphic-card bg-white/60 hover:bg-white/80 text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading && debouncedQuery && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-turquoise-500" />
          </div>
        )}

        {!isLoading && !debouncedQuery && (
          <div className="text-center py-12">
            <div className="glassmorphic-card bg-white/60 backdrop-blur-xl rounded-3xl p-12 max-w-md mx-auto">
              <SearchIcon className="h-16 w-16 text-turquoise-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Start typing to search</h2>
              <p className="text-gray-600">Find users, posts, events, and groups across Mundo Tango</p>
            </div>
          </div>
        )}

        {!isLoading && debouncedQuery && searchResults?.results?.length === 0 && (
          <div className="text-center py-12">
            <div className="glassmorphic-card bg-white/60 backdrop-blur-xl rounded-3xl p-12 max-w-md mx-auto">
              <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No results found</h2>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          </div>
        )}

        {searchResults?.results && searchResults.results.length > 0 && (
          <div className="space-y-4">
            {searchResults.results.map((result: SearchResult) => (
              <Link key={`${result.type}-${result.id}`} href={result.link}>
                <div className="glassmorphic-card bg-white/70 backdrop-blur-xl rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* Icon or Image */}
                    <div className="flex-shrink-0">
                      {result.imageUrl ? (
                        <img
                          src={result.imageUrl}
                          alt={result.title}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-r from-turquoise-400 to-cyan-500 rounded-xl flex items-center justify-center text-white">
                          {getResultIcon(result.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-turquoise-600 uppercase tracking-wider">
                          {result.type}
                        </span>
                        {result.metadata?.date && (
                          <span className="text-xs text-gray-500">
                            • {formatDate(result.metadata.date)}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {result.title}
                      </h3>
                      {result.subtitle && (
                        <p className="text-gray-600 mt-1 line-clamp-2">
                          {result.subtitle}
                        </p>
                      )}
                      {result.metadata && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {result.metadata.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {result.metadata.location}
                            </span>
                          )}
                          {result.metadata.memberCount && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {result.metadata.memberCount} members
                            </span>
                          )}
                          {result.metadata.attendeeCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {result.metadata.attendeeCount} attending
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}