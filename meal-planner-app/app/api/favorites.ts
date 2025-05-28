import axios from 'axios';




export const getFavoriteRecipes = async (): Promise<string[]> => {
  try {
    console.log('Fetching favorite recipes...');
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
      withCredentials: true
    });
    console.log('Favorite recipes response:', response.data);
    
    let favorites: string[];
    if (Array.isArray(response.data)) {
      favorites = response.data.map((id) => String(id));
    } else if (response.data && typeof response.data === 'object') {
      favorites = Array.from(response.data as Set<number>).map((id) => String(id));
    } else {
      favorites = [];
    }
    
    console.log('Converted favorites:', favorites);
    return favorites;
  } catch (error) {
    console.error('Error fetching favorite recipes:', error);
    throw error;
  }
};

export const checkIsFavorite = async (recipeId: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${recipeId}`, {
      withCredentials: true
    });
    return response.data.isFavorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

export const addToFavorites = async (recipeId: string): Promise<boolean> => {
  try {
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
      recipeId: recipeId
    }, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (recipeId: string): Promise<boolean> => {
  try {
    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites/${recipeId}`, {
      withCredentials: true
    });
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
}; 