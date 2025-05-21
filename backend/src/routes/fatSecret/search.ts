
import express, { Request, Response } from 'express';
import { getAccessToken } from '../../utils/fatSecretAuth'
import axios from 'axios';
interface Recipe {
    id: number;
    name: string;
    description: string;
    ingredients?: string[];
    instructions?: string;
    image?: string;
}
export default async function handler(req: Request, res: Response) {
  const { query, max_results, page_number } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query parameter' });
  }

  const maxResultsNum = max_results && !Array.isArray(max_results) ? Number(max_results) : 50;
  const pageNumberNum = page_number && !Array.isArray(page_number) ? Number(page_number) : 0;

  try {
    const token = await getAccessToken();

    const searchParams = new URLSearchParams();
      searchParams.append('method', 'recipes.search.v3');
    searchParams.append('search_expression', query);
    searchParams.append('format', 'json');
    searchParams.append('must_have_images', 'true');
    searchParams.append('max_results', maxResultsNum.toString());
    searchParams.append('page_number', pageNumberNum.toString());
    

    const searchResponse = await axios.post(
      'https://platform.fatsecret.com/rest/server.api',
      searchParams,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const recipesList = searchResponse.data.recipes?.recipe;
    if (!recipesList || !Array.isArray(recipesList)) {
      return res.status(404).json({ error: 'No recipes found' });
    }

    const detailedRecipes: Recipe[] = await Promise.all(
      recipesList.map(async (item: any) => {
        const detailParams = new URLSearchParams();
        detailParams.append('method', 'recipe.get.v2');
        detailParams.append('recipe_id', item.recipe_id);
        detailParams.append('format', 'json');
        detailParams.append('max_results', '50'); // Optional: limits the number of results
        detailParams.append('page_number', '0');

        const detailResponse = await axios.post(
          'https://platform.fatsecret.com/rest/server.api',
          detailParams,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const details = detailResponse.data.recipe;

        return {
          id: parseInt(details.recipe_id),
          name: details.recipe_name,
          description: details.recipe_description,
          ingredients: details.ingredients?.ingredient?.map((ing: any) => ing.ingredient_description) || [],
          instructions:
            details.directions?.direction
              ?.map((dir: any) => dir.direction_description)
              .join(' ') || 'Brak instrukcji.',
          image: details.recipe_images?.recipe_image?.[0] || null,
        };
      })
    );

    return res.status(200).json(detailedRecipes); 
  } catch (error) {
    console.error('Error fetching data from FatSecret API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
