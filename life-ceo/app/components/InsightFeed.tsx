// Insight Feed Component
import React, { useState } from 'react';

interface Insight {
  id: string;
  type: string;
  title: string;
  content: string;
  confidence: number;
  actionable: boolean;
  created_at: string;
  agent_type?: string;
}

interface InsightFeedProps {
  insights: Insight[];
  onBack: () => void;
}

export const InsightFeed: React.FC<InsightFeedProps> = ({ insights, onBack }) => {
  const [filter, setFilter] = useState('all');

  const filteredInsights = insights.filter(insight => {
    if (filter === 'all') return true;
    if (filter === 'actionable') return insight.actionable;
    if (filter === 'high-confidence') return insight.confidence >= 0.8;
    return insight.type === filter;
  });

  const getInsightIcon = (type: string) => {
    const icons: Record<string, string> = {
      health_recommendation: '🏥',
      financial_alert: '💰',
      productivity_tip: '⚡',
      wellness_report: '🌟',
      investment: '📈',
      medication_adherence: '💊',
      environmental_health: '🌍',
      preventive_care: '🛡️',
      inflation: '📊',
      weight_trend: '⚖️',
      default: '💡'
    };
    return icons[type] || icons.default;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4caf50';
    if (confidence >= 0.6) return '#ff9800';
    return '#f44336';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="insight-feed">
      <div className="feed-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1>AI Insights</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="filter-section">
        <div className="filter-scroll">
          <button 
            className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-chip ${filter === 'actionable' ? 'active' : ''}`}
            onClick={() => setFilter('actionable')}
          >
            Actionable
          </button>
          <button 
            className={`filter-chip ${filter === 'high-confidence' ? 'active' : ''}`}
            onClick={() => setFilter('high-confidence')}
          >
            High Confidence
          </button>
          <button 
            className={`filter-chip ${filter === 'health_recommendation' ? 'active' : ''}`}
            onClick={() => setFilter('health_recommendation')}
          >
            Health
          </button>
          <button 
            className={`filter-chip ${filter === 'financial_alert' ? 'active' : ''}`}
            onClick={() => setFilter('financial_alert')}
          >
            Finance
          </button>
        </div>
      </div>

      <div className="insights-list">
        {filteredInsights.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No insights match your filter</p>
          </div>
        ) : (
          filteredInsights.map(insight => (
            <div key={insight.id} className="insight-card">
              <div className="insight-header">
                <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                <div className="insight-meta">
                  <span className="insight-time">{formatTimeAgo(insight.created_at)}</span>
                  {insight.actionable && <span className="actionable-badge">Action Required</span>}
                </div>
              </div>
              
              <h3 className="insight-title">{insight.title}</h3>
              <p className="insight-content">{insight.content}</p>
              
              <div className="insight-footer">
                <div className="confidence-meter">
                  <span className="confidence-label">Confidence</span>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{
                        width: `${insight.confidence * 100}%`,
                        backgroundColor: getConfidenceColor(insight.confidence)
                      }}
                    />
                  </div>
                  <span className="confidence-value">{Math.round(insight.confidence * 100)}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .insight-feed {
          background: #f5f5f5;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .feed-header {
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

        .feed-header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }

        .header-spacer {
          width: 40px;
        }

        .filter-section {
          background: white;
          border-bottom: 1px solid #eee;
          overflow: hidden;
        }

        .filter-scroll {
          display: flex;
          gap: 10px;
          padding: 15px 20px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .filter-scroll::-webkit-scrollbar {
          display: none;
        }

        .filter-chip {
          background: #f0f0f0;
          border: none;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.3s ease;
        }

        .filter-chip.active {
          background: #2a5298;
          color: white;
        }

        .insights-list {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #999;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }

        .insight-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .insight-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .insight-icon {
          font-size: 24px;
        }

        .insight-meta {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .insight-time {
          font-size: 12px;
          color: #999;
        }

        .actionable-badge {
          background: #ff5722;
          color: white;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .insight-title {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: #333;
        }

        .insight-content {
          margin: 0 0 15px 0;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        .insight-footer {
          margin-top: 15px;
        }

        .confidence-meter {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .confidence-label {
          font-size: 12px;
          color: #999;
        }

        .confidence-bar {
          flex: 1;
          height: 6px;
          background: #e0e0e0;
          border-radius: 3px;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .confidence-value {
          font-size: 12px;
          font-weight: 500;
          color: #666;
          min-width: 35px;
          text-align: right;
        }
      `}</style>
    </div>
  );
};