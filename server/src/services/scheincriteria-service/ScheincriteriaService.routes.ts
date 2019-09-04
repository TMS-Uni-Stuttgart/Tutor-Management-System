import Router from 'express-promise-router';
import { initScheincriteriaBlueprints } from '../../model/scheincriteria/scheincriterias';

initScheincriteriaBlueprints();

const scheincriteriaRouter = Router();

export default scheincriteriaRouter;
