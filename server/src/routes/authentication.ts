import { Router } from 'express';
import passport = require('passport');
import { isAuthenticated } from '../middleware/AccessControl';

const authenticationRouter = Router();

authenticationRouter.post('/login', (req, res, next) => {
  passport.authenticate('basic', { session: true }, (err, user, info) => {
    req.login(user, err => {
      if (err || !user) {
        return res.status(401).send();
      }

      return res.send('You were authenticated & logged in!\n');
    });
  })(req, res, next);
});


authenticationRouter.get('/authrequired', isAuthenticated, (req, res) => {
  res.send('you hit the authentication endpoint\n');
});

authenticationRouter.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('connect.sid').send('Successfully logged out.');
});

export default authenticationRouter;
