import { HasRoleGuard } from './has-role.guard';

describe('HasRoleGuard', () => {
  it('should be defined', () => {
    expect(new HasRoleGuard()).toBeDefined();
  });
});
