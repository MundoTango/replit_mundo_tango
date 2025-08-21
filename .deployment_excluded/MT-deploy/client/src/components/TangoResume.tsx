import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Download, Share2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TangoResumeProps {
  userId: number;
  isOwnProfile?: boolean;
}

export default function TangoResume({ userId, isOwnProfile = false }: TangoResumeProps) {
  const { toast } = useToast();

  // Get user's resume data
  const { data: resumeData, isLoading } = useQuery({
    queryKey: ['/api/users', userId, 'resume'],
    queryFn: () => apiRequest(`/api/users/${userId}/resume`),
  });

  const handleDownloadPDF = () => {
    toast({
      title: 'PDF Download',
      description: 'PDF download feature coming soon',
    });
  };

  const handleShareResume = () => {
    const shareUrl = `${window.location.origin}/profile/${userId}/resume`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied',
      description: 'Resume link copied to clipboard',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E142E]"></div>
      </div>
    );
  }

  const resume = resumeData?.data?.resume || [];

  if (resume.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isOwnProfile ? 'No accepted roles yet' : 'No public resume available'}
          </h3>
          <p className="text-gray-500">
            {isOwnProfile 
              ? 'Accept event role invitations to build your tango resume' 
              : 'This user has not accepted any public event roles yet'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      {isOwnProfile && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Tango Resume</h2>
            <p className="text-gray-600">Professional experience in the tango community</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleShareResume}
              className="flex items-center space-x-2"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="bg-[#8E142E] hover:bg-[#6B0F22] flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </Button>
          </div>
        </div>
      )}

      {/* Resume Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#8E142E]">{resume.length}</div>
            <div className="text-sm text-gray-600">Events Participated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#8E142E]">
              {resume.reduce((acc: number, event: any) => acc + event.roles.length, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Roles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#8E142E]">
              {new Set(resume.flatMap((event: any) => event.roles.map((role: any) => role.role))).size}
            </div>
            <div className="text-sm text-gray-600">Unique Role Types</div>
          </CardContent>
        </Card>
      </div>

      {/* Resume Events */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Professional Experience</h3>
        
        {resume
          .sort((a: any, b: any) => new Date(b.eventStartDate).getTime() - new Date(a.eventStartDate).getTime())
          .map((event: any) => (
            <Card key={event.eventId} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#8E142E] to-[#6B0F22] text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg mb-2">{event.eventTitle}</CardTitle>
                    <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-100">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(event.eventStartDate), 'PPP')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.eventLocation}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white text-[#8E142E]">
                    {event.roles.length} Role{event.roles.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  {event.roles.map((role: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#8E142E] rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#8E142E]">{role.role}</div>
                          <div className="text-sm text-gray-600">
                            Confirmed on {format(new Date(role.acceptedAt), 'PPP')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div>Invited by</div>
                        <div className="font-medium">{role.inviterName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Skills Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Role Expertise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(resume.flatMap((event: any) => 
              event.roles.map((role: any) => role.role)
            ))).map((role: string) => {
              const count = resume
                .flatMap((event: any) => event.roles)
                .filter((r: any) => r.role === role).length;
              
              return (
                <Badge
                  key={role}
                  variant="outline"
                  className="px-3 py-1 text-sm border-[#8E142E] text-[#8E142E]"
                >
                  {role} ({count})
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}