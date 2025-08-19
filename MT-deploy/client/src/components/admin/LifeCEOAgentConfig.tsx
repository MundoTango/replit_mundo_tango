import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Settings,
  FileText,
  Brain,
  Shield,
  Heart,
  Save,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
} from 'lucide-react';

interface AgentConfig {
  id: number;
  agent_id: number;
  config_type: string;
  config_name: string;
  config_data: any;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const LifeCEOAgentConfig: React.FC = () => {
  const { id: agentId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('11l_system');
  const [editingConfig, setEditingConfig] = useState<AgentConfig | null>(null);
  const [newConfigData, setNewConfigData] = useState('');

  // Fetch agent configurations
  const { data: configs, isLoading } = useQuery({
    queryKey: [`/api/life-ceo/agents/${agentId}/configs`],
    enabled: !!agentId,
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      return apiRequest('POST', `/api/life-ceo/agents/${agentId}/configs`, configData);
    },
    onSuccess: () => {
      toast({
        title: 'Configuration saved',
        description: 'Agent configuration has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/life-ceo/agents/${agentId}/configs`] });
      setEditingConfig(null);
      setNewConfigData('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error saving configuration',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const getConfigIcon = (type: string) => {
    switch (type) {
      case '11l_system':
        return <Brain className="w-4 h-4" />;
      case 'governance':
        return <Shield className="w-4 h-4" />;
      case 'ai_sentiment':
        return <Heart className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const renderConfigEditor = (config: AgentConfig) => {
    const isEditing = editingConfig?.id === config.id;
    const configDataStr = isEditing ? newConfigData : JSON.stringify(config.config_data, null, 2);

    return (
      <Card key={config.id} className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {getConfigIcon(config.config_type)}
              <CardTitle className="text-lg">{config.config_name}</CardTitle>
              <Badge variant="outline">v{config.version}</Badge>
              {config.is_active && <Badge className="bg-green-100 text-green-800">Active</Badge>}
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      try {
                        const parsedData = JSON.parse(newConfigData);
                        saveConfigMutation.mutate({
                          config_type: config.config_type,
                          config_name: config.config_name,
                          config_data: parsedData,
                        });
                      } catch (error) {
                        toast({
                          title: 'Invalid JSON',
                          description: 'Please check your configuration format.',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingConfig(null);
                      setNewConfigData('');
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditingConfig(config);
                    setNewConfigData(JSON.stringify(config.config_data, null, 2));
                  }}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            className="font-mono text-sm"
            rows={10}
            value={configDataStr}
            onChange={(e) => setNewConfigData(e.target.value)}
            readOnly={!isEditing}
          />
        </CardContent>
      </Card>
    );
  };

  const configTypes = [
    { value: '11l_system', label: '11L System', icon: Brain },
    { value: 'governance', label: 'Governance', icon: Shield },
    { value: 'ai_sentiment', label: 'AI Sentiment', icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Agent Configuration</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Configuration
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          {configTypes.map((type) => (
            <TabsTrigger key={type.value} value={type.value} className="flex items-center space-x-2">
              <type.icon className="w-4 h-4" />
              <span>{type.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {configTypes.map((type) => (
          <TabsContent key={type.value} value={type.value} className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  Loading configurations...
                </CardContent>
              </Card>
            ) : (
              <>
                {configs
                  ?.filter((c: AgentConfig) => c.config_type === type.value)
                  .map((config: AgentConfig) => renderConfigEditor(config))}
                {(!configs || configs.filter((c: AgentConfig) => c.config_type === type.value).length === 0) && (
                  <Card>
                    <CardContent className="py-8 text-center text-gray-500">
                      No {type.label} configurations found. Click "Add Configuration" to create one.
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LifeCEOAgentConfig;