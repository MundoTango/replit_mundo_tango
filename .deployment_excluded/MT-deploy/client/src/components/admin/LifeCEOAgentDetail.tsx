import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LifeCEOAgentConfig from './LifeCEOAgentConfig';
import LifeCEOAgentDocuments from './LifeCEOAgentDocuments';
import LifeCEOAgentChat from './LifeCEOAgentChat';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Settings, FileText, MessageSquare } from 'lucide-react';

const LifeCEOAgentDetail: React.FC = () => {
  const { id: agentId } = useParams();
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/life-ceo">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back to Life CEO Portal
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Agent Management</h1>
          <p className="text-lg text-gray-600">
            Configure and interact with your Life CEO agent
          </p>
        </div>

        {/* Agent Detail Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <LifeCEOAgentChat />
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <LifeCEOAgentConfig />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <LifeCEOAgentDocuments />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LifeCEOAgentDetail;