// passport.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

interface CookieRequest extends Request {
  cookies: {
    token?: string;
    [key: string]: string | undefined;
  };
}

const cookieExtractor = (req: CookieRequest): string | null => {
  let token: string | null = null;
  if (req && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  return token;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderAsBearerToken(),
    cookieExtractor,
  ]),
  secretOrKey: process.env.JWT_SECRET!,
};

passport.use(
  new JwtStrategy(opts, (jwtPayload, done) => {
    if (!jwtPayload) {
      return done(null, false);
    }
    return done(null, jwtPayload);
  })
);

export default passport;