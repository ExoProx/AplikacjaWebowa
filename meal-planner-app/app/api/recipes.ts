import axios from 'axios';
import { Recipe } from '../types/Recipe';



export const getRecipeById = async (id: string): Promise<Recipe> => {
  try {
    const response = await axios.get<Recipe>(`${process.env.NEXT_PUBLIC_API_URL}/recipes/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
}; 