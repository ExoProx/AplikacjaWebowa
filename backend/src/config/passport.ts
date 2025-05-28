// passport.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express'; // Ensure Request type is imported

// Extend the Request interface if not already done globally
declare global {
  namespace Express {
    interface Request {
      cookies: {
        token?: string;
        [key: string]: string | undefined;
      };
    }
  }
}

const cookieExtractor = (req: Request): string | null => {
  let token: string | null = null;
  if (req && req.cookies) {
    // --- DEBUGGING LINE ---
    console.log("Backend DEBUG: All cookies received by cookieExtractor:", req.cookies);
    token = req.cookies.token; // ⭐ Make sure 'token' is the exact name of your JWT cookie!
    // --- DEBUGGING LINE ---
    console.log("Backend DEBUG: Token extracted from cookie:", token ? token.substring(0, 30) + '...' : 'null/undefined');
  }
  return token;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(), // Checks Authorization: Bearer header
    cookieExtractor, // Checks the 'token' cookie
  ]),
  secretOrKey: process.env.JWT_SECRET!, // ⭐ CRITICAL: Ensure this matches the signing secret!
  // issuer: 'your-app-name', // Add these if you have them in your JWT payload
  // audience: 'your-app-frontend', // Add these if you have them in your JWT payload
};

passport.use(
  new JwtStrategy(opts, (jwtPayload, done) => {
    // This callback is invoked IF the token is extracted and verified successfully.
    // If you don't see these logs, the issue is before this (extraction or secret mismatch/expiration).
    console.log("Backend DEBUG: JwtStrategy callback invoked.");
    console.log("Backend DEBUG: Decoded JWT Payload:", jwtPayload); // What does the payload look like?

    if (!jwtPayload) {
      console.log("Backend DEBUG: JWT Payload is null/false, authenticating false.");
      return done(null, false); // Authentication failed (e.g., token invalid or empty payload)
    }

    // Assuming your JWT payload (jwtPayload) contains the user information directly
    // You might do a database lookup here if your JWT only contains an ID
    // E.g., User.findById(jwtPayload.userId, (err, user) => { ... });
    
    console.log("Backend DEBUG: JWT Payload valid. Authenticating user:", jwtPayload.userId || jwtPayload.email || 'unknown user id');
    return done(null, jwtPayload); // Passport sets req.user to jwtPayload
  })
);

export default passport;