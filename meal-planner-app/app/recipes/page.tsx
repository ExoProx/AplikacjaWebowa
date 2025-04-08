// recipes/page.tsx


import React from 'react';
import RecipesList from '../components/RecipesList';

const RecipesList_: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-300 via-blue-900 to-blue-300">
      <RecipesList />
    </div>
  );
};

export default RecipesList_;