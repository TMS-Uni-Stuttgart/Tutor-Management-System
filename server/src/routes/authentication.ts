import { Router } from 'express';
import passport = require('passport');

const authenticationRouter = Router();

authenticationRouter.post('/login', passport.authenticate('local'));

authenticationRouter.get('/logout', (req, res) => {});

export default authenticationRouter;
