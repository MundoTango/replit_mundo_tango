import React, { useState } from 'react';

export function SimpleMediaUploader() {
  const [files, setFiles] = useState<File[]>([]);
  
  console.log('SimpleMediaUploader component rendered!');
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    console.log('Files selected:', selectedFiles);
    alert(`Selected ${selectedFiles.length} files!`);
  };
  
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#ff00ff',
      border: '5px solid red',
      borderRadius: '10px',
      marginBottom: '20px'
    }}>
      <h1 style={{ fontSize: '30px', color: 'white' }}>
        🎯 TEST: SIMPLE MEDIA UPLOADER
      </h1>
      <input 
        type="file" 
        multiple 
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ 
          padding: '10px',
          backgroundColor: 'yellow',
          fontSize: '18px',
          width: '100%'
        }}
      />
      {files.length > 0 && (
        <div style={{ color: 'white', marginTop: '10px' }}>
          Selected {files.length} files:
          <ul>
            {files.map((file, idx) => (
              <li key={idx}>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}