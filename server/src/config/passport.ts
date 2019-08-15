import bcrypt from 'bcrypt';
import { PassportStatic } from 'passport';
import { BasicStrategy } from 'passport-http';
import { User } from 'shared/dist/typings/ServerResponse';
import userService from '../services/UserService';

export default function initPassport(passport: PassportStatic) {
  passport.use(
    new BasicStrategy(async (username, password, done) => {
      try {
        const user = await userService.getUserWithUsername(username);
        const isCorrectPassword = await bcrypt.compare(password, user.password);

        if (isCorrectPassword) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch {
        done(null, false);
      }
    })
  );

  passport.serializeUser((user, done) => {
    if (typeof user === 'object' && (user as User)._id !== undefined) {
      done(null, (user as User)._id);
    } else {
      done(null, false);
    }
  });

  passport.deserializeUser((id, done) => {
    if (typeof id === 'string') {
      userService
        .getUserWithId(id)
        .then(user => done(null, user))
        .catch(err => done(err, null));
    } else {
      done(null, false);
    }
  });
}
