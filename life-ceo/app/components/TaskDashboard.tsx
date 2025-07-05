// Task Dashboard Component
import React, { useState } from 'react';

interface Task {
  id: string;
  agent_type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  created_at: string;
}

interface TaskDashboardProps {
  tasks: Task[];
  onBack: () => void;
}

export const TaskDashboard: React.FC<TaskDashboardProps> = ({ tasks, onBack }) => {
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return task.priority === 'critical' || task.priority === 'high';
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF3737';
      case 'high': return '#FF8C00';
      case 'medium': return '#FFD700';
      case 'low': return '#90EE90';
      default: return '#CCCCCC';
    }
  };

  const getAgentEmoji = (agentType: string) => {
    const emojiMap: Record<string, string> = {
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
    return emojiMap[agentType] || '📋';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days > 0 && days < 7) return `In ${days} days`;
    if (days < 0) return `${Math.abs(days)} days ago`;
    
    return date.toLocaleDateString('es-AR');
  };

  return (
    <div className="task-dashboard">
      <div className="dashboard-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>Tasks</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({tasks.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'urgent' ? 'active' : ''}`}
          onClick={() => setFilter('urgent')}
        >
          Urgent
        </button>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Done
        </button>
      </div>

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className={`task-card ${task.status}`}>
              <div className="task-header">
                <span className="agent-emoji">{getAgentEmoji(task.agent_type)}</span>
                <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}></div>
              </div>
              
              <div className="task-content">
                <h3 className="task-title">{task.title}</h3>
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}
                
                <div className="task-meta">
                  <span className="task-date">
                    {task.due_date ? formatDate(task.due_date) : 'No deadline'}
                  </span>
                  <span className="task-status">{task.status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .task-dashboard {
          background: #f5f5f5;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          background: white;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .back-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 40px;
        }

        .dashboard-header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .header-spacer {
          width: 40px;
        }

        .filter-tabs {
          background: white;
          padding: 10px 20px;
          display: flex;
          gap: 10px;
          overflow-x: auto;
          border-bottom: 1px solid #eee;
        }

        .filter-tab {
          background: none;
          border: none;
          padding: 8px 16px;
          font-size: 14px;
          cursor: pointer;
          border-radius: 20px;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .filter-tab.active {
          background: #2a5298;
          color: white;
        }

        .tasks-list {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .task-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .task-card.completed {
          opacity: 0.7;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .agent-emoji {
          font-size: 24px;
        }

        .task-priority {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .task-content {
          margin-left: 34px;
        }

        .task-title {
          margin: 0 0 5px 0;
          font-size: 16px;
          color: #333;
        }

        .task-description {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
          line-height: 1.4;
        }

        .task-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #999;
        }

        .task-status {
          text-transform: capitalize;
        }
      `}</style>
    </div>
  );
};