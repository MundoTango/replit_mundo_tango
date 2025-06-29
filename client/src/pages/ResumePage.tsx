import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ResumeEntry {
  event_id: number;
  event_name: string;
  event_date: string;
  event_location: string;
  role: string;
  accepted_at: string;
}

interface GroupedResume {
  [year: string]: ResumeEntry[];
}

export default function ResumePage() {
  const { user } = useAuth();

  const { data: resumeData, isLoading, error } = useQuery({
    queryKey: ['/api/resume', user?.id],
    queryFn: async () => {
      console.log('🎯 Fetching resume data for user:', user?.id);
      const response = await fetch('/api/resume', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Resume API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Resume API error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📋 Resume data received:', data);
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E142E]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading resume data</p>
      </div>
    );
  }

  const resumeEntries = resumeData?.data || [];

  if (resumeEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No resume entries yet</h3>
        <p className="text-gray-600">Tag yourself or get tagged at events to build your tango resume.</p>
      </div>
    );
  }

  // Group resume entries by year
  const groupedResume: GroupedResume = resumeEntries.reduce((acc: GroupedResume, entry: ResumeEntry) => {
    const year = format(parseISO(entry.event_date), 'yyyy');
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(entry);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(groupedResume).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tango Resume</h1>
        <p className="text-gray-600">Professional experience in the tango community</p>
      </div>

      {/* Resume Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#8E142E]">{resumeEntries.length}</div>
            <div className="text-xs text-gray-600">Total Roles</div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#8E142E]">
              {new Set(resumeEntries.map((entry: ResumeEntry) => entry.event_id)).size}
            </div>
            <div className="text-xs text-gray-600">Events Participated</div>
          </CardContent>
        </Card>
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#8E142E]">
              {new Set(resumeEntries.map((entry: ResumeEntry) => entry.role)).size}
            </div>
            <div className="text-xs text-gray-600">Unique Roles</div>
          </CardContent>
        </Card>
      </div>

      {/* Resume by Year */}
      <div className="space-y-8">
        {sortedYears.map((year) => (
          <div key={year}>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{year}</h2>
            <div className="space-y-4">
              {groupedResume[year]
                .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
                .map((entry, index) => (
                  <Card key={`${entry.event_id}-${entry.role}-${index}`} className="bg-white rounded-xl shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                            {entry.event_name}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(parseISO(entry.event_date), 'PPP')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{entry.event_location}</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="ml-4 border-[#8E142E] text-[#8E142E] badge"
                        >
                          {entry.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-gray-600">
                        Confirmed on {format(parseISO(entry.accepted_at), 'PPP')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}