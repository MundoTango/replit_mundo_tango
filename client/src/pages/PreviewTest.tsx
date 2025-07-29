import React from 'react';

// Life CEO 44x21s Layer 44: Minimal preview test component
const PreviewTest: React.FC = () => {
  console.log('Life CEO 44x21s: PreviewTest component rendering');
  
  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #f0fdfa, #ecfeff, #eff6ff)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{
          background: 'linear-gradient(135deg, #38b2ac, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          margin: '0 0 15px 0'
        }}>
          🚀 Life CEO Platform
        </h1>
        
        <p style={{
          color: '#6b7280',
          fontSize: '1.2rem',
          margin: '0 0 25px 0'
        }}>
          44x21s Framework - System Online
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginTop: '30px'
        }}>
          <div style={{
            background: 'rgba(56, 178, 172, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
            <div style={{ color: '#38b2ac', fontWeight: 'bold' }}>Server Running</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Port 5000</div>
          </div>
          
          <div style={{
            background: 'rgba(6, 182, 212, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</div>
            <div style={{ color: '#06b6d4', fontWeight: 'bold' }}>Preview Working</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>React Loaded</div>
          </div>
          
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🧠</div>
            <div style={{ color: '#10b981', fontWeight: 'bold' }}>44x21s Active</div>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>All Layers</div>
          </div>
        </div>
      </div>
      
      {/* Quick Navigation */}
      <div style={{
        marginTop: '30px',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => window.location.href = '/feed'}
          style={{
            background: 'linear-gradient(135deg, #38b2ac, #06b6d4)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(56, 178, 172, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          📱 Memory Feed
        </button>
        
        <button 
          onClick={() => window.location.href = '/admin'}
          style={{
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ⚙️ Admin Center
        </button>
      </div>
      
      {/* Status Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(16, 185, 129, 0.9)',
        color: 'white',
        borderRadius: '20px',
        padding: '8px 16px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'white',
          animation: 'pulse 2s infinite'
        }}></div>
        Live
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default PreviewTest;