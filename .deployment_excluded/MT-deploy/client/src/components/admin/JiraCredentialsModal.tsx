import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { jiraApiService } from '@/services/jiraApiService';

interface JiraCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function JiraCredentialsModal({ isOpen, onClose, onSuccess }: JiraCredentialsModalProps) {
  const [credentials, setCredentials] = useState({
    instanceUrl: '',
    email: '',
    apiToken: '',
    projectKey: ''
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      jiraApiService.setCredentials(credentials);
      const result = await jiraApiService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        // Save credentials to localStorage for persistence
        localStorage.setItem('jiraCredentials', JSON.stringify(credentials));
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
            Configure JIRA Integration
          </DialogTitle>
          <DialogDescription>
            Enter your JIRA credentials to enable direct API integration
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="instanceUrl">JIRA Instance URL</Label>
            <Input
              id="instanceUrl"
              placeholder="https://yourcompany.atlassian.net"
              value={credentials.instanceUrl}
              onChange={(e) => setCredentials({ ...credentials, instanceUrl: e.target.value })}
            />
            <p className="text-xs text-gray-500">Your Atlassian domain URL</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@company.com"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            />
            <p className="text-xs text-gray-500">Email associated with your JIRA account</p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="apiToken">API Token</Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Your JIRA API token"
              value={credentials.apiToken}
              onChange={(e) => setCredentials({ ...credentials, apiToken: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Generate from: <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-turquoise-600 hover:underline">
                Atlassian Account Settings
              </a>
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="projectKey">Project Key</Label>
            <Input
              id="projectKey"
              placeholder="MT"
              value={credentials.projectKey}
              onChange={(e) => setCredentials({ ...credentials, projectKey: e.target.value.toUpperCase() })}
            />
            <p className="text-xs text-gray-500">The key of your JIRA project (e.g., MT, PROJ)</p>
          </div>
          
          {testResult && (
            <Alert className={testResult.success ? 'border-green-200' : 'border-red-200'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={testResult.success ? 'text-green-800' : 'text-red-800'}>
                {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleTest}
            disabled={!credentials.instanceUrl || !credentials.email || !credentials.apiToken || !credentials.projectKey || testing}
            className="bg-gradient-to-r from-turquoise-500 to-cyan-500 text-white hover:from-turquoise-600 hover:to-cyan-600"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test & Save'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}