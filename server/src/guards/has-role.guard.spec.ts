import { HasRoleGuard } from './has-role.guard';
import { Role } from '../shared/model/Role';

describe('HasRoleGuard', () => {
  it('should be defined', () => {
    expect(new HasRoleGuard(Role.ADMIN)).toBeDefined();
  });
});
