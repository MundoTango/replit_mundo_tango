import React, { useState } from 'react';
import { FileText, Book, Code, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface DocumentationMetrics {
  apiCoverage: number;
  componentDocs: number;
  testCoverage: number;
  readmeComplete: boolean;
  changelogUpdated: boolean;
  userGuideComplete: boolean;
}

export const ProfileDocumentation: React.FC<{ userId: number }> = ({ userId }) => {
  const [metrics] = useState<DocumentationMetrics>({
    apiCoverage: 92,
    componentDocs: 88,
    testCoverage: 85,
    readmeComplete: true,
    changelogUpdated: true,
    userGuideComplete: true
  });

  const documentationItems = [
    { title: 'Profile API Documentation', status: 'complete', path: '/docs/api/profile' },
    { title: 'Component Library', status: 'complete', path: '/docs/components/profile' },
    { title: 'User Guide', status: 'complete', path: '/docs/user-guide/profile' },
    { title: 'Integration Guide', status: 'in-progress', path: '/docs/integration/profile' },
    { title: 'Security Best Practices', status: 'complete', path: '/docs/security/profile' }
  ];

  return (
    <div className="space-y-6">
      {/* Documentation Coverage */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5 text-purple-600" />
            Profile Documentation Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">API Documentation</span>
                <span className="text-sm text-gray-600">{metrics.apiCoverage}%</span>
              </div>
              <Progress value={metrics.apiCoverage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Component Documentation</span>
                <span className="text-sm text-gray-600">{metrics.componentDocs}%</span>
              </div>
              <Progress value={metrics.componentDocs} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Test Coverage</span>
                <span className="text-sm text-gray-600">{metrics.testCoverage}%</span>
              </div>
              <Progress value={metrics.testCoverage} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentationItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span className="font-medium">{item.title}</span>
                </div>
                <Badge variant={item.status === 'complete' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Documentation Preview */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="endpoints">
            <TabsList>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
            <TabsContent value="endpoints" className="mt-4">
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`GET    /api/profile/:userId
POST   /api/profile/update
PUT    /api/profile/security
DELETE /api/profile/data
GET    /api/profile/export`}
              </pre>
            </TabsContent>
            <TabsContent value="authentication" className="mt-4">
              <div className="prose prose-sm">
                <p>All profile endpoints require authentication via JWT token in the Authorization header:</p>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm">
{`Authorization: Bearer <jwt-token>`}
                </pre>
              </div>
            </TabsContent>
            <TabsContent value="examples" className="mt-4">
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`// Fetch profile data
const response = await fetch('/api/profile/123', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
const profile = await response.json();`}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Documentation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">README.md updated with profile features</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">CHANGELOG.md includes all profile updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">User guide covers all profile functionality</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm">Integration guide needs completion</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};