"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const express_1 = __importDefault(require("express"));
const fatSecretAuth_1 = require("../../utils/fatSecretAuth");
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
router.get('/', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { query, max_results, page_number } = req.query;
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid query parameter' });
    }
    const maxResultsNum = max_results && !Array.isArray(max_results) ? Number(max_results) : 50;
    const pageNumberNum = page_number && !Array.isArray(page_number) ? Number(page_number) : 0;
    try {
        const token = yield (0, fatSecretAuth_1.getAccessToken)();
        const searchParams = new URLSearchParams();
        searchParams.append('method', 'recipes.search.v3');
        searchParams.append('search_expression', query);
        searchParams.append('format', 'json');
        searchParams.append('must_have_images', 'true');
        searchParams.append('max_results', maxResultsNum.toString());
        searchParams.append('page_number', pageNumberNum.toString());
        const searchResponse = yield axios_1.default.post('https://platform.fatsecret.com/rest/server.api', searchParams, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const recipesList = (_a = searchResponse.data.recipes) === null || _a === void 0 ? void 0 : _a.recipe;
        if (!recipesList || !Array.isArray(recipesList)) {
            return res.status(404).json({ error: 'No recipes found' });
        }
        const detailedRecipes = yield Promise.all(recipesList.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            var _b, _c, _d, _e, _f, _g;
            const detailParams = new URLSearchParams();
            detailParams.append('method', 'recipe.get.v2');
            detailParams.append('recipe_id', item.recipe_id);
            detailParams.append('format', 'json');
            detailParams.append('max_results', '50');
            detailParams.append('page_number', '0');
            const detailResponse = yield axios_1.default.post('https://platform.fatsecret.com/rest/server.api', detailParams, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const details = detailResponse.data.recipe;
            return {
                id: parseInt(details.recipe_id),
                name: details.recipe_name,
                description: details.recipe_description,
                ingredients: ((_c = (_b = details.ingredients) === null || _b === void 0 ? void 0 : _b.ingredient) === null || _c === void 0 ? void 0 : _c.map((ing) => ing.ingredient_description)) || [],
                instructions: ((_e = (_d = details.directions) === null || _d === void 0 ? void 0 : _d.direction) === null || _e === void 0 ? void 0 : _e.map((dir) => dir.direction_description).join(' ')) || 'Brak instrukcji.',
                image: ((_g = (_f = details.recipe_images) === null || _f === void 0 ? void 0 : _f.recipe_image) === null || _g === void 0 ? void 0 : _g[0]) || null,
            };
        })));
        return res.status(200).json(detailedRecipes);
    }
    catch (error) {
        console.error('Error fetching data from FatSecret API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.get('/recipes', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const idsParam = req.query.ids;
    if (!idsParam || typeof idsParam !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "ids" parameter' });
    }
    const ids = idsParam.split(',').map(id => id.trim()).filter(id => /^\d+$/.test(id));
    if (ids.length === 0) {
        return res.status(400).json({ error: 'No valid recipe IDs provided' });
    }
    try {
        const token = yield (0, fatSecretAuth_1.getAccessToken)();
        const detailedRecipes = yield Promise.all(ids.map((id) => __awaiter(void 0, void 0, void 0, function* () {
            var _h, _j, _k, _l, _m, _o;
            const detailParams = new URLSearchParams();
            detailParams.append('method', 'recipe.get.v2');
            detailParams.append('recipe_id', id);
            detailParams.append('format', 'json');
            const detailResponse = yield axios_1.default.post('https://platform.fatsecret.com/rest/server.api', detailParams, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            const details = detailResponse.data.recipe;
            return {
                id: parseInt(details.recipe_id),
                name: details.recipe_name,
                description: details.recipe_description,
                ingredients: ((_j = (_h = details.ingredients) === null || _h === void 0 ? void 0 : _h.ingredient) === null || _j === void 0 ? void 0 : _j.map((ing) => ing.ingredient_description)) || [],
                instructions: ((_l = (_k = details.directions) === null || _k === void 0 ? void 0 : _k.direction) === null || _l === void 0 ? void 0 : _l.map((dir) => dir.direction_description).join(' ')) || 'Brak instrukcji.',
                image: ((_o = (_m = details.recipe_images) === null || _m === void 0 ? void 0 : _m.recipe_image) === null || _o === void 0 ? void 0 : _o[0]) || null,
            };
        })));
        return res.status(200).json(detailedRecipes);
    }
    catch (error) {
        console.error('Error fetching multiple recipe details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.get('/random', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _p, _q, _r, _s, _t, _u, _v;
    try {
        const token = yield (0, fatSecretAuth_1.getAccessToken)();
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
        const searchResponse = yield axios_1.default.post('https://platform.fatsecret.com/rest/server.api', searchParams, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const recipesList = (_p = searchResponse.data.recipes) === null || _p === void 0 ? void 0 : _p.recipe;
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
        const detailResponse = yield axios_1.default.post('https://platform.fatsecret.com/rest/server.api', detailParams, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const details = detailResponse.data.recipe;
        if (!details) {
            return res.status(404).json({ error: 'Details for random recipe not found.' });
        }
        // Format the detailed recipe as per your Recipe interface
        const formattedRecipe = {
            id: parseInt(details.recipe_id),
            name: details.recipe_name,
            description: details.recipe_description,
            ingredients: ((_r = (_q = details.ingredients) === null || _q === void 0 ? void 0 : _q.ingredient) === null || _r === void 0 ? void 0 : _r.map((ing) => ing.ingredient_description)) || [],
            instructions: ((_t = (_s = details.directions) === null || _s === void 0 ? void 0 : _s.direction) === null || _t === void 0 ? void 0 : _t.map((dir) => dir.direction_description).join(' ')) || 'Brak instrukcji.',
            image: ((_v = (_u = details.recipe_images) === null || _u === void 0 ? void 0 : _u.recipe_image) === null || _v === void 0 ? void 0 : _v[0]) || null,
        };
        return res.status(200).json(formattedRecipe);
    }
    catch (error) {
        console.error('Error fetching a random recipe from FatSecret API:', error);
        // Check if it's an Axios error and log response data if available
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error('FatSecret API error response:', error.response.data);
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = router;
