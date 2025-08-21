/**
 * GDPR Privacy Center Component
 * Provides users with complete control over their privacy settings and data
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Download, 
  Trash2, 
  Eye, 
  Settings, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConsentRecord {
  consent_type: string;
  consent_given: boolean;
  consent_date: string;
  legal_basis: string;
  purpose: string;
}

export default function PrivacyCenter() {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingData, setExportingData] = useState(false);
  const [deletingData, setDeletingData] = useState(false);
  const { toast } = useToast();

  // Consent types configuration
  const consentTypes = [
    {
      type: 'necessary',
      title: 'Necessary Cookies',
      description: 'Essential for the website to function properly',
      required: true,
      purpose: 'Core functionality and security'
    },
    {
      type: 'functional',
      title: 'Functional Cookies',
      description: 'Enable enhanced features and personalization',
      required: false,
      purpose: 'Enhanced user experience'
    },
    {
      type: 'analytics',
      title: 'Analytics Cookies',
      description: 'Help us understand how you use our website',
      required: false,
      purpose: 'Service improvement and optimization'
    },
    {
      type: 'marketing',
      title: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements',
      required: false,
      purpose: 'Personalized advertising'
    }
  ];

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    try {
      setLoading(true);
      
      // Load consent status
      const consentResponse = await fetch('/api/gdpr/consent/status', {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (consentResponse.ok) {
        const consentData = await consentResponse.json();
        setConsents(consentData.data || []);
      }

      // Initialize default consents if none exist
      if (consents.length === 0) {
        const defaultConsents = consentTypes.map(type => ({
          consent_type: type.type,
          consent_given: type.required,
          consent_date: new Date().toISOString(),
          legal_basis: type.required ? 'legal_obligation' : 'consent',
          purpose: type.purpose
        }));
        setConsents(defaultConsents);
      }

    } catch (error) {
      console.error('Error loading privacy data:', error);
      toast({
        title: "Error",
        description: "Failed to load privacy settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (consentType: string, given: boolean) => {
    try {
      if (given) {
        // Record consent
        await fetch('/api/gdpr/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consent_type: consentType,
            consent_given: true,
            legal_basis: 'consent',
            purpose: consentTypes.find(t => t.type === consentType)?.purpose || 'user_preference',
            data_categories: ['usage_data', 'technical_data']
          })
        });
      } else {
        // Withdraw consent
        await fetch(`/api/gdpr/consent/${consentType}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Update local state
      setConsents(prev => prev.map(consent => 
        consent.consent_type === consentType 
          ? { ...consent, consent_given: given, consent_date: new Date().toISOString() }
          : consent
      ));

      toast({
        title: "Success",
        description: `Privacy preference updated for ${consentType}`,
      });
    } catch (error) {
      console.error('Error updating consent:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy preference",
        variant: "destructive"
      });
    }
  };

  const exportUserData = async () => {
    try {
      setExportingData(true);
      
      const response = await fetch('/api/gdpr/export-data', {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Create and download JSON file
        const dataStr = JSON.stringify(data.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `mundo-tango-data-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        toast({
          title: "Success",
          description: "Your data has been exported and downloaded",
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export your data",
        variant: "destructive"
      });
    } finally {
      setExportingData(false);
    }
  };

  const getConsentStatus = (consentType: string) => {
    const consent = consents.find(c => c.consent_type === consentType);
    return consent?.consent_given || false;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading privacy settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" />
          Privacy Center
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your privacy settings and exercise your data rights under GDPR
        </p>
      </div>

      <Tabs defaultValue="consent" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="consent">Consent</TabsTrigger>
          <TabsTrigger value="data-rights">Data Rights</TabsTrigger>
          <TabsTrigger value="transparency">Transparency</TabsTrigger>
        </TabsList>

        <TabsContent value="consent">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cookie & Privacy Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {consentTypes.map((type) => (
                <div key={type.type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{type.title}</h3>
                      {type.required && (
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                    <p className="text-xs text-gray-500">Purpose: {type.purpose}</p>
                  </div>
                  <Switch
                    checked={getConsentStatus(type.type)}
                    onCheckedChange={(checked) => updateConsent(type.type, checked)}
                    disabled={type.required}
                  />
                </div>
              ))}
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Changes to your consent preferences will take effect immediately. 
                  Some features may be limited if you disable certain cookie types.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-rights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Your Data Rights (GDPR)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Right of Access
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Download a complete copy of all your personal data we store.
                  </p>
                  <Button 
                    onClick={exportUserData}
                    disabled={exportingData}
                    className="w-full"
                  >
                    {exportingData ? 'Exporting...' : 'Export My Data'}
                  </Button>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Right to Rectification
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Request correction of incorrect or incomplete personal data.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full"
                  >
                    Request Correction
                  </Button>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transparency">
          <Card>
            <CardHeader>
              <CardTitle>Data Processing Transparency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3>How We Process Your Data</h3>
                <p>
                  We process your personal data for the following purposes, based on the legal grounds indicated:
                </p>
                
                <div className="space-y-4 mt-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Account Management</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Legal Basis:</strong> Contract performance
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Data Categories:</strong> Personal identifiers, contact information
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Retention:</strong> 7 years after account closure
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Platform Services</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Legal Basis:</strong> Contract performance
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Data Categories:</strong> User-generated content, usage data
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Retention:</strong> 3 years after creation
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Analytics & Improvement</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Legal Basis:</strong> Legitimate interest
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Data Categories:</strong> Usage statistics, technical data
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Retention:</strong> 1 year
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}