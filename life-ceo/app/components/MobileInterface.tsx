// Mobile Interface Component - Main screen for Life CEO
import React from 'react';

interface Agent {
  id: string;
  type: string;
  name: string;
  status: string;
  last_active: string;
}

interface Task {
  id: string;
  title: string;
  priority: string;
}

interface Insight {
  id: string;
  type: string;
  title: string;
  confidence: number;
}

interface MobileInterfaceProps {
  agents: Agent[];
  tasks: Task[];
  insights: Insight[];
  onNavigate: (view: 'voice' | 'tasks' | 'insights') => void;
}

export const MobileInterface: React.FC<MobileInterfaceProps> = ({ 
  agents, 
  tasks, 
  insights, 
  onNavigate 
}) => {
  const urgentTasks = tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  
  const getAgentIcon = (type: string) => {
    const icons: Record<string, string> = {
      business: '💼',
      finance: '💰',
      health: '🏥',
      relationships: '❤️',
      learning: '📚',
      creative: '🎨',
      network: '🌐',
      global_mobility: '✈️',
      security: '🔒',
      emergency: '🚨',
      memory: '🧠',
      voice: '🎤',
      data: '📊',
      workflow: '⚡',
      legal: '⚖️',
      home: '🏠'
    };
    return icons[type] || '🤖';
  };

  return (
    <div className="mobile-interface">
      <header className="app-header">
        <h1>Life CEO</h1>
        <div className="location">Buenos Aires</div>
      </header>

      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-value">{activeAgents}</div>
          <div className="stat-label">Active Agents</div>
        </div>
        <div className="stat-card urgent">
          <div className="stat-value">{urgentTasks}</div>
          <div className="stat-label">Urgent Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{insights.length}</div>
          <div className="stat-label">New Insights</div>
        </div>
      </div>

      <div className="main-actions">
        <button className="action-card voice" onClick={() => onNavigate('voice')}>
          <div className="action-icon">🎤</div>
          <div className="action-content">
            <h3>Voice Command</h3>
            <p>Talk to your Life CEO</p>
          </div>
        </button>

        <button className="action-card tasks" onClick={() => onNavigate('tasks')}>
          <div className="action-icon">📋</div>
          <div className="action-content">
            <h3>View Tasks</h3>
            <p>{tasks.length} total tasks</p>
          </div>
        </button>

        <button className="action-card insights" onClick={() => onNavigate('insights')}>
          <div className="action-icon">💡</div>
          <div className="action-content">
            <h3>Insights</h3>
            <p>AI recommendations</p>
          </div>
        </button>
      </div>

      <div className="agents-overview">
        <h2>Active Agents</h2>
        <div className="agents-grid">
          {agents.slice(0, 6).map(agent => (
            <div key={agent.id} className={`agent-tile ${agent.status}`}>
              <div className="agent-icon">{getAgentIcon(agent.type)}</div>
              <div className="agent-name">{agent.name}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .mobile-interface {
          background: #f5f5f5;
          min-height: 100vh;
          padding-bottom: 20px;
        }

        .app-header {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 30px 20px 20px;
          text-align: center;
        }

        .app-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }

        .location {
          margin-top: 5px;
          opacity: 0.8;
          font-size: 14px;
        }

        .quick-stats {
          display: flex;
          gap: 10px;
          padding: 20px;
          margin-top: -30px;
        }

        .stat-card {
          flex: 1;
          background: white;
          border-radius: 12px;
          padding: 15px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .stat-card.urgent {
          background: #ff8c00;
          color: white;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.7;
        }

        .main-actions {
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .action-card {
          background: white;
          border: none;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .action-card:active {
          transform: scale(0.98);
        }

        .action-card.voice {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-card.tasks {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .action-card.insights {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .action-icon {
          font-size: 36px;
        }

        .action-content h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
        }

        .action-content p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }

        .agents-overview {
          padding: 20px;
          margin-top: 20px;
        }

        .agents-overview h2 {
          margin: 0 0 15px 0;
          font-size: 20px;
          color: #333;
        }

        .agents-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .agent-tile {
          background: white;
          border-radius: 12px;
          padding: 15px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .agent-tile.active {
          border: 2px solid #4caf50;
        }

        .agent-icon {
          font-size: 28px;
          margin-bottom: 5px;
        }

        .agent-name {
          font-size: 12px;
          color: #666;
        }
      `}</style>
    </div>
  );
};