import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Star, User, AlertCircle, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface PublicResumeEntry {
  event_name: string;
  event_date: string;
  role: string;
  location: string;
}

interface PublicResumeData {
  username: string;
  display_name: string;
  profile_image?: string;
  country?: string;
  city?: string;
  resume: PublicResumeEntry[];
}

interface GroupedResume {
  [year: string]: PublicResumeEntry[];
}

export default function PublicResumePage() {
  const { username } = useParams();

  const { data: resumeData, isLoading, error } = useQuery({
    queryKey: ['/api/public-resume', username],
    queryFn: async () => {
      console.log('🎯 Fetching public resume for username:', username);
      const response = await fetch(`/api/public-resume/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Public Resume API response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        const errorText = await response.text();
        console.error('❌ Public Resume API error:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📋 Public resume data received:', data);
      return data;
    },
    enabled: !!username,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading resume...</span>
        </div>
      </div>
    );
  }

  if (error || !resumeData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Resume not found</h3>
          <p className="text-gray-600">
            {error?.message === 'User not found' 
              ? `User @${username} not found or resume is private`
              : 'Unable to load this resume. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  const resumeEntries = resumeData.resume || [];

  if (resumeEntries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        {/* Public Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            This is the public resume of <strong>@{resumeData.username}</strong>
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {resumeData.profile_image ? (
              <img 
                src={resumeData.profile_image} 
                alt={resumeData.display_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{resumeData.display_name}</h1>
              <p className="text-gray-600">@{resumeData.username}</p>
              {(resumeData.country || resumeData.city) && (
                <p className="text-sm text-gray-500">
                  {resumeData.city && resumeData.country 
                    ? `${resumeData.city}, ${resumeData.country}`
                    : resumeData.country || resumeData.city}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resume entries yet</h3>
          <p className="text-gray-600">This user hasn't participated in any public events yet.</p>
        </div>
      </div>
    );
  }

  // Group resume entries by year
  const groupedResume: GroupedResume = resumeEntries.reduce((acc: GroupedResume, entry: PublicResumeEntry) => {
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
      {/* Public Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          This is the public resume of <strong>@{resumeData.username}</strong>
        </p>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          {resumeData.profile_image ? (
            <img 
              src={resumeData.profile_image} 
              alt={resumeData.display_name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{resumeData.display_name}</h1>
            <p className="text-gray-600">@{resumeData.username}</p>
            {(resumeData.country || resumeData.city) && (
              <p className="text-sm text-gray-500">
                {resumeData.city && resumeData.country 
                  ? `${resumeData.city}, ${resumeData.country}`
                  : resumeData.country || resumeData.city}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resume Statistics */}
      <div className="mb-8">
        <Card className="bg-white rounded-xl shadow-md">
          <CardContent className="p-4">
            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8E142E]">{resumeEntries.length}</div>
                <div className="text-sm text-gray-600">Total Roles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8E142E]">
                  {new Set(resumeEntries.map(entry => entry.event_name)).size}
                </div>
                <div className="text-sm text-gray-600">Events Participated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#8E142E]">
                  {new Set(resumeEntries.map(entry => entry.role)).size}
                </div>
                <div className="text-sm text-gray-600">Unique Roles</div>
              </div>
            </div>
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
                  <Card key={`${entry.event_name}-${entry.role}-${index}`} className="bg-white rounded-xl shadow-md">
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
                              <span>{entry.location}</span>
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
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}