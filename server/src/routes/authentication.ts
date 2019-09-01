import { Router } from 'express';
import { UserCredentials } from '../model/documents/UserDocument';
import userService from '../services/user-service/UserService.class';
import passport = require('passport');

const authenticationRouter = Router();

authenticationRouter.post('/login', (req, res, next) => {
  passport.authenticate('basic', { session: true }, (err, user, info) => {
    req.login(user, async err => {
      if (err || !user) {
        return res.status(401).send();
      }

      if (!(user instanceof UserCredentials)) {
        return res.status(401).send();
      }

      const loggedInUser = await userService.getLoggedInUserInformation(user);

      return res.json(loggedInUser);
    });
  })(req, res, next);
});

authenticationRouter.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('connect.sid').send('Successfully logged out.');
});

export default authenticationRouter;
