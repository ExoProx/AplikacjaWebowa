// recipes/page.tsx


import React from 'react';
import RecipesList from '../components/RecipesList';

const RecipesList_: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <RecipesList />
    </div>
  );
};

export default RecipesList_;