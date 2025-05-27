"use strict";
// backend/routes/auth.ts (or wherever your auth routes are)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport")); // Import passport
const router = express_1.default.Router();
router.get('/check-auth', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    res.status(200).json({
        isAuthenticated: true,
    });
    console.log('Token is valid for user:', req.user);
});
exports.default = router;
