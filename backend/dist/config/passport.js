"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// passport.ts
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
// Removed cookieParser import as it's not used here
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['token'];
        console.log('--- Inside cookieExtractor ---');
        console.log('Request has cookies:', !!req.cookies);
        console.log('Token extracted from cookie:', token ? 'YES' : 'NO');
        // If token is present, you can even log a snippet of it to compare with backend generated token
        // console.log('Extracted token snippet:', token ? token.substring(0, 20) + '...' : 'N/A');
    }
    else {
        console.log('--- Inside cookieExtractor: No request or no cookies ---');
    }
    return token;
};
const opts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromExtractors([
        passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor, // Then checks for 'token' cookie
    ]),
    secretOrKey: process.env.JWT_SECRET, // Make sure this is loaded correctly
};
passport_1.default.use(new passport_jwt_1.Strategy(opts, (jwtPayload, done) => {
    console.log('--- Passport JwtStrategy Callback Invoked ---');
    console.log('JWT Payload received by strategy:', jwtPayload); // This will be `undefined` if token is invalid or expired
    if (!jwtPayload) {
        console.log('JwtStrategy: Payload is NULL/UNDEFINED. Token likely invalid or expired.');
        return done(null, false); // Authentication failed
    }
    // If you reach here, payload was successfully parsed
    console.log('JwtStrategy: Payload successfully parsed. Returning payload as user.');
    // This is where you *should* do a DB lookup to verify user still exists/is active,
    // but for now, we're testing the basic flow.
    return done(null, jwtPayload); // Success: Pass the payload to req.user
}));
exports.default = passport_1.default;
