import Router from 'express-promise-router';
import informationService from './InformationService.class';

const informationRouter = Router();

informationRouter.get('/version', (_, res) => {
  const version: string = informationService.getVersion();

  res.send(version);
});

export default informationRouter;
