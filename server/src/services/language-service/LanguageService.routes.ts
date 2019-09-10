import Router from 'express-promise-router';
import { isAuthenticated } from '../../middleware/AccessControl';
import { BadRequestError } from '../../model/Errors';
import languageService from './LanguageService.class';

const languageRouter = Router();

languageRouter.post('/:lang/:namespace', isAuthenticated, async (req, res) => {
  if (!req.params.lang) {
    throw new BadRequestError("Request needs a 'lang' parameter which was not provided.");
  }

  if (!req.params.namespace) {
    throw new BadRequestError("Request needs a 'namespace' parameter which was not provided.");
  }

  const lang = req.params.lang;
  const namespace = req.params.namespace;
  const missingKeys = req.body;

  // TODO: Validation of body

  languageService.addMissingLanguageKey(lang, namespace, missingKeys);

  res.status(204).send();
});

export default languageRouter;
