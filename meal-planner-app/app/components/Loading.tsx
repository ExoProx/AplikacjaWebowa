// components/Loading.tsx
import React from 'react';

const Loading: React.FC = () => {
  console.log('Loading component: Rendered with Tailwind spin.');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <div
        className="animate-spin" 
        style={{
          width: '50px',
          height: '50px',
          border: '5px solid rgba(255, 255, 255, 0.3)',
          borderTop: '5px solid #FFFFFF',
          borderRadius: '50%',
          
        }}
      />
      <p style={{ color: '#FFFFFF', marginTop: '15px', fontSize: '1.2rem' }}>Loading...</p>
      {/* Remove the style jsx block entirely */}
    </div>
  );
};

export default Loading;