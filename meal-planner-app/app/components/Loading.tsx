// components/Loading.tsx
import React from 'react';

const Loading: React.FC = () => {
  return (

    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

        width: '100%',
        height: '100%',
        backgroundColor: '#15202B', 
        position: 'absolute', 
        top: 0,
        left: 0,
        zIndex: 1000, 
      }}
      className="bg-gray-900" 
    >
      <div
        style={{
          width: '50px', 
          height: '50px',
          border: '5px solid rgba(255, 255, 255, 0.3)', 
          borderTop: '5px solid #FFFFFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite', 
        }}
      />
      <p style={{ color: '#FFFFFF', marginTop: '15px', fontSize: '1.2rem' }}>Loading...</p>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loading;