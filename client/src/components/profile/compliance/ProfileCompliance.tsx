import React, { useState } from 'react';
import { FileCheck, Shield, Lock, Globe, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ComplianceMetrics {
  gdprScore: number;
  ccpaScore: number;
  hipaaScore: number;
  pciScore: number;
  overallCompliance: number;
  lastAudit: Date;
  nextAudit: Date;
}

interface ComplianceItem {
  requirement: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export const ProfileCompliance: React.FC<{ userId: number }> = ({ userId }) => {
  const [metrics] = useState<ComplianceMetrics>({
    gdprScore: 95,
    ccpaScore: 92,
    hipaaScore: 88,
    pciScore: 90,
    overallCompliance: 91,
    lastAudit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    nextAudit: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  });

  const [complianceItems] = useState<ComplianceItem[]>([
    { requirement: 'Data encryption at rest', status: 'compliant', category: 'Security', priority: 'high' },
    { requirement: 'Right to data portability', status: 'compliant', category: 'GDPR', priority: 'high' },
    { requirement: 'Cookie consent management', status: 'compliant', category: 'GDPR', priority: 'medium' },
    { requirement: 'Data retention policies', status: 'partial', category: 'CCPA', priority: 'high' },
    { requirement: 'Access audit logging', status: 'compliant', category: 'HIPAA', priority: 'high' },
    { requirement: 'PCI compliance scanning', status: 'compliant', category: 'PCI-DSS', priority: 'high' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getComplianceGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    return 'C';
  };

  return (
    <div className="space-y-6">
      {/* Overall Compliance Score */}
      <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600" />
            Profile Legal Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-amber-600">{metrics.overallCompliance}%</div>
            <div className="text-lg text-gray-600 mt-2">Overall Compliance Score</div>
            <Badge className="mt-2 text-lg px-3 py-1" variant="secondary">
              Grade: {getComplianceGrade(metrics.overallCompliance)}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Last Audit:</span>
              <div className="font-medium">{metrics.lastAudit.toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-gray-600">Next Audit:</span>
              <div className="font-medium">{metrics.nextAudit.toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance by Framework */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance by Framework</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gdpr">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="gdpr">GDPR</TabsTrigger>
              <TabsTrigger value="ccpa">CCPA</TabsTrigger>
              <TabsTrigger value="hipaa">HIPAA</TabsTrigger>
              <TabsTrigger value="pci">PCI-DSS</TabsTrigger>
            </TabsList>
            <TabsContent value="gdpr" className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">GDPR Compliance</span>
                  <span className="text-sm">{metrics.gdprScore}%</span>
                </div>
                <Progress value={metrics.gdprScore} className="h-3" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">User consent management implemented</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Data portability API available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Right to erasure functionality</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="ccpa" className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">CCPA Compliance</span>
                  <span className="text-sm">{metrics.ccpaScore}%</span>
                </div>
                <Progress value={metrics.ccpaScore} className="h-3" />
              </div>
            </TabsContent>
            <TabsContent value="hipaa" className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">HIPAA Compliance</span>
                  <span className="text-sm">{metrics.hipaaScore}%</span>
                </div>
                <Progress value={metrics.hipaaScore} className="h-3" />
              </div>
            </TabsContent>
            <TabsContent value="pci" className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">PCI-DSS Compliance</span>
                  <span className="text-sm">{metrics.pciScore}%</span>
                </div>
                <Progress value={metrics.pciScore} className="h-3" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Compliance Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{item.requirement}</div>
                  <div className="text-sm text-gray-600">{item.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                    {item.priority}
                  </Badge>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Policy Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy & Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Privacy Policy</div>
                <div className="text-sm text-gray-600">Last updated: 30 days ago</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Current</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Terms of Service</div>
                <div className="text-sm text-gray-600">Last updated: 45 days ago</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Current</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium">Cookie Policy</div>
                <div className="text-sm text-gray-600">Review needed in 15 days</div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Review Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Protection Officer */}
      <Alert className="border-blue-200 bg-blue-50">
        <Globe className="h-4 w-4" />
        <AlertDescription>
          <div className="font-medium mb-1">Data Protection Officer</div>
          <div className="text-sm">
            For compliance inquiries, contact: dpo@mundotango.life
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};