import Router from 'express-promise-router';
import { Role } from 'shared/dist/model/Role';
import { Sheet } from 'shared/dist/model/Sheet';
import { validateAgainstSheetDTO } from 'shared/dist/validators/Sheet';
import { checkRoleAccess } from '../../middleware/AccessControl';
import { validateRequestBody } from '../../middleware/Validation';
import sheetService from './SheetService.class';

const sheetRouter = Router();

sheetRouter.get('/', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const sheets: Sheet[] = await sheetService.getAllSheets();

  return res.json(sheets);
});

sheetRouter.post(
  '/',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstSheetDTO, 'Not a valid SheetDTO.'),
  async (req, res) => {
    const dto = req.body;
    const sheet = await sheetService.createSheet(dto);

    return res.json(sheet);
  }
);

sheetRouter.get('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  const sheet = await sheetService.getSheetWithId(id);

  return res.json(sheet);
});

sheetRouter.patch(
  '/:id',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(validateAgainstSheetDTO, 'Not a valid SheetDTO.'),
  async (req, res) => {
    const id = req.params.id;
    const dto = req.body;
    const sheet = await sheetService.updateSheet(id, dto);

    return res.json(sheet);
  }
);

sheetRouter.delete('/:id', ...checkRoleAccess(Role.ADMIN), async (req, res) => {
  const id = req.params.id;
  await sheetService.deleteSheet(id);

  return res.status(204).send();
});

export default sheetRouter;
