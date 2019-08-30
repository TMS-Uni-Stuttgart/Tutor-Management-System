import Router from 'express-promise-router';
import { ValidationErrors } from 'shared/dist/model/errors/Errors';
import { Role } from 'shared/dist/model/Role';
import { checkRoleAccess } from './middleware/AccessControl';
import { SheetDTO, Sheet } from 'shared/dist/model/Sheet';
import { validateAgainstSheetDTO } from 'shared/dist/validators/Sheet';
import sheetService from '../services/SheetService';
import { validateRequestBody } from './middleware/Validation';
import { handleError } from '../model/Errors';

function isValidSheetDTO(obj: any, errors: ValidationErrors): obj is SheetDTO {
  const result = validateAgainstSheetDTO(obj);

  if ('errors' in result) {
    errors.push(...result['errors']);
    return false;
  }

  return true;
}

const sheetRouter = Router();

sheetRouter.get('/', ...checkRoleAccess(Role.ADMIN), async (_, res) => {
  const sheets: Sheet[] = await sheetService.getAllSheets();

  return res.json(sheets);
});

sheetRouter.post(
  '/',
  ...checkRoleAccess(Role.ADMIN),
  validateRequestBody(isValidSheetDTO, 'Not a valid SheetDTO.'),
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
  validateRequestBody(isValidSheetDTO, 'Not a valid SheetDTO.'),
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
