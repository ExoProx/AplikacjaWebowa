// passport.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
// Removed cookieParser import as it's not used here

const cookieExtractor = (req: any) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['token'];
    console.log('--- Inside cookieExtractor ---');
    console.log('Request has cookies:', !!req.cookies);
    console.log('Token extracted from cookie:', token ? 'YES' : 'NO');
    // If token is present, you can even log a snippet of it to compare with backend generated token
    // console.log('Extracted token snippet:', token ? token.substring(0, 20) + '...' : 'N/A');
  } else {
    console.log('--- Inside cookieExtractor: No request or no cookies ---');
  }
  return token;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(), // Checks for 'Bearer token' in Authorization header first
    cookieExtractor, // Then checks for 'token' cookie
  ]),
  secretOrKey: process.env.JWT_SECRET!, // Make sure this is loaded correctly
};

passport.use(
  new JwtStrategy(opts, (jwtPayload, done) => {
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
  })
);

export default passport;