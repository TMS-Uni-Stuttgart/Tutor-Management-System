import bcrypt from 'bcryptjs';
import { PassportStatic } from 'passport';
import { BasicStrategy } from 'passport-http';
import userService from '../services/UserService';
import { UserCredentials } from '../model/documents/UserDocument';
import { AuthenticationError } from '../model/Errors';

export default function initPassport(passport: PassportStatic) {
  passport.use(
    new BasicStrategy(async (username, password, done) => {
      try {
        const user: UserCredentials = await userService.getUserCredentialsWithUsername(username);
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

  passport.serializeUser((user: unknown, done) => {
    if (typeof user === 'object' && !!user && '_id' in user) {
      done(null, (user as any)._id);
    } else {
      done(null, false);
    }
  });

  passport.deserializeUser((id, done) => {
    if (typeof id === 'string') {
      userService
        .getUserWithId(id)
        .then(user => done(null, user))
        .catch(() =>
          done(
            new AuthenticationError(
              'Could not find a user with the given ID. This could be due to an old cookie. Destorying the old session, now. Please try to login again.'
            ),
            null
          )
        );
    } else {
      done(null, false);
    }
  });
}
