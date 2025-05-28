"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const login_1 = __importDefault(require("./routes/login"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const logout_1 = __importDefault(require("./routes/logout"));
const search_1 = __importDefault(require("./routes/fatSecret/search"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const mealPlan_1 = __importDefault(require("./routes/mealPlan"));
const passport_1 = __importDefault(require("./config/passport"));
const auth_1 = __importDefault(require("./routes/auth"));
const favorites_1 = __importDefault(require("./routes/favorites"));
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.',
});
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use(exports.apiLimiter);
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api/users', user_1.default);
app.use('/api/login', login_1.default);
app.use('/api/logout', logout_1.default);
app.use('/api/menuList', mealPlan_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/favorites', favorites_1.default);
app.use('/foodSecret/search', search_1.default);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
