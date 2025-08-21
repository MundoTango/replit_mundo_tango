import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Zap,
  Shield,
  Database,
  Code,
  Palette,
  Smartphone,
  Loader2,
  ArrowRight
} from 'lucide-react';

interface CheckResult {
  passed: boolean;
  issues: string[];
  autoFixAvailable: boolean;
  suggestions: string[];
}

interface ChecklistData {
  ready: boolean;
  checks: Record<string, CheckResult>;
  blockers: string[];
}

const categoryIcons: Record<string, any> = {
  typescript: Code,
  memory: Database,
  cache: Zap,
  api: Shield,
  design: Palette,
  mobile: Smartphone
};

const categoryColors: Record<string, string> = {
  typescript: 'text-blue-600',
  memory: 'text-purple-600',
  cache: 'text-orange-600',
  api: 'text-green-600',
  design: 'text-pink-600',
  mobile: 'text-indigo-600'
};

export default function PreDevelopmentChecklist() {
  const [checklistData, setChecklistData] = useState<ChecklistData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [autoFixing, setAutoFixing] = useState<string | null>(null);

  const runChecklist = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/life-ceo/pre-development-checklist', {
        credentials: 'include'
      });
      const data = await response.json();
      setChecklistData(data);
    } catch (error) {
      console.error('Error running checklist:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const runAutoFix = async (category: string) => {
    setAutoFixing(category);
    try {
      await fetch('/api/life-ceo/auto-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category })
      });
      // Re-run checklist after auto-fix
      await runChecklist();
    } catch (error) {
      console.error('Error running auto-fix:', error);
    } finally {
      setAutoFixing(null);
    }
  };

  useEffect(() => {
    runChecklist();
  }, []);

  const calculateReadiness = () => {
    if (!checklistData) return 0;
    const totalChecks = Object.keys(checklistData.checks).length;
    const passedChecks = Object.values(checklistData.checks).filter(c => c.passed).length;
    return Math.round((passedChecks / totalChecks) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="mb-6 glassmorphic-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-turquoise-600 to-cyan-600 bg-clip-text text-transparent">
                Pre-Development Checklist (Phase 0)
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Comprehensive system validation before starting development
              </p>
            </div>
            <Button
              onClick={runChecklist}
              disabled={isChecking}
              className="bg-gradient-to-r from-turquoise-500 to-cyan-600"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Re-run Checklist
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {checklistData && (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">System Readiness</span>
                  <span className="text-sm font-bold">{calculateReadiness()}%</span>
                </div>
                <Progress value={calculateReadiness()} className="h-3" />
              </div>

              {checklistData.blockers.length > 0 && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <strong className="text-red-800">Blockers Found:</strong>
                    <ul className="mt-2 space-y-1">
                      {checklistData.blockers.map((blocker, idx) => (
                        <li key={idx} className="text-sm text-red-700">• {blocker}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {Object.entries(checklistData.checks).map(([category, result]) => {
                  const Icon = categoryIcons[category] || Shield;
                  const colorClass = categoryColors[category] || 'text-gray-600';
                  
                  return (
                    <Card key={category} className={`${
                      result.passed ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              result.passed ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <Icon className={`w-5 h-5 ${colorClass}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold capitalize">{category}</h3>
                                {result.passed ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600" />
                                )}
                                <Badge variant={result.passed ? 'success' : 'destructive'}>
                                  {result.passed ? 'Passed' : 'Failed'}
                                </Badge>
                              </div>
                              
                              {result.issues.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-red-700 mb-1">Issues:</p>
                                  <ul className="space-y-1">
                                    {result.issues.map((issue, idx) => (
                                      <li key={idx} className="text-sm text-gray-700">• {issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {result.suggestions.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-blue-700 mb-1">Suggestions:</p>
                                  <ul className="space-y-1">
                                    {result.suggestions.map((suggestion, idx) => (
                                      <li key={idx} className="text-sm text-gray-700">
                                        <ArrowRight className="w-3 h-3 inline mr-1 text-blue-500" />
                                        {suggestion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {!result.passed && result.autoFixAvailable && (
                            <Button
                              size="sm"
                              onClick={() => runAutoFix(category)}
                              disabled={autoFixing === category}
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                            >
                              {autoFixing === category ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Fixing...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-3 h-3 mr-1" />
                                  Auto-fix
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-turquoise-50 to-cyan-50 rounded-lg border border-turquoise-200">
                <h4 className="font-semibold text-gray-800 mb-2">Ready to Develop?</h4>
                <p className="text-sm text-gray-700">
                  {checklistData.ready ? (
                    <>
                      <CheckCircle className="w-4 h-4 inline mr-1 text-green-600" />
                      All checks passed! You're ready to start development.
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 inline mr-1 text-orange-600" />
                      Please resolve the blockers before starting development.
                    </>
                  )}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}