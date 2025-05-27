import axios from 'axios';
import { Recipe } from '../types/Recipe';

const API_BASE_URL = "http://localhost:5000/api";

export const getRecipeById = async (id: string): Promise<Recipe> => {
  try {
    const response = await axios.get<Recipe>(`${API_BASE_URL}/recipes/${id}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw error;
  }
}; 