import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { initScheincriteriaBlueprints } from '../../model/scheincriteria/scheincriterias';

initScheincriteriaBlueprints();

const scheincriteriaRouter = Router();



export default scheincriteriaRouter;
