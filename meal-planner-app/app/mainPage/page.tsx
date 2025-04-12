// MainPage/page.tsx


import React from 'react';
import MainPage from './MainPage';

const MainPageU: React.FC = () => {
  return (
    <div className="min-h-screen" 
    style={{
      backgroundImage: 'url("/jedzenie.jpg")',
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    }}
    >
      <MainPage />
    </div>
  );
};

export default MainPageU;