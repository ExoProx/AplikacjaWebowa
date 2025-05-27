import passport from 'passport';
import express, { Request, Response } from 'express';
import { getAccessToken } from '../../utils/fatSecretAuth'
import axios from 'axios';

const router = express.Router();
//Scieżka API do wykonywania wyszukiwań w api FatSecret, najpierw pobiera przepisy, a później pobiera szczegółowe dane o instrukcjach w danych przepisach
interface Recipe {
    id: number;
    name: string;
    description: string;
    ingredients?: string[];
    instructions?: string;
    image?: string;
}
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
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
        detailParams.append('max_results', '50');
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
});

router.get(
  '/recipes',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    const idsParam = req.query.ids;
    if (!idsParam || typeof idsParam !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "ids" parameter' });
    }

    const ids = idsParam.split(',').map(id => id.trim()).filter(id => /^\d+$/.test(id));
    if (ids.length === 0) {
      return res.status(400).json({ error: 'No valid recipe IDs provided' });
    }

    try {
      const token = await getAccessToken();

      const detailedRecipes: Recipe[] = await Promise.all(
        ids.map(async (id) => {
          const detailParams = new URLSearchParams();
          detailParams.append('method', 'recipe.get.v2');
          detailParams.append('recipe_id', id);
          detailParams.append('format', 'json');

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
      console.error('Error fetching multiple recipe details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

router.get(
    '/random',
    passport.authenticate('jwt', { session: false }),
    async (req: Request, res: Response) => {
        try {
            const token = await getAccessToken();

            // Step 1 & 2: Search for a broad category to get a list of potential recipe IDs
            // Use a very general search term or a common cuisine to ensure a wide range of results.
            // You might need to experiment with 'search_expression' for best results.
            // 'max_results' can be set to a reasonable number to get a pool of IDs.
            // 'page_number' could also be randomized for more variety if you get many pages.
            const searchParams = new URLSearchParams();
            searchParams.append('method', 'recipes.search.v3');
            searchParams.append('search_expression', 'food'); // Broad search term
            searchParams.append('format', 'json');
            searchParams.append('must_have_images', 'true'); // Only recipes with images
            searchParams.append('max_results', '50'); // Get up to 50 results
            searchParams.append('page_number', '0'); // Start from the first page

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
            if (!recipesList || !Array.isArray(recipesList) || recipesList.length === 0) {
                return res.status(404).json({ error: 'No recipes found for random selection.' });
            }

            // Step 3: Pick one recipe_id randomly from the list
            const randomIndex = Math.floor(Math.random() * recipesList.length);
            const randomRecipeId = recipesList[randomIndex].recipe_id;

            // Step 4: Fetch detailed information for the randomly selected recipe
            const detailParams = new URLSearchParams();
            detailParams.append('method', 'recipe.get.v2');
            detailParams.append('recipe_id', randomRecipeId);
            detailParams.append('format', 'json');

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

            if (!details) {
                return res.status(404).json({ error: 'Details for random recipe not found.' });
            }

            // Format the detailed recipe as per your Recipe interface
            const formattedRecipe: Recipe = {
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

            return res.status(200).json(formattedRecipe);

        } catch (error) {
            console.error('Error fetching a random recipe from FatSecret API:', error);
            // Check if it's an Axios error and log response data if available
            if (axios.isAxiosError(error) && error.response) {
                console.error('FatSecret API error response:', error.response.data);
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

export default router;
