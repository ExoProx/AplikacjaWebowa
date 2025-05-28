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
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
// mealPlans.ts
router.post('/', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = user.userId;
    const client = yield db_1.default.connect();
    // ⭐ REMOVE 'description' from destructuring
    const { name, days } = req.body; // Changed from 'number' to 'days' in previous step
    // ⭐ Add console logs for debugging backend input
    console.log("Backend POST /api/menuList: Received name:", name);
    console.log("Backend POST /api/menuList: Received days:", days); // Should be a number
    // Validation (ensure 'days' is being validated, not 'number')
    if (typeof name !== 'string' ||
        !name.trim() ||
        typeof days !== 'number' || // Validate 'days'
        days < 1 ||
        days > 31) {
        client.release();
        return res.status(400).json({ error: 'Invalid name or day count. Name must be a non-empty string, days must be a number between 1 and 31.' });
    }
    try {
        yield client.query("BEGIN");
        // ⭐ REMOVE 'description' from the INSERT column list
        // ⭐ Adjust values ($) to match the remaining parameters
        const result = yield client.query(`INSERT INTO meal_plans (name, created_at, id_account, day_count)
         VALUES ($1, Now(), $2, $3)
         RETURNING id_meal_plans AS id, name, day_count AS days;`, // ⭐ REMOVE 'description' from RETURNING
        [name.trim(), userId, days] // ⭐ REMOVE 'description' from parameters
        );
        yield client.query("COMMIT");
        if (result.rows.length > 0) {
            return res.status(201).json(result.rows[0]);
        }
        else {
            return res.status(500).json({ error: "Failed to create meal plan: No data returned from database." });
        }
    }
    catch (err) {
        yield client.query("ROLLBACK");
        console.error("Backend Error creating meal plan:", err);
        if (err instanceof Error) {
            if ('code' in err && typeof err.code === 'string') {
                console.error("PostgreSQL Error Code:", err.code);
                // Specific error handling for database errors
                if (err.code === '23502') { // Not null violation
                    return res.status(500).json({ error: "Database error: A required field is missing (check name or days)." });
                }
                if (err.code === '23503') { // Foreign key violation
                    return res.status(500).json({ error: "Database error: Invalid account ID." });
                }
            }
        }
        return res.status(500).json({ error: "Internal server error during meal plan creation." });
    }
    finally {
        client.release();
    }
}));
router.put('/updateMeal', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const client = yield db_1.default.connect();
    const { menuId, dayIndex, mealType, recipeId } = req.body;
    if (!menuId || dayIndex === undefined || !mealType || !recipeId) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        yield client.query("BEGIN");
        const check = yield client.query(`SELECT id_recipe FROM meal_plans_recipes 
         WHERE id_meal_plans = $1 AND meal_type = $2 AND dayindex = $3`, [menuId, mealType, dayIndex]);
        yield client.query("COMMIT");
        if (check.rows.length > 0) {
            yield client.query(`UPDATE meal_plans_recipes 
           SET id_recipe = $1 
           WHERE id_meal_plans = $2 AND meal_type = $3 AND dayindex = $4`, [recipeId, menuId, mealType, dayIndex]);
            yield client.query("COMMIT");
            return res.status(201).json({ message: "Recipe Added" });
        }
        else {
            yield client.query(`INSERT INTO meal_plans_recipes (id_meal_plans, meal_type, dayindex, id_recipe) 
         VALUES ($1, $2, $3, $4)`, [menuId, mealType, dayIndex, recipeId]);
            yield client.query("COMMIT");
            return res.status(201).json({ message: "Recipe Added" });
        }
    }
    catch (err) {
        yield client.query("ROLLBACK");
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
}));
router.get('/', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const client = yield db_1.default.connect();
    try {
        yield client.query("BEGIN");
        const result = yield client.query(`SELECT id_meal_plans AS id, name, day_count AS days FROM meal_plans WHERE id_account = $1`, [user.userId]);
        yield client.query("COMMIT");
        return res.status(200).json(result.rows);
    }
    catch (err) {
        yield client.query("ROLLBACK");
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
}));
router.get('/fetch', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const menuId = Number(req.query.menuId);
    if (isNaN(menuId) || menuId <= 0) {
        return res.status(400).json({ error: 'Invalid or missing menuId' });
    }
    const client = yield db_1.default.connect();
    try {
        yield client.query("BEGIN");
        const result = yield client.query(`SELECT id_recipe as id, meal_plans_recipes.id_meal_plans as menuId, dayindex as dayIndex, meal_type as mealType
         FROM meal_plans_recipes
         WHERE meal_plans_recipes.id_meal_plans = $1`, [menuId]);
        return res.status(200).json(result.rows);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch meals." });
    }
    finally {
        client.release();
    }
}));
router.delete('/delete', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const menuId = Number(req.query.menuId);
    if (isNaN(menuId) || menuId <= 0) {
        return res.status(400).json({ error: 'Invalid or missing menuId' });
    }
    const client = yield db_1.default.connect();
    try {
        yield client.query("BEGIN");
        yield client.query(`DELETE FROM meal_plans_recipes WHERE id_meal_plans = $1`, [menuId]);
        yield client.query(`DELETE FROM meal_plans WHERE id_meal_plans = $1`, [menuId]);
        yield client.query("COMMIT");
        return res.status(201).json({ message: "Mealplan DELETED" });
    }
    catch (err) {
        yield client.query("ROLLBACK");
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
}));
router.post('/deleteRecipe', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const menuId = Number(req.query.menuId);
    const mealType = String(req.query.mealType);
    const mealTypes = ["Breakfast", "Second Breakfast", "Lunch", "Snack", "Dinner"];
    const dayIndex = Number(req.query.dayIndex);
    if (isNaN(menuId) || menuId <= 0) {
        return res.status(400).json({ error: 'Invalid or missing menuId' });
    }
    if (!mealTypes.includes(mealType)) {
        return res.status(400).json({ error: 'Invalid or missing menuId' });
    }
    if (isNaN(dayIndex) || dayIndex <= 0) {
        return res.status(400).json({ error: 'Invalid or missing menuId' });
    }
    const client = yield db_1.default.connect();
    try {
        yield client.query("BEGIN");
        yield client.query(`DELETE FROM meal_plans_recipes WHERE id_meal_plans = $1 AND meal_type= $2 AND day_count =$3 `, [menuId]);
        yield client.query("COMIT");
        return res.status(201).json({ message: "Recipe DELETED" });
    }
    catch (err) {
        yield client.query("ROLLBACK");
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
}));
router.put('/extend', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { menuId, additionalDays } = req.body;
    if (!menuId || typeof additionalDays !== 'number' || additionalDays <= 0) {
        return res.status(400).json({ error: 'Invalid menuId or additionalDays' });
    }
    const client = yield db_1.default.connect();
    try {
        yield client.query("BEGIN");
        const currentPlan = yield client.query(`SELECT day_count FROM meal_plans WHERE id_meal_plans = $1 AND id_account = $2`, [menuId, user.userId]);
        if (currentPlan.rows.length === 0) {
            yield client.query("ROLLBACK");
            return res.status(404).json({ error: "Meal plan not found" });
        }
        const newDayCount = currentPlan.rows[0].day_count + additionalDays;
        yield client.query(`UPDATE meal_plans SET day_count = $1 WHERE id_meal_plans = $2 AND id_account = $3`, [newDayCount, menuId, user.userId]);
        yield client.query("COMMIT");
        return res.status(200).json({
            message: "Meal plan extended successfully",
            newDayCount: newDayCount
        });
    }
    catch (err) {
        yield client.query("ROLLBACK");
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
}));
router.post('/share', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { menuId } = req.body;
    if (!menuId) {
        return res.status(400).json({ error: 'Missing menuId' });
    }
    const client = yield db_1.default.connect();
    try {
        yield client.query("BEGIN");
        const menuCheck = yield client.query(`SELECT id_meal_plans FROM meal_plans WHERE id_meal_plans = $1 AND id_account = $2`, [menuId, user.userId]);
        if (menuCheck.rows.length === 0) {
            yield client.query("ROLLBACK");
            return res.status(404).json({ error: "Meal plan not found" });
        }
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        yield client.query(`UPDATE meal_plans SET shared_token = $1 WHERE id_meal_plans = $2 RETURNING shared_token as token`, [token, menuId]);
        yield client.query("COMMIT");
        return res.status(200).json({ token });
    }
    catch (err) {
        yield client.query("ROLLBACK");
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
}));
router.post('/unshare', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { menuId } = req.body;
    if (!menuId) {
        return res.status(400).json({ error: 'Missing menuId' });
    }
    const client = yield db_1.default.connect();
    try {
        yield client.query("BEGIN");
        const menuCheck = yield client.query(`SELECT id_meal_plans FROM meal_plans 
         WHERE id_meal_plans = $1 AND id_account = $2`, [menuId, user.userId]);
        if (menuCheck.rows.length === 0) {
            yield client.query("ROLLBACK");
            return res.status(404).json({ error: "Menu not found or not owned by user" });
        }
        yield client.query(`UPDATE meal_plans SET shared_token = NULL 
         WHERE id_meal_plans = $1`, [menuId]);
        yield client.query("COMMIT");
        return res.status(200).json({ message: "Sharing stopped successfully" });
    }
    catch (err) {
        yield client.query("ROLLBACK");
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
}));
router.get('/check-share/:menuId', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { menuId } = req.params;
    if (!menuId) {
        return res.status(400).json({ error: 'Missing menuId' });
    }
    const client = yield db_1.default.connect();
    try {
        const menuCheck = yield client.query(`SELECT id_meal_plans AS id, name, day_count AS days, shared_token AS token 
         FROM meal_plans WHERE id_meal_plans = $1 AND id_account = $2`, [menuId, user.userId]);
        if (menuCheck.rows.length === 0) {
            return res.status(404).json({ error: "Menu not found" });
        }
        return res.status(200).json({
            mealPlan: Object.assign(Object.assign({}, menuCheck.rows[0]), { token: menuCheck.rows[0].token || null })
        });
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
}));
router.get('/shared/:token', 
// Passport authentication middleware. 'jwt' strategy from passport.ts.
// `session: false` is standard for stateless JWT authentication.
passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This route handler is only reached if passport.authenticate('jwt') SUCCEEDS.
    // If you see a 401, it means passport.authenticate failed *before* this.
    // --- DEBUGGING LINE ---
    console.log("Server-side DEBUG: In /shared/:token route handler.");
    console.log("Server-side DEBUG: req.user from Passport:", req.user); // Should show your user object if authenticated
    const user = req.user;
    if (!user) {
        // This check *should* ideally not be hit if `passport.authenticate` passed.
        // If it is, it indicates a highly unusual Passport setup issue where it authenticates
        // but fails to attach the user object.
        console.error("Server-side DEBUG: req.user was unexpectedly undefined after passport.authenticate!");
        return res.status(401).json({ error: 'Unauthorized: User object not found after authentication' });
    }
    // ⭐ Your existing route logic continues from here, now with an authenticated `req.user`
    const { token } = req.params;
    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }
    const client = yield db_1.default.connect(); // Assuming db.connect() exists
    try {
        const mealPlan = yield client.query(`SELECT id_meal_plans AS id, name, day_count AS days, shared_token AS token
         FROM meal_plans WHERE shared_token = $1`, [token]);
        if (mealPlan.rows.length === 0) {
            return res.status(404).json({ error: "Shared meal plan not found" });
        }
        // Ensure that only the correct user can access their shared meal plan
        // This check is in addition to just being logged in.
        // E.g., if meal_plans also has a 'user_id' column:
        // if (mealPlan.rows[0].user_id !== user.userId) {
        //   return res.status(403).json({ error: 'Forbidden: You do not own this meal plan.' });
        // }
        const recipes = yield client.query(`SELECT id_recipe as id, meal_plans_recipes.id_meal_plans as menuId,
                dayindex as dayIndex, meal_type as mealType
         FROM meal_plans_recipes
         WHERE meal_plans_recipes.id_meal_plans = $1`, [mealPlan.rows[0].id]);
        return res.status(200).json({
            mealPlan: mealPlan.rows[0],
            recipes: recipes.rows
        });
    }
    catch (err) {
        console.error('Error fetching shared meal plan in route handler:', err);
        return res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
}));
router.post('/copy-shared', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user || !user.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Missing token' });
    }
    const client = yield db_1.default.connect();
    try {
        yield client.query("BEGIN");
        const originalPlan = yield client.query(`SELECT id_meal_plans, name, day_count 
         FROM meal_plans WHERE shared_token = $1`, [token]);
        if (originalPlan.rows.length === 0) {
            yield client.query("ROLLBACK");
            return res.status(404).json({ error: "Shared meal plan not found" });
        }
        const original = originalPlan.rows[0];
        const newPlan = yield client.query(`INSERT INTO meal_plans (name, created_at, id_account, day_count) 
         VALUES ($1, Now(), $2, $3) RETURNING id_meal_plans`, [`Copy of ${original.name}`, user.userId, original.day_count]);
        yield client.query(`INSERT INTO meal_plans_recipes (id_meal_plans, meal_type, dayindex, id_recipe)
         SELECT $1, meal_type, dayindex, id_recipe
         FROM meal_plans_recipes
         WHERE id_meal_plans = $2`, [newPlan.rows[0].id_meal_plans, original.id_meal_plans]);
        yield client.query("COMMIT");
        return res.status(201).json({
            message: "Meal plan copied successfully",
            newPlanId: newPlan.rows[0].id_meal_plans
        });
    }
    catch (err) {
        yield client.query("ROLLBACK");
        return res.status(500).json({
            error: "Internal server error",
            details: err instanceof Error ? err.message : 'An unknown error occurred'
        });
    }
    finally {
        client.release();
    }
}));
exports.default = router;
