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

interface FatSecretIngredient {
  ingredient_description: string;
}

interface FatSecretDirection {
  direction_description: string;
}

interface FatSecretSearchItem {
  recipe_id: string;
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
      recipesList.map(async (item: FatSecretSearchItem) => {
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
          ingredients: details.ingredients?.ingredient?.map((ing: FatSecretIngredient) => ing.ingredient_description) || [],
          instructions:
            details.directions?.direction
              ?.map((dir: FatSecretDirection) => dir.direction_description)
              .join(' ') || 'Brak instrukcji.',
          image: details.recipe_images?.recipe_image?.[0] || null,
        };
      })
    );

    return res.status(200).json(detailedRecipes); 
  } catch (error) {
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
            ingredients: details.ingredients?.ingredient?.map((ing: FatSecretIngredient) => ing.ingredient_description) || [],
            instructions:
              details.directions?.direction
                ?.map((dir: FatSecretDirection) => dir.direction_description)
                .join(' ') || 'Brak instrukcji.',
            image: details.recipe_images?.recipe_image?.[0] || null,
          };
        })
      );

      return res.status(200).json(detailedRecipes);
    } catch (error) {
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

            const searchParams = new URLSearchParams();
            searchParams.append('method', 'recipes.search.v3');
            searchParams.append('search_expression', 'food');
            searchParams.append('format', 'json');
            searchParams.append('must_have_images', 'true');
            searchParams.append('max_results', '50');
            searchParams.append('page_number', '0');

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

            const randomIndex = Math.floor(Math.random() * recipesList.length);
            const randomRecipeId = recipesList[randomIndex].recipe_id;

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

            const formattedRecipe: Recipe = {
                id: parseInt(details.recipe_id),
                name: details.recipe_name,
                description: details.recipe_description,
                ingredients: details.ingredients?.ingredient?.map((ing: FatSecretIngredient) => ing.ingredient_description) || [],
                instructions:
                    details.directions?.direction
                        ?.map((dir: FatSecretDirection) => dir.direction_description)
                        .join(' ') || 'Brak instrukcji.',
                image: details.recipe_images?.recipe_image?.[0] || null,
            };

            return res.status(200).json(formattedRecipe);

        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
);

export default router;
