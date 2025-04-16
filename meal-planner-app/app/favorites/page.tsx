import React from 'react';
import FavoriteRecipes from './FavoriteRecipes';


const fav: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <FavoriteRecipes />
    </div>
  );
};

export default fav;