// Life CEO Mobile App
import React, { useState, useEffect } from 'react';
import { MobileInterface } from './components/MobileInterface';
import { VoiceInterface } from './components/VoiceInterface';
import { TaskDashboard } from './components/TaskDashboard';
import { InsightFeed } from './components/InsightFeed';

interface AppState {
  user: any | null;
  activeView: 'main' | 'voice' | 'tasks' | 'insights';
  agents: any[];
  tasks: any[];
  insights: any[];
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    user: null,
    activeView: 'main',
    agents: [],
    tasks: [],
    insights: []
  });

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Get user context from gateway
      const userResponse = await fetch('/api/auth/context');
      const userData = await userResponse.json();
      
      // Fetch initial data
      const [agentsRes, tasksRes, insightsRes] = await Promise.all([
        fetch('http://localhost:4001/api/agents/status', {
          headers: { 'x-user-context': JSON.stringify(userData) }
        }),
        fetch('http://localhost:4001/api/tasks', {
          headers: { 'x-user-context': JSON.stringify(userData) }
        }),
        fetch('http://localhost:4001/api/insights', {
          headers: { 'x-user-context': JSON.stringify(userData) }
        })
      ]);

      const [agents, tasks, insights] = await Promise.all([
        agentsRes.json(),
        tasksRes.json(),
        insightsRes.json()
      ]);

      setState(prev => ({
        ...prev,
        user: userData,
        agents: agents.agents || [],
        tasks: tasks.tasks || [],
        insights: insights.insights || []
      }));
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    try {
      const response = await fetch('http://localhost:4001/api/process-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-context': JSON.stringify(state.user)
        },
        body: JSON.stringify({
          command,
          context: {
            language: 'es-AR',
            location: 'Buenos Aires',
            timestamp: new Date().toISOString()
          }
        })
      });

      const result = await response.json();
      
      // Handle response
      if (result.followUp) {
        // Stay in voice mode for follow-up
        return result;
      } else {
        // Refresh data after command
        await initializeApp();
        return result;
      }
    } catch (error) {
      console.error('Failed to process voice command:', error);
      return { error: 'Failed to process command' };
    }
  };

  const renderView = () => {
    switch (state.activeView) {
      case 'voice':
        return (
          <VoiceInterface
            onCommand={handleVoiceCommand}
            onClose={() => setState(prev => ({ ...prev, activeView: 'main' }))}
          />
        );
      
      case 'tasks':
        return (
          <TaskDashboard
            tasks={state.tasks}
            onBack={() => setState(prev => ({ ...prev, activeView: 'main' }))}
          />
        );
      
      case 'insights':
        return (
          <InsightFeed
            insights={state.insights}
            onBack={() => setState(prev => ({ ...prev, activeView: 'main' }))}
          />
        );
      
      default:
        return (
          <MobileInterface
            agents={state.agents}
            tasks={state.tasks}
            insights={state.insights}
            onNavigate={(view) => setState(prev => ({ ...prev, activeView: view }))}
          />
        );
    }
  };

  return (
    <div className="life-ceo-app">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: #f5f5f5;
          color: #333;
        }
        
        .life-ceo-app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      
      {renderView()}
    </div>
  );
};

export default App;