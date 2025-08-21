import React from 'react';

export default function TimelineMinimal() {
  return (
    <div style={{ padding: '50px', backgroundColor: 'lightgreen', color: 'black' }}>
      <h1>Timeline Minimal Test</h1>
      <p>If you can see this green box, routing works!</p>
      <p>Current URL: {window.location.pathname}</p>
    </div>
  );
}