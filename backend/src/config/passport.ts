import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import cookieParser from 'cookie-parser';


const cookieExtractor = (req: any) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['token'];
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
    console.log('JWT Payload received:', jwtPayload);
    if (jwtPayload) {
      return done(null, jwtPayload);
    } else {
      return done(null, false);
    }
  })
);

export default passport;
