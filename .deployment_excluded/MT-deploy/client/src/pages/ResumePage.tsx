import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Star, Download, ChevronDown, Link2, User, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'PDF' | 'CSV'>('PDF');

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

  const handleCopyPublicLink = async () => {
    if (!user?.username) {
      toast({
        title: "Error",
        description: "Username not available",
        variant: "destructive",
      });
      return;
    }

    const publicUrl = `https://mundotango.life/u/${user.username}/resume`;
    
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({
        title: "Link copied!",
        description: "Public resume link copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    if (!resumeRef.current || !user || !resumeData?.data?.length) {
      toast({
        title: "Export Failed",
        description: "No data to export",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      if (exportFormat === 'PDF') {
        // Create a temporary container for PDF export
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '0';
        exportContainer.style.width = '800px';
        exportContainer.style.background = 'white';
        exportContainer.style.padding = '40px';
        exportContainer.style.fontFamily = 'Arial, sans-serif';
        
        // Create PDF content
        const resumeEntries = resumeData.data;
        const groupedResume: GroupedResume = resumeEntries.reduce((acc: GroupedResume, entry: ResumeEntry) => {
          const year = format(parseISO(entry.event_date), 'yyyy');
          if (!acc[year]) {
            acc[year] = [];
          }
          acc[year].push(entry);
          return acc;
        }, {});

        const sortedYears = Object.keys(groupedResume).sort((a, b) => parseInt(b) - parseInt(a));

        // Build HTML content for PDF
        let htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #8E142E; padding-bottom: 20px;">
              <h1 style="color: #8E142E; font-size: 28px; margin: 0 0 10px 0;">Tango Resume - ${user.name}</h1>
              <p style="color: #666; font-size: 14px; margin: 0;">Generated on ${format(new Date(), 'PPP')}</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <div style="display: flex; justify-content: space-around; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #8E142E;">${resumeEntries.length}</div>
                  <div style="font-size: 12px; color: #666;">Total Roles</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #8E142E;">${new Set(resumeEntries.map((entry: ResumeEntry) => entry.event_id)).size}</div>
                  <div style="font-size: 12px; color: #666;">Events Participated</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #8E142E;">${new Set(resumeEntries.map((entry: ResumeEntry) => entry.role)).size}</div>
                  <div style="font-size: 12px; color: #666;">Unique Roles</div>
                </div>
              </div>
            </div>
        `;

        // Add each year's entries
        sortedYears.forEach(year => {
          htmlContent += `
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333; font-size: 20px; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">${year}</h2>
          `;
          
          groupedResume[year]
            .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
            .forEach(entry => {
              htmlContent += `
                <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                      <h3 style="color: #333; font-size: 16px; font-weight: bold; margin: 0 0 8px 0;">${entry.event_name}</h3>
                      <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
                        📅 ${format(parseISO(entry.event_date), 'PPP')}
                      </div>
                      <div style="font-size: 12px; color: #666; margin-bottom: 8px;">
                        📍 ${entry.event_location}
                      </div>
                      <div style="font-size: 11px; color: #888;">
                        Confirmed on ${format(parseISO(entry.accepted_at), 'PPP')}
                      </div>
                    </div>
                    <div style="background: #f0f0f0; border: 1px solid #8E142E; color: #8E142E; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                      ${entry.role}
                    </div>
                  </div>
                </div>
              `;
            });
          
          htmlContent += `</div>`;
        });

        htmlContent += `</div>`;
        
        exportContainer.innerHTML = htmlContent;
        document.body.appendChild(exportContainer);

        // Generate PDF
        const canvas = await html2canvas(exportContainer, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 800,
          height: exportContainer.scrollHeight
        });

        document.body.removeChild(exportContainer);

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        // Save the PDF
        const fileName = `Tango_Resume_${user.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        pdf.save(fileName);

        toast({
          title: "Success",
          description: "Resume exported to PDF!",
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8E142E]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load resume</h3>
          <p className="text-red-600 mb-4">
            {error.message.includes('401') || error.message.includes('Authentication')
              ? 'You must be logged in to view your resume.'
              : 'Error loading resume data. Please try again later.'}
          </p>
          <p className="text-sm text-gray-500">
            {error.message.includes('401') || error.message.includes('Authentication')
              ? 'Please log in and try again.'
              : `Details: ${error.message}`}
          </p>
        </div>
      </div>
    );
  }

  const resumeEntries = resumeData?.data || [];

  if (resumeEntries.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tango Resume</h1>
          <p className="text-gray-600">Professional experience in the tango community</p>
        </div>
        <div className="text-center py-12">
          <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resume entries yet</h3>
          <p className="text-gray-600">Tag yourself or get tagged at events to build your tango resume.</p>
        </div>
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tango Resume</h1>
          <p className="text-gray-600">Professional experience in the tango community</p>
        </div>
        
        {/* Export Controls */}
        <div className="flex items-center space-x-2">
          {/* Copy Public Link Button */}
          <Button
            onClick={handleCopyPublicLink}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded flex items-center space-x-1"
          >
            <Link2 className="h-3 w-3" />
            <span>Copy Public Resume Link</span>
          </Button>
          
          {/* Format Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setExportFormat(exportFormat === 'PDF' ? 'CSV' : 'PDF')}
              className="flex items-center space-x-1"
            >
              <span>{exportFormat}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Download Button */}
          <Button
            onClick={handleExport}
            disabled={!resumeData?.data?.length || isExporting}
            className="bg-blue-500 text-white px-4 py-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            title={!resumeData?.data?.length ? "No data to export" : "Download resume"}
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? 'Exporting...' : 'Download PDF'}</span>
          </Button>
        </div>
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
      <div ref={resumeRef} className="space-y-8">
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