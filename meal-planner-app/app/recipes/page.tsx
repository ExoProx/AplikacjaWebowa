import React from 'react';
import RecipesList from '../components/RecipesList';

const RecipesList_: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <RecipesList />
    </div>
  );
};

export default RecipesList_;